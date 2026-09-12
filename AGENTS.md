# AGENTS.md

## Project

This repository contains Ryan's personal website and content system.

Before making significant architectural or product changes, read:

```text
PROJECT_BRIEF.md
```

The website is not merely a blog. It is a long-term personal content hub for:

- technical writing
- learning notes
- courses
- projects
- experiments
- insights
- personal profile
- selected personal content

---

# Core Principles

1. **Content first.**
2. Prefer simple static architecture.
3. Markdown/MDX is the source of truth.
4. Optimize for long-term maintainability.
5. Preserve a clean, restrained visual language.
6. Avoid unnecessary client-side JavaScript.
7. Avoid overengineering.
8. Design around real content rather than hypothetical features.

---

# Preferred Stack

Use unless there is a strong reason not to:

```text
Astro
TypeScript
Tailwind CSS
Markdown / MDX
Astro Content Collections
KaTeX
Shiki or Astro-supported syntax highlighting
GitHub
Cloudflare
```

Do not introduce alternative frameworks without explaining why.

---

# Architecture Constraints

Do not introduce the following unless explicitly required:

```text
database
authentication
CMS
backend API
server-side state
user accounts
heavy client state management
```

Static generation should remain the default.

Avoid turning the project into a full-stack application without a concrete requirement.

---

# Content Types

Primary content types:

```text
Insight
Note
Article
Project
Course
```

Additional page:

```text
Now
```

Keep content relationships metadata-driven.

Do not duplicate the same Note inside a Course.

---

# Insight

Insights are lightweight records of ideas or observations.

They may remain internal and do not necessarily require standalone public pages.

Typical examples:

- realization
- analogy
- experiment observation
- unresolved question
- architecture idea
- learning breakthrough

---

# Note

Notes have a low publishing threshold.

A Note should focus on one idea or question.

Possible structure:

```text
Context
Question
Explanation
My Understanding
Open Questions
```

Do not force every Note into a rigid template.

---

# Article

Articles are more complete pieces of writing.

Possible structure:

```text
Motivation
Background
Core Idea
Analysis
Examples / Experiments
My Takeaways
References
```

Articles should contain a meaningful personal angle rather than becoming generic tutorials.

---

# Project

Project pages are case studies.

Prefer:

```text
Overview
Motivation
Demo
Architecture
Implementation
Technical Decisions
Failures
Lessons
Status
Next Steps
Links
```

Do not simply mirror GitHub README content.

---

# Courses

Courses organize existing Notes.

Example:

```text
CS336
Algorithms
Database Systems
```

Course ordering should be represented through metadata.

---

# Writing Style

When generating or editing content:

- preserve Ryan's actual reasoning
- preserve useful uncertainty
- document changes in understanding
- prefer first-person language where appropriate
- keep technical claims precise
- write naturally
- avoid artificial academic tone
- avoid generic AI-generated introductions
- avoid exaggerated conclusions

Do not invent personal insights Ryan did not express.

Background knowledge may be added, but distinguish it from Ryan's own reasoning when relevant.

Prefer writing that captures:

```text
initial mental model
        ↓
question / contradiction
        ↓
new understanding
```

over generic textbook explanations.

---

# AI Writing Workflow

The intended content workflow is conversational.

Ryan may ask AI to turn previous discussions into:

```text
Insight
Note
Article
Project Log
Course Note
```

When doing so, inspect the conversation for:

1. original questions
2. initial assumptions
3. misunderstandings
4. turning points
5. analogies
6. Ryan's own insights
7. current understanding
8. unresolved questions

Do not merely summarize the final answer.

---

# Content Metadata

Prefer typed metadata validated through Astro Content Collections.

Common metadata may include:

```text
title
description
date
updated
status
tags
course
order
featured
draft
```

Project metadata may include:

```text
status
tech
github
demo
featured
```

Do not add metadata fields without an actual use case.

---

# File Organization

Prefer colocating content-specific assets with their content.

Good:

```text
notes/
└── tokenization/
    ├── index.md
    ├── diagram.svg
    └── example.webp
```

Avoid:

```text
public/images/image1.png
public/images/final2.png
public/images/screenshot-new.png
```

Use descriptive filenames.

---

# Images

For published raster images, prefer:

```text
AVIF
WebP
```

Use SVG for appropriate diagrams and vector graphics.

Do not commit unnecessarily large original photos.

Media-processing scripts should preserve originals unless explicitly requested otherwise.

---

# Video

Do not place large video collections in Git.

Long-term media storage should use Cloudflare R2 or another suitable object store.

Pages should preferably use:

```text
video
poster image
preview image
lazy loading
```

Do not autoplay large videos by default.

---

# UI and Design

Prioritize:

```text
typography
spacing
readability
hierarchy
navigation
responsive layout
```

Avoid unnecessary:

```text
WebGL
particle effects
mouse trails
heavy transitions
decorative 3D
large animation libraries
```

Interactive behavior must justify its cost.

---

# Client JavaScript

Astro islands should be used intentionally.

Default assumption:

```text
static HTML first
```

Before adding client-side JavaScript, ask whether the feature can work without hydration.

---

# Accessibility

Maintain:

- semantic HTML
- keyboard navigation
- visible focus states
- sensible heading hierarchy
- alt text support
- readable contrast
- reduced-motion compatibility where relevant

---

# Performance

Avoid unnecessary dependencies.

Pay attention to:

- image sizes
- fonts
- JavaScript payload
- hydration
- layout shift

Do not optimize prematurely, but do not knowingly introduce obviously expensive patterns.

---

# SEO

Pages should support:

```text
title
description
canonical URL
OpenGraph metadata
sitemap
RSS
```

Do not produce SEO spam or keyword-stuffed writing.

---

# Dependency Policy

Before adding a dependency:

1. verify it solves a concrete problem
2. check whether Astro/platform functionality already solves it
3. prefer mature lightweight libraries
4. avoid packages for trivial functionality

Do not introduce large UI frameworks solely for individual components.

---

# Implementation Workflow

Before implementing a non-trivial feature:

1. inspect existing architecture
2. identify the smallest coherent change
3. preserve existing conventions
4. implement
5. test
6. run validation
7. summarize important decisions

Avoid broad unrelated refactors.

---

# Validation

After meaningful code changes, run the relevant checks.

At minimum when available:

```bash
pnpm check
pnpm build
```

Also run:

```text
tests
lint
format checks
```

when configured.

Do not report a task as complete if the build is failing unless the failure is explicitly documented.

---

# Git

Keep commits logically scoped when commits are requested.

Do not commit:

- secrets
- environment credentials
- unnecessary binary files
- local editor state
- build artifacts unless explicitly required

Never expose Cloudflare or other service credentials.

---

# Environment

Primary local development environment:

```text
WSL / Linux
```

The repository should preferably live inside the Linux filesystem, for example:

```text
~/Projects/personal-site
```

rather than under:

```text
/mnt/c/...
```

Ensure commands work in a Linux environment.

## Local Proxy

This WSL environment uses `clashctl` with a local proxy at `127.0.0.1:7890`.
If a sandboxed command reports a proxy connection error, retry it with approved
network access. Treat GitHub authentication as invalid only after `gh api user`
also fails with normal network access.

---

# Social Pipeline

The website is the canonical content source.

Social content is derived from published or draft content.

Initial target:

```text
Xiaohongshu
```

Potential future command:

```bash
pnpm social <slug>
```

Potential output:

```text
dist/social/<slug>/
├── 01-cover.png
├── 02.png
├── 03.png
├── ...
├── caption.md
└── metadata.json
```

Do not implement automatic posting unless explicitly requested.

Human review remains part of the publishing workflow.

---

# Roadmap Awareness

Unless instructed otherwise, prioritize work roughly in this order:

```text
V0.1 Website Foundation
        ↓
V0.2 Content System
        ↓
V0.3 Media Pipeline
        ↓
V0.4 Social Pipeline
```

Do not build V0.4 infrastructure while fundamental V0.1 functionality is incomplete unless specifically requested.

---

# Decision Rule

When uncertain between two implementations, prefer the one that is:

```text
simpler
more static
more portable
more readable
easier to delete
easier to maintain
```

The project should be able to evolve gradually without accumulating unnecessary infrastructure.
