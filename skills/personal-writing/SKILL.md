---
name: personal-writing
description: Turn conversations, notes, research, or development logs into personal Markdown drafts while preserving the author's reasoning and voice. Use only when explicitly invoked to draft, revise, or publish site content.
---

# Personal Writing

Produce a useful draft from the author's actual source material. The output should read like a clearer version of something the author could have written, not a performance of literary style.

Before writing, read:

- [voice-profile.md](references/voice-profile.md) for the author's current writing tendencies.
- [site-authoring.md](references/site-authoring.md) when creating or publishing a repository entry.

## Workflow

1. Gather the current conversation and any files or links the user supplied. Treat them as evidence, not merely as a topic prompt.
2. Extract the concrete sequence: starting point, work attempted, observations, problems, explanations, decisions, result, and open questions. Mark claims that require verification and personal conclusions that only the user can supply.
3. Choose the smallest fitting form:
   - **Note** for one question, mechanism, observation, or compact learning record.
   - **Article** for an argument or explanation assembled from multiple connected ideas.
   - **Project log** for work performed, failures, decisions, results, and next steps.
     Follow the substance rather than stretching material to fit a form.
4. Draft around the extracted sequence. Preserve uncertainty, comparisons, failed attempts, and causal explanations when present. Keep technical identifiers exact.
5. Run the voice pass from `voice-profile.md`. Remove claims, motivations, confidence, anecdotes, and conclusions not supported by the source. When essential material is missing, leave a concise marker or ask one focused question instead of inventing it.
6. When writing into the site, create one Markdown or MDX file with the minimum useful metadata. New work is a draft unless the user explicitly asks to publish it. Preserve source links and colocate referenced assets when available.
7. Validate every modified entry using the repository's configured checks. Report the output path, editorial choices that materially changed the source, unresolved markers, and publication state.

## Editorial contract

- Lead with the concrete question, event, result, or contradiction. Earn background explanation after the reader knows why it matters.
- Preserve the author's reasoning path; do not replace it with a generic tutorial structure.
- Prefer plain first-person Chinese and concrete verbs. Let the material determine length.
- Distinguish sourced technical background from the author's own observation or interpretation.
- Retain useful rough edges in thought, but correct spelling, broken syntax, and accidental repetition.
- Use headings only when they help scanning. A short note may need none.
- Use lists for real sets, procedures, comparisons, or unresolved issues—not to manufacture structure.
- Keep links close to the claim or resource they support. Never fabricate a source.
- Do not commit, push, publish, or delete source material unless the user explicitly requests that action.

## Completion

A draft is complete when every substantive claim traces to supplied material or an identified source, the author's reasoning transitions remain visible, metadata validates, no placeholder is hidden from the user, and the requested repository checks pass.
