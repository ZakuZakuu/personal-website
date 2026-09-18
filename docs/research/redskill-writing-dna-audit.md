# RedSkill 与 writing-dna-skill 只读评估

调查日期：2026-09-18
范围：只读检查官方安装文档、RedSkill 返回的公开 bundle、`writing-dna-skill` 的公开 GitHub 源码，以及本仓库的 `personal-writing` skill。没有执行安装命令，没有把 RedSkill 或该 skill 安装进系统或项目。

## 结论先行

`writing-dna-skill` 值得借鉴，但它不是一个能够自动把文章“变成人写的”的模型或检测器。它本质上是一个文件驱动的上下文工程流程：用至少 20 篇完整文章提炼语言、结构、选题、素材策略、认知框架和视觉风格，再要求 agent 在每次写作前重新读取这些规则和 5 篇相关原文。[公开 `SKILL.md`](https://github.com/larashero3-dotcom/writing-dna-skill/blob/main/SKILL.md)

它对本项目最有价值的部分是：把当前只有定性描述的 `voice-profile.md`，升级成有语料、有例外、有原文回读的写作校准流程；不能保证每篇文章都没有 AI 味，也不能替代作者审稿。

建议：暂时不要安装 RedSkill 商店。可以先把 `writing-dna-skill` 的方法移植到现有 `personal-writing` skill，使用我们自己拥有的开发日志和文章作为语料；如果后续确实需要从 RedSkill 分发，再单独审核安装链路。

## 1. RedSkill 的安装机制

### 官方安装文档

官方文档要求通过 shell 管道执行远程脚本：

```bash
curl -fsSL https://fe-video-qc.xhscdn.com/...sh | bash
```

也提供 `--cli-only` 变体，并说明 CLI 安装后使用 `redskill install <identifier>`。[官方安装文档](https://redskill.xiaohongshu.net/install.md)

只读审查该公开 bootstrap 脚本后，发现它会继续下载一个 CDN 上的 `.tar.gz`，解压后执行其中的 `install.sh`。bootstrap 层没有在安装文档或脚本中提供固定 SHA-256 校验；因此风险不在于“必然恶意”，而在于初始安装依赖远程脚本和可变 CDN 内容，供应链审计困难。

### 初始 kit 会写入的位置

公开 kit 的 `install.sh`（由官方安装文档指向的压缩包中读取，未执行）默认组件是 `cli,skill`，目标包括：

- `~/.redskill/src`、`~/.redskill/version.json`、`~/.redskill/metadata.json`、`~/.redskill/config.json`
- `~/.local/bin/redskill`
- `~/.openclaw/workspace/skills/find-redskills/SKILL.md`
- `~/.openclaw/workspace/skills/redskill-preference/SKILL.md`

如果显式选择 plugin，还会写入 `~/.openclaw/extensions/redskill`，并尝试通过 `openclaw config set` 开启插件。`--restart-gateway` 还会启动一个 OpenClaw gateway 进程。也就是说，安装 RedSkill 不只是把一个 Markdown 文件放进当前仓库，而是会改动用户目录和可能存在的 OpenClaw 配置。

### `redskill install` 的远程下发

CLI 的默认安装根目录是当前工作区的 `./skills`。它通过 RedSkill API 获取 bundle manifest，再下载 ZIP；公开 bundle 安装器会校验服务器返回的 SHA-256，并在安装前做路径安全检查、临时目录 staging 和回滚处理。这一部分的防护比初始 `curl | bash` bootstrap 更完整。

我只读查询了官方 bundle 接口：

```text
GET https://edith.xiaohongshu.com/api/sns/v1/creator/red_skill/get_skill_bundle?identifier=writing-dna-skill
```

2026-09-18 返回 `writing-dna-skill@1.0.1`，并带有 SHA-256：

```text
2c7ba8cd4643efef0cdfd75204d4027a1d959a665b19b2c83f57e433f6547f5c
```

这个查询只读取 manifest；随后为核对内容，我把签名 ZIP 临时下载到 `/tmp`，没有解压到项目、没有执行其中内容、没有安装。ZIP 的 SHA-256 与 manifest 一致，内容是 40 个文件，全部为 Markdown、模板或示例；没有可执行脚本。该 API 响应是当前调查时的事实，不应当视作永久版本承诺。

### 安全判断

需要区分两层：

1. **RedSkill 商店/CLI 安装链：需要谨慎。** 官方路径是远程 shell 执行，bootstrap 下载的 tarball 没有初始固定哈希校验；安装还会改动用户目录，plugin 选项会改动 OpenClaw 配置并可能启动 gateway。另一个值得注意的事实是，本次 API 返回的 bundle 下载 URL 使用了 `http://sns-video-qc.xhscdn.com/...`，虽然 ZIP 的 SHA-256 校验能阻止大多数内容篡改，但 HTTP 下载本身仍增加了降级、可用性和元数据暴露风险。
2. **当前 `writing-dna-skill` bundle：风险较低但不是零。** 这次返回的 bundle 不含脚本，skill 内容是给 agent 读取的 Markdown；不过任何 agent skill 都会影响模型行为，仍应在安装前审阅全文，并且不应把私密语料上传到第三方服务。

## 2. writing-dna-skill 实际做什么

它明确要求至少 20 篇完整 `.md` 或 `.txt` 文章，放在 `raw/` 或 `raw-corpus/`；小样本只能视作流程演示，不能当作可靠的风格模型。[公开工作流](https://raw.githubusercontent.com/larashero3-dotcom/writing-dna-skill/main/references/workflow.en.md)

它把风格拆成六层：

- L1：词汇、句长、标点、修辞和段落节奏
- L2：开头、正文结构、转折和结尾
- L3：选题时机、角度和取舍
- L4：权威来源、案例、数据、截图的使用方式
- L5：价值判断、假设和反复出现的核心命题
- L6：图片、排版、字体、强调和色彩

然后生成四份分层文档和一份 `Writing-DNA.md`，并要求每次写作前读完全部产物，再从原文中选 5 篇题材和体裁最接近的文章通读。[`SKILL.md` 的写作前读取要求](https://github.com/larashero3-dotcom/writing-dna-skill/blob/main/SKILL.md)

它还附带 `lieflat-less-ai-tone`。这个子 skill 不是“读起来像 AI 就重写”，而是白名单式改写：只处理明确列出的规则，保留未命中的句子、段落结构和信息；规则包含翻案腔、顿号罗列过密、相邻句结构同款、破折号/冒号滥用、序数词小标题、理想化职业人格比喻、用概括词盖掉已有具体数据等。[子 skill 源码](https://raw.githubusercontent.com/larashero3-dotcom/writing-dna-skill/main/skills/lieflat-less-ai-tone/SKILL.md)

这个设计可以减少常见的模型模板痕迹，但它不会判断一篇文章是否真正有作者的经验，也不会自动补齐材料缺口。规则与作者真实习惯冲突时，项目文档要求以作者的 Writing DNA 为准。

## 3. 是否真的“厉害”

### 有明确价值的部分

- 比“参考这几篇，模仿我的语气”更可重复：它要求先建立语料元数据，再分层分析，写作前回读规则和原文。
- 不只分析词语，还分析作者如何选题、使用证据和形成判断。这正好对应我们现在文章“有过程但仍有 AI 味”的问题。
- `lieflat-less-ai-tone` 的信息守恒和白名单边界，比泛化的“润色得自然一点”更容易审阅。
- 项目是公开 GitHub 仓库，许可证标为 MIT；仓库公开列出 `SKILL.md`、参考文档、模板、边界说明和附带子 skill。[仓库主页](https://github.com/larashero3-dotcom/writing-dna-skill)

### 不能过度承诺的部分

- 仓库自己要求至少 20 篇完整文章，并明确小样本不能用于判断上限；因此不能拿几篇开发日志就宣称已经得到稳定的“个人 DNA”。
- “去 AI 味”的效果主要是规则驱动的改写，不是经过个人语料训练的模型，也不是可证明的人类检测器。
- 项目 README 提到与 300 篇 AI 输出、329 篇真实文章的对比，但公开 skill 本身没有把完整实验数据、评测脚本和独立复现实验作为本项目的验收保证。这个数字应看作作者提供的方法依据，不应直接解释为对我们文章效果的保证。
- 风格蒸馏可能把当前文章中的模型腔也当成“个人风格”学进去，所以语料需要尽量使用你本人独立写成、而不是 GPT 已经改写过的文本。

因此，合理评价是：**方法论有用，尤其适合作为写作前校准和写作后受控清理；“明显消除 AI 味”需要用你的真实语料和 A/B 试写验证，不能仅凭 skill 名称或星标相信。**

## 4. 与本项目 `personal-writing` 的兼容性

### 兼容点

现有 skill 已经要求：

- 从对话和日志中提取“尝试 → 观察 → 问题 → 机制 → 决策”的过程；
- 保留不确定性、失败和取舍；
- 使用自然中文，避免泛泛教程、装饰性比喻和无材料支撑的结论；
- 在默认流程中生成 review PR，由作者合并。

这些原则与 Writing DNA 的“读原文校准、保留证据、区分作者判断和背景知识”一致。现有 `voice-profile.md` 也已经是一个轻量版的定性风格档案。

### 差异点

目前项目没有 `raw/` 语料目录、文章级 `_meta/`、四份分层 DNA 文档或 `Writing-DNA.md`；现有 voice profile 只有定性规则，而且它主要来自开发日志，不是 20 篇完整成文的个人文章。因此它能约束 agent 的方向，但不够约束句子节奏、段落呼吸和具体的转折习惯。

另外，我们的网站内容主要由对话总结产生。对话适合保留思考过程，但不等同于“你本人写过的文章”。如果把大量 GPT 产出的站内文章直接放入语料，蒸馏结果可能复制现有 AI 腔，形成反馈回路。

### 推荐接入方式

不安装 RedSkill，先在项目自己的写作流程中引入一个受控实验：

1. 单独准备一个不发布的本地语料目录，只放你本人写过或明确授权使用的完整文章/日志；不把未经整理的原始私人内容提交到公开仓库。
2. 先以 20 篇为目标；如果目前不足，就只生成“初版风格假设”，不把它当成稳定 DNA。
3. 生成语言、结构、认知框架和 Writing-DNA 四类文档；视觉层对我们的 Markdown/网站排版不是主要收益，可以先不做图文语料蒸馏。
4. 改造 `personal-writing`：写作前读取 DNA，再读 3–5 篇相近原文；生成后执行白名单式 AI 痕迹检查，所有改动仍进入 PR 供你审阅。
5. 做一次盲测：同一份对话材料分别用旧流程和新流程生成，比较你是否更愿意把它改成自己的文章。验收标准应是“更像你的思考和说话方式”，而不只是少了几个“不是……而是……”句式。

这种接入保留了当前项目的静态、审阅 PR 和作者最终确认机制，也避免把私密 DevLogs 交给一个未经必要性验证的安装链。

## 5. 相关来源

- [RedSkill 官方安装说明](https://redskill.xiaohongshu.net/install.md)
- [RedSkill bundle manifest API（本次只读查询入口）](https://edith.xiaohongshu.com/api/sns/v1/creator/red_skill/get_skill_bundle?identifier=writing-dna-skill)
- [`writing-dna-skill` GitHub 仓库](https://github.com/larashero3-dotcom/writing-dna-skill)
- [`writing-dna-skill/SKILL.md`](https://raw.githubusercontent.com/larashero3-dotcom/writing-dna-skill/main/SKILL.md)
- [`writing-dna-skill` 英文工作流](https://raw.githubusercontent.com/larashero3-dotcom/writing-dna-skill/main/references/workflow.en.md)
- [`lieflat-less-ai-tone/SKILL.md`](https://raw.githubusercontent.com/larashero3-dotcom/writing-dna-skill/main/skills/lieflat-less-ai-tone/SKILL.md)
- [`usage-boundaries.md`](https://raw.githubusercontent.com/larashero3-dotcom/writing-dna-skill/main/docs/usage-boundaries.md)
