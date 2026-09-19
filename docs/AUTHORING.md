# Authoring

Markdown and MDX under `src/content/` are the canonical source. The schemas in `src/content.config.ts` validate frontmatter during `pnpm check` and `pnpm build`.

## AI-assisted drafting

Invoke `$personal-writing` when source material already exists in the current conversation or in supplied files. The skill extracts the author's questions, attempts, observations, decisions, and unresolved points before choosing a source collection and checking whether the material belongs in a continuing series.

AI-assisted entries default to a publication-ready pull request: the generated entry is public in source, but it reaches the production site only when you review and merge that PR. Say “只生成草稿” or “不要发 PR” when you instead want a local `draft: true` file. Review personal claims and missing context before merging; the skill may clarify and organize the author's reasoning, but it must not invent it.

The writing profile lives with the skill at `skills/personal-writing/references/voice-profile.md`. Refine it from writing the author identifies as representative rather than from generic style preferences.

## 给 AI 的写作请求

在网页版 GPT 或 Codex 中新开一个任务后，把下面这段连同你的聊天记录、项目日志、链接或笔记一起发出即可。网页版 GPT 需要已连接你的 GitHub 账号，并有这个私有仓库的访问权限：

```text
请为我的个人网站整理一篇可发布内容，并按仓库中的写作流程执行：

仓库：https://github.com/ZakuZakuu/personal-website
请先读取 main 分支的 AGENTS.md、skills/personal-writing/SKILL.md、
skills/personal-writing/references/voice-profile.md、
skills/personal-writing/references/style-audit.md 和
skills/personal-writing/references/site-authoring.md，再开始写作。

材料：
【把聊天记录、项目日志、笔记或链接放在这里】

要求：
- 根据材料选择最合适的源集合，并判断是否应接入已有合集；公开页面不展示固定内容类型；
- 保留我原本的问题、尝试、取舍、困惑和结论，不要写成泛泛的教程；
- 用自然的中文，避免 AI 腔、空泛开场和未经材料支持的个人感受；
- 写作前先判断语料校准的可信度；没有足够的本人原文时，只把风格判断当作暂时假设，不要声称已经完成稳定的文风复刻；
- 写完后按 style-audit.md 做一次受控检查，只修改有材料依据的 AI 痕迹，不要机械删掉所有对比句、破折号或问句；
- 不确定或材料不足的地方不要编造，直接标出来；
- 按默认流程创建独立分支、完成校验并开一个指向 main 的审阅 PR；不要合并 PR。

最后告诉我：文章路径、PR 链接、改动摘要，以及校验结果。
```

如果只想先看看文章，不想创建 PR，把最后一条替换为：“只生成本地 `draft: true` 草稿，不提交、不推送、不发 PR。”

## Create an entry

```bash
pnpm new:note "Why this boundary matters"
pnpm new:article "A title with an argument"
pnpm new:project "Project name"
pnpm new:course "Course name"
```

Each command creates a conservative template and refuses to overwrite an existing file. Replace every `TODO` before publishing.

## Relationships

- Put stable series IDs in `series`, for example `series: [cs336]`. Use a series only for a continuing thread; tags remain for cross-cutting topics.
- Put writing entry IDs in `related` to create explicit related-reading links.
- Set `draft: true` to exclude an entry from routes, feeds, search, tags, and indexes.
- Use `featured: true` sparingly for homepage selections.
- `demo: true` is reserved for short-lived layout validation. Real content should omit it.

## Assets

Give content-specific assets descriptive names and keep them beside the content they support. Import images from MDX and render them with `MediaFigure.astro` so dimensions, lazy loading, alt text, and captions remain consistent. Use `VideoFigure.astro` for local or hosted video; always provide a useful title and poster when available.

## Mathematics

Use `$...$` for inline mathematics and `$$...$$` for display mathematics. The site processes these delimiters with `remark-math` and KaTeX; LaTeX-style `\(...\)` and `\[...\]` delimiters are not recognized in Markdown or MDX source.

## Before publishing

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

Preview the result at mobile and desktop widths. Long code, equations, tables, image alt text, heading order, and internal links deserve explicit attention.

## Prepare an image

The image helper preserves the source file, caps width at 1800 pixels without enlargement, and writes WebP or AVIF:

```bash
pnpm media:image path/to/original.jpg path/to/article-image.webp
```

It refuses to overwrite an existing output unless `--force` is passed. Large source photos should normally remain outside the published repository.
