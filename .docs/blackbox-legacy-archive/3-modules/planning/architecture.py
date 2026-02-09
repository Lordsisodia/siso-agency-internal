#!/usr/bin/env python3
"""
Architecture Manager for Blackbox3

Provides system architecture planning with component diagrams,
dependency tracking, and technical decision records (TDRs).
"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
import threading


class ArchitectureStatus(Enum):
    """Architecture status enumeration."""
    DRAFT = "draft"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class DecisionStatus(Enum):
    """TDR status enumeration."""
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    DEPRECATED = "deprecated"
    SUPERSEDED = "superseded"


class ArchitectureManager:
    """
    Manages system architecture and technical decisions.

    Features:
    - Component architecture modeling
    - Dependency graph visualization
    - Technical Decision Records (TDRs)
    - System context diagrams
    - Data flow documentation
    - Integration mapping
    - Technology stack tracking
    - Architecture decision logging
    """

    def __init__(self, planning_root: Optional[Path] = None):
        """
        Initialize architecture manager.

        Args:
            planning_root: Root directory for planning data
        """
        self.planning_root = Path(planning_root) if planning_root else Path.cwd() / ".plans"
        self.planning_root.mkdir(parents=True, exist_ok=True)

        self._lock = threading.RLock()

        # Data storage
        self.architectures: Dict[str, Dict[str, Any]] = {}
        self.components: Dict[str, Dict[str, Any]] = {}
        self.tdrs: Dict[str, Dict[str, Any]] = {}
        self.dependencies: Dict[str, List[str]] = {}

        # Load existing data
        self._load_data()

    def _load_data(self):
        """Load architecture data from disk."""
        arch_file = self.planning_root / "architectures.json"
        comp_file = self.planning_root / "components.json"
        tdr_file = self.planning_root / "tdrs.json"
        dep_file = self.planning_root / "arch_dependencies.json"

        for file_path, storage in [
            (arch_file, self.architectures),
            (comp_file, self.components),
            (tdr_file, self.tdrs),
            (dep_file, self.dependencies)
        ]:
            if file_path.exists():
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                        storage.update(data)
                except Exception as e:
                    print(f"Warning: Could not load {file_path.name}: {e}")

    def _save_data(self):
        """Save architecture data to disk."""
        arch_file = self.planning_root / "architectures.json"
        comp_file = self.planning_root / "components.json"
        tdr_file = self.planning_root / "tdrs.json"
        dep_file = self.planning_root / "arch_dependencies.json"

        with self._lock:
            for file_path, data in [
                (arch_file, self.architectures),
                (comp_file, self.components),
                (tdr_file, self.tdrs),
                (dep_file, self.dependencies)
            ]:
                with open(file_path, 'w') as f:
                    json.dump(data, f, indent=2)

    def create_architecture(
        self,
        name: str,
        description: str,
        scope: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create a new architecture document.

        Args:
            name: Architecture name
            description: Architecture description
            scope: Architecture scope (system, module, component)
            metadata: Optional metadata

        Returns:
            Architecture ID
        """
        arch_id = str(uuid.uuid4())[:8]

        architecture = {
            "id": arch_id,
            "name": name,
            "description": description,
            "scope": scope,
            "status": ArchitectureStatus.DRAFT.value,
            "components": [],
            "external_systems": [],
            "data_flows": [],
            "technology_stack": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }

        with self._lock:
            self.architectures[arch_id] = architecture
            self._save_data()

        print(f"Created architecture: {arch_id} - {name}")
        return arch_id

    def add_component(
        self,
        arch_id: str,
        name: str,
        component_type: str,
        description: str,
        responsibilities: Optional[List[str]] = None,
        technologies: Optional[List[str]] = None,
        interfaces: Optional[List[str]] = None
    ) -> str:
        """
        Add a component to architecture.

        Args:
            arch_id: Architecture ID
            name: Component name
            component_type: Component type (service, module, library, etc.)
            description: Component description
            responsibilities: List of component responsibilities
            technologies: Technologies used
            interfaces: Public interfaces

        Returns:
            Component ID
        """
        if arch_id not in self.architectures:
            print(f"Error: Architecture {arch_id} not found")
            return None

        comp_id = str(uuid.uuid4())[:8]

        component = {
            "id": comp_id,
            "arch_id": arch_id,
            "name": name,
            "type": component_type,
            "description": description,
            "responsibilities": responsibilities or [],
            "technologies": technologies or [],
            "interfaces": interfaces or [],
            "dependencies": [],
            "created_at": datetime.utcnow().isoformat()
        }

        with self._lock:
            self.components[comp_id] = component
            self.architectures[arch_id]["components"].append(comp_id)
            self.architectures[arch_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Added component to architecture: {comp_id} - {name}")
        return comp_id

    def add_dependency(
        self,
        component_id: str,
        depends_on: str,
        dependency_type: str = "uses"
    ) -> bool:
        """
        Add dependency between components.

        Args:
            component_id: Component ID
            depends_on: ID of component this depends on
            dependency_type: Type of dependency (uses, extends, implements)

        Returns:
            True if successful
        """
        if component_id not in self.components or depends_on not in self.components:
            print("Error: Both components must exist")
            return False

        with self._lock:
            if component_id not in self.dependencies:
                self.dependencies[component_id] = []

            self.dependencies[component_id].append({
                "depends_on": depends_on,
                "type": dependency_type,
                "added_at": datetime.utcnow().isoformat()
            })

            self.components[component_id]["dependencies"].append(depends_on)
            self._save_data()

        print(f"Added dependency: {component_id} -> {depends_on}")
        return True

    def create_tdr(
        self,
        title: str,
        context: str,
        decision: str,
        consequences: List[str],
        alternatives: Optional[List[Dict[str, str]]] = None,
        status: DecisionStatus = DecisionStatus.PROPOSED
    ) -> str:
        """
        Create a Technical Decision Record.

        Args:
            title: Decision title
            context: Problem context
            decision: Decision description
            consequences: Consequences of decision
            alternatives: Alternative solutions considered
            status: Decision status

        Returns:
            TDR ID
        """
        tdr_id = str(uuid.uuid4())[:8]

        tdr = {
            "id": tdr_id,
            "title": title,
            "status": status.value,
            "context": context,
            "decision": decision,
            "consequences": consequences,
            "alternatives": alternatives or [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        with self._lock:
            self.tdrs[tdr_id] = tdr
            self._save_data()

        print(f"Created TDR: {tdr_id} - {title}")
        return tdr_id

    def update_tdr_status(self, tdr_id: str, status: DecisionStatus) -> bool:
        """
        Update TDR status.

        Args:
            tdr_id: TDR ID
            status: New status

        Returns:
            True if successful
        """
        if tdr_id not in self.tdrs:
            return False

        with self._lock:
            self.tdrs[tdr_id]["status"] = status.value
            self.tdrs[tdr_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Updated TDR {tdr_id} status to {status.value}")
        return True

    def add_data_flow(
        self,
        arch_id: str,
        source: str,
        destination: str,
        data: str,
        protocol: Optional[str] = None,
        frequency: Optional[str] = None
    ) -> bool:
        """
        Add data flow to architecture.

        Args:
            arch_id: Architecture ID
            source: Source component
            destination: Destination component
            data: Data being transferred
            protocol: Communication protocol
            frequency: Flow frequency

        Returns:
            True if successful
        """
        if arch_id not in self.architectures:
            return False

        flow = {
            "source": source,
            "destination": destination,
            "data": data,
            "protocol": protocol,
            "frequency": frequency,
            "added_at": datetime.utcnow().isoformat()
        }

        with self._lock:
            self.architectures[arch_id]["data_flows"].append(flow)
            self.architectures[arch_id]["updated_at"] = datetime.utcnow().isoformat()
            self._save_data()

        print(f"Added data flow: {source} -> {destination}")
        return True

    def generate_dependency_graph(self, arch_id: str) -> Optional[Dict[str, Any]]:
        """
        Generate dependency graph for architecture.

        Args:
            arch_id: Architecture ID

        Returns:
            Dependency graph
        """
        if arch_id not in self.architectures:
            return None

        arch = self.architectures[arch_id]
        component_ids = arch.get("components", [])

        graph = {
            "nodes": [],
            "edges": []
        }

        # Add nodes
        for comp_id in component_ids:
            if comp_id in self.components:
                comp = self.components[comp_id]
                graph["nodes"].append({
                    "id": comp_id,
                    "name": comp["name"],
                    "type": comp["type"]
                })

        # Add edges
        for comp_id in component_ids:
            if comp_id in self.dependencies:
                for dep in self.dependencies[comp_id]:
                    graph["edges"].append({
                        "from": comp_id,
                        "to": dep["depends_on"],
                        "type": dep["type"]
                    })

        return graph

    def export_architecture_to_markdown(self, arch_id: str, output_path: Optional[Path] = None) -> Path:
        """
        Export architecture to markdown file.

        Args:
            arch_id: Architecture ID
            output_path: Output file path

        Returns:
            Path to exported file
        """
        if arch_id not in self.architectures:
            raise ValueError(f"Architecture {arch_id} not found")

        arch = self.architectures[arch_id]

        if output_path is None:
            output_path = self.planning_root / f"architecture_{arch_id}.md"

        with open(output_path, 'w') as f:
            # Header
            f.write(f"# {arch['name']}\n\n")
            f.write(f"**ID:** {arch['id']}\n")
            f.write(f"**Scope:** {arch['scope']}\n")
            f.write(f"**Status:** {arch['status']}\n\n")

            # Description
            f.write("## Overview\n\n")
            f.write(f"{arch['description']}\n\n")

            # Components
            if arch.get("components"):
                f.write("## Components\n\n")
                for comp_id in arch["components"]:
                    if comp_id in self.components:
                        comp = self.components[comp_id]
                        f.write(f"### {comp['name']}\n\n")
                        f.write(f"**Type:** {comp['type']}\n")
                        f.write(f"**Description:** {comp['description']}\n\n")

                        if comp.get("responsibilities"):
                            f.write("**Responsibilities:**\n\n")
                            for resp in comp["responsibilities"]:
                                f.write(f"- {resp}\n")
                            f.write("\n")

                        if comp.get("technologies"):
                            f.write(f"**Technologies:** {', '.join(comp['technologies'])}\n\n")

                        if comp.get("interfaces"):
                            f.write("**Interfaces:**\n\n")
                            for iface in comp["interfaces"]:
                                f.write(f"- `{iface}`\n")
                            f.write("\n")

            # Data Flows
            if arch.get("data_flows"):
                f.write("## Data Flows\n\n")
                for flow in arch["data_flows"]:
                    f.write(f"- **{flow['source']}** → **{flow['destination']}**\n")
                    f.write(f"  - Data: {flow['data']}\n")
                    if flow.get("protocol"):
                        f.write(f"  - Protocol: {flow['protocol']}\n")
                    if flow.get("frequency"):
                        f.write(f"  - Frequency: {flow['frequency']}\n")
                    f.write("\n")

            # Technology Stack
            if arch.get("technology_stack"):
                f.write("## Technology Stack\n\n")
                for tech in arch["technology_stack"]:
                    f.write(f"- {tech}\n")
                f.write("\n")

            # Dependency Graph
            graph = self.generate_dependency_graph(arch_id)
            if graph:
                f.write("## Dependencies\n\n")
                for edge in graph["edges"]:
                    from_comp = next((c for c in graph["nodes"] if c["id"] == edge["from"]), {})
                    to_comp = next((c for c in graph["nodes"] if c["id"] == edge["to"]), {})
                    f.write(f"- {from_comp.get('name', edge['from'])} → {to_comp.get('name', edge['to'])}\n")
                f.write("\n")

        print(f"Exported architecture to: {output_path}")
        return output_path

    def export_tdr_to_markdown(self, tdr_id: str, output_path: Optional[Path] = None) -> Path:
        """
        Export TDR to markdown file.

        Args:
            tdr_id: TDR ID
            output_path: Output file path

        Returns:
            Path to exported file
        """
        if tdr_id not in self.tdrs:
            raise ValueError(f"TDR {tdr_id} not found")

        tdr = self.tdrs[tdr_id]

        if output_path is None:
            output_path = self.planning_root / f"tdr_{tdr_id}.md"

        with open(output_path, 'w') as f:
            f.write(f"# {tdr['title']}\n\n")
            f.write(f"**Status:** {tdr['status']}\n")
            f.write(f"**Date:** {tdr['created_at']}\n\n")

            f.write("## Context\n\n")
            f.write(f"{tdr['context']}\n\n")

            f.write("## Decision\n\n")
            f.write(f"{tdr['decision']}\n\n")

            f.write("## Consequences\n\n")
            for consequence in tdr["consequences"]:
                f.write(f"- {consequence}\n")
            f.write("\n")

            if tdr.get("alternatives"):
                f.write("## Alternatives Considered\n\n")
                for alt in tdr["alternatives"]:
                    f.write(f"### {alt.get('title', 'Alternative')}\n\n")
                    f.write(f"{alt.get('description', '')}\n\n")
                    f.write(f"**Rejected because:** {alt.get('rejection_reason', '')}\n\n")

        print(f"Exported TDR to: {output_path}")
        return output_path


def cli_main():
    """CLI entry point for architecture management."""
    import argparse

    parser = argparse.ArgumentParser(description="Blackbox3 Architecture Manager")
    parser.add_argument("action", choices=["create-arch", "add-comp", "add-dep", "create-tdr", "export-arch", "export-tdr", "list"])
    parser.add_argument("--id", help="Architecture/Component/TDR ID")
    parser.add_argument("--name", help="Name")
    parser.add_argument("--description", help="Description")
    parser.add_argument("--scope", help="Architecture scope")
    parser.add_argument("--type", help="Component type")
    parser.add_argument("--depends-on", help="Dependency target ID")
    parser.add_argument("--dep-type", help="Dependency type", default="uses")
    parser.add_argument("--title", help="TDR title")
    parser.add_argument("--context", help="TDR context")
    parser.add_argument("--decision", help="TDR decision")
    parser.add_argument("--output", help="Output file for export")

    args = parser.parse_args()
    mgr = ArchitectureManager()

    if args.action == "create-arch":
        mgr.create_architecture(args.name, args.description, args.scope or "system")

    elif args.action == "add-comp":
        if not args.id:
            print("Error: --id (architecture ID) required")
            return 1
        mgr.add_component(args.id, args.name, args.type or "module", args.description)

    elif args.action == "add-dep":
        if not args.id or not args.depends_on:
            print("Error: --id and --depends-on required")
            return 1
        mgr.add_dependency(args.id, args.depends_on, args.dep_type)

    elif args.action == "create-tdr":
        mgr.create_tdr(
            args.title,
            args.context or "",
            args.decision or "",
            ["Consequence 1", "Consequence 2"]
        )

    elif args.action == "export-arch":
        if not args.id:
            print("Error: --id required for export")
            return 1
        output = Path(args.output) if args.output else None
        mgr.export_architecture_to_markdown(args.id, output)

    elif args.action == "export-tdr":
        if not args.id:
            print("Error: --id required for export")
            return 1
        output = Path(args.output) if args.output else None
        mgr.export_tdr_to_markdown(args.id, output)

    elif args.action == "list":
        print(f"Architectures: {len(mgr.architectures)}")
        print(f"Components: {len(mgr.components)}")
        print(f"TDRs: {len(mgr.tdrs)}")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(cli_main())
