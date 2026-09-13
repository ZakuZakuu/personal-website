---
title: 'learn-dsh：先把 DSH 做成一门课，再验证它能不能真的教会人'
description: 一个把 DSH、教材、Teacher、Student、Builder 和 Trajectory 放进同一个工作区的交互式 Harness Engineering 课程。Ch00–Ch05 已完成第一轮实现，但教学质量还在验收。
date: 2026-09-13
status: building
tech: [DSH, Cordis, React, TypeScript, Chromium]
tags: [agents, harness-engineering, interactive-learning, DSH]
draft: false
---

我最近一直在做一个叫 learn-dsh 的项目：把 DeepSeek Harness（DSH）做成一门交互式的 Harness Engineering 课程。

它不是一份“DSH 有哪些功能”的文档，也不想变成一个不断提问、让人答题的 AI Tutor。我的预想是，学习者在真实的 DSH 运行时上，从一个没有学习者自有能力的 Student Harness 开始，一层层把文件工具、Shell、权限、Persona、上下文压缩加回来。教材负责把事实和概念讲清楚；Teacher 根据学习状态引导；Student 用来观察真实行为；Builder 协助实现；Validator 验证能力有没有真的成立。

说起来有点像把课程、IDE 和 agent runtime 塞进同一个工作区。

## 第一件推翻自己的事：课程并不是从“裸模型”开始

最早我想做的是一门“从 0 开始实现 harness”的课，所以 Ch00 的叙事也很自然：先看一个只有 `user input → model → response` 的最小模型，再逐步补 memory、工具和循环。

后来实际接上 DSH 才发现不对。即使 Student preset 很空，DSH Runtime 也已经提供了 session/history、请求组装、agent loop 和 tool registry。Student 可以连续聊天，不是因为模型自己突然有了 memory；它也不是一个完全裸的模型调用。

这让原来的 Ch00 很别扭：Student 明明已经有基础运行时能力，Teacher 却在让学习者判断它哪里“不足”。我最后把这个前提改掉了：课程所谓“从零开始”，不是从零重写 Runtime，而是从 **零个学习者拥有的 Harness capability layer** 开始。

现在的 Ch00 是一个轻量的 DSH Baseline 定向章节。它不要求写代码，也不让 Builder 出场。学习者要先在 Student Panel 的 Chat 和 Trajectory 里看见：模型、DSH Runtime 和 Student Harness 分别管什么。Ch01 才第一次加入文件工具。

这个调整看起来只是课程文案的变化，但其实定了后面所有章节的边界：运行时已经给出的机制，不应该被伪装成学习者刚刚“实现”的东西。

## 我想教的不是插件清单

我对这门课真正关心的，一直不是让人记住某个工具包怎么配。

在 agent 时代，具体实现当然还重要，但很多实现会越来越容易交给代码 agent。更值得理解的是：一个方案为什么这样取舍，有哪些技术路线，能力和权限为什么要分开，什么时候应该相信模型的文字，什么时候必须回到真实的运行时证据。

所以课程当前的主线是这样的：

1. Ch00：先看清 DSH Runtime 这个 baseline；
2. Ch01：加入文件工具，理解工具注册和 tool loop；
3. Ch02：加入 Shell，讨论执行能力和运行时接入缝隙；
4. Ch03：讨论 sandbox 与 approval，建立“有能力不等于有权限”的边界；
5. Ch04：加入 Persona 与 Agent Instructions，区分身份、工作区上下文和工具；
6. Ch05：加入 context compaction，观察上下文管理不是完美记忆。

每章都有可见的 Textbook、Teacher 的教学指南、行为验证契约和 canonical checkpoint。Textbook 是稳定的课程事实；Lesson Guide 是 Teacher 私下使用的教学策略。这两个东西刻意分开了：前者决定“教什么”，后者决定“什么时候怎么讲”。

我也不希望 Teacher 一开始就进入苏格拉底式盘问。学习者刚进一章时，应该可以先读、先玩、先观察，或者先问一个概念；等真的见过材料和证据之后，再讨论设计判断。课程内容可以稳定，学习路径不需要被强制成同一种顺序。

## UI 不是附属品，因为证据本来就藏在运行时里

这个项目后来花了很多时间在 UI 上，原因不是单纯想把它做得像一个产品。

Harness 的很多关键事实平时是看不见的。模型到底看到了哪些 history？系统塞进了哪些 runtime context？有没有真正发生 tool call？工具结果有没有回到模型？如果这些都只能靠 Teacher 说，课程很容易又退回“相信一段解释”。

所以 Student Panel 里有两个视图：Chat 负责正常对话，Trajectory 负责看请求和事件。Trajectory 不是一个新的 agent，也不是聊天记录的另一种皮肤；它是 Student Session 的请求调试视图。

现在的 UI 有 Reading 和 Workspace 两种布局。Reading 把教材放在中心位置，Teacher、Student、Builder 仍然可以随时打开；Workspace 则让三种角色一起工作。教材里的动作可以直接打开 Student Trajectory 或切到 Builder。选中一段教材后，可以快速问“解释一下”“举个例子”，也可以把它作为一个可移除的引用附件放到 Teacher 输入框里。

我还刻意把 Quick Reply 和 Action 分成了两个概念。Quick Reply 只是替学习者快速发送一句话；Action 才是切换面板、打开轨迹、定位教材 section 这种确定性的 UI 操作。把它们混在一起，最后会让“我想怎么回应 Teacher”和“页面应该跳到哪里”都变得不清楚。

课程 UI 目前有中英文切换、深浅主题和接近原版 DSH 的模型配置入口。Trajectory 也没有直接搬原版组件，而是根据 raw session events 自己重建 request ledger，再不断拿原版 DSH 的行为和样式对照。

## 一些很具体的坑

做这件事之后，我越来越觉得，agent 课程的 dogfood 本身就是课程设计的一部分。

例如，早期 Student 曾经在对话里声称自己能看到工作区、能写代码，但 Ch00 的 Student 本来应该是一个很纯的 chatbot。模型的说法看起来很像真的，实际能力却不在它手里。这个问题让我更坚定：不能把模型的自然语言自述当作能力证据，还是要回到 Trajectory 里看 request、可用 tools 和真实 tool call。

还有一个很别扭的 Trajectory bug：这一轮模型已经回复了，但轨迹页必须等到下一轮请求，才会把上一轮 assistant message 显示出来；在 Chat 点 Reset 后，Trajectory 甚至还会保留旧 session 的记录。最后查到的不是某一个渲染条件，而是 live WebSocket 和 polling 的事件顺序不能被假定为严格递增。现在前端会合并完整事件日志，把最后一个已完成的 response 归到所属 request，并在 Reset 时同步清空 Chat 和 Trajectory 的 projection。

教材图表也踩过一个很朴素的问题：图表嵌在阅读面板的 iframe 里，窄一点就只能看到局部，还要拖 iframe 内部的横向和纵向滚动条。最后把固定最小宽度和固定高度去掉，用 `ResizeObserver` 让 iframe 跟着内容自适应。看起来只是视觉细节，但它决定了“图是帮助理解，还是又多了一个要操作的障碍”。

## 现在到底做到哪里了

Ch00–Ch05 的双语教材、教学指南、行为验证契约和 checkpoint 都已经有了。课程 UI 的 Reading / Workspace、教材 Action、选段提问、Teacher Quick Reply、Builder Code 查看、进度与理解证据入口也已经接上。

自动化方面，我没有只测一些独立函数。现在的回归会启动真实的 DSH loader、临时 workspace、本地 fake Provider 和 Chromium，通过浏览器去走 Builder → Student Reset → Trajectory → Validator → Teacher Reflect 的链路。之后还补了一个显式 opt-in 的真实 Provider dogfood：Ch01 到 Ch05 都跑过 Teacher 的教材读取、Student 的工具选择，以及 Ch05 压缩后的工具连续性。

但这些结果只能说明：插件组合、事件链路和课程状态大体能跑通。它们不能证明一门课真的教得好。

目前还没有完成的部分包括：

- 我还需要完整地以学习者身份走完 Ch01–Ch05，判断 Teacher 的引导是不是自然，低压力 Reflect 会不会反而变成新的负担；
- Teacher 的 Guide / Tutor / Coach 目前主要还是 prompt 和课程状态约束，不是一个独立的教学状态机；
- Trajectory 已经能用来观察核心请求、工具和 compaction，但还没有原版的历史分页、streaming partial、虚拟列表和跨视图精确定位；
- Builder 现在有只读的 Code / diff 查看，设计决策记录和可选手动编辑还没做；
- 教材有 diagram、callout、对比、观察点和动作，但 glossary、hover annotation、source snippet、before/after、timeline 这些更丰富的阅读交互还在后面。

更大的未完成项其实不是某个功能。

我还不能确定，这种“教材 + Teacher + 实操 + 运行时证据”的形式，能不能真的让学习者理解 Harness 的设计取舍，而不是在一个被照顾得很好的流程里点完按钮；也不知道引导到底会不会太少，让人无从下手，或者太多，最后变成宝宝难度。

所以接下来我不急着继续加章节。先把现有 Ch00–Ch05 真正走一遍，再看这套教学体验有没有资格继续往下扩。
