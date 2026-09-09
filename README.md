# Ryan's personal site

A static-first personal content hub for technical writing, learning notes, courses, and project case studies. The repository is intentionally content-first: Markdown and MDX are the source of truth, and the generated site requires no database or application server.

## Stack

- Astro 7 and TypeScript
- Tailwind CSS 4, plus a small token-based design system
- Astro Content Collections and MDX
- Shiki syntax highlighting, KaTeX math, RSS, sitemap, and Pagefind

## Local development

```bash
pnpm install
pnpm dev
```

The development server runs at `http://localhost:4321` by default.

## Validation and production

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm preview
```

Set `SITE_URL` to the production origin while building so canonical URLs, RSS links, and the sitemap use the final domain:

```bash
SITE_URL=https://your-domain.example pnpm build
```

## Content

Content authoring instructions and collection details will live alongside the completed content system. Personal details in this first build are deliberately conservative: replace clearly marked placeholder copy rather than treating demo content as biographical fact.
