# Verdure — Premium Plant Shop

A polished, responsive e-commerce storefront for selling houseplants and plant-care accessories. Built with Cloudflare Workers + Durable Objects for seamless backend persistence, featuring a stunning single-page layout with hero section, product grid, filters, quick-view modals, and a lightweight cart system.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/kristopher-lab/verdure-premium-plant-shop)

## Overview

Verdure delivers an exquisite, mobile-first shopping experience focused on visual excellence and smooth interactions. Users can browse curated plant collections, apply filters, view product details in modals, and manage their cart with mock checkout functionality. The architecture leverages Cloudflare's edge computing for fast, global performance, with data persistence via Durable Objects.

### Key Features
- **Hero Section**: Eye-catching banner with headline, subheadline, and "Shop Plants" CTA.
- **Product Catalog**: Responsive grid of plant cards with prices, ratings, color swatches, and quick-add buttons.
- **Filters**: Collapsible sidebar on desktop; expandable top bar on mobile for categories, price range, size, and sun requirements.
- **Product Quick-View**: Modal dialog with image gallery, variants (size/pot), care info, and add-to-cart.
- **Cart & Checkout**: Floating drawer for items, quantity controls, subtotal, promo codes, and mock order confirmation.
- **Visual Polish**: Earthy color palette (#27532A primary green, #F38020 orange accents, #6EE7B7 mint highlights), glassmorphism cards, framer-motion animations, skeleton loaders, and toast notifications.
- **Backend**: API endpoints for products and carts, seeded with mock data, using Hono routing and IndexedEntity patterns for storage.
- **Responsive & Accessible**: Flawless on all devices; ARIA-compliant with keyboard navigation.

## Technology Stack
- **Frontend**: React 18, React Router 6, Tailwind CSS 3, shadcn/ui (components like Button, Card, Dialog, Sheet, Slider), Framer Motion (animations), Sonner (toasts), Zustand (state management), React Hook Form (forms), React Select (filters), Lucide React (icons).
- **Backend**: Cloudflare Workers, Hono (routing), Durable Objects (via GlobalDurableObject for entities like ProductEntity and CartEntity).
- **Data & Utils**: TypeScript, Zod (validation), clsx/tailwind-merge (styling), @tanstack/react-query (optional caching).
- **Build & Dev**: Vite (bundler), Bun (package manager), Wrangler (Cloudflare CLI).

## Installation

1. **Prerequisites**:
   - Node.js 18+ (though we use Bun for speed).
   - Bun installed: `curl -fsSL https://bun.sh/install | bash`.
   - Cloudflare account and Wrangler CLI: `bunx wrangler login`.

2. **Clone & Setup**:
   ```bash
   git clone <your-repo-url>
   cd verdure-plantshop
   bun install
   ```

3. **Environment**:
   - No additional env vars needed for local dev; the template uses a single Durable Object binding.
   - Run `bunx wrangler types` to generate Cloudflare types if needed.

## Development

1. **Start Local Server**:
   ```bash
   bun run dev
   ```
   - Frontend: Runs on `http://localhost:3000`.
   - Worker: Automatically proxied for API calls (e.g., `/api/products`).

2. **Test APIs**:
   - Seed data loads automatically on first request to `/api/products`.
   - Use browser dev tools or curl: `curl http://localhost:3000/api/products`.

3. **Build for Production**:
   ```bash
   bun run build
   ```
   - Outputs static assets to `dist/` and worker to `worker/`.

4. **Hot Reload**: Changes to React components auto-reload. Worker changes require restart (`Ctrl+C` and `bun run dev`).

5. **Lint & Type Check**:
   ```bash
   bun run lint
   bunx tsc --noEmit
   ```

### Usage Examples

- **Browse Products**: Navigate to `/` – hero scrolls to grid; apply filters to refine results.
- **Add to Cart**: Click quick-add on cards or "Add to Cart" in modal; cart badge updates.
- **Checkout Flow**: Open cart drawer → Adjust quantities → Apply promo → Click checkout for mock confirmation toast.
- **API Integration**: Frontend fetches via `fetch('/api/products')`; handles loading with skeletons and errors with toasts.

Extend by adding routes in `src/pages/`, entities in `worker/entities.ts`, and API handlers in `worker/user-routes.ts`.

## Deployment

Deploy to Cloudflare Workers for global edge execution with zero-config scaling.

1. **Prerequisites**:
   - Wrangler CLI installed and authenticated.

2. **Deploy**:
   ```bash
   bun run deploy
   ```
   - Builds and deploys the worker + static assets.
   - Your app will be live at `<project-name>.<your-subdomain>.workers.dev`.

3. **Custom Domain** (Optional):
   ```bash
   bunx wrangler pages publish dist --project-name=verdure-plantshop
   ```
   - Or configure via dashboard for custom domains.

4. **Environment Variables/Bindings**: Handled automatically via `wrangler.jsonc`; no manual setup needed.

For one-click deployment:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/kristopher-lab/verdure-premium-plant-shop)

### Post-Deployment
- Monitor via Cloudflare Dashboard > Workers > Your Project.
- View logs: `bunx wrangler tail`.
- Update: Edit code → `bun run deploy`.

## Contributing

1. Fork the repo and create a feature branch.
2. Install dependencies with `bun install`.
3. Make changes and test locally.
4. Lint: `bun run lint`.
5. Commit with semantic messages.
6. Open a PR against `main`.

We welcome contributions for new features, bug fixes, or UI enhancements. Focus on visual polish and performance.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Support

- Issues: Open a GitHub issue.
- Discussions: Use GitHub Discussions for questions.
- Built with ❤️ by Cloudflare Workers community.