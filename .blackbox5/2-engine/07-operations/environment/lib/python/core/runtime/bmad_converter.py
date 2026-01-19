#!/usr/bin/env python3
"""
BMAD Agent Converter
Converts BMAD YAML agents to Blackbox3 agent.md format with think-rail integration
"""

import yaml
from pathlib import Path
from typing import Dict, Any, Optional
import json


class BMADAgentConverter:
    """Convert BMAD agents to Blackbox3 format"""

    def __init__(self, output_dir: Path):
        self.output_dir = Path(output_dir)

    def convert_agent(self, yaml_path: Path) -> str:
        """
        Convert BMAD YAML agent to Blackbox3 agent.md

        Args:
            yaml_path: Path to BMAD .agent.yaml file

        Returns:
            Converted agent.md content
        """
        # Load YAML
        with open(yaml_path) as f:
            data = yaml.safe_load(f)

        agent_data = data.get("agent", {})
        metadata = agent_data.get("metadata", {})
        persona = agent_data.get("persona", {})
        menu = agent_data.get("menu", [])
        critical_actions = agent_data.get("critical_actions", [])

        # Extract metadata
        agent_id = metadata.get("id", "unknown")
        name = metadata.get("name", "Unknown")
        title = metadata.get("title", "")
        icon = metadata.get("icon", "🤖")
        has_sidecar = metadata.get("hasSidecar", False)

        # Extract persona
        role = persona.get("role", "")
        identity = persona.get("identity", "")
        comm_style = persona.get("communication_style", "")
        principles = persona.get("principles", "")

        # Determine complexity tier
        tier = self._determine_tier(role, name)

        # Build agent.md
        agent_md = self._build_agent_md(
            agent_id=agent_id,
            name=name,
            title=title,
            icon=icon,
            role=role,
            identity=identity,
            comm_style=comm_style,
            principles=principles,
            menu=menu,
            critical_actions=critical_actions,
            has_sidecar=has_sidecar,
            tier=tier
        )

        return agent_md

    def _determine_tier(self, role: str, name: str) -> str:
        """Determine agent complexity tier"""
        role_lower = role.lower()
        name_lower = name.lower()

        # Tier 1: Strategic (HQ Model)
        if any(kw in role_lower or kw in name_lower for kw in [
            "product manager", "architect", "scrum master", "business analyst",
            "pm", "sm", "architect"
        ]):
            return "strategic"

        # Tier 2: Specialist (Balanced Model)
        elif any(kw in role_lower or kw in name_lower for kw in [
            "developer", "dev", "frontend", "backend", "fullstack",
            "ux", "designer", "security", "devops", "performance",
            "qa", "test", "documentation", "tech writer"
        ]):
            return "specialist"

        # Tier 3: Executor (Fast Model)
        else:
            return "executor"

    def _build_agent_md(self,
                       agent_id: str,
                       name: str,
                       title: str,
                       icon: str,
                       role: str,
                       identity: str,
                       comm_style: str,
                       principles: str,
                       menu: list,
                       critical_actions: list,
                       has_sidecar: bool,
                       tier: str) -> str:
        """Build agent.md content"""

        # Model mapping based on tier
        model_mapping = {
            "strategic": "GLM-4 Plus / Claude Opus (HQ)",
            "specialist": "GLM-4 / Claude Sonnet (Balanced)",
            "executor": "GLM-4 Flash / Claude Haiku (Fast)"
        }

        model = model_mapping[tier]

        md = f"""# {title}

{icon} **Agent Name:** {name}
**Tier:** {tier.upper()}
**Primary Model:** {model}
**Sidecar:** {"Yes" if has_sidecar else "No"}

---

## 🎭 Persona

### Role
{role}

### Identity
{identity}

### Communication Style
{comm_style}

### Principles
{principles}

---

## 🛡️ Think-Rail Configuration

**Validation Level:** {tier}

### Hierarchical Oversight

**Tier: {tier.upper()}**
"""

        if tier == "strategic":
            md += """
- **Trust Level:** TRUSTED (for most actions)
- **Validation:** Only high-risk actions (git_push, file_delete) are validated
- **Spot-Check Rate:** 0% (trusted to make decisions)
- **Rationale:** High-complexity strategic agents have deep domain expertise
"""
        elif tier == "specialist":
            md += """
- **Trust Level:** SPOT_CHECK
- **Validation:** 30% random spot-checking
- **High-Risk Actions:** Always validated
- **Spot-Check Rate:** 30%
- **Rationale:** Medium-complexity specialists are competent but benefit from oversight
"""
        else:  # executor
            md += """
- **Trust Level:** ALWAYS_VALIDATE
- **Validation:** Every action validated before execution
- **Spot-Check Rate:** 100%
- **Rationale:** Low-complexity executors need consistent oversight
"""

        md += """
---

## 🚀 Critical Actions

Always execute these actions first:
"""

        for i, action in enumerate(critical_actions, 1):
            md += f"{i}. {action}\n"

        if not critical_actions:
            md += "No critical actions defined.\n"

        md += """

---

## 📋 Menu Commands

"""

        if menu:
            for item in menu:
                trigger = item.get("trigger", "")
                description = item.get("description", "")
                action = item.get("action", item.get("workflow", item.get("exec", "")))
                ide_only = item.get("ide-only", False)

                md += f"### {description}\n"
                md += f"- **Trigger:** `{trigger}`\n"
                md += f"- **Action:** `{action}`\n"
                if ide_only:
                    md += "- **IDE Only:** Yes\n"
                md += "\n"
        else:
            md += "No menu commands defined.\n"

        md += """
---

## 🧠 Context Integration

This agent automatically receives context from:

1. **Codebase Scanner:** Finds similar features, patterns, and lessons learned
2. **Model Router:** Routes to appropriate model based on task complexity
3. **Think-Rail Validator:** Validates actions based on agent tier

### Before Execution

Agent receives:
- Similar features built in codebase
- Reusable patterns
- Relevant code files
- Lessons learned from past work

### During Execution

Agent actions are validated based on:
- Agent tier (strategic/specialist/executor)
- Action risk level (low/medium/high)
- Random spot-checking (for specialists)

---

## 🔧 Usage

### Initialization

```bash
blackbox3 agent init {name}
```

### Execution

```bash
blackbox3 agent run {name}
```

### With Context

```bash
blackbox3 agent run {name} --context
```

This will automatically:
1. Scan codebase for relevant context
2. Route to appropriate model
3. Validate actions during execution

---

## 📊 Metrics

Track agent performance:

- **Validation Rate:** Percentage of actions validated
- **Approval Rate:** Percentage of validated actions approved
- **Efficiency Gain:** Actions that skipped validation (trusted agents)

---

*Generated from BMAD-METHOD agent*
*Integrated with Think-Rail oversight system*
"""

        return md

    def convert_all(self, bmad_src: Path) -> list:
        """
        Convert all BMAD agents to Blackbox3 format

        Args:
            bmad_src: Path to BMAD-METHOD source directory

        Returns:
            List of converted file paths
        """
        converted = []

        # Find all .agent.yaml files
        agent_files = list(bmad_src.rglob("*.agent.yaml"))

        for agent_file in agent_files:
            try:
                # Convert
                agent_md = self.convert_agent(agent_file)

                # Determine output path
                relative_path = agent_file.relative_to(bmad_src)
                agent_id = relative_path.stem.replace(".agent", "")

                output_file = self.output_dir / f"{agent_id}.md"

                # Write
                output_file.parent.mkdir(parents=True, exist_ok=True)
                with open(output_file, "w") as f:
                    f.write(agent_md)

                converted.append(output_file)
                print(f"✅ Converted: {agent_file.name} → {output_file.name}")

            except Exception as e:
                print(f"❌ Failed to convert {agent_file.name}: {e}")

        return converted


def main():
    """CLI entry point"""
    import sys

    if len(sys.argv) < 3:
        print("Usage: python bmad_converter.py <bmad-src> <output-dir>")
        sys.exit(1)

    bmad_src = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])

    if not bmad_src.exists():
        print(f"Error: BMAD source directory not found: {bmad_src}")
        sys.exit(1)

    # Create converter
    converter = BMADAgentConverter(output_dir)

    # Convert all agents
    print(f"\n🔥 Converting BMAD agents to Blackbox3 format...")
    print(f"   Source: {bmad_src}")
    print(f"   Output: {output_dir}\n")

    converted = converter.convert_all(bmad_src)

    print(f"\n✅ Converted {len(converted)} agents")
    print(f"📂 Output directory: {output_dir}")
    print(f"\n🎯 Next Steps:")
    print(f"   1. Review converted agents")
    print(f"   2. Test with think-rail validation")
    print(f"   3. Integrate into orchestrator")


if __name__ == "__main__":
    main()
