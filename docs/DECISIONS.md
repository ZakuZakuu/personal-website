# Architecture decisions

## Static output is the product boundary

Astro generates deployable HTML, CSS, and small progressive enhancements. There is no database, content API, account system, or server-side state. This keeps the canonical Markdown portable and makes Cloudflare Pages or any static host viable.

## Public entries share one reading module

Every public piece is an Entry: it has one canonical `/writing/` URL and one reading layout. Notes, articles, and projects remain separate source collections only where their authoring metadata differs. A project may expose its state or links, but it does not receive a second visual template.

## Series organize durable threads

Series are explicit, metadata-driven collections of Entries that grow around one continuing question, project, or course. They complement tags: a tag is a cross-cutting index; a series preserves a thread over time. Neither duplicates the Markdown source.

## Search is derived after the build

Pagefind indexes the finished HTML. Search therefore follows what readers can actually access, requires no backend, and adds JavaScript only on the search page.

## Design stays token-based and server-rendered

The restrained visual system uses CSS custom properties for color, type, spacing, and width. Components are Astro by default. The only global client behavior is the small theme preference control; it respects the system preference and persists an explicit choice.
