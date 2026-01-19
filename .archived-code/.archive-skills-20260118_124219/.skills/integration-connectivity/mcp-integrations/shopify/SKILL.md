---
name: shopify
category: integration-connectivity/mcp-integrations
version: 1.0.0
description: Complete guide to using Shopify Dev MCP server with Claude Code
author: blackbox5/mcp
verified: true
tags: [mcp, shopify, ecommerce, api]
---

# Shopify Dev MCP Server Skills

<context>
Complete guide to using Shopify Dev MCP server (`@shopify/dev-mcp@1.5.1`) with Claude Code. This server provides tools for interacting with Shopify's API and managing your Shopify store.

**Configuration:** HTTP proxy at `http://localhost:3000/mcp/shopify`

**Prerequisites:**
1. A working Shopify store
2. Shopify API credentials (API key and password)
3. Store URL (e.g., `https://your-store.myshopify.com`)

Configure your Shopify API credentials in the MCP proxy server environment variables.
</context>

<instructions>
When working with Shopify through Claude Code, use natural language commands. Claude will convert your requests into appropriate Shopify API calls.

Always start with exploration (get store info, list products) before making changes. Use filters to limit results and avoid overwhelming data.
</instructions>

<workflow>
  <phase name="Store Exploration">
    <goal>Verify connection and understand store structure</goal>
    <steps>
      <step>Use `shopify_get_store_info` to verify API connection</step>
      <step>Use `shopify_get_products` to see product catalog</step>
      <step>Review store configuration and settings</step>
    </steps>
  </phase>

  <phase name="Product Management">
    <goal>Manage store products and inventory</goal>
    <steps>
      <step>Use `shopify_get_products` to browse existing products</step>
      <step>Use `shopify_create_product` to add new products</step>
      <step>Use `shopify_update_product` to modify product details</step>
      <step>Use `shopify_update_inventory` to adjust stock levels</step>
    </steps>
  </phase>

  <phase name="Order Processing">
    <goal>Handle customer orders</goal>
    <steps>
      <step>Use `shopify_get_orders` to retrieve orders</step>
      <step>Use `shopify_get_order` to view order details</step>
      <step>Use `shopify_update_order` to modify order status</step>
      <step>Use `shopify_cancel_order` when needed (requires reason)</step>
    </steps>
  </phase>

  <phase name="Customer Management">
    <goal>Manage customer information</goal>
    <steps>
      <step>Use `shopify_get_customers` to browse customers</step>
      <step>Use `shopify_create_customer` to add new customers</step>
      <step>Use `shopify_update_customer` to modify customer details</step>
    </steps>
  </phase>
</workflow>

<available_skills>
  <skill_group name="Store Management">
    <skill name="shopify_get_store_info">
      <purpose>Get basic information about your Shopify store</purpose>
      <usage>Get my store information</usage>
      <returns>Store name, domain, email, currency, timezone</returns>
    </skill>
    <skill name="shopify_get_products">
      <purpose>List products from your store</purpose>
      <usage>Get all products created in the last 7 days</usage>
      <parameters>
        <param name="limit">Number of products to return (default: 50)</param>
        <param name="since_id">Retrieve products after this ID</param>
        <param name="created_at_min">Filter by creation date</param>
      </parameters>
    </skill>
    <skill name="shopify_get_product">
      <purpose>Get details of a specific product</purpose>
      <usage>Get product with ID 123456789</usage>
      <parameters>
        <param name="product_id">Product ID or handle</param>
      </parameters>
    </skill>
    <skill name="shopify_create_product">
      <purpose>Create a new product</purpose>
      <usage>Create a new product with title 'New T-Shirt' and price $29.99</usage>
      <parameters>
        <param name="title">Product title</param>
        <param name="description">Product description (HTML)</param>
        <param name="vendor">Vendor name</param>
        <param name="product_type">Product type</param>
        <param name="variants">Array of product variants</param>
      </parameters>
    </skill>
    <skill name="shopify_update_product">
      <purpose>Update an existing product</purpose>
      <usage>Update product 123456789 to set price to $39.99</usage>
      <parameters>
        <param name="product_id">Product ID</param>
        <param name="updates">Object containing fields to update</param>
      </parameters>
    </skill>
    <skill name="shopify_delete_product">
      <purpose>Delete a product (cannot be undone)</purpose>
      <usage>Delete product 123456789</usage>
      <warning>This action cannot be undone</warning>
    </skill>
  </skill_group>

  <skill_group name="Order Management">
    <skill name="shopify_get_orders">
      <purpose>Get orders from your store</purpose>
      <usage>Get unpaid orders from the last week</usage>
      <parameters>
        <param name="status">Order status (open, closed, cancelled, etc.)</param>
        <param name="created_at_min">Filter by date</param>
        <param name="limit">Number of orders (default: 50)</param>
      </parameters>
    </skill>
    <skill name="shopify_get_order">
      <purpose>Get details of a specific order</purpose>
      <usage>Get order with ID 987654321</usage>
      <returns>Customer information, line items, shipping address, payment status, fulfillment status</returns>
    </skill>
    <skill name="shopify_create_order">
      <purpose>Create a new order manually</purpose>
      <usage>Create a new order for customer@example.com</usage>
      <parameters>
        <param name="email">Customer email</param>
        <param name="line_items">Array of product variants</param>
        <param name="shipping_address">Shipping details</param>
        <param name="financial_status">Payment status</param>
      </parameters>
    </skill>
    <skill name="shopify_update_order">
      <purpose>Update an existing order</purpose>
      <usage>Update order 987654321 to mark as paid</usage>
      <parameters>
        <param name="order_id">Order ID</param>
        <param name="updates">Fields to update</param>
      </parameters>
    </skill>
    <skill name="shopify_cancel_order">
      <purpose>Cancel an order</purpose>
      <usage>Cancel order 987654321 with reason 'customer'</usage>
      <parameters>
        <param name="reason">Cancellation reason (customer, inventory, fraud, etc.)</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Customer Management">
    <skill name="shopify_get_customers">
      <purpose>Get customers from your store</purpose>
      <usage>Get customers who purchased in the last month</usage>
    </skill>
    <skill name="shopify_get_customer">
      <purpose>Get details of a specific customer</purpose>
      <usage>Get customer with ID 555555555</usage>
    </skill>
    <skill name="shopify_create_customer">
      <purpose>Create a new customer</purpose>
      <usage>Create a new customer with email john@example.com</usage>
      <parameters>
        <param name="email">Customer email (required)</param>
        <param name="first_name">First name</param>
        <param name="last_name">Last name</param>
        <param name="phone">Phone number</param>
      </parameters>
    </skill>
    <skill name="shopify_update_customer">
      <purpose>Update a customer</purpose>
      <usage>Update customer 555555555 to set phone to 555-1234</usage>
    </skill>
  </skill_group>

  <skill_group name="Inventory Management">
    <skill name="shopify_get_inventory">
      <purpose>Get inventory levels</purpose>
      <usage>Check inventory for product 123456789</usage>
    </skill>
    <skill name="shopify_update_inventory">
      <purpose>Update inventory levels</purpose>
      <usage>Set inventory for SKU TSHIRT-001 to 50</usage>
      <parameters>
        <param name="inventory_item_id">Inventory item ID</param>
        <param name="available">New quantity</param>
        <param name="location_id">Location ID</param>
      </parameters>
    </skill>
  </skill_group>

  <skill_group name="Collection Management">
    <skill name="shopify_get_collections">
      <purpose>Get product collections</purpose>
      <usage>Get smart collections</usage>
    </skill>
    <skill name="shopify_create_collection">
      <purpose>Create a new collection</purpose>
      <usage>Create a collection called 'Summer Sale'</usage>
      <parameters>
        <param name="title">Collection title</param>
        <param name="collects">Array of product IDs</param>
        <param name="rules">Smart collection rules (for smart collections)</param>
      </parameters>
    </skill>
  </skill_group>
</available_skills>

<best_practices>
  <do>
    <item>Use product handles for easier identification</item>
    <item>Keep inventory updated regularly</item>
    <item>Use collections to organize products</item>
    <item>Test operations in development first</item>
    <item>Monitor API rate limits</item>
    <item>Start with exploration using get_store_info</item>
    <item>Use filters to limit results</item>
    <item>Check errors and understand API responses</item>
  </do>
  <dont>
    <item>Delete products without backup</item>
    <item>Create duplicate products</item>
    <item>Ignore API errors</item>
    <item>Exceed rate limits</item>
    <item>Hardcode IDs in workflows</item>
  </dont>
</best_practices>

<rules>
  <rule priority="high">Always verify connection with get_store_info before operations</rule>
  <rule priority="high">Never delete products without confirmation</rule>
  <rule priority="medium">Use pagination for large datasets</rule>
  <rule priority="medium">Cache frequently accessed data</rule>
  <rule priority="low">Test in dev store before production</rule>
</rules>

<error_handling>
  <error>
    <condition>Connection error</condition>
    <solution>
      <step>Verify MCP proxy is running: curl http://localhost:3000/health</step>
      <step>Check Shopify API credentials</step>
      <step>Ensure store URL is correct</step>
    </solution>
  </error>
  <error>
    <condition>Authentication failed</condition>
    <solution>
      <step>Verify API key and password</step>
      <step>Check API permissions in Shopify admin</step>
      <step>Ensure credentials have required scopes</step>
    </solution>
  </error>
  <error>
    <condition>Rate limit exceeded</condition>
    <solution>
      <step>Slow down requests</step>
      <step>Use pagination for large datasets</step>
      <step>Cache frequently accessed data</step>
    </solution>
  </error>
  <error>
    <condition>Product not found</condition>
    <solution>
      <step>Verify product ID or handle</step>
      <step>Check if product is deleted</step>
      <step>Ensure you're querying the right store</step>
    </solution>
  </error>
</error_handling>

<integration_notes>
  <integration>
    <platform>Lumelle Partnership Platform</platform>
    <capabilities>
      <capability>Get all partner products from Shopify</capability>
      <capability>Create a new partner product</capability>
      <capability>Update partner pricing</capability>
      <capability>Get orders for partner products</capability>
      <capability>Fulfill partner orders</capability>
      <capability>Track partner shipments</capability>
      <capability>Check inventory levels</capability>
      <capability>Update Shopify inventory from Lumelle</capability>
      <capability>Sync product data between systems</capability>
    </capabilities>
  </integration>
</integration_notes>

<examples>
  <example>
    <scenario>Product Setup</scenario>
    <commands>
      <command>Create a new product</command>
      <command>Add variants to product 123456789</command>
      <command>Set inventory levels</command>
    </commands>
  </example>
  <example>
    <scenario>Order Processing</scenario>
    <commands>
      <command>Get new orders</command>
      <command>Fulfill order 987654321</command>
      <command>Create a shipping label</command>
    </commands>
  </example>
  <example>
    <scenario>Customer Management</scenario>
    <commands>
      <command>Find customer by email</command>
      <command>Update customer information</command>
      <command>View customer order history</command>
    </commands>
  </example>
  <example>
    <scenario>Analytics</scenario>
    <commands>
      <command>Get sales for the last month</command>
      <command>Count orders by status</command>
      <command>Get revenue by product</command>
    </commands>
  </example>
</examples>

<rate_limits>
  <plan tier="Standard">40 requests per minute</plan>
  <plan tier="Plus">80 requests per minute</plan>
  <plan tier="Advanced">1000 requests per minute</plan>
  <note>Claude will automatically handle rate limiting and retry requests</note>
</rate_limits>
