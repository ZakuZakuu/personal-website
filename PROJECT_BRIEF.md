# Personal Site — Project Brief

## 1. Project Vision

This project is a long-term personal website for Ryan.

It is not intended to be just a traditional blog or a one-off portfolio. The site should function as a **personal content hub**, combining:

- technical writing
- learning notes
- course notes
- project case studies
- experiments and engineering logs
- personal insights
- resume and personal profile
- selected non-technical content
- long-term records of learning and building

The website should become the canonical public home for Ryan's work on the internet.

Social platforms such as Xiaohongshu are treated as **distribution channels**, not the primary source of content.

The general content flow is:

```text
Learning / Building / Thinking
            ↓
     ChatGPT Conversation
            ↓
 Insights / Notes / Project Logs
            ↓
       Articles / Projects
            ↓
          Website
            ↓
    Social Distribution
```

The site should grow naturally over several years rather than being designed only around current content.

---

# 2. Core Philosophy

## 2.1 Writing First

Content is the main product.

The website should emphasize:

- typography
- readability
- information hierarchy
- navigation
- searchability
- long-term archival

Avoid building a visually impressive portfolio at the expense of readable content.

Do not use unnecessary:

- WebGL effects
- particle systems
- mouse trails
- excessive gradients
- heavy page transitions
- autoplay animations
- decorative 3D elements

The desired visual character is:

> clean, technical, quiet, personal, modern, content-first

The inspiration is closer to a modern long-running personal knowledge site than a conventional frontend developer portfolio.

---

# 3. Target Users

The website has several audiences.

### Primary

Ryan himself.

The site should help preserve:

- things learned
- ideas developed
- projects built
- mistakes encountered
- technical decisions
- long-term intellectual development

### Secondary

Potential:

- recruiters
- interviewers
- engineers
- researchers
- classmates
- collaborators
- people discovering content through search or social platforms

Someone opening the homepage should understand within approximately 10 seconds:

- who Ryan is
- what he works on
- what he is learning
- what he has built
- where to find his writing and projects

---

# 4. Information Architecture

Initial top-level navigation:

```text
Home
Writing
Projects
Courses
About
```

Secondary pages may include:

```text
Now
Archive
Tags
Search
Resume
```

Do not create too many categories during the early stage.

The structure should remain simple until actual content volume justifies additional organization.

---

# 5. Homepage

The homepage is a personal homepage rather than a chronological blog index.

Suggested structure:

```text
Intro / Hero

Featured Writing

Featured Projects

Recent Notes

Current Learning / Now

Footer
```

The intro should communicate identity and interests concisely.

Example conceptual structure:

```text
Hi, I'm Ryan.

I learn, build and write about
AI, machine learning, systems and robotics.

[About] [Resume] [GitHub]
```

Exact wording may evolve later.

---

# 6. Content Model

The site should distinguish between several content types.

## 6.1 Insight

The smallest unit of thought.

An Insight may contain:

- a realization
- an analogy
- a question
- a design idea
- an observation during an experiment
- a change in mental model

Insights do not necessarily need to be publicly displayed as first-class pages.

They may serve as raw material for Notes and Articles.

Conceptual progression:

```text
Conversation
    ↓
 Insight
    ↓
  Note
    ↓
 Article
```

Multiple Insights may contribute to one Note.

Multiple Notes may later evolve into an Article.

---

# 6.2 Note

A lightweight record of understanding.

Typical length:

```text
200–1500 words
```

Examples:

- Big O, Big Omega and Big Theta
- Atomic vs Simple Attributes
- What does a tokenizer actually do?
- Why LayerNorm is used in Transformers

Notes should have a low publishing threshold.

A Note does not need to be a complete tutorial.

Its purpose is often:

> record what I now understand about a specific problem.

Possible structure:

```text
Context
Question
Explanation
My Understanding
Open Questions
```

Not every Note needs every section.

---

# 6.3 Article

A more complete piece of writing.

Typical content:

- deeper technical explanation
- synthesis of several Notes
- project retrospective
- technical analysis
- experiment report
- architecture discussion
- long-form opinion grounded in experience

Possible structure:

```text
Motivation
Background
Core Idea
Analysis
Experiments / Examples
My Takeaways
References
```

Articles should not become generic AI-generated tutorials.

They should contain a clear reason why Ryan chose to write them.

---

# 6.4 Project

Projects should be presented as case studies rather than copied GitHub README files.

Recommended structure:

```text
Overview

Motivation

Demo

Architecture

Implementation

Technical Decisions

Things That Failed

What I Learned

Current Status

Next Steps

Links
```

A project page may contain:

- screenshots
- architecture diagrams
- videos
- interactive demos
- GitHub links
- related articles
- project logs

Projects may have states such as:

```text
building
completed
paused
archived
```

---

# 6.5 Course

Courses organize learning content into coherent sequences.

Examples:

```text
CS336
Algorithms
Database Systems
Machine Learning
Deep Learning
Reinforcement Learning
```

A course page should provide:

- course description
- learning status
- ordered notes
- optional external course link
- optional progress information

Example:

```text
Courses
└── CS336
    ├── Overview
    ├── Tokenization
    ├── Architecture
    ├── Training
    └── ...
```

Course Notes remain normal Notes internally and are linked through metadata rather than duplicated.

---

# 6.6 Now

The `/now` page provides a snapshot of what Ryan is currently doing.

Possible sections:

```text
Currently Learning
Currently Building
Currently Reading
Currently Exploring
```

This page should be updated occasionally rather than continuously.

Historic versions may optionally be preserved later.

---

# 7. AI-First Writing Workflow

The primary writing interface does not have to be a Markdown editor.

Ryan frequently learns through conversation with ChatGPT.

Therefore the intended workflow is:

```text
Learn / Build
     ↓
Talk with ChatGPT
     ↓
Develop understanding
     ↓
Identify insights
     ↓
Generate first draft
     ↓
Ryan edits / directs revisions
     ↓
Markdown / MDX
     ↓
Publish
```

Ryan should not normally need to start from a blank document.

The AI should help transform conversation into structured writing.

---

# 8. Writing Principles

AI-generated drafts must preserve Ryan's actual thinking.

The system should attempt to identify:

1. the original question
2. Ryan's initial mental model
3. misconceptions or uncertainty
4. important turning points
5. analogies proposed by Ryan
6. insights developed during the conversation
7. the final understanding
8. remaining questions

The writing should preserve intellectual progression when useful.

For example, prefer:

> I used to think tokenizer was simply a necessary preprocessing step. After seeing tokenizer-free architectures, I realized I had never seriously asked why tokenization was necessary in the first place.

over:

> Tokenization is an important preprocessing technique used in natural language processing.

The first conveys personal intellectual development.

The second is generic documentation.

---

# 9. Writing Voice

Default style:

- first person where appropriate
- natural
- technically precise
- concise when possible
- curious rather than authoritative
- willing to document uncertainty
- willing to document mistakes
- no unnecessary academic tone
- no exaggerated claims

Avoid common AI-writing patterns such as:

- excessive rhetorical headings
- repetitive summaries
- "First, second, finally" everywhere
- artificial inspirational conclusions
- generic introductions
- excessive bullet lists when prose is clearer
- pretending Ryan had insights he did not actually express

Background knowledge may be added when needed, but it should not be falsely presented as Ryan's own discovery.

---

# 10. Source of Truth

Markdown / MDX files in the repository are the canonical content source.

Do not introduce:

- WordPress
- database-backed CMS
- authentication
- admin dashboards

unless a future requirement clearly justifies them.

Git provides:

- version history
- revision tracking
- publishing history

---

# 11. Technical Stack

Initial preferred stack:

```text
Astro
TypeScript
Tailwind CSS
Markdown / MDX
Astro Content Collections
KaTeX
syntax highlighting
Git
GitHub
Cloudflare
```

Potential supporting tools:

```text
Shiki
Pagefind or equivalent static search
RSS
Sitemap
OpenGraph image generation
```

The exact dependency choice may change when implementation begins.

Prefer established, lightweight solutions.

---

# 12. Repository Structure

Conceptual structure:

```text
personal-site/
│
├── AGENTS.md
├── PROJECT_BRIEF.md
│
├── docs/
│
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │
│   └── content/
│       ├── articles/
│       ├── notes/
│       ├── insights/
│       ├── projects/
│       └── courses/
│
├── scripts/
│   ├── media/
│   └── social/
│
├── public/
│
└── .blog/
    ├── STYLE.md
    ├── schemas/
    └── prompts/
```

The final structure may adapt to Astro conventions.

---

# 13. Content Colocation

Assets belonging primarily to one piece of content should generally live close to that content.

Example:

```text
notes/
└── tokenization/
    ├── index.md
    ├── tokenizer-diagram.webp
    └── byte-example.webp
```

Example project:

```text
projects/
└── companion-robot/
    ├── index.mdx
    ├── architecture.svg
    ├── robot-front.webp
    ├── demo-poster.webp
    └── assets/
```

Avoid global asset directories containing files such as:

```text
image1.png
screenshot2.png
final-final.png
```

---

# 14. Image Management

Preferred image formats:

```text
AVIF
WebP
SVG
```

PNG/JPEG may be retained where appropriate.

Large camera images should be processed before publication.

Conceptual pipeline:

```text
Original Image
      ↓
Resize
      ↓
Compress
      ↓
WebP / AVIF
      ↓
Blog Asset
```

Keep originals outside the published site when appropriate.

---

# 15. Diagrams

Prefer scalable formats for technical diagrams.

Possible sources:

- Mermaid
- SVG
- Excalidraw
- Figma
- custom diagrams

Architecture diagrams should ideally be exportable as SVG.

---

# 16. Video Management

Large videos should not accumulate inside the Git repository.

Video storage should eventually use object storage or a dedicated media host.

Preferred initial architecture:

```text
GitHub
├── source code
├── Markdown
├── metadata
└── small assets

Cloudflare R2
├── videos
├── large media
└── downloadable assets
```

Video pages should use poster images and lazy loading.

Potential derived assets:

```text
demo.mp4
demo-poster.webp
demo-preview.webp
```

---

# 17. Project Capture Workflow

When building projects, preserve intermediate milestones.

For example:

```text
2026-10-21-face-tracking.mp4
```

with a short corresponding log:

```text
Today I connected face tracking to the reactive loop.

The most noticeable result was that the robot immediately
felt more alive, even though no LLM was involved.
```

These small records may later become:

- project logs
- project retrospective sections
- Notes
- Articles
- social content

---

# 18. Social Distribution

The website is the canonical version of content.

Social platforms contain adapted versions.

Conceptual workflow:

```text
article.md
    ↓
Website
    ↓
Social Transformer
    ↓
Xiaohongshu Assets
```

Possible CLI:

```bash
pnpm social <content-slug>
```

Potential generated output:

```text
dist/social/<slug>/
├── 01-cover.png
├── 02.png
├── 03.png
├── 04.png
├── 05.png
├── caption.md
└── metadata.json
```

The pipeline may use an LLM to:

- identify key ideas
- rewrite for social format
- divide content into cards
- produce title candidates
- generate caption text
- suggest tags

Final publication should remain human-reviewed.

Do not prioritize fully automatic platform posting during early development.

---

# 19. Search and Discovery

Eventually support:

- full-text search
- tags
- archive
- related posts
- course relationships
- project relationships

Avoid building complicated knowledge graphs before sufficient content exists.

---

# 20. SEO and Sharing

The site should support:

- semantic HTML
- canonical URLs
- sitemap
- RSS
- OpenGraph metadata
- social preview images
- structured titles and descriptions

SEO should not compromise writing quality.

---

# 21. Initial Roadmap

## V0.1 — Website Foundation

Build a usable public site.

Required:

```text
Home
Writing
Projects
Courses
About
Now
```

Technical requirements:

```text
Astro
TypeScript
Tailwind
MDX
Content Collections
KaTeX
syntax highlighting
dark mode
RSS
sitemap
basic SEO
```

Goal:

```text
Create Markdown
      ↓
git push
      ↓
Website updates automatically
```

---

## V0.2 — Content System

Formalize:

```text
Insight
Note
Article
Project
Course
```

Add:

```text
.blog/
├── STYLE.md
├── schemas/
└── prompts/
```

Develop the conversational writing workflow.

---

## V0.3 — Media Pipeline

Implement utilities for:

- image resizing
- WebP/AVIF conversion
- compression
- video poster generation
- metadata handling
- future R2 upload workflow

---

## V0.4 — Social Pipeline

Build:

```text
Markdown
   ↓
Social content extraction
   ↓
Card layout
   ↓
PNG generation
   ↓
Caption generation
```

Start with Xiaohongshu.

Additional social channels may be added later.

---

# 22. Non-Goals for Initial Versions

Do not initially build:

- user accounts
- login
- comments backend
- database
- custom CMS
- newsletter infrastructure
- recommendation engine
- complex analytics dashboard
- social network
- advanced knowledge graph
- automatic Xiaohongshu publishing
- excessive animations

These can be reconsidered only when actual usage creates a reason.

---

# 23. Success Criteria

The project succeeds if Ryan can naturally do this:

```text
Learn something
      ↓
Discuss it with AI
      ↓
Generate a Note
      ↓
Review it
      ↓
Publish
```

and:

```text
Build something
      ↓
Capture screenshots/videos/insights
      ↓
Accumulate project history
      ↓
Produce a strong project case study
```

without maintaining several disconnected tools or manually duplicating content.

Over time, the site should become an increasingly accurate public record of:

> what Ryan has learned, built, thought about, and cared about.