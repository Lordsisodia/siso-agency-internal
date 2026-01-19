# Knowledge Graph

This folder contains **Knowledge Graph** memory - semantic understanding and relationships.

## Structure

```
knowledge/
├── entities/            # Knowledge graph nodes
│   └── {entity-type}/
│       └── {entity-name}/
│           └── entity.json
│               - Entity properties
│               - Relationships
│               - Metadata
│
├── relationships/       # Entity relationships
│   └── {relationship-type}/
│       └── {entities}/
│           └── relationship.json
│               - Source entity
│               - Target entity
│               - Relationship type
│               - Properties
│
└── embeddings/          # Vector embeddings
    └── {content-type}/
        └── {id}.json
            - Embedding vector
            - Content hash
            - Metadata
```

## Purpose

The knowledge graph provides:

### Semantic Understanding
- Entity extraction and identification
- Relationship mapping
- Contextual connections

### Search
- Vector-based semantic search
- Relationship-based traversal
- Multi-hop reasoning

## Usage

### Creating Entities

```json
{
  "id": "entity-1",
  "type": "component",
  "name": "UserProfile",
  "properties": {
    "file": "src/components/UserProfile.tsx",
    "language": "typescript"
  },
  "relationships": [
    {"type": "uses", "target": "api-client"},
    {"type": "rendered_by", "target": "router"}
  ]
}
```

### Vector Search

Use embeddings in `embeddings/` for semantic search.
