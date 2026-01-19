# Notion Integration - Implementation Guide

## Implementation Summary

This Notion integration for BlackBox5 follows the standard integration template structure with Notion-specific customizations.

## Notion-Specific Implementation Details

### API Configuration

- **API Base URL**: `https://api.notion.com`
- **API Version**: `2025-09-03` (for endpoint URLs)
- **Notion-Version Header**: `2022-06-28` (for request headers)
- **Authentication**: Bearer token from `NOTION_TOKEN` environment variable

### Key Design Decisions

1. **Block Structure**: Implemented a hierarchical block system that mirrors Notion's content model. Each block can have children, allowing for complex nested structures.

2. **Markdown Conversion**: Built a comprehensive markdown-to-blocks converter that handles:
   - Headings (H1-H3)
   - Paragraphs
   - Bullet and numbered lists
   - Todo/checkbox items
   - Code blocks with syntax highlighting
   - Quotes
   - Dividers
   - Toggle blocks

3. **Type Safety**: Used dataclasses for all Notion entities (Page, Database, Block, etc.) with proper type hints throughout.

4. **Rate Limiting**: Implemented a `RateLimiter` helper class for the 3 req/sec recommended limit.

5. **Error Handling**: Graceful handling of 404 errors (returns None) with proper logging for debugging.

## File Structure

```
notion/
├── __init__.py              # Package initialization, exports NotionManager
├── manager.py               # Main NotionManager class (~500 lines)
├── types.py                 # Data classes and enums (~400 lines)
├── config.py                # Configuration helpers
├── demo.py                  # Usage demonstrations
├── requirements.txt         # Python dependencies
├── README.md                # Full documentation
├── QUICKSTART.md            # Quick start guide
├── IMPLEMENTATION-GUIDE.md  # This file
└── tests/
    ├── __init__.py
    └── test_integration.py  # Comprehensive tests
```

## Notion API Specifics

### Parent Types

Notion uses two types of parents:
- **page_id**: Create page under another page
- **database_id**: Create page in a database

### Property Types

Notion has extensive property types:
- **title**: Page title (max 1 per page)
- **rich_text**: Formatted text
- **number**: Numeric values
- **select**: Single choice dropdown
- **multi_select**: Multiple choice tags
- **date**: Date/time with optional time
- **people**: User references
- **files**: File attachments
- **checkbox**: Boolean value
- **url**: Link URL
- **email**: Email address
- **phone**: Phone number
- **formula**: Computed values
- **relation**: References to other databases
- **rollup**: Aggregated values from relations
- **created_time**: Auto-created timestamp
- **created_by**: Auto-created by user
- **last_edited_time**: Auto-edited timestamp
- **last_edited_by**: Auto-edited by user

### Block Types

The integration supports all major block types:
- Text content: paragraph, heading_1/2/3, callout, quote
- Lists: bulleted_list_item, numbered_list_item, to_do
- Media: image, video, file, pdf, embed
- Structure: divider, toggle, synchronized_block
- Code: code (with language support)
- Data: table, table_row

### Search Filters

Search accepts these filter parameters:
- **object**: "page" or "database"
- **property**: "object" (only value supported)
- **value**: "page", "database", or "block"

### Database Query Filters

Database queries support complex filters:
```python
{
    "property": "Status",
    "select": {
        "equals": "In Progress"
    }
}
```

Compound filters:
```python
{
    "and": [
        {
            "property": "Status",
            "select": {"equals": "In Progress"}
        },
        {
            "property": "Priority",
            "number": {"greater_than": 5}
        }
    ]
}
```

## Implementation Patterns

### Creating Pages with Properties

```python
properties = {
    "Name": {
        "title": [
            {"type": "text", "text": {"content": "Page Title"}}
        ]
    },
    "Status": {
        "select": {"name": "In Progress"}
    },
    "Date": {
        "date": {"start": "2025-01-19"}
    }
}
```

### Building Block Arrays

```python
blocks = [
    {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [
                {"type": "text", "text": {"content": "Text here"}}
            ]
        }
    },
    {
        "object": "block",
        "type": "heading_2",
        "heading_2": {
            "rich_text": [
                {"type": "text", "text": {"content": "Heading"}}
            ]
        }
    }
]
```

### Pagination Pattern

```python
results = []
has_more = True
next_cursor = None

while has_more:
    data = await manager.query_database(
        database_id="db_id",
        start_cursor=next_cursor,
        page_size=100
    )

    results.extend(data.get("results", []))
    has_more = data.get("has_more", False)
    next_cursor = data.get("next_cursor")
```

## Notion API Quirks

### 1. No Partial Property Updates

When updating page properties, you must provide the full property object, not just the changed parts.

### 2. Title Property is Required

Every page must have exactly one title property. Database parent pages can have titles from database properties.

### 3. Block IDs for New Blocks

When creating blocks, you can use a placeholder ID like "pending" for new blocks. Notion assigns real IDs on creation.

### 4. Rich Text Arrays

All text content uses rich text arrays, even for plain text:
```python
"rich_text": [
    {"type": "text", "text": {"content": "Plain text"}}
]
```

### 5. Database Schema Updates

Updating database properties requires the full schema, not partial updates. This is a Notion API limitation.

### 6. Integration Must Be Shared

Pages and databases must explicitly share with your integration via "Add connections" before API access.

## Rate Limiting Strategy

### Recommended Approach

```python
from integration.notion.manager import RateLimiter

limiter = RateLimiter(calls=3, period=1.0)

async with NotionManager() as manager:
    for i in range(10):
        await limiter.acquire()
        await manager.get_page(f"page_{i}")
```

### Bulk Operations

For bulk operations:
- Use rate limiter consistently
- Implement exponential backoff on 429 errors
- Consider batching operations

## Testing Strategy

### Unit Tests

- Mock all HTTP responses
- Test all CRUD operations
- Test markdown conversion
- Test error handling

### Integration Tests

- Use real Notion API
- Create test pages/database
- Test full workflow
- Clean up test artifacts

### Test Setup

```python
# Use pytest fixtures
@pytest.fixture
async def test_page(manager):
    page = await manager.create_page(...)
    yield page
    await manager.delete_page(page.id)
```

## Troubleshooting Common Issues

### Issue 1: "Unauthorized" Error

**Cause**: Invalid token or integration not shared
**Solution**:
- Verify NOTION_TOKEN is correct
- Check integration is shared with page/database

### Issue 2: "Object not found" Error

**Cause**: Page ID not accessible
**Solution**:
- Share page with integration
- Verify page ID is correct
- Check page is not in workspace not linked to integration

### Issue 3: "Validation error" on property

**Cause**: Invalid property format
**Solution**:
- Check property name matches exactly
- Verify property type is correct for parent database
- Ensure required properties are included

### Issue 4: Rate limit errors

**Cause**: Too many requests
**Solution**:
- Implement rate limiter
- Add delays between requests
- Use pagination to reduce request count

## Future Enhancements

### Potential Additions

1. **Webhook Support**: Listen for Notion webhook events
2. **Block Caching**: Cache block children to reduce API calls
3. **Batch Operations**: Implement batch create/update
4. **Rich Text Builder**: Helper for building rich text arrays
5. **Filter Builder**: DSL for building complex filters
6. **Sync Engine**: Two-way sync with local files
7. **Template Engine**: Create pages from templates
8. **Relation Management**: Handle database relations better

### Advanced Features

1. **Block Children Recursion**: Full tree traversal
2. **Content Export**: Export to markdown, HTML, etc.
3. **Database Views**: Manage different view types
4. **Comments**: Add/retrieve page comments
5. **Users**: Manage workspace user access

## Performance Considerations

### API Call Optimization

- Minimize redundant calls
- Use pagination efficiently
- Cache frequently accessed data
- Batch operations where possible

### Memory Management

- Stream large query results
- Use generators for pagination
- Clear cached data when done

### Error Recovery

- Implement retry logic with exponential backoff
- Handle rate limits gracefully
- Log errors for debugging

## Security Considerations

### Token Security

- Never commit tokens to git
- Use environment variables
- Rotate tokens periodically
- Use read-only tokens when possible

### Data Validation

- Validate all user input
- Sanitize markdown content
- Check permissions before operations

## Related Documentation

- Notion API Reference: https://developers.notion.com/reference
- Block Type Reference: https://developers.notion.com/reference/block-type
- Property Object Reference: https://developers.notion.com/reference/property-object
- Rate Limits: https://developers.notion.com/reference/request-limits
