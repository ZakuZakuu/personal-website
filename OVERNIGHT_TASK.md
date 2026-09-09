# Autonomous First Public Build

You are the primary engineer and designer responsible for taking this repository from its current specification-only state to the strongest first public version you can reasonably produce.

The user will not be monitoring this run.

Read `AGENTS.md` and `PROJECT_BRIEF.md` completely before touching implementation.

Treat those documents as authoritative product context.

---

# Mission

Do **not** build a rough prototype.

Do **not** optimize for finishing quickly.

Build a polished, coherent, production-quality first public version of this personal site that the owner could reasonably continue using immediately.

Quality matters more than feature count.

However, once one phase reaches a strong level of quality, continue into the next useful phase rather than stopping early.

Use the available working time productively.

Do not consume time through meaningless rewrites or speculative overengineering.

The objective is:

> make the product as genuinely good and complete as possible.

---

# Operating Principle

Work autonomously.

When a decision is ambiguous:

1. consult `PROJECT_BRIEF.md`
2. consult `AGENTS.md`
3. inspect established best practices if necessary
4. make the simplest strong product decision
5. continue

Do not stop for minor product decisions.

Only stop for user input when continuing would require genuinely unknowable personal information, credentials, destructive external actions, or a security-sensitive decision.

Use placeholder content where personal information is unavailable.

Never invent facts about Ryan.

---

# Phase 0 — Repository Foundation

Start from the current repository state.

Establish a professional project foundation.

Choose and configure the appropriate current Astro stack based on the specifications.

Expected direction:

- Astro
- TypeScript
- Tailwind CSS where useful
- Markdown / MDX
- Astro Content Collections
- modern package management
- static-first architecture

Create:

- sensible project structure
- `.gitignore`
- scripts
- configuration
- formatting/linting/checking setup where useful
- clear README

Do not blindly reproduce an Astro starter theme.

The resulting site must have its own coherent design.

Run the application as early as practical and keep it working throughout development.

Commit the stable foundation before proceeding.

---

# Phase 1 — Content Architecture

Implement the content system thoroughly.

Support the conceptual content types described in `PROJECT_BRIEF.md`:

- Note
- Article
- Project
- Course
- Insight where appropriate
- Now

Use typed Astro Content Collections and schemas.

Metadata should be minimal but useful.

Support relationships such as:

- Note → Course
- ordered course notes
- related writing
- tags
- featured content
- drafts
- publication/update dates

Avoid duplicate content.

Provide enough concise demo content to validate all layouts.

Demo content must be clearly replaceable and must not invent biographical facts.

Implement robust content utilities rather than scattering repeated query logic throughout pages.

Commit once this system is stable and validated.

---

# Phase 2 — Design System

Treat visual design as a first-class engineering task.

The desired site is:

- quiet
- technical
- modern
- readable
- personal
- restrained
- typography-driven

It must not look like:

- a generic Astro template
- a SaaS landing page
- a flashy frontend portfolio
- an AI-generated gradient-heavy website

Develop a coherent system for:

- typography
- type scale
- spacing
- content width
- colors
- borders
- cards
- metadata
- links
- headings
- code blocks
- inline code
- quotes
- tables
- callouts where appropriate
- mathematical content

Both light and dark appearance should feel intentionally designed.

Pay particular attention to long technical articles.

Typography and reading comfort are more important than decoration.

---

# Phase 3 — Core Site Experience

Build all important site surfaces to a polished state.

At minimum:

## Home

Should quickly communicate:

- identity
- areas of interest
- featured writing
- featured projects
- recent writing
- current activity

The homepage is a personal hub, not merely a blog feed.

## Writing

Provide a strong writing index.

Support useful distinctions between Notes and Articles.

Include appropriate:

- dates
- descriptions
- tags
- filtering/navigation if genuinely useful

## Individual writing pages

Support:

- excellent article typography
- table of contents for sufficiently long content
- headings with anchor links where useful
- code highlighting
- math / KaTeX
- previous/next or related navigation where appropriate
- metadata
- responsive layout

## Projects

Provide project index and detailed project case-study layout.

Project pages should support:

- overview
- status
- technologies
- screenshots/images
- architecture diagrams
- video embeds or local video metadata where appropriate
- GitHub/demo links
- technical decisions
- lessons
- related writing

## Courses

Provide:

- course index
- course overview
- ordered course notes
- progression/navigation between notes
- course metadata

## About

Create a thoughtful structure without fabricating personal content.

Use safe placeholder sections where necessary.

## Now

Implement a useful `/now` page.

## Archive

Provide chronological browsing when valuable.

## Tags

Provide tag navigation if the content system supports it cleanly.

## 404

Build a useful, consistent 404 page.

Commit the stable site experience.

---

# Phase 4 — Navigation and Discovery

Make navigation genuinely pleasant.

Implement as appropriate:

- responsive header
- mobile navigation
- active navigation state
- breadcrumb/context cues where useful
- search
- tags
- archives
- related content
- course navigation
- RSS discovery

Prefer static search solutions such as Pagefind or an equivalent lightweight approach if appropriate.

Do not introduce a backend merely for search.

---

# Phase 5 — Technical Writing Features

The website is meant for serious technical writing.

Ensure strong support for:

- Markdown
- MDX
- fenced code blocks
- syntax highlighting
- line wrapping/overflow behavior
- mathematical equations
- footnotes where supported
- tables
- headings
- blockquotes
- images
- diagrams
- captions
- external links
- internal links

Test these features using realistic demo content.

Technical pages must remain usable on mobile screens.

---

# Phase 6 — Media Experience

Implement the foundations needed for future project media without prematurely building external infrastructure.

Support clean handling of:

- colocated images
- optimized Astro images
- SVG diagrams
- captions
- galleries where genuinely useful
- video elements
- poster images
- lazy loading

Do NOT require Cloudflare R2 credentials.

If useful, build local abstractions/helpers that make migration to R2 straightforward later.

Do not commit large fake binary assets merely to demonstrate functionality.

---

# Phase 7 — SEO, Sharing, Feeds, and Production Quality

Implement production-quality basics:

- page titles
- descriptions
- canonical URLs
- OpenGraph metadata
- social cards / sensible preview handling
- sitemap
- RSS
- favicon / site identity treatment
- robots metadata where appropriate
- semantic HTML

Avoid SEO spam.

Make metadata architecture reusable across content types.

---

# Phase 8 — Accessibility and Responsive QA

Review the entire application for:

- keyboard navigation
- focus visibility
- landmark structure
- heading hierarchy
- aria usage where needed
- image alt handling
- color contrast
- reduced motion
- mobile layouts
- tablet layouts
- wide desktop layouts
- horizontal overflow
- long code blocks
- long URLs
- large equations

Fix meaningful problems found.

---

# Phase 9 — Visual QA

Do not assume that a successful build means the site looks good.

Run the site and inspect it visually.

If browser automation or Playwright is available or reasonable to install, use it to inspect representative pages at multiple viewport sizes and capture screenshots for self-review.

Review at least:

- homepage
- writing index
- long article
- note
- project
- course
- about
- mobile navigation
- dark appearance
- light appearance

Look specifically for:

- awkward spacing
- poor hierarchy
- broken wrapping
- excessive empty space
- dense sections
- generic template appearance
- inconsistent components
- poor mobile composition
- weak typography

Iterate on the design based on what you actually observe.

Do not redesign endlessly.

Stop redesigning once the experience is coherent, polished, and clearly intentional.

---

# Phase 10 — Developer Experience

After the public site is strong, improve the content authoring experience.

Useful possibilities include:

- `pnpm new:note`
- `pnpm new:article`
- `pnpm new:project`
- lightweight scaffolding scripts
- slug generation
- frontmatter templates
- content validation

These should reduce repetitive manual work.

Keep them simple and maintainable.

Document the authoring workflow in the README or a concise dedicated document.

---

# Phase 11 — AI-Assisted Content Foundation

If the website and developer experience are already strong, implement the repository-side foundation for the AI-first writing workflow described in `PROJECT_BRIEF.md`.

Create only useful artifacts such as:

- `.blog/STYLE.md`
- content schemas/templates
- instructions for converting conversation → Insight
- conversation → Note
- conversation → Article
- conversation → Project Log

Do not create many redundant prompt files.

The writing system must emphasize:

- preserving Ryan's actual reasoning
- capturing changes in mental models
- distinguishing personal insight from added background knowledge
- avoiding generic AI writing

This phase does not require an API integration.

Repository-based instructions/templates are sufficient for the first version.

---

# Phase 12 — Media Tooling

Only after the previous phases are healthy:

Consider useful local media tooling for:

- image resizing
- image compression
- WebP/AVIF conversion
- naming conventions
- video poster extraction

Prefer simple scripts and established tools.

Do not build infrastructure that requires cloud credentials.

---

# Phase 13 — Social Pipeline Prototype

This is a stretch phase.

Only begin this if the website itself is genuinely strong and the previous systems are stable.

Prototype the architecture for:

```text
Markdown / MDX
      ↓
social content representation
      ↓
card rendering
      ↓
PNG output
      ↓
caption
```

Initial target:

- Xiaohongshu-style image posts

Possible output:

```text
dist/social/<slug>/
├── 01-cover.png
├── 02.png
├── ...
├── caption.md
└── metadata.json
```

Requirements:

- source content remains canonical
- generated social assets are derived
- human review remains required
- no automatic posting
- no credentials
- do not compromise website quality for this feature

If a high-quality implementation cannot be completed cleanly, leave this phase documented rather than introducing brittle code.

---

# Git and Version Management

Version control quality is mandatory.

The repository started with a specification baseline commit.

Work on the existing dedicated Codex branch.

Use coherent commits corresponding to meaningful working milestones.

Examples:

```text
chore: bootstrap astro project
feat: establish typed content architecture
feat: build writing and course experience
feat: add project case study system
style: establish site design system
feat: add search feeds and metadata
feat: improve content authoring workflow
chore: perform accessibility and visual polish
```

Do not blindly use those exact commits if another grouping is more coherent.

Rules:

- never force push
- never rewrite existing history
- never delete the specification baseline
- never rebase onto unrelated branches
- do not squash the work yourself
- never commit secrets
- never commit `.env`
- never commit generated build output unless intentionally required
- do not commit temporary screenshots/debug artifacts
- avoid committing dependency caches

Before every important commit:

1. inspect `git diff`
2. run relevant validation
3. ensure the milestone is internally coherent

If the run is interrupted or quota ends, previous commits should still represent useful stable checkpoints.

---

# Quality Gates

At meaningful milestones, run the appropriate available commands.

The final project should have clear scripts for checks such as:

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

Not every command must exist if unnecessary, but validation must be real.

Production build must succeed.

Resolve meaningful warnings.

Do not hide errors simply to make checks green.

---

# Autonomous Review Loop

After major implementation is complete, perform a systematic review.

Use this loop:

```text
implement
   ↓
build/check
   ↓
inspect
   ↓
visual review
   ↓
identify weaknesses
   ↓
fix
   ↓
build/check again
```

Repeat while there are clear, meaningful improvements to make.

Do not stop after the first green build.

Do not consume time making arbitrary changes once no clear improvement remains.

Ask:

- Does this feel production-ready?
- Does this look intentionally designed?
- Would technical writing actually be pleasant to read here?
- Is mobile genuinely good?
- Is the repository understandable to another engineer?
- Can new content be added easily?
- Are abstractions justified?
- Is anything obviously unfinished?
- Is placeholder content easy to replace?
- Did I accidentally overengineer something?

Address substantive weaknesses.

---

# Repository Cleanliness

Before finishing:

- inspect the entire top-level structure
- remove dead files
- remove abandoned implementations
- remove debug logs
- remove temporary screenshots
- remove unused dependencies
- check `.gitignore`
- check package scripts
- check README accuracy
- check content schemas
- run `git status`

Prefer a clean working tree.

---

# Final Documentation

Keep documentation useful and compact.

README should explain:

- what the project is
- stack
- setup
- local development
- production build
- content organization
- how to create content
- major scripts
- important architectural concepts

If important design decisions deserve preservation, maintain:

```text
docs/DECISIONS.md
```

Do not generate large amounts of process documentation for its own sake.

---

# Final Report

When you determine there are no longer obvious high-value improvements that fit the project direction:

1. run all relevant checks
2. run the production build
3. inspect `git status`
4. inspect recent Git history
5. create a final clean commit if necessary

Then write a concise final report containing:

## Implemented
Major product features.

## Architecture
Important technical decisions.

## Design
Important visual decisions.

## Validation
Exact checks and their results.

## Git
Commit history summary.

## Deferred
Things intentionally not implemented and why.

## User Decisions Needed
Only genuine decisions that could not responsibly be made autonomously.

Do not create a version tag.

Do not merge into `main`.

Leave the branch ready for human review.