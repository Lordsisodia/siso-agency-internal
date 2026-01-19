#!/usr/bin/env python3
"""
Sidecar File System for Expert Agents
Provides persistent memory, config, and knowledge for agents

Based on BMAD-METHOD sidecar pattern
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import yaml
import json
from datetime import datetime


class SidecarManager:
    """
    Manages agent sidecar files

    Sidecar Structure:
    agent-name-sidecar/
    ├── .config/
    │   └── agent-config.yaml
    ├── knowledge/
    │   ├── patterns.md
    │   ├── learnings.md
    │   └── domain-knowledge.md
    ├── context/
    │   └── session-history.md
    └── memories/
        ├── insights.md
        └── feedback.md

    Benefits:
    - Agents maintain memory across sessions
    - Accumulate domain knowledge over time
    - Persistent configuration
    - Context awareness of previous runs
    """

    def __init__(self, agent_path: Path, blackbox_root: Path):
        self.agent_path = Path(agent_path)
        self.blackbox_root = Path(blackbox_root)
        self.agent_name = self.agent_path.name

        # Sidecar path
        self.sidecar_path = self.agent_path / f"{self.agent_name}-sidecar"

        # Ensure sidecar structure exists
        self._ensure_sidecar_structure()

    def _ensure_sidecar_structure(self):
        """Create sidecar directory structure if it doesn't exist"""
        directories = [
            self.sidecar_path / "config",
            self.sidecar_path / "knowledge",
            self.sidecar_path / "context",
            self.sidecar_path / "memories"
        ]

        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

        # Create default files if they don't exist
        self._create_default_files()

    def _create_default_files(self):
        """Create default sidecar files"""
        # Config
        config_file = self.sidecar_path / "config" / "agent-config.yaml"
        if not config_file.exists():
            default_config = {
                "agent_name": self.agent_name,
                "created_at": datetime.now().isoformat(),
                "version": "1.0",
                "settings": {
                    "max_memory_items": 1000,
                    "auto_save": True,
                    "context_window": 10
                }
            }
            with open(config_file, 'w') as f:
                yaml.dump(default_config, f, default_flow_style=False)

        # Knowledge files
        for knowledge_file in ["patterns.md", "learnings.md", "domain-knowledge.md"]:
            kf = self.sidecar_path / "knowledge" / knowledge_file
            if not kf.exists():
                kf.write_text(f"# {knowledge_file.replace('-', ' ').title()}\n\n*Knowledge accumulated over time*\n\n")

        # Context
        context_file = self.sidecar_path / "context" / "session-history.md"
        if not context_file.exists():
            context_file.write_text("# Session History\n\n*Record of agent interactions*\n\n")

        # Memories
        for memory_file in ["insights.md", "feedback.md"]:
            mf = self.sidecar_path / "memories" / memory_file
            if not mf.exists():
                mf.write_text(f"# {memory_file.replace('-', ' ').title()}\n\n*Accumulated insights and feedback*\n\n")

    def load_context(self) -> Dict[str, Any]:
        """
        Load all sidecar context for agent

        Returns:
            Dictionary with config, knowledge, context, and memories
        """
        context = {
            "config": self._load_config(),
            "knowledge": self._load_knowledge(),
            "context": self._load_context(),
            "memories": self._load_memories()
        }

        return context

    def _load_config(self) -> Dict[str, Any]:
        """Load agent configuration"""
        config_file = self.sidecar_path / "config" / "agent-config.yaml"
        if config_file.exists():
            with open(config_file, 'r') as f:
                return yaml.safe_load(f)
        return {}

    def _load_knowledge(self) -> Dict[str, str]:
        """Load knowledge base"""
        knowledge = {}
        knowledge_dir = self.sidecar_path / "knowledge"

        for kf in knowledge_dir.glob("*.md"):
            key = kf.stem
            knowledge[key] = kf.read_text()

        return knowledge

    def _load_context(self) -> Dict[str, str]:
        """Load session context"""
        context = {}
        context_dir = self.sidecar_path / "context"

        for cf in context_dir.glob("*.md"):
            key = cf.stem
            context[key] = cf.read_text()

        return context

    def _load_memories(self) -> Dict[str, str]:
        """Load memories"""
        memories = {}
        memories_dir = self.sidecar_path / "memories"

        for mf in memories_dir.glob("*.md"):
            key = mf.stem
            memories[key] = mf.read_text()

        return memories

    def save_insight(self, insight: str, category: str = "general"):
        """
        Save a new insight to memories

        Args:
            insight: The insight to save
            category: Category for the insight (default: general)
        """
        insights_file = self.sidecar_path / "memories" / "insights.md"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        new_insight = f"\n## {timestamp} - {category.title()}\n\n{insight}\n"

        with open(insights_file, 'a') as f:
            f.write(new_insight)

    def update_knowledge(self, key: str, content: str, file_type: str = "learnings"):
        """
        Update knowledge base

        Args:
            key: Knowledge key
            content: Content to add
            file_type: Type of knowledge file (patterns, learnings, domain-knowledge)
        """
        knowledge_file = self.sidecar_path / "knowledge" / f"{file_type}.md"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        new_entry = f"\n## {timestamp} - {key}\n\n{content}\n"

        with open(knowledge_file, 'a') as f:
            f.write(new_entry)

    def log_session(self, session_data: Dict[str, Any]):
        """
        Log session to context

        Args:
            session_data: Session information
        """
        context_file = self.sidecar_path / "context" / "session-history.md"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        session_entry = f"\n## Session: {timestamp}\n\n"
        session_entry += f"- **Task**: {session_data.get('task', 'N/A')}\n"
        session_entry += f"- **Status**: {session_data.get('status', 'N/A')}\n"
        session_entry += f"- **Duration**: {session_data.get('duration', 'N/A')}\n"
        session_entry += f"- **Tokens**: {session_data.get('tokens', 'N/A')}\n"

        if session_data.get('notes'):
            session_entry += f"\n**Notes**:\n{session_data['notes']}\n"

        session_entry += "\n---\n"

        with open(context_file, 'a') as f:
            f.write(session_entry)

    def save_feedback(self, feedback: str, positive: bool = True):
        """
        Save feedback for agent improvement

        Args:
            feedback: Feedback text
            positive: Whether feedback is positive (default: True)
        """
        feedback_file = self.sidecar_path / "memories" / "feedback.md"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sentiment = "✅ Positive" if positive else "❌ Negative"

        new_feedback = f"\n## {timestamp} - {sentiment}\n\n{feedback}\n"

        with open(feedback_file, 'a') as f:
            f.write(new_feedback)

    def update_config(self, updates: Dict[str, Any]):
        """
        Update agent configuration

        Args:
            updates: Configuration updates to apply
        """
        config_file = self.sidecar_path / "config" / "agent-config.yaml"

        # Load existing config
        if config_file.exists():
            with open(config_file, 'r') as f:
                config = yaml.safe_load(f)
        else:
            config = {}

        # Update with new values
        config.update(updates)
        config['updated_at'] = datetime.now().isoformat()

        # Save updated config
        with open(config_file, 'w') as f:
            yaml.dump(config, f, default_flow_style=False)

    def get_recent_insights(self, limit: int = 10) -> List[str]:
        """
        Get recent insights from memories

        Args:
            limit: Maximum number of insights to return

        Returns:
            List of recent insights
        """
        insights_file = self.sidecar_path / "memories" / "insights.md"

        if not insights_file.exists():
            return []

        content = insights_file.read_text()

        # Split by ## to get individual insights
        insight_blocks = content.split("## ")[-limit:]  # Get last 'limit' insights

        return [block.strip() for block in insight_blocks if block.strip()]

    def get_knowledge_summary(self) -> Dict[str, int]:
        """
        Get summary of knowledge base

        Returns:
            Dictionary with file names and line counts
        """
        knowledge_dir = self.sidecar_path / "knowledge"

        summary = {}
        for kf in knowledge_dir.glob("*.md"):
            lines = len(kf.read_text().split('\n'))
            summary[kf.stem] = lines

        return summary

    def search_knowledge(self, query: str) -> List[Dict[str, str]]:
        """
        Search knowledge base for query

        Args:
            query: Search query

        Returns:
            List of matching knowledge entries
        """
        results = []
        knowledge_dir = self.sidecar_path / "knowledge"

        query_lower = query.lower()

        for kf in knowledge_dir.glob("*.md"):
            content = kf.read_text()
            lines = content.split('\n')

            for i, line in enumerate(lines):
                if query_lower in line.lower():
                    # Get context (3 lines before and after)
                    start = max(0, i - 3)
                    end = min(len(lines), i + 4)
                    context = '\n'.join(lines[start:end])

                    results.append({
                        "file": kf.stem,
                        "line": i + 1,
                        "context": context
                    })

        return results

    def export_sidecar(self, output_path: Optional[Path] = None) -> Path:
        """
        Export sidecar as compressed archive

        Args:
            output_path: Optional output path

        Returns:
            Path to exported archive
        """
        import shutil

        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = self.blackbox_root / ".blackbox3" / "exports" / f"{self.agent_name}_sidecar_{timestamp}.tar.gz"

        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Create tar.gz archive
        shutil.make_archive(
            str(output_path.with_suffix('')),
            'gztar',
            str(self.sidecar_path.parent),
            str(self.sidecar_path.name)
        )

        return output_path

    def import_sidecar(self, archive_path: Path):
        """
        Import sidecar from compressed archive

        Args:
            archive_path: Path to archive file
        """
        import shutil
        import tarfile

        # Extract archive
        with tarfile.open(archive_path, 'r:gz') as tar:
            tar.extractall(path=self.sidecar_path.parent)

        print(f"✅ Sidecar imported from {archive_path}")

    def clear_old_context(self, keep_sessions: int = 10):
        """
        Clear old session history, keeping only recent sessions

        Args:
            keep_sessions: Number of recent sessions to keep
        """
        context_file = self.sidecar_path / "context" / "session-history.md"

        if not context_file.exists():
            return

        content = context_file.read_text()

        # Split by ## Session:
        sessions = content.split("## Session: ")

        # Keep header + last N sessions
        if len(sessions) > keep_sessions + 1:  # +1 for header
            header = sessions[0]
            recent_sessions = sessions[-(keep_sessions + 1):]

            new_content = "## Session: ".join([header] + recent_sessions)

            # Write back
            context_file.write_text(new_content)

            print(f"✅ Cleared old sessions, kept last {keep_sessions}")

    def get_sidecar_stats(self) -> Dict[str, Any]:
        """
        Get statistics about sidecar usage

        Returns:
            Dictionary with sidecar statistics
        """
        stats = {
            "agent_name": self.agent_name,
            "sidecar_path": str(self.sidecar_path),
            "knowledge_files": len(list((self.sidecar_path / "knowledge").glob("*.md"))),
            "context_files": len(list((self.sidecar_path / "context").glob("*.md"))),
            "memory_files": len(list((self.sidecar_path / "memories").glob("*.md"))),
            "total_size_bytes": sum(f.stat().st_size for f in self.sidecar_path.rglob("*") if f.is_file()),
            "insights_count": len(self.get_recent_insights(1000)),
            "last_updated": datetime.fromtimestamp(self.sidecar_path.stat().st_mtime).isoformat()
        }

        return stats


class SidecarLoader:
    """
    Utility class to load sidecar context into agents

    Usage:
        # In agent initialization
        sidecar = SidecarLoader(agent_path, blackbox_root)
        context = sidecar.load_for_agent()

        # Use context in agent prompt
        prompt = f"Context: {context['summary']}\n\nRecent insights: {context['recent_insights']}"
    """

    def __init__(self, agent_path: Path, blackbox_root: Path):
        self.sidecar = SidecarManager(agent_path, blackbox_root)

    def load_for_agent(self, max_insights: int = 5) -> Dict[str, Any]:
        """
        Load sidecar context formatted for agent consumption

        Args:
            max_insights: Maximum insights to include

        Returns:
            Formatted context dictionary
        """
        full_context = self.sidecar.load_context()

        # Format for agent
        agent_context = {
            "config": full_context.get("config", {}),
            "knowledge_summary": self.sidecar.get_knowledge_summary(),
            "recent_insights": self.sidecar.get_recent_insights(max_insights),
            "session_count": len(full_context.get("context", {}).get("session-history", "").split("## Session: ")) - 1,
            "stats": self.sidecar.get_sidecar_stats()
        }

        return agent_context

    def get_context_prompt(self) -> str:
        """
        Get sidecar context as formatted prompt string

        Returns:
            Formatted context prompt
        """
        context = self.load_for_agent()

        prompt = f"""# Sidecar Context for {context['stats']['agent_name']}

## Configuration
{yaml.dump(context.get('config', {}), default_flow_style=False)}

## Knowledge Base
{chr(10).join([f"- {k}: {v} lines" for k, v in context.get('knowledge_summary', {}).items()]) if context.get('knowledge_summary') else "No knowledge yet"}

## Recent Insights
{chr(10).join([f"- {insight}" for insight in context.get('recent_insights', [])]) if context.get('recent_insights') else "No insights yet"}

## Statistics
- Total sessions: {context.get('session_count', 0)}
- Total files: {context['stats']['knowledge_files'] + context['stats']['context_files'] + context['stats']['memory_files']}
- Size: {context['stats']['total_size_bytes']} bytes
- Last updated: {context['stats']['last_updated']}
"""

        return prompt
