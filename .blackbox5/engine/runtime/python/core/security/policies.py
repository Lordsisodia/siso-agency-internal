#!/usr/bin/env python3
"""
Policy Engine for Blackbox3
Enforces filesystem, network, and operation policies

Based on BMAD-METHOD policy guardrails
"""

from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import yaml
import re
from datetime import datetime
import fnmatch


class PolicyViolation(Exception):
    """Raised when a policy is violated"""
    def __init__(self, message: str, policy_type: str, severity: str = "error"):
        self.message = message
        self.policy_type = policy_type
        self.severity = severity
        super().__init__(f"[{policy_type.upper()}] {message}")


class PolicyEngine:
    """
    Enforces policies on agent operations

    Policy Types:
    - Filesystem: File access restrictions
    - Network: Network request restrictions
    - Operations: Tool and operation restrictions
    - Content: Content safety restrictions
    """

    def __init__(self, policy_path: Path, enforcement_mode: str = "strict"):
        """
        Initialize policy engine

        Args:
            policy_path: Path to policies.yaml
            enforcement_mode: strict | permissive | learning
        """
        self.policy_path = Path(policy_path)
        self.enforcement_mode = enforcement_mode

        # Load policies
        self.policies = self._load_policies()

        # Compile regex patterns for secret detection
        self.secret_patterns = self._compile_secret_patterns()

        # Setup audit log
        self.audit_log_path = self.policy_path.parent.parent / "logs" / "audit.log"
        self.audit_log_path.parent.mkdir(parents=True, exist_ok=True)

    def _load_policies(self) -> Dict[str, Any]:
        """Load policies from YAML file"""
        if not self.policy_path.exists():
            # Return default policies
            return self._default_policies()

        with open(self.policy_path, 'r') as f:
            return yaml.safe_load(f)

    def _default_policies(self) -> Dict[str, Any]:
        """Default policies if file not found"""
        return {
            "policies": {
                "filesystem": {
                    "allow": ["core/**", "modules/**", "shared/**"],
                    "deny": [".env", "**/*secret*", "**/.ssh/**"],
                    "max_file_size": 10485760
                },
                "network": {
                    "allow_domains": ["github.com", "api.github.com"],
                    "deny_domains": ["*social*"],
                    "allow_network_requests": True
                },
                "operations": {
                    "allow_shell_exec": False,
                    "allowed_tools": ["file.read", "file.write"]
                }
            }
        }

    def _compile_secret_patterns(self) -> List[re.Pattern]:
        """Compile regex patterns for secret detection"""
        patterns = []

        secret_patterns = self.policies.get('policies', {}).get('content', {}).get('secret_patterns', [])

        for pattern in secret_patterns:
            try:
                patterns.append(re.compile(pattern, re.IGNORECASE))
            except re.error as e:
                self._log_violation("content", f"Invalid secret pattern: {pattern}")

        return patterns

    # ========== FILESYSTEM POLICIES ==========

    def check_filesystem_access(self, file_path: Path, operation: str = "read") -> bool:
        """
        Check if file access is allowed

        Args:
            file_path: Path to file
            operation: Type of access (read, write, delete)

        Returns:
            True if allowed

        Raises:
            PolicyViolation if denied
        """
        policies = self.policies.get('policies', {}).get('filesystem', {})

        # Check file size
        if file_path.exists():
            file_size = file_path.stat().st_size
            max_size = policies.get('max_file_size', 10485760)

            if file_size > max_size:
                raise PolicyViolation(
                    f"File too large: {file_size} bytes (max: {max_size})",
                    "filesystem",
                    "error"
                )

        # Check deny list first
        deny_patterns = policies.get('deny', [])
        for pattern in deny_patterns:
            if self._match_path_pattern(file_path, pattern):
                raise PolicyViolation(
                    f"Access denied to {file_path} (matches deny pattern: {pattern})",
                    "filesystem",
                    "error"
                )

        # Check allow list
        allow_patterns = policies.get('allow', [])
        allowed = False

        for pattern in allow_patterns:
            if self._match_path_pattern(file_path, pattern):
                allowed = True
                break

        if not allowed:
            # Check if we should allow anyway (permissive mode)
            if self.enforcement_mode == "permissive":
                self._log_violation("filesystem", f"File {file_path} not explicitly allowed, but permitting in permissive mode")
                return True
            else:
                raise PolicyViolation(
                    f"Access denied to {file_path} (not in allow list)",
                    "filesystem",
                    "error"
                )

        # Check file extension
        ext = file_path.suffix.lower()
        allowed_exts = policies.get('allowed_extensions', [])

        if allowed_exts and ext not in allowed_exts and ext != "":
            if self.enforcement_mode == "permissive":
                self._log_violation("filesystem", f"Extension {ext} not allowed, but permitting in permissive mode")
            else:
                raise PolicyViolation(
                    f"File extension {ext} not allowed",
                    "filesystem",
                    "warning"
                )

        # Log allowed access
        self._log_access("filesystem", f"{operation.upper()} {file_path}")

        return True

    def _match_path_pattern(self, file_path: Path, pattern: str) -> bool:
        """Match file path against pattern (supports wildcards)"""
        # Convert to string for matching
        path_str = str(file_path)

        # Handle recursive wildcards
        if "**" in pattern:
            # Convert **/* to ** for fnmatch
            regex_pattern = pattern.replace("**", "*")
            return fnmatch.fnmatch(path_str, regex_pattern) or fnmatch.fnmatch(path_str, pattern)

        return fnmatch.fnmatch(path_str, pattern)

    # ========== NETWORK POLICIES ==========

    def check_network_access(self, domain: str, method: str = "GET") -> bool:
        """
        Check if network access is allowed

        Args:
            domain: Domain to access
            method: HTTP method

        Returns:
            True if allowed

        Raises:
            PolicyViolation if denied
        """
        policies = self.policies.get('policies', {}).get('network', {})

        # Check if network requests are allowed
        if not policies.get('allow_network_requests', True):
            raise PolicyViolation(
                "Network requests disabled",
                "network",
                "error"
            )

        # Check deny list
        deny_domains = policies.get('deny_domains', [])
        for pattern in deny_domains:
            if pattern.replace("*", "") in domain.lower():
                raise PolicyViolation(
                    f"Access denied to {domain} (matches deny pattern: {pattern})",
                    "network",
                    "error"
                )

        # Check allow list
        allow_domains = policies.get('allow_domains', [])
        allowed = False

        for pattern in allow_domains:
            if pattern.replace("*", "") in domain.lower() or pattern in domain.lower():
                allowed = True
                break

        if not allowed:
            if self.enforcement_mode == "permissive":
                self._log_violation("network", f"Domain {domain} not explicitly allowed, but permitting in permissive mode")
                return True
            else:
                raise PolicyViolation(
                    f"Access denied to {domain} (not in allow list)",
                    "network",
                    "error"
                )

        # Check method
        allowed_methods = policies.get('allowed_methods', ["GET", "HEAD"])
        denied_methods = policies.get('denied_methods', [])

        if method in denied_methods:
            raise PolicyViolation(
                f"HTTP method {method} not allowed",
                "network",
                "error"
            )

        if method not in allowed_methods:
            raise PolicyViolation(
                f"HTTP method {method} not in allowed list",
                "network",
                "warning"
            )

        # Log network access
        self._log_access("network", f"{method} {domain}")

        return True

    # ========== OPERATION POLICIES ==========

    def check_operation(self, operation: Dict[str, Any]) -> bool:
        """
        Check if operation is allowed

        Args:
            operation: Operation dictionary
                {
                    "type": "file.read" | "file.write" | "shell.exec" | etc.,
                    "path": "...",
                    "method": "...",
                    ...
                }

        Returns:
            True if allowed

        Raises:
            PolicyViolation if denied
        """
        op_type = operation.get('type', '')

        # File operations
        if op_type.startswith('file.'):
            return self._check_file_operation(operation)

        # Shell operations
        elif op_type == 'shell.exec':
            return self._check_shell_operation(operation)

        # Network operations
        elif op_type.startswith('network.'):
            return self._check_network_operation(operation)

        # Unknown operation
        else:
            if self.enforcement_mode == "permissive":
                self._log_violation("operations", f"Unknown operation type: {op_type}, permitting in permissive mode")
                return True
            else:
                raise PolicyViolation(
                    f"Unknown operation type: {op_type}",
                    "operations",
                    "warning"
                )

    def _check_file_operation(self, operation: Dict[str, Any]) -> bool:
        """Check file operation"""
        file_path = Path(operation.get('path', ''))
        op_type = operation['type']  # file.read, file.write, file.delete

        # Map to operation names
        operation_map = {
            "file.read": "read",
            "file.write": "write",
            "file.delete": "delete",
            "file.search": "read"
        }

        fs_operation = operation_map.get(op_type, "read")
        return self.check_filesystem_access(file_path, fs_operation)

    def _check_shell_operation(self, operation: Dict[str, Any]) -> bool:
        """Check shell operation"""
        policies = self.policies.get('policies', {}).get('operations', {})

        if not policies.get('allow_shell_exec', False):
            raise PolicyViolation(
                "Shell execution disabled",
                "operations",
                "error"
            )

        command = operation.get('command', '')
        allowed_commands = policies.get('allowed_shell_commands', [])

        # Check if command is in allowed list
        allowed = False
        for allowed_cmd in allowed_commands:
            if command.startswith(allowed_cmd):
                allowed = True
                break

        if not allowed:
            raise PolicyViolation(
                f"Shell command not allowed: {command}",
                "operations",
                "error"
            )

        self._log_access("operations", f"shell.exec: {command}")
        return True

    def _check_network_operation(self, operation: Dict[str, Any]) -> bool:
        """Check network operation"""
        url = operation.get('url', '')
        method = operation.get('method', 'GET')

        # Extract domain from URL
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path

        return self.check_network_access(domain, method)

    # ========== CONTENT POLICIES ==========

    def check_content(self, content: str, content_type: str = "text") -> bool:
        """
        Check content for policy violations

        Args:
            content: Content to check
            content_type: Type of content (text, code, etc.)

        Returns:
            True if allowed

        Raises:
            PolicyViolation if denied
        """
        policies = self.policies.get('policies', {}).get('content', {})

        # Check for secrets
        if policies.get('detect_secrets', True):
            detected_secrets = self._detect_secrets(content)

            if detected_secrets and policies.get('block_if_secrets_found', True):
                raise PolicyViolation(
                    f"Potential secrets detected in content: {', '.join(detected_secrets[:3])}",
                    "content",
                    "error"
                )

        # Check output size
        max_size = policies.get('max_output_size', 10485760)
        content_size = len(content.encode('utf-8'))

        if content_size > max_size:
            raise PolicyViolation(
                f"Content too large: {content_size} bytes (max: {max_size})",
                "content",
                "error"
            )

        return True

    def _detect_secrets(self, content: str) -> List[str]:
        """Detect potential secrets in content"""
        detected = []

        for pattern in self.secret_patterns:
            matches = pattern.findall(content)

            if matches:
                # Get unique matches
                unique_matches = list(set(matches))
                detected.extend(unique_matches)

        return detected

    # ========== AGENT-SPECIFIC POLICIES ==========

    def get_agent_policies(self, agent_id: str) -> Dict[str, Any]:
        """
        Get policies specific to an agent

        Args:
            agent_id: Agent identifier

        Returns:
            Agent-specific policies
        """
        agent_policies = self.policies.get('policies', {}).get('agents', {}).get(agent_id, {})

        return agent_policies

    def check_agent_operation(self, agent_id: str, operation: Dict[str, Any]) -> bool:
        """
        Check operation against agent-specific policies

        Args:
            agent_id: Agent identifier
            operation: Operation to check

        Returns:
            True if allowed
        """
        # Get agent-specific policies
        agent_policies = self.get_agent_policies(agent_id)

        if not agent_policies:
            # No agent-specific policies, use global
            return self.check_operation(operation)

        # Check against agent-specific policies
        # TODO: Implement agent-specific policy checking

        return True

    # ========== LOGGING ==========

    def _log_access(self, policy_type: str, message: str):
        """Log allowed access"""
        timestamp = datetime.now().isoformat()
        log_entry = f"[{timestamp}] [ALLOW] [{policy_type.upper()}] {message}\n"

        with open(self.audit_log_path, 'a') as f:
            f.write(log_entry)

    def _log_violation(self, policy_type: str, message: str):
        """Log policy violation"""
        timestamp = datetime.now().isoformat()
        log_entry = f"[{timestamp}] [VIOLATION] [{policy_type.upper()}] {message}\n"

        with open(self.audit_log_path, 'a') as f:
            f.write(log_entry)

    # ========== POLICY INFO ==========

    def get_policy_summary(self) -> Dict[str, Any]:
        """Get summary of loaded policies"""
        policies = self.policies.get('policies', {})

        summary = {
            "enforcement_mode": self.enforcement_mode,
            "filesystem": {
                "allow_count": len(policies.get('filesystem', {}).get('allow', [])),
                "deny_count": len(policies.get('filesystem', {}).get('deny', [])),
                "max_file_size": policies.get('filesystem', {}).get('max_file_size', 0)
            },
            "network": {
                "allow_domains": len(policies.get('network', {}).get('allow_domains', [])),
                "deny_domains": len(policies.get('network', {}).get('deny_domains', [])),
                "network_enabled": policies.get('network', {}).get('allow_network_requests', True)
            },
            "operations": {
                "shell_enabled": policies.get('operations', {}).get('allow_shell_exec', False),
                "allowed_tools": len(policies.get('operations', {}).get('allowed_tools', []))
            },
            "content": {
                "secret_detection_enabled": policies.get('content', {}).get('detect_secrets', True),
                "max_output_size": policies.get('content', {}).get('max_output_size', 0)
            },
            "agents": len(policies.get('agents', {})),
            "audit_log": str(self.audit_log_path)
        }

        return summary
