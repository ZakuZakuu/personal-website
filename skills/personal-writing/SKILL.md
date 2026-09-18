---
name: personal-writing
description: Turn conversations, notes, research, or development logs into personal site content while preserving the author's reasoning and voice. Use only when explicitly invoked to draft, revise, or publish site content.
---

# Personal Writing

Produce a useful draft from the author's actual source material. The output should read like a clearer version of something the author could have written, not a performance of literary style.

Before writing, read:

- [voice-profile.md](references/voice-profile.md) for the author's current writing tendencies.
- [site-authoring.md](references/site-authoring.md) when creating or publishing a repository entry.
- [style-audit.md](references/style-audit.md) for corpus calibration and the final AI-tell audit.

## Workflow

### 1. Establish the evidence boundary

Gather the current conversation and any files or links the user supplied. Treat them as evidence, not merely as a topic prompt. Separate three kinds of material before drafting:

- **Author evidence**: the user's own words, observations, decisions, and stated reactions.
- **Technical evidence**: documentation, code, logs, test output, and links that can support factual claims.
- **Editorial hypothesis**: a possible transition, emphasis, or explanation inferred by the agent.

Author evidence and technical evidence may become prose. Editorial hypotheses must either be verified with the user or remain out of the article.

### 2. Calibrate the voice at the right confidence

Always read `voice-profile.md`. If the user supplies representative writing, follow [style-audit.md](references/style-audit.md) to choose a small comparison set before drafting. Do not claim a stable Writing DNA from a handful of excerpts. Use the following confidence labels internally:

- **Direct**: wording or a habit appears in the current source material.
- **Supported**: the habit recurs in several representative samples.
- **Provisional**: a pattern is plausible but the corpus is too small or mixed to trust.

When direct source material conflicts with the profile, the current material wins. When a technical explanation conflicts with the author's own uncertainty, preserve the uncertainty and identify the explanation as background.

### 3. Extract the thinking path

Write down the concrete sequence: starting point, work attempted, observations, problems, explanations, decisions, result, and open questions. Keep the sequence that actually happened, including detours and partial fixes. Mark claims that require verification and personal conclusions that only the user can supply.

### 4. Choose the smallest useful shape

Choose the smallest useful source collection for metadata and authoring, but treat the public result as one **Entry** rather than a visible content type. Check whether the material continues an existing series; add its stable series ID only when it genuinely belongs to that thread. Use headings only when they help a reader find a real change in the reasoning.

### 5. Draft from evidence, not from a template

Lead with the concrete question, event, result, or contradiction. Preserve uncertainty, comparisons, failed attempts, and causal explanations when present. Keep technical identifiers exact. Let the material decide whether the piece needs a short note, a longer explanation, a timeline, or a case study; do not add a symmetrical introduction, a three-part structure, or a grand conclusion just because they are available.

### 6. Run the voice and AI-tell passes

Apply the voice profile, then perform the controlled audit in `style-audit.md`. The audit is a shortlist of candidates, not a rewrite license: confirm each candidate against the source and the author's recurring habits, change only the smallest necessary span, and preserve any candidate that may be a genuine author choice. Do not add personal emotion, concrete details, examples, or certainty to make prose feel more human.

### 7. Author and deliver

When writing into the site, create one Markdown or MDX file with the minimum useful metadata. Follow `site-authoring.md` for delivery: the default is a publication-ready pull request for the author's review; a local draft is only for an explicit request such as “只生成草稿” or “不要发 PR”. Preserve source links and colocate referenced assets when available.

### 8. Validate and report

Validate every modified entry using the repository's configured checks. Report the output path, editorial choices that materially changed the source, unresolved markers, confidence gaps in the voice calibration, and the pull-request URL or local-draft state.

## Editorial contract

- Lead with the concrete question, event, result, or contradiction. Earn background explanation after the reader knows why it matters.
- Preserve the author's reasoning path; do not replace it with a generic tutorial structure.
- Prefer plain first-person Chinese and concrete verbs. Let the material determine length.
- Distinguish sourced technical background from the author's own observation or interpretation.
- Retain useful rough edges in thought, but correct spelling, broken syntax, and accidental repetition.
- Use headings only when they help scanning. A short note may need none.
- Use lists for real sets, procedures, comparisons, or unresolved issues—not to manufacture structure.
- Keep links close to the claim or resource they support. Never fabricate a source.
- Never merge a pull request or push generated content directly to the production branch. The author decides publication by merging the review PR.
- Do not delete source material unless the user explicitly requests it.

## Completion

A delivery is complete when every substantive claim traces to supplied material or an identified source, the author's reasoning transitions remain visible, metadata validates, no placeholder is hidden from the user, the requested repository checks pass, and either the review PR is open or the requested local draft is clearly reported.
