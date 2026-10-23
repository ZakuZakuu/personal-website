# Study notes: read-through and lookup

Use this reference when the entry is a learning note the author will come back to: course lectures, papers, or technical topics with formulas, numbers, or definitions worth looking up later. The note has to work two ways: read top to bottom as a review of the material, and scanned in a few seconds to find one formula.

The reference model is `src/content/notes/cs336-resource-accounting.md`.

## Structure

1. **Short opening.** One or two paragraphs with the author's actual question or motivation, as in any entry. Then one sentence pointing to the quick reference and saying how the body is ordered.
2. **`## 速查` section first.** Only conclusions, no derivations. Typical subsections:
   - `### 公式卡`: a three-column table — what to compute | formula | caveat. The first cell links to the body section that derives it.
   - Worked examples for any question the source poses (for example, napkin-math questions), with the full arithmetic, not just the answer.
   - Reference numbers (hardware specs, sizes, magnitudes) with their source stated.
   - Comparison tables when the source contrasts several options on the same attributes (for example, tokenizer types or post-training methods).

   Skip any subsection the material does not support. A note with nothing worth looking up does not need a quick reference.

3. **Body sections in the source's order.** Each `##` section opens with a one- or two-sentence bold conclusion, then the derivation, examples, and the author's reasoning in their own words.
4. **`#### 易混点` blocks.** Put the author's past confusions, misreadings, and easily-mixed distinctions in an `h4` block at the end of the relevant section, keeping the author's first-person wording. They stay in the note; they just no longer interrupt the main explanation. `h4` stays out of the table of contents.
5. **Closing and References** as usual. Do not add a summary that repeats the quick reference.

## Headings

The table of contents shows `h2` (numbered) and `h3`. Keep it scannable:

- Name the concept, not the takeaway: `训练显存`, `算术强度`, `反向传播与 6ND`. The takeaway belongs in the section's bold opening sentence.
- Aim for at most about 10 Chinese characters or 3–4 English words, so a heading fits on one line of the table of contents.
- Avoid the `主题：解释` pattern, rhetorical questions, and narrative sentences as headings.
- Use `h3` only for subsections a reader would look for directly. Two to four per `h2` is typical.
- Keep math out of headings. Write `每隔 √L 层存一次`, not `$\sqrt L$`.

## Quick-reference links

Heading IDs come from `rehype-slug` (github-slugger): lowercase, spaces become `-`, and punctuation or symbols such as `：`, `/`, `、`, `×`, `√` are dropped. `FLOP/s 与 MFU` becomes `flops-与-mfu`. Links use the raw ID: `[训练显存](#训练显存)`.

When an entry has quick-reference links, add or extend a browser test that asserts every in-page `#` link resolves to an element. See the resource-accounting test in `tests/e2e/site.spec.ts`.

## Accuracy

- Check every number and formula in the quick reference against the primary source (lecture code, slides, or paper). Prefer the source's exact figures and say where they come from.
- Numbers or examples the author did not write go in as course or source content (“课件里…”, “课程源码…”), never as the author's own discovery.
- Display math uses `$$` on its own lines. A single `$` around a standalone formula renders as inline math.

## Relation to the editorial contract

This structure is an explicit exception to “do not add a symmetrical structure”: the author asked for it so learning notes double as lookup sheets. Apply it to study notes only, not to project logs or argumentative articles. The voice, evidence, and AI-tell rules still apply inside every section.
