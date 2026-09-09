# Architecture decisions

## Static output is the product boundary

Astro generates deployable HTML, CSS, and small progressive enhancements. There is no database, content API, account system, or server-side state. This keeps the canonical Markdown portable and makes Cloudflare Pages or any static host viable.

## Collections represent editorial meaning

Notes, articles, projects, courses, internal insights, and Now snapshots have separate typed collections because readers and authors use them differently. Shared query logic lives in `src/lib/content.ts`. Course membership and related writing are metadata relationships, not duplicated files.

## Search is derived after the build

Pagefind indexes the finished HTML. Search therefore follows what readers can actually access, requires no backend, and adds JavaScript only on the search page.

## Design stays token-based and server-rendered

The restrained visual system uses CSS custom properties for color, type, spacing, and width. Components are Astro by default. The only global client behavior is the small theme preference control; it respects the system preference and persists an explicit choice.
