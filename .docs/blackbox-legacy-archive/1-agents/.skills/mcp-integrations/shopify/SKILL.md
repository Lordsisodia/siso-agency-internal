# Shopify Dev MCP Server Skills

Complete guide to using Shopify MCP server with Claude Code.

## Overview

The Shopify Dev MCP server (`@shopify/dev-mcp@1.5.1`) provides tools for interacting with Shopify's API and managing your Shopify store.

**Configuration:** HTTP proxy at `http://localhost:3000/mcp/shopify`

---

## Prerequisites

Before using Shopify MCP, ensure you have:

1. **Shopify Store** - A working Shopify store
2. **Shopify API Credentials** - API key and password
3. **Store URL** - Your Shopify store URL (e.g., `https://your-store.myshopify.com`)

**Note:** You'll need to configure your Shopify API credentials in the MCP proxy server environment variables.

---

## Available Skills

### Store Management

#### `shopify_get_store_info`
Get basic information about your Shopify store.

**Usage:**
```
Get my store information
```

**Returns:**
- Store name
- Domain
- Email
- Currency
- Timezone

---

#### `shopify_get_products`
List products from your store.

**Usage:**
```
Get all products
Get products created in the last 7 days
```

**Parameters:**
- `limit`: Number of products to return (default: 50)
- `since_id`: Retrieve products after this ID
- `created_at_min`: Filter by creation date

---

#### `shopify_get_product`
Get details of a specific product.

**Usage:**
```
Get product with ID 123456789
Show details for product 'my-product-handle'
```

**Parameters:**
- `product_id`: Product ID or handle

---

#### `shopify_create_product`
Create a new product.

**Usage:**
```
Create a new product with title 'New T-Shirt' and price $29.99
```

**Parameters:**
- `title`: Product title
- `description`: Product description (HTML)
- `vendor`: Vendor name
- `product_type`: Product type
- `variants`: Array of product variants

**Example:**
```json
{
  "title": "New T-Shirt",
  "body_html": "<p>Awesome t-shirt</p>",
  "vendor": "YourBrand",
  "product_type": "Apparel",
  "variants": [{
    "price": "29.99",
    "sku": "TSHIRT-001",
    "inventory_quantity": 100
  }]
}
```

---

#### `shopify_update_product`
Update an existing product.

**Usage:**
```
Update product 123456789 to set price to $39.99
```

**Parameters:**
- `product_id`: Product ID
- `updates`: Object containing fields to update

---

#### `shopify_delete_product`
Delete a product.

**Usage:**
```
Delete product 123456789
```

**Warning:** This action cannot be undone!

---

### Order Management

#### `shopify_get_orders`
Get orders from your store.

**Usage:**
```
Get all orders
Get orders from the last week
Get unpaid orders
```

**Parameters:**
- `status`: Order status (open, closed, cancelled, etc.)
- `created_at_min`: Filter by date
- `limit`: Number of orders (default: 50)

---

#### `shopify_get_order`
Get details of a specific order.

**Usage:**
```
Get order with ID 987654321
Show order details for order #1001
```

**Returns:**
- Customer information
- Line items
- Shipping address
- Payment status
- Fulfillment status

---

#### `shopify_create_order`
Create a new order manually.

**Usage:**
```
Create a new order for customer@example.com with these items: ...
```

**Parameters:**
- `email`: Customer email
- `line_items`: Array of product variants
- `shipping_address`: Shipping details
- `financial_status`: Payment status

---

#### `shopify_update_order`
Update an existing order.

**Usage:**
```
Update order 987654321 to mark as paid
```

**Parameters:**
- `order_id`: Order ID
- `updates`: Fields to update

---

#### `shopify_cancel_order`
Cancel an order.

**Usage:**
```
Cancel order 987654321 with reason 'customer'
```

**Parameters:**
- `reason`: Cancellation reason (customer, inventory, fraud, etc.)

---

### Customer Management

#### `shopify_get_customers`
Get customers from your store.

**Usage:**
```
Get all customers
Get customers who purchased in the last month
```

---

#### `shopify_get_customer`
Get details of a specific customer.

**Usage:**
```
Get customer with ID 555555555
Show details for customer@example.com
```

---

#### `shopify_create_customer`
Create a new customer.

**Usage:**
```
Create a new customer with email john@example.com and name John Doe
```

**Parameters:**
- `email`: Customer email (required)
- `first_name`: First name
- `last_name`: Last name
- `phone`: Phone number

---

#### `shopify_update_customer`
Update a customer.

**Usage:**
```
Update customer 555555555 to set phone to 555-1234
```

---

### Inventory Management

#### `shopify_get_inventory`
Get inventory levels.

**Usage:**
```
Get inventory for all products
Check inventory for product 123456789
```

---

#### `shopify_update_inventory`
Update inventory levels.

**Usage:**
```
Set inventory for SKU TSHIRT-001 to 50
```

**Parameters:**
- `inventory_item_id`: Inventory item ID
- `available`: New quantity
- `location_id`: Location ID

---

### Collection Management

#### `shopify_get_collections`
Get product collections.

**Usage:**
```
Get all collections
Get smart collections
```

---

#### `shopify_create_collection`
Create a new collection.

**Usage:**
```
Create a collection called 'Summer Sale' with these products: ...
```

**Parameters:**
- `title`: Collection title
- `collects`: Array of product IDs
- `rules`: Smart collection rules (for smart collections)

---

## Common Workflows

### 1. Product Setup
```
Create a new product
Add variants to product 123456789
Set inventory levels
```

### 2. Order Processing
```
Get new orders
Fulfill order 987654321
Create a shipping label
```

### 3. Customer Management
```
Find customer by email
Update customer information
View customer order history
```

### 4. Analytics
```
Get sales for the last month
Count orders by status
Get revenue by product
```

---

## Integration with Lumelle

Since Lumelle is a partnership platform, you can use Shopify MCP to:

### Partner Products
```
Get all partner products from Shopify
Create a new partner product
Update partner pricing
```

### Order Management
```
Get orders for partner products
Fulfill partner orders
Track partner shipments
```

### Inventory Sync
```
Check inventory levels
Update Shopify inventory from Lumelle
Sync product data between systems
```

---

## Tips

1. **Start with exploration** - Use `get_store_info` to verify connection
2. **Use filters** - Limit results to avoid overwhelming data
3. **Check errors** - Claude will explain any API errors
4. **Test in dev store** - Use a development store for testing
5. **Batch operations** - Claude can help with bulk updates

---

## Best Practices

✅ **DO:**
- Use product handles for easier identification
- Keep inventory updated regularly
- Use collections to organize products
- Test operations in development first
- Monitor API rate limits

❌ **DON'T:**
- Delete products without backup
- Create duplicate products
- Ignore API errors
- Exceed rate limits
- Hardcode IDs in workflows

---

## Troubleshooting

**Connection error:**
- Verify MCP proxy is running: `curl http://localhost:3000/health`
- Check Shopify API credentials
- Ensure store URL is correct

**Authentication failed:**
- Verify API key and password
- Check API permissions in Shopify admin
- Ensure credentials have required scopes

**Rate limit exceeded:**
- Slow down requests
- Use pagination for large datasets
- Cache frequently accessed data

**Product not found:**
- Verify product ID or handle
- Check if product is deleted
- Ensure you're querying the right store

---

## Rate Limits

Shopify API has rate limits:

- **Standard plans:** 40 requests per minute
- **Plus plans:** 80 requests per minute
- **Advanced plans:** 1000 requests per minute

Claude will automatically handle rate limiting and retry requests.

---

**Need Help?** Just ask Claude: "Show me how to use Shopify MCP to..."
