# 在笔记中加入生成式 UI

## 公开资料能确认什么

ChatGPT 在 2026 年 3 月的发布说明中展示了数学与科学的交互模块。读者可以直接改变公式的输入，观察图形与结果变化。这份说明描述了使用体验，具体的内建生成和渲染链路仍无法从中确定。 [ChatGPT 发布说明](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

OpenAI 公开的 MCP Apps 路线面向给 ChatGPT 添加界面的开发者。服务端工具提供结构化数据和相应的 UI 资源，ChatGPT 在 iframe 中运行组件，通过桥接协议交换信息。这个方案可以作为「数据和渲染分离」的参考。 [OpenAI 的 MCP UI 指南](https://developers.openai.com/plugins/build/chatgpt-ui)

如果独立站点以后需要按读者提问即时选控件，可以用模型工具的结果选择开发者预先实现的组件。Vercel AI SDK 展示了这个模式，OpenAI Structured Outputs 则支持用 JSON Schema 约束模型输出的结构。公式、答案和数值范围仍要由应用校验。 [Vercel AI SDK 的 Generative UI 指南](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) · [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

## 对本站的建议

从写作阶段生成交互开始。AI 根据笔记选择已有组件并填写参数，作者在预览和 PR 中检查，Astro 静态构建，读者的交互在浏览器里即时计算。当前站点已安装 MDX 集成，官方支持从 MDX 导入 Astro 组件、用组件脚本实现局部交互。通常只需把使用组件的文章写成 MDX，正文和初始示例仍可静态输出。这条路线继续使用当前的 Cloudflare Pages 发布方式，读者访问时没有模型调用费用。 [本站架构决策](../DECISIONS.md) · [Astro MDX 集成](https://docs.astro.build/en/guides/integrations-guide/mdx/) · [Astro 客户端脚本](https://docs.astro.build/en/guides/client-side-scripts/)

第一例可以放在 CS336 的梯度累积段落。按单卡口径，让读者分别调 micro-batch 大小和累积步数，实时看到有效 batch。初始值使用原文的 `256 × 4 = 1024`，并保留静态算例和原文关于梯度等价的条件。适合复习的后续组件包括带解释的自测题，以及可以改变参数观察阈值的图，例如 Roofline 的带宽瓶颈切换。 [CS336 笔记原文](../../src/content/notes/cs336-resource-accounting.mdx)

先实现一两个可复用的组件就能验证阅读价值。读者按文章即时请求任意交互则需要另外解决模型调用、服务端密钥、调用额度、输出校验和稳定性，属于独立的第二阶段。
