# Authoring

Markdown and MDX under `src/content/` are the canonical source. The schemas in `src/content.config.ts` validate frontmatter during `pnpm check` and `pnpm build`.

## AI-assisted drafting

Invoke `$personal-writing` when source material already exists in the current conversation or in supplied files. The skill extracts the author's questions, attempts, observations, decisions, and unresolved points before deciding whether the material fits a note, article, or project log.

New AI-assisted entries remain drafts unless publication is explicitly requested. Review the result for personal claims and missing context; the skill may clarify and organize the author's reasoning, but it must not invent it.

The writing profile lives with the skill at `skills/personal-writing/references/voice-profile.md`. Refine it from writing the author identifies as representative rather than from generic style preferences.

## Create an entry

```bash
pnpm new:note "Why this boundary matters"
pnpm new:article "A title with an argument"
pnpm new:project "Project name"
pnpm new:course "Course name"
```

Each command creates a conservative template and refuses to overwrite an existing file. Replace every `TODO` before publishing.

## Relationships

- Put `course: course-id` and `order: 1` on a note to include it in a course. The note stays in `notes`; do not copy it into the course directory.
- Put writing entry IDs in `related` to create explicit related-reading links.
- Set `draft: true` to exclude an entry from routes, feeds, search, tags, and indexes.
- Use `featured: true` sparingly for homepage selections.
- `demo: true` visibly identifies replaceable sample content. Real content should omit it.

## Assets

Give content-specific assets descriptive names and keep them beside the content they support. Import images from MDX and render them with `MediaFigure.astro` so dimensions, lazy loading, alt text, and captions remain consistent. Use `VideoFigure.astro` for local or hosted video; always provide a useful title and poster when available.

## Before publishing

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

Preview the result at mobile and desktop widths. Long code, equations, tables, image alt text, heading order, and internal links deserve explicit attention.

## Prepare an image

The image helper preserves the source file, caps width at 1800 pixels without enlargement, and writes WebP or AVIF:

```bash
pnpm media:image path/to/original.jpg path/to/article-image.webp
```

It refuses to overwrite an existing output unless `--force` is passed. Large source photos should normally remain outside the published repository.
