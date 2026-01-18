# Supabase MCP Server Skills

Complete guide to using Supabase MCP servers with Claude Code.

## Overview

You have **two Supabase instances** configured:

1. **SISO Internal Supabase** (Global) - `avdgyrepwrvsvwgxrccr`
2. **Lumelle Supabase** (Project) - `tmsbyiwqzesmirbargxv`

---

## Available Skills

### Database Query Skills

#### `supabase_query`
Execute raw SQL queries on your Supabase database.

**Usage:**
```
Query the users table for all active users
```

**Example:**
```sql
SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC;
```

**Parameters:**
- `query`: The SQL query to execute

---

#### `supabase_select`
Select rows from a table with filtering options.

**Usage:**
```
Get all products from the products table where price is greater than 100
```

**Parameters:**
- `table`: Table name
- `filter`: Filter conditions (optional)
- `columns`: Specific columns to select (optional)
- `order`: Order by column (optional)
- `limit`: Maximum number of rows (optional)

---

#### `supabase_insert`
Insert new rows into a table.

**Usage:**
```
Insert a new user with email john@example.com and name John Doe
```

**Parameters:**
- `table`: Table name
- `data`: Object containing column names and values

**Example:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "status": "active"
}
```

---

#### `supabase_update`
Update existing rows in a table.

**Usage:**
```
Update user john@example.com to set status to inactive
```

**Parameters:**
- `table`: Table name
- `data`: Object containing columns to update
- `filter`: Filter condition to identify rows

---

#### `supabase_delete`
Delete rows from a table.

**Usage:**
```
Delete all users where status is 'deleted'
```

**Parameters:**
- `table`: Table name
- `filter`: Filter condition

---

### Schema Skills

#### `supabase_list_tables`
List all tables in the database.

**Usage:**
```
Show me all tables in the database
```

---

#### `supabase_describe_table`
Get the schema of a specific table.

**Usage:**
```
Describe the users table
```

**Parameters:**
- `table`: Table name

**Returns:**
- Column names
- Data types
- Constraints
- Indexes

---

#### `supabase_get_relationships`
Get foreign key relationships for a table.

**Usage:**
```
Show relationships for the orders table
```

---

### Advanced Skills

#### `supabase_execute_rpc`
Call a PostgreSQL function or stored procedure.

**Usage:**
```
Execute the function get_user_stats with user ID 123
```

**Parameters:**
- `function_name`: Name of the PostgreSQL function
- `params`: Parameters to pass to the function

---

#### `supabase_subscribe`
Subscribe to real-time database changes.

**Usage:**
```
Subscribe to changes in the notifications table
```

**Parameters:**
- `table`: Table to watch
- `filter`: Filter for specific changes (optional)

---

#### `supabase_upload_file`
Upload a file to Supabase Storage.

**Usage:**
```
Upload image.png to the avatars bucket
```

**Parameters:**
- `bucket`: Storage bucket name
- `path`: File path in bucket
- `file`: Local file path

---

#### `supabase_download_file`
Download a file from Supabase Storage.

**Usage:**
```
Download avatar.jpg from the avatars bucket
```

---

## Multi-Database Usage

### Switching Between Databases

Claude automatically detects which Supabase to use:

**Working in Lumelle project:**
```
Get all products from Lumelle database
```
→ Uses Lumelle Supabase (`tmsbyiwqzesmirbargxv`)

**Working in any other project:**
```
Get all internal users from SISO database
```
→ Uses SISO Internal Supabase (`avdgyrepwrvsvwgxrccr`)

### Explicit Database Selection

If needed, specify which database:

```
In the SISO database, get all users
In the Lumelle database, get all orders
```

---

## Common Workflows

### 1. Database Exploration
```
Show me all tables
Describe the users table
Get the first 10 users
```

### 2. Data Analysis
```
Count users by status
Show orders grouped by customer
Find total revenue this month
```

### 3. Data Modification
```
Insert a new order with these details: ...
Update order 123 to set status to 'completed'
Delete cancelled orders older than 30 days
```

### 4. Schema Management
```
Show the schema for the products table
What relationships does the orders table have?
List all indexes on the users table
```

---

## Tips

1. **Use natural language** - Claude converts your requests to SQL
2. **Start with exploration** - List tables, then describe them
3. **Ask for explanations** - "Explain what this query does"
4. **Verify before modifying** - Claude can show you the query first
5. **Use transactions** - For complex operations, Claude can wrap in transactions

---

## Best Practices

✅ **DO:**
- Start with `supabase_list_tables` to understand the structure
- Use descriptive column names in queries
- Ask Claude to explain complex queries before running
- Use filters to limit data retrieval

❌ **DON'T:**
- Run `DELETE` without a `WHERE` clause
- Modify schema directly in production
- Insert duplicate primary keys
- Forget to back up important data

---

## Troubleshooting

**Permission denied:**
- Check your Supabase access token
- Verify RLS policies on the table

**Connection timeout:**
- Check your internet connection
- Verify Supabase URL is correct

**Query returns no results:**
- Use `supabase_describe_table` to verify column names
- Check if data exists in the table
- Verify filter conditions

---

## Project-Specific Notes

### Lumelle Project Supabase
- **Project:** Lumelle partnership platform
- **Used for:** Products, orders, customer data
- **Location:** Available only in Lumelle project directory

### SISO Internal Supabase
- **Project:** SISO internal operations
- **Used for:** Internal data, analytics, operations
- **Location:** Available globally in all projects

---

**Need Help?** Just ask Claude: "Show me how to query Supabase for..."
