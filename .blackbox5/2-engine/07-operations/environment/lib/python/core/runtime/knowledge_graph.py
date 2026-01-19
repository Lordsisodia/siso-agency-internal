#!/usr/bin/env python3
"""
Knowledge Graph for Entity Relationship Tracking

Maintains a graph of entities (decisions, artifacts, agents, etc.)
and their relationships for better context understanding.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

# Try to import networkx
try:
    import networkx as nx
except ImportError:
    print("networkx not installed. Install with: pip install networkx", file=sys.stderr)
    sys.exit(1)


@dataclass
class Entity:
    """An entity in the knowledge graph."""
    id: str
    type: str  # decision, artifact, agent, goal, etc.
    name: str
    description: str
    created_at: str
    metadata: Dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class Relationship:
    """A relationship between entities."""
    id: str
    from_entity: str
    to_entity: str
    type: str  # depends_on, produces, blocks, etc.
    weight: float = 1.0
    metadata: Dict = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class KnowledgeGraph:
    """
    Knowledge graph for tracking entity relationships.

    Uses NetworkX for graph operations and persistence.
    """

    def __init__(self, storage_path: str = None):
        """
        Initialize knowledge graph.

        Args:
            storage_path: Path to store graph data
        """
        if storage_path is None:
            project_root = Path(__file__).parent.parent
            storage_path = project_root / ".memory" / "knowledge_graph.json"

        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)

        # Initialize graph
        self.graph = nx.DiGraph()
        self.entities = {}
        self.relationships = {}

        # Load existing data
        self._load()

    def _load(self):
        """Load graph from storage."""
        if self.storage_path.exists():
            try:
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)

                # Load entities
                for entity_data in data.get("entities", []):
                    entity = Entity(**entity_data)
                    self.entities[entity.id] = entity
                    self.graph.add_node(entity.id, **entity_data)

                # Load relationships
                for rel_data in data.get("relationships", []):
                    rel = Relationship(**rel_data)
                    self.relationships[rel.id] = rel
                    self.graph.add_edge(
                        rel.from_entity,
                        rel.to_entity,
                        relationship_type=rel.type,
                        weight=rel.weight,
                        **rel.metadata
                    )
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Error loading graph: {e}", file=sys.stderr)

    def _save(self):
        """Save graph to storage."""
        data = {
            "entities": [asdict(e) for e in self.entities.values()],
            "relationships": [asdict(r) for r in self.relationships.values()],
            "last_updated": datetime.utcnow().isoformat()
        }

        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)

    def add_entity(self, entity_type: str, name: str, description: str,
                   metadata: Dict = None) -> str:
        """
        Add an entity to the graph.

        Args:
            entity_type: Type of entity
            name: Entity name
            description: Entity description
            metadata: Optional metadata

        Returns:
            Entity ID
        """
        import uuid

        entity_id = f"{entity_type.upper()}-{uuid.uuid4().hex[:8].upper()}"

        entity = Entity(
            id=entity_id,
            type=entity_type,
            name=name,
            description=description,
            created_at=datetime.utcnow().isoformat(),
            metadata=metadata or {}
        )

        self.entities[entity_id] = entity
        self.graph.add_node(entity_id, **asdict(entity))
        self._save()

        return entity_id

    def add_relationship(self, from_entity: str, to_entity: str,
                        rel_type: str, weight: float = 1.0,
                        metadata: Dict = None) -> str:
        """
        Add a relationship between entities.

        Args:
            from_entity: Source entity ID
            to_entity: Target entity ID
            rel_type: Type of relationship
            weight: Relationship weight (0-1)
            metadata: Optional metadata

        Returns:
            Relationship ID
        """
        import uuid

        if from_entity not in self.entities:
            raise ValueError(f"Source entity not found: {from_entity}")
        if to_entity not in self.entities:
            raise ValueError(f"Target entity not found: {to_entity}")

        rel_id = f"REL-{uuid.uuid4().hex[:8].upper()}"

        relationship = Relationship(
            id=rel_id,
            from_entity=from_entity,
            to_entity=to_entity,
            type=rel_type,
            weight=weight,
            metadata=metadata or {}
        )

        self.relationships[rel_id] = relationship
        self.graph.add_edge(
            from_entity,
            to_entity,
            relationship_type=rel_type,
            weight=weight,
            **(metadata or {})
        )
        self._save()

        return rel_id

    def get_entity(self, entity_id: str) -> Optional[Entity]:
        """Get an entity by ID."""
        return self.entities.get(entity_id)

    def get_relationships(self, entity_id: str) -> List[Relationship]:
        """Get all relationships for an entity."""
        related = []
        for rel in self.relationships.values():
            if rel.from_entity == entity_id or rel.to_entity == entity_id:
                related.append(rel)
        return related

    def find_dependencies(self, entity_id: str) -> List[str]:
        """
        Find all entities this entity depends on.

        Args:
            entity_id: Entity to check

        Returns:
            List of dependent entity IDs
        """
        # Get all predecessors (entities that point to this one)
        predecessors = list(self.graph.predecessors(entity_id))

        # Also check predecessors transitively
        all_deps = set(predecessors)
        for pred in predecessors:
            all_deps.update(self.find_dependencies(pred))

        return list(all_deps)

    def find_dependents(self, entity_id: str) -> List[str]:
        """
        Find all entities that depend on this one.

        Args:
            entity_id: Entity to check

        Returns:
            List of dependent entity IDs
        """
        # Get all successors (entities this one points to)
        successors = list(self.graph.successors(entity_id))

        # Also check successors transitively
        all_deps = set(successors)
        for succ in successors:
            all_deps.update(self.find_dependents(succ))

        return list(all_deps)

    def find_path(self, from_entity: str, to_entity: str) -> List[str]:
        """
        Find shortest path between two entities.

        Args:
            from_entity: Start entity
            to_entity: End entity

        Returns:
            List of entity IDs in path
        """
        try:
            return nx.shortest_path(self.graph, from_entity, to_entity)
        except (nx.NodeNotFound, nx.NetworkXNoPath):
            return []

    def get_entities_by_type(self, entity_type: str) -> List[Entity]:
        """Get all entities of a specific type."""
        return [
            e for e in self.entities.values()
            if e.type == entity_type
        ]

    def get_stats(self) -> Dict:
        """Get graph statistics."""
        return {
            "total_entities": len(self.entities),
            "total_relationships": len(self.relationships),
            "entity_types": {
                t: len([e for e in self.entities.values() if e.type == t])
                for t in set(e.type for e in self.entities.values())
            },
            "relationship_types": {
                t: len([r for r in self.relationships.values() if r.type == t])
                for t in set(r.type for r in self.relationships.values())
            },
            "storage_path": str(self.storage_path)
        }


def main():
    """CLI for knowledge graph."""
    import argparse

    parser = argparse.ArgumentParser(description="Knowledge graph management")
    parser.add_argument("command", choices=["add-entity", "add-rel", "stats", "deps", "path"],
                       help="Command to run")
    parser.add_argument("--type", help="Entity type")
    parser.add_argument("--name", help="Entity name")
    parser.add_argument("--description", help="Entity description")
    parser.add_argument("--from", dest="from_entity", help="From entity ID")
    parser.add_argument("--to", dest="to_entity", help="To entity ID")
    parser.add_argument("--rel-type", help="Relationship type")
    parser.add_argument("--output", help="Output path")

    args = parser.parse_args()

    kg = KnowledgeGraph()

    if args.command == "add-entity":
        if not all([args.type, args.name, args.description]):
            print("Error: --type, --name, and --description required", file=sys.stderr)
            sys.exit(1)

        entity_id = kg.add_entity(args.type, args.name, args.description)
        print(f"Entity created: {entity_id}")

    elif args.command == "add-rel":
        if not all([args.from_entity, args.to_entity, args.rel_type]):
            print("Error: --from, --to, and --rel-type required", file=sys.stderr)
            sys.exit(1)

        rel_id = kg.add_relationship(args.from_entity, args.to_entity, args.rel_type)
        print(f"Relationship created: {rel_id}")

    elif args.command == "stats":
        stats = kg.get_stats()
        print(json.dumps(stats, indent=2))

    elif args.command == "deps":
        if not args.from_entity:
            print("Error: --from required", file=sys.stderr)
            sys.exit(1)

        deps = kg.find_dependencies(args.from_entity)
        print(f"Dependencies for {args.from_entity}:")
        for dep in deps:
            entity = kg.get_entity(dep)
            if entity:
                print(f"  - {dep}: {entity.name}")

    elif args.command == "path":
        if not all([args.from_entity, args.to_entity]):
            print("Error: --from and --to required", file=sys.stderr)
            sys.exit(1)

        path = kg.find_path(args.from_entity, args.to_entity)
        print(f"Path from {args.from_entity} to {args.to_entity}:")
        for i, entity_id in enumerate(path):
            entity = kg.get_entity(entity_id)
            name = entity.name if entity else entity_id
            print(f"  {i+1}. {entity_id}: {name}")


if __name__ == "__main__":
    main()
