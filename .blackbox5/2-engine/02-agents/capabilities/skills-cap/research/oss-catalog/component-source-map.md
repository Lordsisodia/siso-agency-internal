# OSS Component Source Map (file pointers, no cloning)

Updated: `2025-12-31`

Goal: keep a single, tactical map from “the component we want” → “the best OSS repo(s) to mine” → “the exact file(s) to read”.

Rules:
- **Do not vendor/copy** these repos into our codebase; we use them as reference implementations.
- Prefer **concrete file pointers** over vague repo-level notes.
- If a repo is `license_bucket=verify`, treat it as reference-only until verified.

Related:
- Blocks inventory (what we want to build): `docs/.blackbox/oss-catalog/blocks-inventory.md`
- Storefront reference index: `docs/.blackbox/oss-catalog/storefront-reference-set.md`

---

## Storefront primitives (PLP/PDP/cart/search)

### Product grid + product card (PLP)
Primary sources:
- `BuilderIO/nextjs-shopify`
  - `blocks/ProductGrid/ProductGrid.tsx`
  - `components/common/ProductCard.tsx`
- `vercel/commerce`
  - `components/layout/product-grid-items.tsx` (PLP grid assembly)
  - `components/grid/tile.tsx` + `components/grid/three-items.tsx` (tiles)
  - `app/search/[collection]/page.tsx` (collection PLP route)
- `Shopify/hydrogen-v1`
  - `templates/demo-store/src/components/cards/ProductCard.client.tsx`
  - `templates/demo-store/src/components/product/ProductGrid.client.tsx`
- `packdigital/pack-hydrogen-theme-blueprint` (Hydrogen theme blueprint)
  - `app/components/ProductItem/ProductItem.tsx` (product card)
  - `app/components/Collection/CollectionGrid.tsx` (collection/PLP grid shell)
- `Blazity/enterprise-commerce`
  - `starters/shopify-algolia/components/product-card.tsx`
  - `starters/shopify-algolia/components/mini-product-card.tsx`
- `vuestorefront/storefront-ui` (React preview showcase)
  - `apps/preview/next/pages/showcases/ProductCard/ProductCardVertical.tsx`
  - `apps/preview/next/pages/showcases/ProductCard/ProductCardHorizontal.tsx`
  - `apps/docs/components/content/_blocks/ProductCard.md` (docs block for product card patterns)
- `takeshape/penny` (MIT)
  - `src/app/(shop)/collections/[...collection]/page.tsx` (collection route)
  - `src/features/ProductCategory/ProductCategoryWithCollection.tsx` (PLP composition)
  - `src/features/ProductCategory/ProductGrid/ProductGrid.tsx` (grid shell)
  - `src/features/ProductCategory/ProductGrid/components/GridItem.tsx` (tile/card)
- `zeon-studio/commerceplate` (MIT)
  - `src/layouts/partials/ProductListView.tsx` (PLP composition)
  - `src/layouts/partials/ProductCardView.tsx` (product card view)
  - `src/layouts/partials/FeaturedProducts.tsx` (home page product section)

### PDP + variant selection (URL-sync option selection)
Primary sources:
- `BuilderIO/nextjs-shopify`
  - `blocks/ProductView/ProductView.tsx`
  - `components/common/OptionPicker.tsx`
- `vercel/commerce`
  - `app/product/[handle]/page.tsx` (PDP route)
  - `components/product/variant-selector.tsx` (variant selection)
  - `components/product/gallery.tsx` (gallery)
- `Shopify/hydrogen-v1`
  - `templates/demo-store/src/routes/products/[handle].server.tsx` (product page; options + selected variant)
  - `packages/hydrogen/src/hooks/useProductOptions/useProductOptions.client.ts` (variant selection state)
  - `packages/hydrogen/src/components/ProductOptionsProvider/ProductOptionsProvider.client.tsx` (provider patterns)
- `packdigital/pack-hydrogen-theme-blueprint`
  - `app/components/Product/ProductOptions/*` (variant selection UI + state)
  - `app/components/Product/ProductAddToCart.tsx` (variant → add-to-cart glue)
- `zeon-studio/storeplate` (Astro + Shopify Storefront GraphQL)
  - `src/layouts/functional-components/cart/AddToCart.tsx` (variant selection + URL sync → add-to-cart)
- `pevey/sveltekit-medusa-starter` (SvelteKit + Medusa)
  - `src/routes/product/[slug]/+page.svelte` (query param `v` variant id, URL as source of truth)
  - `src/lib/utils.ts` (`findSelectedOptions`, `findVariant`)
- `Blazity/enterprise-commerce`
  - `starters/shopify-algolia/components/product/variant.tsx`
  - `starters/shopify-algolia/components/product/variants-section.tsx`
- `takeshape/penny` (MIT)
  - `src/app/(shop)/products/[...product]/page.tsx` (PDP route)
  - `src/features/ProductPage/ProductPage.tsx` (PDP composition)
  - `src/features/ProductPage/Product/Product.tsx` (product details)
  - `src/features/ProductPage/Details/Details.tsx` (details panel)
- `zeon-studio/commerceplate`
  - `src/layouts/components/product/VariantSelector.tsx`
  - `src/layouts/components/product/VariantDropDown.tsx`
  - `src/layouts/components/product/ProductGallery.tsx`

### Cart drawer + line item editing
Primary sources:
- `BuilderIO/nextjs-shopify`
  - `components/cart/CartSidebarView/CartSidebarView.tsx`
  - `components/cart/CartItem/CartItem.tsx` (qty +/- + update-on-blur patterns)
  - `lib/shopify/storefront-data-hooks/src/hooks/*` (`useCart`, `useAddItemToCart`, `useUpdateItemQuantity`, `useRemoveItemFromCart`)
- `vercel/commerce`
  - `components/cart/cart-context.tsx` (cart state)
  - `components/cart/add-to-cart.tsx` (add-to-cart pattern)
  - `components/cart/edit-item-quantity-button.tsx` + `components/cart/delete-item-button.tsx` (line editing)
  - `components/cart/modal.tsx` + `components/cart/open-cart.tsx` (cart modal/drawer)
  - `components/cart/actions.ts` (server action glue)
- `Shopify/hydrogen-v1`
  - `templates/demo-store/src/components/global/CartDrawer.client.tsx` (drawer shell)
  - `templates/demo-store/src/components/cart/CartLineItem.client.tsx` (line item UI)
  - `packages/hydrogen/src/components/CartProvider/CartProvider.client.tsx` (cart state + actions)
  - `packages/hydrogen/src/components/CartProvider/graphql/CartLineAddMutation.ts` (cart mutations)
  - `packages/hydrogen/src/components/CartProvider/graphql/CartLineUpdateMutation.ts` (qty updates)
  - `packages/hydrogen/src/components/CartProvider/graphql/CartLineRemoveMutation.ts` (remove line)
- `packdigital/pack-hydrogen-theme-blueprint`
  - `app/components/Cart/Cart.tsx` (cart shell)
  - `app/components/Cart/CartLine/*` (line item UI + editing)
  - `app/components/Cart/CartDiscounts.tsx` (discount code UX)
  - `app/components/Cart/FreeShippingMeter.tsx` (threshold meter UX)
- `zeon-studio/storeplate`
  - `src/layouts/functional-components/cart/CartModal.tsx`
  - `src/layouts/functional-components/cart/EditItemQuantityButton.tsx`
  - `src/layouts/functional-components/cart/DeleteItemButton.tsx`
  - `src/cartStore.ts` + `src/lib/utils/cartActions.ts` (nanostores + cookie cartId)
- `pevey/sveltekit-medusa-starter`
  - `src/routes/cart/+page.server.ts` (server-side form actions: add/remove/update)
  - `src/lib/components/Cart.svelte` (drawer/dialog + invalidation refresh)
- `Blazity/enterprise-commerce`
  - `starters/shopify-algolia/components/cart/cart-sheet.tsx` (cart drawer/sheet)
  - `starters/shopify-algolia/components/cart/cart-item.tsx` (line item UI)
  - `starters/shopify-algolia/components/cart/change-quantity-button.tsx` (qty editing)
  - `starters/shopify-algolia/components/cart/delete-button.tsx` (remove line)
  - `starters/shopify-algolia/stores/cart-store.ts` (cart state)
  - `starters/shopify-algolia/app/actions/cart.actions.ts` (server actions)
- `takeshape/penny` (MIT)
  - `src/features/Cart/CartProvider.tsx` (cart provider/context)
  - `src/features/Cart/Cart.tsx` (cart shell)
  - `src/features/Cart/components/CartItem.tsx` (line item UI)
  - `src/features/Cart/components/DiscountCode.tsx` (discount code UI)
- `zeon-studio/commerceplate`
  - `src/layouts/components/cart/CartModal.tsx` (cart modal/drawer)
  - `src/layouts/components/cart/EditItemQuantityButton.tsx` (qty editing)
  - `src/layouts/components/cart/DeleteItemButton.tsx` (remove line)
  - `src/layouts/components/cart/AddToCart.tsx` (add-to-cart button)

### Shopify Storefront API (raw GraphQL client + fragments)
Primary sources:
- `zeon-studio/storeplate`
  - `src/lib/shopify/index.ts`
  - `src/lib/shopify/fragments/cart.ts`
  - `src/lib/shopify/queries/cart.ts`
  - `src/lib/shopify/mutations/cart.ts`
- `vercel/commerce`
  - `lib/shopify/queries/*` + `lib/shopify/mutations/*` + `lib/shopify/fragments/*`
  - `lib/shopify/index.ts` + `lib/shopify/types.ts`
- `Blazity/enterprise-commerce`
  - `starters/shopify-algolia/lib/shopify/fragments/cart.ts`
  - `starters/shopify-algolia/lib/shopify/queries/cart.storefront.ts`
  - `starters/shopify-algolia/lib/shopify/mutations/cart.storefront.ts`

### Search modal / search UX
Primary sources:
- `BuilderIO/nextjs-shopify`
  - `components/common/Searchbar.tsx`
  - `lib/shopify/storefront-data-hooks/src/api/operations.ts` (`searchProducts` path)
- `vercel/commerce`
  - `app/search/page.tsx` + `app/search/[collection]/page.tsx` (search routes)
  - `components/layout/search/*` (search + collections UI primitives)
- `packdigital/pack-hydrogen-theme-blueprint`
  - `app/components/Search/Search.tsx` (search shell)
  - `app/components/Search/SearchAutocomplete.tsx` (autocomplete UI)
  - `app/components/Search/useSearch.ts` (search state hook)
- `Blazity/enterprise-commerce`
  - `starters/shopify-algolia/components/modals/search-modal.tsx`
  - `starters/shopify-algolia/components/search-view.tsx`
- `takeshape/penny` (MIT)
  - `src/features/Search/useSearch.ts` (search state hook)
  - `src/features/Search/Modal/Modal.tsx` (search modal)
  - `src/features/Search/Modal/components/ModalSearchItem.tsx` (result item)
- `zeon-studio/commerceplate`
  - `src/layouts/components/SearchBar.tsx`

### Collection filters / facets (URL-synced)
Primary sources:
- `Blazity/enterprise-commerce`
  - `starters/shopify-algolia/components/filters/facets-desktop.tsx`
  - `starters/shopify-algolia/components/filters/facets-mobile.tsx`
  - `starters/shopify-algolia/components/filters/facets-content.tsx`
  - `starters/shopify-algolia/components/filters/price-facet.tsx`
  - `starters/shopify-algolia/components/filters/vendors-facet.tsx`
  - `starters/shopify-algolia/components/filters/search-facet.tsx`
- `vercel/commerce`
  - `components/layout/search/filter/*` (filters UI primitives)
  - `app/search/layout.tsx` + `app/search/loading.tsx` (layout + loading states)
- `vuestorefront/storefront-ui` (UI primitives to compose facets)
  - `packages/sfui/frameworks/react/components/SfChip/SfChip.tsx` (selected filter “chips”)
  - `packages/sfui/frameworks/react/components/SfAccordionItem/SfAccordionItem.tsx` (collapsible facet groups)
  - `packages/sfui/frameworks/react/components/SfScrollable/SfScrollable.tsx` (horizontal chip bar)
- `takeshape/penny` (MIT)
  - `src/features/ProductCategory/Filters/Filters.tsx` (filters UI)
  - `src/features/ProductCategory/Pagination/Pagination.tsx` (pagination UI)
  - `src/features/ProductCategory/Pagination/usePagination.ts` (pagination state)
- `zeon-studio/commerceplate`
  - `src/layouts/partials/ProductFilters.tsx` (filters composition)
  - `src/layouts/components/filter/DropdownMenu.tsx` (facet dropdown menu)
  - `src/layouts/components/filter/FilterDropdownItem.tsx` (facet item)

### Shipping rates / packaging (boxes, dimensions)
Primary sources:
- `jonyw4/vendure-advanced-shipping` (MIT)
  - `packages/core/src/plugin.ts` (Vendure plugin entrypoint)
  - `packages/core/src/services/shipping-packages.service.ts` (packages + box/dimensions logic)
  - `packages/core/src/entities/shipping-packages.entity.ts` (shipping package model)
  - `packages/core/src/services/package.service.ts` (package CRUD/service layer)
  - `packages/core/src/entities/package.entity.ts` (package entity)

### Shopify app primitives (OAuth, sessions, webhooks)
Primary sources:
- `kinngh/shopify-nextjs-prisma-app` (MIT)
  - `pages/api/webhooks/[...webhookTopic].js` (webhook handler)
  - `utils/middleware/verifyRequest.js` (JWT/session token → online/offline token exchange → attach session)
  - `utils/sessionHandler.js` + `utils/cryption.js` + `prisma/schema.prisma` (encrypted session persistence)
  - `pages/api/graphql.js` (Admin GraphQL proxy)
  - `pages/api/proxy_route/json.js` + `utils/middleware/verifyProxy.js` (app proxy signature verification)
  - `pages/api/gdpr/*` + `utils/middleware/verifyHmac.js` (GDPR webhooks + HMAC verification)
  - `utils/middleware/withMiddleware.js` (middleware registry)
- `carstenlebek/shopify-node-app-starter` (MIT)
  - `src/pages/api/auth/*` (online/offline OAuth flow)
  - `src/lib/shopify.ts` (Shopify Context init + webhook registry)
  - `src/pages/api/webhooks.ts` + `src/webhooks/index.ts` (webhook endpoint + handler map)
  - `src/pages/api/graphql.ts` (Admin GraphQL proxy)
  - `src/lib/sessionStorage.ts` (session storage)
  - `src/middleware.ts` + `src/middleware/verify-request.ts` (request validation + top-level redirect + CSP)

### Policy + approvals primitives (policy-as-code)
Primary sources:
- `open-policy-agent/opa` (Apache-2.0)
  - `docs/docs/rest-api.md` (`POST /v1/data/{path:.+}` decision evaluation; policy CRUD; compile API)
  - `docs/docs/management-bundles/index.md` (snapshot/delta bundles; ETag + polling; roots scoping)
  - `docs/docs/management-decision-logs.md` (decision logs reporting to HTTP service/console/plugins)
  - `docs/docs/policy-testing.md` (`opa test` + coverage)
  - Evidence: `docs/.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-opa-policy-approvals-primitives.md`

### Audit log primitives (event schema + embeddable viewer)
Primary sources:
- `retracedhq/retraced` (Apache-2.0)
  - `swagger.json` (OpenAPI; base URL includes `/auditlog`)
    - `POST /publisher/v1/project/{projectId}/event` (ingest)
    - `POST /publisher/v1/project/{projectId}/event/bulk` (bulk ingest)
    - `GET /publisher/v1/project/{projectId}/viewertoken` (embed viewer token)
    - `POST /publisher/v1/project/{projectId}/graphql` (query)
  - `src/controllers/PublisherController.ts` (publisher endpoints)
  - `docker-compose.yaml` (local run)
  - `helm/` + `kustomize/` (k8s deploy options)
  - Evidence: `docs/.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-retraced-audit-log-primitives.md`

### Reliability primitives (webhook inbox/outbox, idempotency)
Primary sources:
- `Zehelein/pg-transactional-outbox` (MIT)
  - `lib/README.md` (concepts + operational considerations; polling vs replication)
  - `examples/setup/out/example-trx-polling.sql` (outbox/inbox schemas + polling functions + indexes)
  - `examples/setup/out/example-trx-replication.sql` (publication + replication slot wiring; reference-only)
  - `lib/src/setup/database-setup-exporter.ts` + `lib/src/setup/database-setup.ts` (generated setup SQL blueprint)
  - `lib/src/message/transactional-message.ts` (message fields + stored state)
  - `lib/src/message/mark-message-completed.ts` + `lib/src/message/mark-message-abandoned.ts` (state transitions)
  - `lib/src/message/message-cleanup.ts` (retention/cleanup loop)
  - Polling loop:
    - `lib/src/polling/polling-message-listener.ts`
    - `lib/src/polling/next-messages.ts`
  - Logical replication loop (later):
    - `lib/src/replication/logical-replication-listener.ts`
    - `lib/src/replication/acknowledge-manager.ts` (LSN ordering + ack safety)

Reference implementations (not direct integration targets):
- `dotnetcore/CAP` (C#/.NET) — outbox/event-bus semantics + operational knobs (README + docs)
- `tomorrow-one/transactional-outbox` (Java/Kafka) — pattern semantics + tradeoffs (README)
- `lydtechconsulting/kafka-idempotent-consumer` — idempotent consumer + outbox example (README)
- `catmullet/one` — idempotency middleware reference (README)

### Agent workflow studio primitives (visual workflows + execution logs)
Primary sources:
- `simstudioai/sim` (Apache-2.0)
  - Workflow serialization:
    - `apps/sim/serializer/types.ts` (`SerializedWorkflow`: blocks + connections + loops + parallels)
    - `apps/sim/stores/workflows/workflow/types.ts` (UI/editor types; loops/parallels + ReactFlow edges)
  - Runtime execution engine:
    - `apps/sim/executor/dag/builder.ts` (DAG build; loop/parallel sentinel validation)
    - `apps/sim/executor/orchestrators/node.ts` (node execution + loop/parallel orchestration)
    - `apps/sim/executor/execution/engine.ts` (ready queue + concurrency + pause/resume result)
    - `apps/sim/executor/types.ts` (execution logs, pause points, metadata payloads)
  - Persistence model (audit trail building blocks):
    - `packages/db/schema.ts` (`workflow_*`, `workflow_execution_logs`, `workflow_execution_snapshots`, `paused_executions`)
  - Integration registries:
    - `apps/sim/blocks/registry.ts` (canvas blocks; includes `shopify`, `stripe`, `webhook`, `human_in_the_loop`)
    - `apps/sim/tools/registry.ts` (action tools; includes `shopify`, `zendesk`, `stripe`, etc)
    - `apps/sim/triggers/registry.ts` (webhook/poller triggers; includes `stripe_webhook`, `generic_webhook`, etc)
  - Evidence: `docs/.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-simstudio-sim-agent-workflows-primitives.md`

---

## Blog + content primitives (MDX, TOC, code blocks, SEO)

### Content model + MDX pipeline (Contentlayer)
Primary sources:
- `timlrx/tailwind-nextjs-starter-blog` (Contentlayer2 + Pliny)
  - `contentlayer.config.ts` (DocumentTypes + computedFields: readingTime, toc; remark/rehype plugins)
- `shadcn-ui/taxonomy` (Contentlayer + MDX for docs/blog/pages)
  - `contentlayer.config.js` (DocumentTypes + rehype-pretty-code + heading anchors)
- `pdsuwwz/nextjs-nextra-starter` (Nextra + App Router)
  - `src/app/[lang]/[[...mdxPath]]/page.tsx` (MDX page route)
  - `src/app/[lang]/layout.tsx` (docs/blog layout shell)
  - `src/mdx-components.ts` (MDX component mapping)
  - `src/content/*` (content tree)
  - `next-sitemap.config.mjs` (sitemap/SEO glue)

### MDX component mapping (portable blocks)
Primary sources:
- `timlrx/tailwind-nextjs-starter-blog`
  - `components/MDXComponents.tsx` (Image/TOCInline/CustomLink/Pre/TableWrapper/NewsletterForm)
- `shadcn-ui/taxonomy`
  - `components/mdx-components.tsx` (headings/typography + Callout + Card + Image/table wrappers)
- `netlify-templates/nextjs-blog-theme` (MIT)
  - `components/CustomLink.js` (link wrapper)
  - `components/CustomImage.js` (image wrapper)
  - `utils/mdx-utils.js` (MDX loading/compilation utilities)

### TOC (extraction + UI active-heading)
Primary sources:
- `timlrx/tailwind-nextjs-starter-blog`
  - `contentlayer.config.ts` (computedFields.toc via `extractTocHeadings`)
  - `app/blog/[...slug]/page.tsx` (`MDXLayoutRenderer` receives `toc`)
- `shadcn-ui/taxonomy`
  - `lib/toc.ts` (mdast-util-toc → TableOfContents structure)
  - `components/toc.tsx` (IntersectionObserver active heading + nested Tree UI)
  - `app/(docs)/docs/[[...slug]]/page.tsx` (toc computation and rendering)

### Code blocks (highlighting + line numbers + titles)
Primary sources:
- `shadcn-ui/taxonomy`
  - `contentlayer.config.js` (rehype-pretty-code with highlight hooks)
  - `styles/mdx.css` (data-rehype-pretty-code selectors for line numbers + highlight styles)
- `timlrx/tailwind-nextjs-starter-blog`
  - `contentlayer.config.ts` (rehype-prism-plus + code title plugin)

### Blog page shells + SEO (Metadata, OpenGraph, JSON-LD)
Primary sources:
- `timlrx/tailwind-nextjs-starter-blog`
  - `app/blog/[...slug]/page.tsx` (Metadata generation + JSON-LD script)
  - `layouts/PostLayout.tsx` (post shell: authors/tags/prev-next/comments/edit links)
- `shadcn-ui/taxonomy`
  - `app/(marketing)/blog/page.tsx` (blog list grid)
  - `app/(marketing)/blog/[...slug]/page.tsx` (post layout + OG via `/api/og`)
- `netlify-templates/nextjs-blog-theme` (MIT)
  - `components/SEO.js` (SEO wrapper)
  - `pages/posts/[slug].js` (post page shell)
  - `posts/*.mdx` (frontmatter + content examples)

### RSS + sitemap
Primary sources:
- `timlrx/tailwind-nextjs-starter-blog`
  - `scripts/rss.mjs` (RSS + per-tag feeds)
  - `app/sitemap.ts` (MetadataRoute sitemap from contentlayer)

### Gatsby MDX wiring (plugins + templates)
Primary sources:
- `rwieruch/gatsby-mdx-blog-starter-project` (MIT)
  - `gatsby-config.js` (`gatsby-plugin-mdx` + `gatsby-remark-images` + `gatsby-remark-prismjs`)
  - `gatsby-node.js` (MDX node creation + page generation)
  - `src/templates/post.js` (`MDXRenderer`, banner image, categories list)
  - `src/templates/blog.js` (blog index template)
  - `src/components/mdx/*` (portable MDX components: `Title`, `Subtitle`, `Paragraph`)
  - `content/blog/mdx-example/index.md` (MDX post example)
  - `content/blog/*/index.md` (post structure + images folder per post)

### Gatsby starter (theme-based, MDX content examples)
Primary sources:
- `LekoArts/gatsby-starter-minimal-blog` (0BSD)
  - `gatsby-config.ts` (theme config surface + `gatsby-plugin-feed` + `gatsby-plugin-sitemap`)
  - `content/posts/*/index.mdx` (MDX post examples: code blocks, images, markdown reference)
  - `content/pages/about/index.mdx` (static MDX page)

Notes:
- The theme implementation lives in the `@lekoarts/gatsby-theme-minimal-blog` dependency; this starter is best for MDX content examples + config surface.

Theme implementation sources:
- `LekoArts/gatsby-themes` (MIT)
  - `themes/gatsby-theme-minimal-blog/src/components/mdx-components.tsx` (MDX component map)
  - `themes/gatsby-theme-minimal-blog/src/components/code.tsx` (code block wrapper + copy UX)
  - `themes/gatsby-theme-minimal-blog/src/components/post.tsx` (post layout shell)
  - `themes/gatsby-theme-minimal-blog/src/components/blog.tsx` (blog index page)
  - `themes/gatsby-theme-minimal-blog/src/components/blog-list-item.tsx` (post list item/card)
  - `themes/gatsby-theme-minimal-blog/src/components/seo.tsx` (SEO wrapper)
  - `themes/gatsby-theme-minimal-blog/src/components/item-tags.tsx` (tag list UI)

### Lightweight blog engine (Markdown + YAML config)
Primary sources:
- `prplwtf/writea` (MIT)
  - `configuration/Configuration.example.yml` (site config schema example)
  - `configuration/Posts.example.yml` (posts list/index config example)
  - `posts/*.md` (markdown posts)
  - `src/configuration/*` (load + render YAML configuration)
  - `src/router/*` (routing primitives)
  - `themes/*.css` (theme CSS switches)
  - `src/vendor/hljs/languages/{markdown,yaml}.*` (highlight.js language wiring)

### Astro blog page wiring (routes + layout + RSS)
Primary sources:
- `stelcodes/multiterm-astro` (Astro theme)
  - `src/layouts/MarkdownLayout.astro` (post layout)
  - `src/pages/posts/[slug].astro` (post page)
  - `src/pages/posts/[...page].astro` (paginated index)
  - `src/pages/rss.xml.ts` (RSS generation)
- `jktrn/astro-erudite` (MIT)
  - `src/content.config.ts` (content collections + schema)
  - `src/pages/blog/[...id].astro` + `src/pages/blog/[...page].astro` (post + pagination)
  - `src/pages/rss.xml.ts` (RSS generation)
  - `src/layouts/Layout.astro` (site shell)

### TOC UI (Astro)
Primary sources:
- `ArtemKutsan/astro-citrus`
  - `src/components/blog/TOC.astro` (TOC container)
  - `src/components/blog/TOCHeading.astro` (heading row + active state)
  - `src/layouts/BlogPost.astro` (layout integrates TOC)
- `jktrn/astro-erudite` (MIT)
  - `src/components/TOCSidebar.astro` + `src/components/TOCHeader.astro` (TOC UI variants)
  - `src/components/PostHead.astro` + `src/components/PostNavigation.astro` (post shell primitives)

### Markdown parsing + extensions (plugins, custom blocks)
Primary sources:
- `zestedesavoir/zmarkdown` (MIT)
  - `packages/rebber-plugins/src/preprocessors/*` (markdown preprocessing: footnotes, iframes, math, spoilers)
  - `packages/rebber-plugins/src/type/*` (custom node types: footnotes, grid tables, kbd, math, etc.)
  - `packages/mdast-util-split-by-heading/src/index.js` (split AST by heading; useful for TOC/sections)

### Streaming markdown renderer (AI output UI)
Primary sources:
- `Simon-He95/markstream-vue`
  - `packages/markstream-vue2/src/components/NodeRenderer/NodeRenderer.vue` (node renderer)
  - `packages/markdown-parser/src/index.ts` (streaming parser)
  - `docs/guide/monaco.md` + `docs/guide/mermaid.md` (performance strategy)

---

## Marketing / page sections (FAQ, pricing, testimonials, newsletter)

### FAQ accordion (collapse / disclosure patterns)
Primary sources:
- `markmead/hyperui`
  - `src/content/collection/marketing/faqs.mdx` (index + metadata)
  - `public/components/marketing/faqs/1.html` (FAQ section)
  - `public/components/marketing/faqs/2.html` (FAQ section)
  - `public/components/marketing/faqs/3.html` (FAQ section)
- `merakiuilabs/merakiui`
  - `components/faq/Collapse.html` (FAQ collapse)

Supporting sources:
- `themesberg/flowbite`
  - `content/components/accordion.md` (accordion usage examples)
  - `src/components/accordion/index.ts` + `src/components/accordion/types.ts` (JS API/behavior)
- `saadeghi/daisyui`
  - `packages/docs/src/routes/(routes)/components/accordion/+page.md` (accordion docs/examples)
  - `packages/docs/src/routes/(routes)/components/collapse/+page.md` (collapse docs/examples)

### Pricing tables (tiers, comparisons, “most popular” highlight)
Primary sources:
- `markmead/hyperui`
  - `src/content/collection/marketing/pricing.mdx` (index + metadata)
  - `public/components/marketing/pricing/1.html` (pricing section)
  - `public/components/marketing/pricing/2.html` (pricing section)
- `mertJF/tailblocks`
  - `src/blocks/pricing/light/a.js`
  - `src/blocks/pricing/light/b.js`
  - `src/blocks/pricing/dark/a.js`
  - `src/blocks/pricing/dark/b.js`
- `merakiuilabs/merakiui`
  - `components/pricing/Simple.html`
  - `components/pricing/Popular.html`
  - `components/pricing/SideBySide.html`

### Testimonials / reviews (quote cards, grid/slider variants)
Primary sources:
- `mertJF/tailblocks`
  - `src/blocks/testimonial/light/a.js`
  - `src/blocks/testimonial/light/b.js`
  - `src/blocks/testimonial/light/c.js`
  - `src/blocks/testimonial/dark/a.js`
  - `src/blocks/testimonial/dark/b.js`
  - `src/blocks/testimonial/dark/c.js`
- `merakiuilabs/merakiui`
  - `components/testimonials/Card.html`
  - `components/testimonials/Centered.html`
  - `components/testimonials/Slider.html`
  - `components/cards/Testimonial.html` (single testimonial card)

Supporting primitive:
- `themesberg/flowbite`
  - `content/components/rating.md` (read-only star rating patterns)

### Newsletter / waitlist signup (email capture UX)
Primary sources:
- `markmead/hyperui`
  - `src/content/collection/marketing/newsletter-signup.mdx` (index + metadata)
  - `public/components/marketing/newsletter-signup/1.html`
  - `public/components/marketing/newsletter-signup/2.html`
- `merakiuilabs/merakiui`
  - `components/heros/NewsletterForm.html`
  - `components/footers/SubscribeFromAndLinks.html`

Supporting primitives:
- `themesberg/flowbite`
  - `content/forms/input-field.md` (email input patterns)
  - `content/components/alerts.md` (success/error callouts)

### Landing-page “section kits” (Nav/Hero/Pricing/Teams/Footer)
Primary sources:
- `ant-design/ant-design-landing` (MIT)
  - Elements library (many sections):
    - `site/templates/template/element/Pricing0/index.jsx`
    - `site/templates/template/element/Pricing1/index.jsx`
    - `site/templates/template/element/Pricing2/index.jsx`
    - `site/templates/template/element/Teams0/index.jsx`
    - `site/templates/template/element/Teams1/index.jsx`
    - `site/templates/template/element/Teams2/index.jsx`
    - `site/templates/template/element/Teams3/index.jsx`
    - `site/templates/template/element/Footer0/index.jsx`
    - `site/templates/template/element/Footer1/index.jsx`
    - `site/templates/template/element/Footer2/index.jsx`
    - `site/templates/template/element/Nav0/index.jsx` (nav variants)
    - `site/templates/template/element/Banner0/index.jsx` (hero/banner variants)
- `LiveDuo/destack` (MIT) — Next.js page builder + bundled section themes
  - HyperUI-derived TSX sections (FAQ/Testimonials/Stats/etc):
    - `lib/themes/hyperui/Banner1/index.tsx`
    - `lib/themes/hyperui/Cta1/index.tsx`
    - `lib/themes/hyperui/Faq1/index.tsx`
    - `lib/themes/hyperui/Form1/index.tsx` (newsletter/waitlist form variants)
    - `lib/themes/hyperui/Testimonials1/index.tsx`
    - `lib/themes/hyperui/Stats1/index.tsx`
    - `lib/themes/hyperui/Navigation1/index.tsx`
  - Theme index + variants:
    - `lib/themes/hyperui/index.ts` (exports)
    - `lib/themes/flowbite/*` (Flowbite-derived blocks)
    - `lib/themes/preline/*` (Preline-derived blocks)
- `themesberg/tailwind-landing-page` (MIT)
  - `index.html` (single-page landing composition; easy copy reference)

### Newsletter / contact / pricing blocks in a real app skeleton (Remix)
Primary sources:
- `AlexandroMtzG/remix-blocks` (MIT)
  - Newsletter + contact primitives:
    - `app/routes/blocks/email/newsletter-with-convertkit.tsx`
    - `app/routes/blocks/email/contact-form-with-formspree.tsx`
  - Forms + validation patterns:
    - `app/routes/blocks/forms/simple-form.tsx`
    - `app/routes/blocks/forms/form-with-confirmation-dialog.tsx`
  - Table/list UI (admin-ish):
    - `app/routes/blocks/lists/table.tsx`
  - Pricing Stripe setup example (backend + UI glue):
    - `app/routes/blocks/subscriptions/create-pricing-plans-with-stripe.tsx`

---

## Admin + bulk ops primitives (RBAC, admin shell, CRUD)

### Internal tool builder (Retool-like admin surfaces)
Primary sources:
- `illacloud/illa-builder` (Apache-2.0)
  - Router shell:
    - `apps/builder/src/router/index.tsx`
    - `apps/builder/src/router/routerConfig.tsx`
  - API/service layer (apps/resources/actions/users):
    - `apps/builder/src/services/apps.ts`
    - `apps/builder/src/services/resource.ts`
    - `apps/builder/src/services/action.ts`
    - `apps/builder/src/services/users.ts`
    - `apps/builder/src/services/team.ts`
  - Core UI surfaces:
    - `apps/builder/src/page/App/index.tsx` (app shell)
    - `apps/builder/src/page/Resource/*` (resource create/edit flows)
  - Evidence: `docs/.blackbox/agents/.plans/2025-12-31_2205_oss-sourcing-roadmap-audit-next-lanes/artifacts/poc-illa-builder-admin-bulk-ops-primitives.md`

### RBAC model + route gating
Primary sources:
- `mickasmt/next-auth-roles-template` (Next.js + Auth.js v5)
  - `prisma/schema.prisma` (UserRole enum)
  - `auth.ts` + `lib/session.ts` (role in JWT/session; `getCurrentUser` helper)
  - `middleware.ts` (auth middleware + matcher)
  - `app/(protected)/admin/layout.tsx` + `app/(protected)/admin/page.tsx` (ADMIN-only gate)

### Role-filtered navigation (hide unauthorized sections)
Primary sources:
- `mickasmt/next-auth-roles-template`
  - `config/dashboard.ts` + `types/index.d.ts` (`authorizeOnly` on nav items)
  - `app/(protected)/layout.tsx` (filters nav sections by user.role)

### CRUD + server-side pagination/search in admin
Primary sources:
- `radomirbrkovic/fast-kit` (FastAPI + Jinja admin)
  - `app/repositories/admin/user_repository.py` + `app/repositories/admin/crud_repository.py` (search + paginate)
  - `app/routers/admin/users.py` (index/create/edit/update/delete)
  - `templates/admin/users/index.html` (search + table + delete confirmation via fetch DELETE)

### API auth middleware (token → request.state.user)
Primary sources:
- `radomirbrkovic/fast-kit`
  - `app/middlewares/api_auth_middleware.py` (Bearer token verify → attach user + user_role)

---

## Store credit + gift cards (codes + ledger patterns)

### Redemption code generation (code-only, no balance ledger)
Primary sources:
- `voucherifyio/voucher-code-generator-js` (MIT)
  - `voucher_codes.js` (core generator)
  - `test/` (expected formats)
  - `README.md` (usage examples)
  - `LICENSE` (MIT)

### Gift card issuance + redemption + store-credit integration (Solidus extension)
Primary sources:
- `solidusio-contrib/solidus_virtual_gift_card` (BSD-3-Clause)
  - `app/models/spree/virtual_gift_card.rb` (gift card model)
  - `app/models/spree/virtual_gift_card_event.rb` (event/ledger-like model)
  - `app/models/spree/payment_method/gift_card.rb` (gift card payment method)
  - `app/controllers/spree/api/gift_card_codes_controller.rb` (API: redeem/apply code)
  - `app/controllers/spree/api/gift_cards_controller.rb` (API: gift cards)
  - `config/initializers/gift_card_store_credit_event_originator.rb` (ties gift card → store credit event originator)
  - `app/decorators/models/solidus_virtual_gift_card/spree/order_decorator.rb` (order integration hooks)
  - `lib/solidus_virtual_gift_card/controllers/backend/spree/admin/gift_cards_controller.rb` (admin CRUD)
  - `app/views/checkouts/payment/_gift_card.html.erb` (checkout apply gift card UX)
  - `db/migrate/20140623152903_create_virtual_gift_card.rb` (initial schema)
  - `db/migrate/20250113222704_create_spree_virtual_gift_card_events.rb` (events schema)
  - `spec/models/spree/virtual_gift_card_spec.rb` (behavior expectations)

### Gift cards as “store credit” (Saleor)
Primary sources:
- `saleor/saleor` (BSD-3-Clause)
  - `saleor/giftcard/models.py` (GiftCard model: balance/expiry + relations)
  - `saleor/giftcard/events.py` (gift card event model/hooks)
  - `saleor/giftcard/const.py` (`GIFT_CARD_PAYMENT_GATEWAY_ID` + gateway naming)
  - `saleor/giftcard/gateway.py` (gift card gateway behavior; refunds adjust gift card balance)
  - `saleor/checkout/models.py` (checkout ↔ gift_cards relation; `get_total_gift_cards_balance`)
  - `saleor/checkout/calculations.py` (`calculate_checkout_total_with_gift_cards`)
  - `saleor/graphql/payment/mutations/payment/checkout_payment_create.py` (payment creation accounts for gift cards)
  - `saleor/order/models.py` (order ↔ gift_cards relation; `is_gift_card` flags)
  - `saleor/graphql/giftcard/mutations/gift_card_create.py` (issue gift card)
  - `saleor/graphql/giftcard/mutations/gift_card_add_note.py` (audit-ish notes)
  - `saleor/graphql/giftcard/bulk_mutations/gift_card_bulk_create.py` (bulk issuance)

### Returns + refunds primitives (Saleor)
Primary sources:
- `saleor/saleor` (BSD-3-Clause)
  - `saleor/graphql/order/mutations/fulfillment_return_products.py` (return products; optional refund + optional replacement)
  - `saleor/graphql/order/mutations/fulfillment_refund_products.py` (line-level refunds)
  - `saleor/graphql/order/mutations/order_refund.py` (amount-level refund “ops escape hatch”)
  - `saleor/graphql/order/mutations/order_grant_refund_create.py` + `saleor/graphql/order/mutations/order_grant_refund_update.py` (create/update “refund owed” record)
  - `saleor/graphql/payment/mutations/transaction/transaction_request_refund_for_granted_refund.py` (execute refund via transaction rail)
  - `saleor/order/actions.py` (orchestration helpers for return/refund/exchange)
  - `saleor/graphql/order/tests/mutations/test_fulfillment_return_products.py` (behavior expectations)

### Store credit + returns/reimbursements (Spree)
Reference sources (license=flagged in curation: AGPL-3.0 for v4.10+; treat as reference-only):
- `spree/spree`
  - `core/app/models/spree/store_credit.rb` (store credit model)
  - `core/app/models/spree/store_credit_event.rb` (ledger/event history)
  - `storefront/app/views/spree/checkout/_store_credit.html.erb` (apply store credit at checkout UX)
  - `core/app/models/spree/return_authorization.rb` (RMA/authorization)
  - `core/app/models/spree/return_item.rb` + `core/app/models/spree/customer_return.rb` (return primitives)
  - `core/app/models/spree/reimbursement.rb` + `core/app/models/spree/reimbursement_type.rb` (refund/store credit reimbursements)
  - `admin/app/controllers/spree/admin/orders/customer_returns_controller.rb` (admin workflows)

### Store credit + returns/reimbursements (Solidus core)
Reference sources (license verified manually: BSD-3-Clause; GitHub metadata is NOASSERTION):
- `solidusio/solidus`
  - `core/app/models/spree/store_credit.rb` (store credit model)
  - `core/app/models/spree/store_credit_event.rb` (ledger/event history)
  - `core/app/models/spree/store_credit_type.rb` (typing/categories)
  - `core/app/models/spree/payment_method/store_credit.rb` (payment method integration)
  - `core/app/models/spree/return_authorization.rb` + `core/app/models/spree/core/state_machines/return_authorization.rb` (RMA + state transitions)
  - `core/app/models/spree/customer_return.rb` + `core/app/models/spree/return_item.rb` (return primitives)
  - `core/app/models/spree/return_item/eligibility_validator/*` (policy-like gates: time window, RMA required, etc.)
  - `core/app/models/spree/reimbursement.rb` + `core/app/models/spree/reimbursement_type/credit.rb` (refund/store credit reimbursements)
  - `admin/app/controllers/solidus_admin/store_credits_controller.rb` (new admin UI surface)
  - `backend/app/controllers/spree/admin/customer_returns_controller.rb` (legacy admin workflows)

---

## Support timeline + inbox primitives (threads/messages/widgets)

### Embeddable chat widget (React)
Primary sources:
- `papercups-io/chat-widget` (MIT)
  - `src/components/ChatWidget.tsx` (main widget)
  - `src/components/ChatWindow.tsx` (conversation UI)
  - `src/index.tsx` (package entry)
  - `example/src/App.tsx` (embed example)

### Helpdesk primitives (models + staff/public views)
Primary sources:
- `django-helpdesk/django-helpdesk` (BSD-2-Clause)
  - `src/helpdesk/models.py` (tickets/threads/followups)
  - `src/helpdesk/views/staff.py` (staff dashboard flows)
  - `src/helpdesk/views/public.py` (public ticket flows)
  - `src/helpdesk/views/api.py` (API endpoints)
  - `src/helpdesk/templates/helpdesk/dashboard.html` (dashboard UI)

### Widget loader patterns (bootstrapping)
Reference sources:
- `channel-io/channel-web-sdk-loader` (Apache-2.0)
  - `src/index.ts` (loader entrypoint)
- `rotatordisk92/react-slack-chat` (license=verify)
  - `src/components/ReactSlackChat/ReactSlackChat.js` (widget component)

### Intercom API client patterns (conversations/users ingestion)
Reference sources:
- `tarunc/intercom.io` (MIT, Node.js)
  - `index.js` (package entry)
  - `lib/intercom.io.js` (API client)
  - `lib/IntercomError.js` (error mapping)
- `intercom/intercom-dotnet` (Apache-2.0, .NET)
  - `src/Intercom/Core/Client.cs` (HTTP client core)
  - `src/Intercom/Clients/ConversationsClient.cs` (conversations endpoints)
  - `src/Intercom/Data/Conversation.cs` (conversation model)
