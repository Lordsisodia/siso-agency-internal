# Shopify Redirect Snippet (Homepage → Headless)

Use this when you need the Shopify Online Store homepage to instantly forward shoppers to the headless app (`https://lumellebeauty.co.uk`) without touching checkout or other pages.

## One-line summary
Add a conditional redirect at the top of `layout/theme.liquid` so it only runs on the homepage (`request.page_type == 'index'`).

## Drop-in code (copy/paste)
Paste this immediately after the opening `<head>` tag in `layout/theme.liquid`:

```liquid
{% if request.page_type == 'index' %}
  <meta http-equiv="refresh" content="0; url=https://lumellebeauty.co.uk">
  <script>window.location.replace('https://lumellebeauty.co.uk');</script>
  <style>body { opacity: 0; }</style>
{% endif %}
```

## Notes
- Runs only on the Online Store **home** (`request.page_type == 'index'`); checkout, account, and other pages are untouched.
- Keep the redirect URL consistent with your headless app.
- Test on a duplicated theme before publishing.

