# Style calibration and AI-tell audit

This is a calibration aid for `$personal-writing`, not a second writing template. Its job is to make style judgments traceable to the author's material and to stop a cleanup pass from sanding away the author's actual voice.

## Corpus calibration

Use the author's own writing first: development logs, notes, messages, or published entries that the author identifies as representative. Keep raw personal material outside the public repository unless the author explicitly chooses to publish it. Label samples that were substantially rewritten by an AI; do not treat those as clean voice evidence.

Choose the smallest comparison set that covers the current piece's subject and form. Read the complete samples, not isolated sentences.

| Available representative samples          | What may be claimed                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1–4                                       | Direct observations only. Reuse concrete habits visible in the current material; do not infer a general style. |
| 5–19                                      | Provisional patterns. Record recurring tendencies as hypotheses and keep exceptions visible.                   |
| 20+ complete pieces across time or topics | A reusable style profile may be drafted. Check it against several held-out pieces before calling it stable.    |

A large corpus does not make AI-written source material authoritative. When samples disagree, preserve the disagreement or ask which period and context the author wants to represent.

## What to extract

Prefer observations that can change a draft:

- sentence and paragraph rhythm, including where a short sentence lands;
- how the author moves from an observation to a mechanism or judgment;
- recurring kinds of uncertainty, comparison, qualification, and self-correction;
- preferred evidence: commands, logs, screenshots, numbers, links, or small experiments;
- endings: a result, a next step, an unresolved question, or a quiet stop.

Count words or punctuation only to support a visible pattern. A frequency table is not a voice by itself. Do not turn every recurring word into a required mannerism.

## Controlled AI-tell audit

Run this after the evidence-based draft. For each candidate, ask: “Is this supported by the source, and is it unlike the author's representative writing?” If either answer is unclear, preserve the text and flag it for review.

Check candidates in this order:

1. **Generic opening** — replace an abstract promise or scene-setting paragraph with the actual question, event, or result only when the source contains one.
2. **Manufactured symmetry** — loosen a neat three-part progression or repeated sentence shell when it was not present in the reasoning. Keep symmetry that describes a real procedure or comparison.
3. **Stock transitions** — remove empty signposts such as a bare “首先/其次/最后/总之/值得注意的是” when the surrounding sentences already carry the relationship. Keep a signpost that prevents a real ambiguity.
4. **Contrast formula** — review repeated “不是 A，而是 B” and similar reversals. Keep it when the author actually changed their mind or the contrast is the point; otherwise state the supported judgment directly.
5. **Decorative explanation** — cut a metaphor, slogan, or elevated conclusion that adds no mechanism or author observation. Keep concrete analogies that make the mechanism easier to follow.
6. **Unsupported smoothness** — restore qualifiers, failed attempts, rough edges, and open questions that appeared in the source but disappeared during summarization.
7. **Abstract summary over concrete evidence** — prefer the supplied command, number, log, or observed behavior when a vague summary is covering it.

This audit changes structure only when the user explicitly asks for restructuring. It never invents a detail, upgrades “可能” to certainty, adds a personal feeling, or deletes a limitation to make the prose more confident.

## Acceptance check

Before delivery, verify:

- every personal claim traces to the conversation or a supplied file;
- every technical claim has a source or is clearly marked as background explanation;
- the article still contains the author's actual question, attempt, observation, and decision where those exist;
- the audit did not erase a genuine habit merely because a generic checklist disliked it;
- the result is readable without becoming uniformly polished or artificially colloquial.

If the last two checks cannot be answered confidently, report the uncertainty in the PR instead of performing another blind rewrite.
