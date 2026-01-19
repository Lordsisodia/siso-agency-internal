#!/usr/bin/env python3
"""
PRD Manager for Blackbox3

Provides Product Requirements Document management with
templating, validation, and workflow support.
"""

import os
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
import threading


class PRDStatus(Enum):
    """PRD status enumeration."""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"
    ARCHIVED = "archived"


class PRDManager:
    """
    Manages Product Requirements Documents with validation and workflow.

    Features:
    - PRD template management
    - Requirement validation
    - Approval workflow tracking
    - Version history
    - Stakeholder management
    - Success metrics tracking
    - Competitive analysis integration
    - Technical feasibility assessment
    """

    def __init__(
        self,
        planning_root: Optional[Path] = None,
        enable_templates: bool = True
    ):
        """
        Initialize PRD manager.

        Args:
            planning_root: Root directory for planning data
            enable_templates: Enable template system
        """
        self.planning_root = Path(planning_root) if planning_root else Path.cwd() / ".plans"
        self.planning_root.mkdir(parents=True, exist_ok=True)

        self.enable_templates = enable_templates
        self._lock = threading.RLock()

        # Data storage
        self.prds: Dict[str, Dict[str, Any]] = {}
        self.templates: Dict[str, Dict[str, Any]] = {}
        self.approval_workflows: Dict[str, List[Dict[str, Any]]] = {}

        # Load existing data
        self._load_data()
        self._load_templates()

    def _load_data(self):
        """Load PRD data from disk."""
        prd_file = self.planning_root / "prds.json"
        workflow_file = self.planning_root / "prd_workflows.json"

        if prd_file.exists():
            try:
                with open(prd_file, 'r') as f:
                    self.prds = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load PRDs: {e}")

        if workflow_file.exists():
            try:
                with open(workflow_file, 'r') as f:
                    self.approval_workflows = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load workflows: {e}")

    def _save_data(self):
        """Save PRD data to disk."""
        prd_file = self.planning_root / "prds.json"
        workflow_file = self.planning_root / "prd_workflows.json"

        with self._lock:
            with open(prd_file, 'w') as f:
                json.dump(self.prds, f, indent=2)

            with open(workflow_file, 'w') as f:
                json.dump(self.approval_workflows, f, indent=2)

    def _load_templates(self):
        """Load PRD templates."""
        if not self.enable_templates:
            return

        template_dir = self.planning_root.parent / "modules" / "planning" / "templates"

        # Default template
        self.templates["default"] = {
            "name": "Standard PRD Template",
            "sections": {
                "title": {"required": True, "type": "string"},
                "executive_summary": {"required": True, "type": "text"},
                "problem_statement": {"required": True, "type": "text"},
                "goals": {"required": True, "type": "list"},
                "success_metrics": {"required": True, "type": "list"},
                "user_stories": {"required": True, "type": "list"},
                "functional_requirements": {"required": True, "type": "list"},
                "non_functional_requirements": {"required": False, "type": "list"},
                "technical_considerations": {"required": False, "type": "text"},
                "risks": {"required": False, "type": "list"},
                "timeline": {"required": True, "type": "object"},
                "resources": {"required": False, "type": "list"}
            }
        }

        # Load custom templates from directory
        if template_dir.exists():
            for template_file in template_dir.glob("*.json"):
                try:
                    with open(template_file, 'r') as f:
                        template = json.load(f)
                        template_name = template_file.stem
                        self.templates[template_name] = template
                except Exception as e:
                    print(f"Warning: Could not load template {template_file}: {e}")

    def create_prd(
        self,
        title: str,
        template_name: str = "default",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create a new PRD.

        Args:
            title: PRD title
            template_name: Template to use
            metadata: Optional metadata

        Returns:
            PRD ID
        """
        if template_name not in self.templates:
            print(f"Error: Template '{template_name}' not found, using default")
            template_name = "default"

        prd_id = str(uuid.uuid4())[:8]

        prd = {
            "id": prd_id,
            "title": title,
            "template": template_name,
            "status": PRDStatus.DRAFT.value,
            "version": 1,
            "sections": {},
            "stakeholders": [],
            "approvals": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }

        # Initialize sections from template
        template = self.templates[template_name]
        for section_name, section_config in template.get("sections", {}).items():
            prd["sections"][section_name] = {
                "content": None,
                "required": section_config.get("required", False),
                "type": section_config.get("type", "text"),
                "completed": False
            }

        # Create approval workflow
        self.approval_workflows[prd_id] = [
            {"role": "product_manager", "status": "pending", "approved_at": None},
            {"role": "tech_lead", "status": "pending", "approved_at": None},
            {"role": "stakeholder", "status": "pending", "approved_at": None}
        ]

        with self._lock:
            self.prds[prd_id] = prd
            self._save_data()

        print(f"Created PRD: {prd_id} - {title}")
        return prd_id

    def update_section(
        self,
        prd_id: str,
        section_name: str,
        content: Any
    ) -> bool:
        """
        Update a PRD section.

        Args:
            prd_id: PRD ID
            section_name: Section name
            content: Section content

        Returns:
            True if successful
        """
        if prd_id not in self.prds:
            print(f"Error: PRD {prd_id} not found")
            return False

        if section_name not in self.prds[prd_id]["sections"]:
            print(f"Error: Section '{section_name}' not found in PRD")
            return False

        with self._lock:
            self.prds[prd_id]["sections"][section_name]["content"] = content
            self.prds[prd_id]["sections"][section_name]["completed"] = bool(content)
            self.prds[prd_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Updated section '{section_name}' in PRD {prd_id}")
        return True

    def validate_prd(self, prd_id: str) -> Dict[str, Any]:
        """
        Validate PRD completeness.

        Args:
            prd_id: PRD ID

        Returns:
            Validation results
        """
        if prd_id not in self.prds:
            return {"valid": False, "errors": ["PRD not found"]}

        prd = self.prds[prd_id]
        errors = []
        warnings = []

        # Check required sections
        for section_name, section in prd["sections"].items():
            if section.get("required") and not section.get("completed"):
                errors.append(f"Required section '{section_name}' is incomplete")

            if not section.get("content"):
                warnings.append(f"Section '{section_name}' is empty")

        # Check stakeholders
        if not prd.get("stakeholders"):
            warnings.append("No stakeholders defined")

        # Check approvals
        workflow = self.approval_workflows.get(prd_id, [])
        pending_approvals = [w for w in workflow if w["status"] == "pending"]
        if pending_approvals:
            warnings.append(f"{len(pending_approvals)} approvals pending")

        valid = len(errors) == 0

        return {
            "valid": valid,
            "errors": errors,
            "warnings": warnings,
            "completion_percent": self._get_completion_percent(prd)
        }

    def _get_completion_percent(self, prd: Dict[str, Any]) -> float:
        """Calculate PRD completion percentage."""
        sections = prd.get("sections", {})
        if not sections:
            return 0.0

        completed = sum(1 for s in sections.values() if s.get("completed"))
        return (completed / len(sections)) * 100

    def submit_for_approval(self, prd_id: str) -> bool:
        """
        Submit PRD for approval.

        Args:
            prd_id: PRD ID

        Returns:
            True if submitted successfully
        """
        if prd_id not in self.prds:
            print(f"Error: PRD {prd_id} not found")
            return False

        # Validate first
        validation = self.validate_prd(prd_id)
        if not validation["valid"]:
            print(f"Error: PRD validation failed: {validation['errors']}")
            return False

        with self._lock:
            self.prds[prd_id]["status"] = PRDStatus.IN_REVIEW.value
            self.prds[prd_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Submitted PRD {prd_id} for approval")
        return True

    def approve_prd(
        self,
        prd_id: str,
        role: str,
        approver: str,
        comments: Optional[str] = None
    ) -> bool:
        """
        Approve PRD for a specific role.

        Args:
            prd_id: PRD ID
            role: Approval role
            approver: Approver name
            comments: Optional approval comments

        Returns:
            True if approved successfully
        """
        if prd_id not in self.prds:
            return False

        with self._lock:
            # Update workflow
            workflow = self.approval_workflows.get(prd_id, [])
            for step in workflow:
                if step["role"] == role:
                    step["status"] = "approved"
                    step["approver"] = approver
                    step["approved_at"] = datetime.utcnow().isoformat()
                    step["comments"] = comments
                    break

            # Add to approvals list
            self.prds[prd_id]["approvals"].append({
                "role": role,
                "approver": approver,
                "approved_at": datetime.utcnow().isoformat(),
                "comments": comments
            })

            # Check if all approved
            all_approved = all(w["status"] == "approved" for w in workflow)
            if all_approved:
                self.prds[prd_id]["status"] = PRDStatus.APPROVED.value

            self.prds[prd_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Approved PRD {prd_id} for role '{role}' by {approver}")
        return True

    def add_stakeholder(
        self,
        prd_id: str,
        name: str,
        role: str,
        email: Optional[str] = None
    ) -> bool:
        """
        Add stakeholder to PRD.

        Args:
            prd_id: PRD ID
            name: Stakeholder name
            role: Stakeholder role
            email: Optional email

        Returns:
            True if added successfully
        """
        if prd_id not in self.prds:
            return False

        with self._lock:
            self.prds[prd_id]["stakeholders"].append({
                "name": name,
                "role": role,
                "email": email,
                "added_at": datetime.utcnow().isoformat()
            })
            self._save_data()

        print(f"Added stakeholder {name} ({role}) to PRD {prd_id}")
        return True

    def update_status(self, prd_id: str, status: PRDStatus) -> bool:
        """
        Update PRD status.

        Args:
            prd_id: PRD ID
            status: New status

        Returns:
            True if successful
        """
        if prd_id not in self.prds:
            return False

        with self._lock:
            self.prds[prd_id]["status"] = status.value
            self.prds[prd_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Updated PRD {prd_id} status to {status.value}")
        return True

    def create_new_version(self, prd_id: str) -> Optional[str]:
        """
        Create a new version of an existing PRD.

        Args:
            prd_id: Original PRD ID

        Returns:
            New PRD ID or None
        """
        if prd_id not in self.prds:
            return None

        original_prd = self.prds[prd_id]

        # Create new PRD
        new_prd_id = self.create_prd(
            f"{original_prd['title']} (v{original_prd['version'] + 1})",
            template_name=original_prd.get("template", "default")
        )

        # Copy sections
        with self._lock:
            for section_name, section_data in original_prd["sections"].items():
                self.prds[new_prd_id]["sections"][section_name]["content"] = \
                    section_data.get("content")

            # Copy metadata
            self.prds[new_prd_id]["metadata"]["previous_version"] = prd_id
            self.prds[new_prd_id]["version"] = original_prd["version"] + 1
            self._save_data()

        print(f"Created new version: {new_prd_id} (v{original_prd['version'] + 1})")
        return new_prd_id

    def export_to_markdown(self, prd_id: str, output_path: Optional[Path] = None) -> Path:
        """
        Export PRD to markdown file.

        Args:
            prd_id: PRD ID
            output_path: Output file path

        Returns:
            Path to exported file
        """
        if prd_id not in self.prds:
            raise ValueError(f"PRD {prd_id} not found")

        prd = self.prds[prd_id]

        if output_path is None:
            output_path = self.planning_root / f"prd_{prd_id}.md"

        with open(output_path, 'w') as f:
            # Header
            f.write(f"# {prd['title']}\n\n")
            f.write(f"**ID:** {prd['id']}\n")
            f.write(f"**Status:** {prd['status']}\n")
            f.write(f"**Version:** {prd['version']}\n")
            f.write(f"**Created:** {prd['created_at']}\n")
            f.write(f"**Updated:** {prd['updated_at']}\n\n")

            # Sections
            for section_name, section_data in prd["sections"].items():
                if not section_data.get("content"):
                    continue

                f.write(f"## {section_name.replace('_', ' ').title()}\n\n")

                # Format content based on type
                content = section_data["content"]
                if isinstance(content, list):
                    for item in content:
                        if isinstance(item, dict):
                            f.write(f"- **{item.get('key', '')}:** {item.get('value', '')}\n")
                        else:
                            f.write(f"- {item}\n")
                elif isinstance(content, dict):
                    for key, value in content.items():
                        f.write(f"- **{key}:** {value}\n")
                else:
                    f.write(f"{content}\n")

                f.write("\n")

            # Stakeholders
            if prd.get("stakeholders"):
                f.write("## Stakeholders\n\n")
                for stakeholder in prd["stakeholders"]:
                    f.write(f"- **{stakeholder['name']}** ({stakeholder['role']})")
                    if stakeholder.get("email"):
                        f.write(f" - {stakeholder['email']}")
                    f.write("\n")
                f.write("\n")

            # Approvals
            if prd.get("approvals"):
                f.write("## Approvals\n\n")
                for approval in prd["approvals"]:
                    f.write(f"- **{approval['role']}:** {approval['approver']}")
                    if approval.get("comments"):
                        f.write(f" - \"{approval['comments']}\"")
                    f.write(f" ({approval['approved_at']})\n")
                f.write("\n")

        print(f"Exported PRD to: {output_path}")
        return output_path

    def list_prds(self, status: Optional[PRDStatus] = None) -> List[Dict[str, Any]]:
        """
        List PRDs with optional filtering.

        Args:
            status: Filter by status

        Returns:
            List of PRDs
        """
        prds = list(self.prds.values())

        if status:
            prds = [p for p in prds if p["status"] == status.value]

        return prds


def cli_main():
    """CLI entry point for PRD management."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 PRD Manager")
    parser.add_argument("action", choices=["create", "update", "validate", "submit", "approve", "list", "export", "version"])
    parser.add_argument("--id", help="PRD ID")
    parser.add_argument("--title", help="PRD title")
    parser.add_argument("--section", help="Section name")
    parser.add_argument("--content", help="Section content (JSON)")
    parser.add_argument("--template", help="Template name", default="default")
    parser.add_argument("--role", help="Approval role")
    parser.add_argument("--approver", help="Approver name")
    parser.add_argument("--comments", help="Approval comments")
    parser.add_argument("--stakeholder", help="Stakeholder name")
    parser.add_argument("--stakeholder-role", help="Stakeholder role")
    parser.add_argument("--output", help="Output file for export")

    args = parser.parse_args()
    mgr = PRDManager()

    if args.action == "create":
        mgr.create_prd(args.title, template_name=args.template)

    elif args.action == "update":
        if not args.id or not args.section:
            print("Error: --id and --section required for update")
            return 1

        import json
        content = json.loads(args.content) if args.content else None
        mgr.update_section(args.id, args.section, content)

    elif args.action == "validate":
        if not args.id:
            print("Error: --id required for validate")
            return 1

        validation = mgr.validate_prd(args.id)
        print(json.dumps(validation, indent=2))

    elif args.action == "submit":
        if not args.id:
            print("Error: --id required for submit")
            return 1
        mgr.submit_for_approval(args.id)

    elif args.action == "approve":
        if not args.id or not args.role or not args.approver:
            print("Error: --id, --role, and --approver required for approve")
            return 1
        mgr.approve_prd(args.id, args.role, args.approver, args.comments)

    elif args.action == "list":
        prds = mgr.list_prds()
        print(f"Found {len(prds)} PRDs:")
        for prd in prds:
            print(f"  - {prd['id']}: {prd['title']} ({prd['status']})")

    elif args.action == "export":
        if not args.id:
            print("Error: --id required for export")
            return 1
        output = Path(args.output) if args.output else None
        mgr.export_to_markdown(args.id, output)

    elif args.action == "version":
        if not args.id:
            print("Error: --id required for version")
            return 1
        mgr.create_new_version(args.id)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
