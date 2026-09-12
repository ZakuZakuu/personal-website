# 思构录

A static-first personal content hub for technical writing, learning notes, courses, and project case studies. The repository is intentionally content-first: Markdown and MDX are the source of truth, and the generated site requires no database or application server.

## Stack

- Astro 7 and TypeScript
- Tailwind CSS 4, plus a small token-based design system
- Astro Content Collections and MDX
- Shiki syntax highlighting, KaTeX math, RSS, sitemap, and Pagefind
- Playwright browser checks and Axe accessibility audits

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
pnpm test:e2e
pnpm preview
```

Set `SITE_URL` to the production origin while building so canonical URLs, RSS links, and the sitemap use the final domain:

```bash
SITE_URL=https://your-domain.example pnpm build
```

## Content

Content lives in six typed collections under `src/content/`:

- `notes` and `articles` share the Writing experience;
- `projects` render as case studies;
- `courses` organize existing notes through `course` and `order` metadata;
- `insights` hold small, normally private records;
- `now` provides the current `/now` snapshot.

Create a conservative starter file with:

```bash
pnpm new:note "A focused question"
pnpm new:article "A connected argument"
pnpm new:project "Project name"
pnpm new:course "Course name"
```

See [docs/AUTHORING.md](docs/AUTHORING.md) for relationships, assets, drafts, and the publishing checklist. AI-assisted drafting guidance lives in `.blog/STYLE.md` and one conversation-to-draft prompt; it deliberately separates Ryan's own reasoning from added background.

## Architecture

Shared collection queries and ordering rules live in `src/lib/content.ts`. Pages remain static Astro components, and Pagefind indexes the generated HTML after every production build. RSS and sitemap outputs are generated from the same published content.

The only site-wide browser script controls the persisted light/dark preference. Search JavaScript is loaded only on `/search`.

`pnpm test:e2e` builds the production site, starts its preview server, and checks representative pages in desktop and mobile Chromium. Install its browser once with `pnpm exec playwright install chromium`.

Small media helpers are also available:

```bash
pnpm media:image original.jpg article-image.webp
pnpm media:social-card
```

Important trade-offs are recorded in [docs/DECISIONS.md](docs/DECISIONS.md).

GitHub Actions repeats the type/content checks, formatting check, unit tests, production build, desktop/mobile browser tests, and Axe accessibility audit on pushes and pull requests.

## Replace before deployment

Demo entries carry `demo: true` and display a visible label. They validate the layouts without claiming personal history. Before the first real deployment:

1. replace or draft the demo content;
2. add only the public profile and contact links Ryan wants to expose;
3. set `SITE_URL` to the final canonical origin;
4. replace the default social preview if desired.
