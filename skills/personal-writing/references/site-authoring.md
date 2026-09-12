# Site authoring

Use this reference only when the requested output belongs in the personal-site repository.

1. Read `AGENTS.md`, `src/content.config.ts`, and `docs/AUTHORING.md` before choosing a collection or metadata.
2. Keep the public information architecture unified even though source collections retain editorial meaning.
3. Prefer an English URL slug that remains stable if the displayed Chinese title changes. Ask for a slug only when no concise, unambiguous one can be inferred.
4. Use the minimum metadata supported by the target collection. Add `draft: true` for a new draft; omit `demo` for real content.
5. Keep images beside the entry in a descriptive content directory when assets exist. Convert Obsidian embeds into valid site assets or leave clearly reported unresolved markers when the files were not supplied.
6. Do not duplicate a note inside a course. Course membership remains metadata-driven.
7. Before declaring the entry ready, run `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm build`. Use browser tests when markup, shared components, or layouts changed.
8. Publishing requires an explicit request: set the intended draft state, revalidate, then commit or push only if requested.
