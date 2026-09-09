---
title: Tokenization Is a Design Choice, Not a Law
description: A demo note that starts with a basic preprocessing assumption and exposes the system boundary hidden inside it.
date: 2026-08-28
tags: [nlp, tokenization, mental-models]
featured: true
demo: true
course: language-model-foundations
order: 1
related: [durable-technical-notes]
---

This is demonstration content, not a record of Ryan’s personal conclusion.

## Question

Why do language models need tokenization at all? It is tempting to treat the tokenizer as neutral preprocessing, but it decides which chunks the model can see directly.

## Explanation

Text must become a finite sequence of model inputs. A subword tokenizer is one way to choose that sequence. Bytes, characters, or learned continuous representations move the boundary elsewhere; they do not remove the underlying representation decision.

For the text `unbelievable`, one vocabulary might produce:

```text
["un", "believ", "able"]
```

Another might produce bytes. The model receives a different sequence length and a different set of reusable units in each case.

## Current understanding

The useful mental shift is from “tokenization cleans text” to “tokenization allocates representational primitives.” That framing makes tokenizer-free research easier to evaluate: the question becomes which component learns the segmentation and what cost moves with it.

## Open question

How should we compare tokenizers when compression efficiency, multilingual fairness, and downstream accuracy disagree?
