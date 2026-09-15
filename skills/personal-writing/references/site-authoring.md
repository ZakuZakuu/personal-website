# Site authoring

Use this reference only when the requested output belongs in the personal-site repository.

1. Read `AGENTS.md`, `src/content.config.ts`, and `docs/AUTHORING.md` before choosing a collection or metadata.
2. Keep the public information architecture unified even though source collections retain editorial meaning.
3. Prefer an English URL slug that remains stable if the displayed Chinese title changes. Ask for a slug only when no concise, unambiguous one can be inferred.
4. Use the minimum metadata supported by the target collection. For the default review-PR delivery, use `draft: false` (or omit it when the schema defaults to public). Use `draft: true` only when the author explicitly requests a local/private draft. Omit `demo` for real content.
5. When supplied images, screenshots, or diagrams materially support the entry, use MDX and keep them beside the entry in a descriptive content directory. Import each local asset and render it with `MediaFigure` from `src/components/MediaFigure.astro`; write accurate `alt` text and add a `caption` when it helps explain the evidence. Prefer WebP or AVIF for published raster images. Do not add decorative images or invent a visual when none was supplied. Convert Obsidian embeds into valid site assets or leave clearly reported unresolved markers when the files were not supplied.
6. Write inline mathematics with `$...$` and display mathematics with `$$...$$` so `remark-math` and KaTeX render it. Do not use `\(...\)` or `\[...\]` delimiters in Markdown or MDX content.
7. Do not duplicate a note inside a course. Course membership remains metadata-driven.
8. Before declaring the entry ready, run `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build`. Use browser tests when markup, shared components, or layouts changed.
9. Default delivery is a review PR:
   - Create a dedicated branch named `content/<stable-slug>` from the current production branch. Do not reuse or overwrite an existing branch without checking it first.
   - Stage only the generated entry and directly related source assets. Do not include unrelated working-tree changes.
   - Commit, push the branch, and open a non-draft pull request targeting the production branch. Use a concise title such as `content: <entry title>`.
   - Never merge the pull request, change branch protection, or push generated content directly to the production branch. Merging is the author's explicit decision to publish; the hosting deployment then follows the repository configuration.
   - If GitHub authentication or pull-request access is unavailable, do not pretend a PR was opened. Leave the generated file in place and report the exact limitation.
10. When the author explicitly asks for a local draft, no PR, or no publish, use `draft: true` and do not commit or push it. Report the file path and draft state.
