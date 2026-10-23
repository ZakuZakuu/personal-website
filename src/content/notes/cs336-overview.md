---
title: CS336 学习记录 01：Overview 与 Tokenization
description: 从课程 Overview 到 Tokenization，我开始重新理解 token、scaling、data、alignment，以及为什么效率本身就是大模型训练的一部分。开头整理了 scaling law、tokenizer 和 post-training 的速查表。
date: 2026-09-15
updated: 2026-10-23
tags: [LLM, CS336, training, systems, tokenization]
series: [cs336]
featured: false
draft: false
---

最近几个月实习里做的事情比较集中在 Agent、文档和模型调用上。做久了以后有一个很明显的感觉：我已经很熟悉怎么“用”一个大模型了，但对模型下面到底发生了什么，尤其是训练这一侧，理解还是比较零散。

所以最近开始看 Stanford CS336。第一节是 Overview，本来以为主要就是介绍课程安排，结果看下来反而有不少地方让我重新调整了以前对大模型的理解。

下面先放一张速查卡，回来找公式和结论时看这一节就够了；点表格里每一行开头的名字会跳到正文里对应的部分。正文按课程顺序：先是 Overview 里的 scaling、data、alignment，再是 Tokenization 一讲。

## 速查

### 公式卡

| 要算什么                                        | 公式 / 数字                       | 备注                                                            |
| ----------------------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| [训练计算量](#scaling-law)                      | $C\approx6ND$                     | $N$ = 参数量，$D$ = 训练 token 数；6 的来历见 Lecture 2 笔记    |
| [compute-optimal 配比](#scaling-law)            | $D\approx20N$                     | 70B 模型约 1.4T tokens；Chinchilla 式经验结论，没考虑推理成本   |
| [compression ratio](#压缩率与词表大小)          | 原始 bytes 数 / token 数          | BPE 大约是 1000 bytes → 250 tokens，也就是每个 token 约 4 bytes |
| [词表 vs 序列长度](#压缩率与词表大小)           | 词表越大 → 压缩率越高 → 序列越短  | 代价是稀有 token 更多、embedding / output 层更大、更稀疏        |
| [BPE 训练](#bpe-算法)                           | 反复合并出现最多的相邻 token pair | 从 bytes 出发，直到达到目标词表大小                             |
| [Tokenizer-free 的约束](#tokenizer-free-的约束) | 在 chunk 上计算，chunk 长度可变   | 课程给出的两个条件，不管以后换成什么方案                        |

### 四种 tokenizer

| 方案      | 词表大小                | 压缩率         | 主要问题                                 |
| --------- | ----------------------- | -------------- | ---------------------------------------- |
| Character | 约 150K 个 Unicode 字符 | 低             | 词表大，而且很多字符非常罕见             |
| Byte      | 256                     | 1              | 序列太长，attention 是序列长度的二次方   |
| Word      | 很大，而且没有固定上限  | 好             | 罕见词学不好，没见过的词全部变成 `[UNK]` |
| BPE       | 自己设定的目标大小      | 好，按数据调整 | 仍是独立的前处理步骤，边界提前固定       |

### Post-training 方法

| 方法 | 监督信号                           | 说明                               |
| ---- | ---------------------------------- | ---------------------------------- |
| SFT  | full supervision：直接示范正确答案 | 仍然是预测下一个 token             |
| PPO  | reward（human / verifier / judge） | 来自强化学习，InstructGPT 用的方法 |
| DPO  | preference 数据                    | 针对偏好数据，更简单               |
| GRPO | reward                             | 去掉了 value function              |

### 五个作业

| 作业         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| A1 basics    | BPE tokenizer、Transformer、cross-entropy、AdamW、训练循环、resource accounting     |
| A2 systems   | Triton 写 fused RMSNorm kernel、分布式数据并行、optimizer state sharding、profiling |
| A3 scaling   | 在 FLOPs 预算内提交训练任务、拟合 scaling law、预测 loss                            |
| A4 data      | Common Crawl HTML 转文本、质量和有害内容分类器、MinHash 去重                        |
| A5 alignment | 实现 DPO 和 GRPO                                                                    |

## 为什么重学

**课程的思路是 understanding via building：自己从零搭一遍，才算真正理解。**

课程开头专门讲了「Why you should not take this course」。如果目标只是把某个应用做好，prompt、微调或者现成模型往往已经够用；如果只是想追多模态、RAG 之类最新的应用技术，也有更直接的课程。

这让我一开始有点犹豫，因为我以前也跟过李沐的深度学习课程，Transformer、优化器这些概念并不是完全没见过。但仔细想了一下，我之前很多时候其实只是把 Notebook 跑起来，看一眼图表，然后进入下一节。很多东西属于“见过”，但没有真的自己实现过，也没有经历过一个模型为什么训不起来、一个实验为什么要这样设计。

所以这次我想换一个方式：**assignment 才是主线，lecture 是辅助材料。**

先自己实现、跑测试，再做小规模训练。如果只是把训练脚本跑几个小时，最后看一张 loss 曲线，我觉得意义还是不大。真正有价值的是先有一个问题，再用实验去回答它。

## Token 与 bytes

**token 不是文本天然的组成单位，而是在 bytes 之上额外引入的一层表示；tokenizer 可以看成一种无损的聚合和序列压缩。**

第一节里让我印象很深的一个点，是教授提到 tokenizer-free model：理想情况下，模型直接在 bytes 上工作，不需要 tokenizer。

以前我几乎默认了：

```text
文本 -> tokenizer -> token -> Transformer
```

好像文本本来就应该由 token 组成。但换个角度以后会发现，计算机真正拿到的其实只是 bytes，token 是我们额外引入的一层表示。

我现在更愿意把 tokenizer 理解成一种**无损的聚合和序列压缩**：把经常一起出现的 byte sequence 合成一个 vocabulary 里的符号，用更大的词表换更短的序列。它不是在丢掉原始文本的信息，但它确实提前替模型决定了「哪些 bytes 应该被绑在一起」。

这样再看 tokenizer-free 就很自然了：理论上，为什么一定要由一个固定 tokenizer 提前规定这些边界？模型也可以从 byte 开始自己学出字符、subword、词和更高层的表示。真正麻烦的地方主要还是效率——byte sequence 太长，直接交给昂贵的 Transformer 处理会非常贵。课件里的说法是，这类架构很有前景，但还没有被放大到 frontier 规模。

这个地方虽然在 Overview 里只是一带而过，但确实改变了我以前“token 就应该存在”的默认认知。

## Scaling law

**真正的大模型没法在目标规模上调参，所以先在小规模上做很多便宜实验、拟合 scaling law，再外推到目标规模。固定 FLOPs 预算时，经典结论是 $D\approx20N$。**

Scaling law 这一部分让我第一次比较具体地理解，为什么训练大模型时会这么强调 predictability。

真正的大模型实验太贵，不可能每一个超参数、模型大小和数据量都直接在目标规模上试。课件把这件事叫做 **scaling recipe**：不再只盯着一个规模，而是把“FLOPs → 超参数”当成一个配方。先在多个小规模（比如到 $10^{24}$ FLOPs）上跑实验算出 loss，再拟合 scaling law，预测这个配方在目标规模（比如 $10^{25}$ FLOPs）上的 loss。

课里给了一个很直观的关系：训练计算量可以粗略写成

$$
C \approx 6ND
$$

其中 $N$ 是参数量，$D$ 是训练 token 数。这个 6 是怎么数出来的，[Lecture 2 笔记](/writing/cs336-resource-accounting/#反向传播与-6nd)里有推导。固定 FLOPs budget 后，就会出现一个实际问题：到底应该把钱花在更大的模型上，还是让小一点的模型看更多数据？

IsoFLOP 曲线就是在同一算力预算下尝试不同的 $N$ 和 $D$，找到最低 loss 的点，再根据多个规模的最优点拟合 scaling law。课程里还提到了经典的 Chinchilla-style 经验结论：

$$
D \approx 20N
$$

例如 70B 的模型大约应该训练 1.4T tokens。我更愿意把这个数字当成某套训练条件下的经验 recipe，而不是固定不变的定律。课件也提醒了一点：它没有考虑推理成本，如果模型训完要大量部署，往往会希望模型更小、多训一些 token。

也正因为这样，我开始理解教授为什么说 **predictability 至少和 optimality 一样重要**。把一次训练优化快 20% 很有价值，但如果小规模实验能提前告诉你某条路线放大以后根本不值得跑，省下来的可能是一次完整的大模型训练。

**易混点**：这里我第一次把 **hyperparameter transfer** 和 scaling law 区分开：前者更像是在问“小模型上调好的超参数怎么迁移到大模型”（课件提到的是 muP 这类参数化方法），后者是在问“模型、数据和算力放大以后，性能会怎么变化”。它们共同做的事情其实很像——尽量把过去比较玄学的“炼丹”，变成一个可以在小规模验证、再有依据地放大的工程过程。课件的原话是，scaling law 不会自动出现，需要仔细构造 scaling recipe。

## 数据

**模型想要什么能力，数据里就得先有什么；数据要经过转换、过滤、去重、配比、改写一整套 pipeline，而且可以一直迭代。**

Data 这一段讲得很短，但感觉其实完全可以单独开一门课。

教授问得很直接：你希望模型有什么能力？多语言、对话、agentic coding？那首先就要看数据里有没有这些东西，以及它们的质量和比例。

然后数据并不是“抓下来就开训”，原始数据是 HTML、PDF、目录结构，中间还有一整套 pipeline：

```text
获取数据
-> transformation（HTML / PDF 转成文本）
-> filtering
-> deduplication
-> data mixing
-> rewriting / synthetic data
-> training
-> evaluation
```

过滤质量和有害内容、用 MinHash 去重（课件说去重既省算力，也避免模型死记）、调整不同来源的权重、生成合成数据……看到 Assignment 4 的时候我忍不住笑了，因为教授自己都说这是很多人眼里的 dirty work。难怪很多所谓算法实习，进去以后很大一部分时间真的是在洗数据。

但脏归脏，这部分并不低级。模型架构可能很久不改，数据 pipeline 却可以一直迭代，而且最终能力会非常直接地受它影响。

数据按阶段也分了三类：pretraining 数据量大且多样；mid-training 数据质量高，包括长上下文；post-training 数据是 SFT 用的对话和带 tool calling 的 agent 轨迹。

这里还第一次注意到 **mid-training** 这个说法。我的理解是，它仍然是在做 language modeling，但已经进入预训练后期，开始把数据分布往更高质量、长上下文或目标能力需要的数据上倾斜。它和“模型会更受最近训练数据影响”有一定关系，但显然不只是简单地最后塞一批好数据进去，还要考虑数据比例、学习率和遗忘问题。

**易混点**：评估上也分得很清楚：internal evaluation 是为了指导模型开发，看重的是跨规模的平滑性和相对好坏，典型的是 validation loss / perplexity；external evaluation 衡量真实使用场景下的绝对质量，比如 GPQA、HLE、SWE-Bench、Terminal-Bench 这些 benchmark。前者告诉我“作为语言模型预测 token 做得怎么样”，后者才是在问“最终表现出来的能力怎么样”。两者并不能互相替代。课件还提到 perplexity 最好在不公开的文档上算，避免数据污染。

## Alignment

**预训练是 full supervision（预测下一个 token）；alignment 用的是更弱的监督信号，因为判断一个答案好不好，往往比从零写一个好答案容易。**

最后讲到 alignment，我以前对这个词其实没有太明确的概念。现在先把它理解成：预训练只教模型预测下一个 token，而 alignment / post-training 要进一步让模型更倾向于做我们真正想要的事情。

这一段最启发我的还是一句很简单的话：

> It is easier to critique than to generate.

让人从零写一个很好的答案可能很难，但模型已经生成几个候选以后，让人判断哪个更好，或者让 verifier 检查数学答案对不对，往往容易得多。

所以课程把它写成一个很简单的模板：

```text
模型生成候选
-> human / verifier / LM judge 打分
-> 更新模型，让它更偏好更好的输出
```

PPO、DPO、GRPO 都是在这个大框架里，用不同方式利用这些 reward / preference 信号。课件也列了这条路线的难点：RL 算法不稳定、难调；规模上去以后需要大量新基础设施（比如异步 rollout 的推理）；还要一直在系统效率和 on-policy 程度之间做取舍。

**易混点**：这里课程用的是 full supervision 和 weak supervision 的对比，而不是简单的 supervised / unsupervised。SFT 是 full supervision 很典型的形式：直接示范“正确答案应该是什么”；RL 或 preference optimization 则可以只提供更弱、更间接的判断信号。

## Tokenization

**tokenizer 在 strings 和 token 序列之间做无损转换；它不是语言学意义上的切词，而是根据训练语料把常见的 byte sequence 压成更短的序列。**

继续看 Tokenization 这一讲以后，前面“token 是人为引入的一层表示”这件事变得更具体了。

教授先展示了几个很反直觉的现象：一个词前面的空格可能和词本身属于同一个 token，同一个 `hello` 出现在句首和句中可能会被表示成不同 token，数字也经常不是按“一个完整数字”来切，而是每几位拆成一块。

**易混点**：以前我会下意识觉得 tokenizer 应该在做某种语言学意义上的切词，但实际上它更像是在根据训练语料，把常见的 byte sequence 压成更短的序列。

### 压缩率与词表大小

课程用 **compression ratio** 来量化这件事：

$$
\text{compression ratio} = \frac{\text{原始文本的 byte 数}}{\text{token 数}}
$$

也就是一个 token 平均覆盖多少原始 byte。这个值越大，送进 Transformer 的序列越短，对 attention 越友好（attention 的开销是序列长度的二次方）。课件给的量级是，BPE 大概能把 1000 bytes 压成 250 个 token 左右。

一个很自然的想法是把 vocabulary 做大：如果词表里直接收录更多常见词、短语甚至长字符串，同样一段文本就能用更少的 token 表示。但这又带来另一个问题——词表会越来越稀疏。大量罕见 token 出现次数很少，embedding 学不充分，输入输出层也会随着 vocabulary 一起变大。

这让我第一次很清楚地看到 tokenizer 的一个基本 trade-off：

```text
更大的 vocabulary
-> 更高 compression ratio
-> 更短 sequence

但同时

更大的 vocabulary
-> 更多稀有 token
-> 更大的 embedding / output space
-> 更严重的 sparsity
```

两个极端都不好用。按字符切，词表有大约 150K 个 Unicode 字符，很多又极其罕见，压缩率还低，课件说这是“两头都不占”。按 byte 切，词表只有 256，但压缩率是 1，序列太长。

### 为什么是 BPE

传统的 word tokenizer 更极端：整个单词就是 token。它的压缩率可以很好，但一旦碰到没见过的单词、专有名词，甚至只是用户打错一个字母，就可能全部掉进 `[UNK]`。多个完全不同的字符串因此失去区别，课件还提到这会把 perplexity 的计算搞乱。看到这里以后，subword / byte-level BPE 为什么会出现就很顺了：即使整个词没见过，也可以继续往更小的片段拆，最差退回到 byte，就不会因为 OOV 直接把原始信息丢掉。

### BPE 算法

BPE 本身反而非常简单：从 bytes 出发，每轮找到出现频率最高的相邻 token pair，把它合并成一个新 token，然后不断重复，直到达到目标 vocabulary size。它最早是 1994 年 Philip Gage 提出的数据压缩算法，后来被用到神经机器翻译，再被 GPT-2 采用。

作业真正有意思的地方不在算法定义，而在效率。naive 做法每次 merge 都重新扫完整个 corpus 统计 pair，真实数据规模上会非常慢，所以需要想办法只更新受影响的 pair 统计，把一个“算法很简单”的东西真正做得能用。课件列出的作业要求还包括：保留 `<|endoftext|>` 这类 special token，以及用 GPT-2 的正则做 pre-tokenization。

### Tokenizer-free 的约束

课程最后又回到了 tokenizer-free。让我觉得最有启发性的不是“未来一定会把 tokenizer 去掉”，而是教授给出的两个约束：不管以后换成什么方案，昂贵的大模型仍然应该在某种 **chunk / abstraction** 上工作，而不是把每一个 byte 都同等昂贵地处理；同时这些 chunk 最好是可变的，让简单、容易预测的区域压得更狠，把更多模型容量留给复杂、信息量高的区域。

换句话说，未来可能没有今天这种固定 vocabulary，但**压缩和抽象本身大概不会消失**。真正可能改变的是：现在由 tokenizer 提前固定好的边界，未来能不能变成模型根据内容动态决定的边界。

这也让我重新理解了 tokenizer 的意义：它不只是“把文本切成 token”的前处理工具，而是在回答一个很底层的问题——**哪些低层信息值得先被聚合，昂贵的模型计算应该花在哪里。**

## 效率视角

**这门课里几乎每个设计决策，最后都在回答同一个问题：给定算力和数据，怎么训出最好的模型。**

Overview 和 Tokenization 看完以后，我大概知道为什么这么多人推荐 CS336 了。

它不是一门纯粹追前沿架构的理论课。Transformer 作为主干已经比较稳定，很多真正决定模型能不能做大的工作，发生在 architecture 之外：数据、scaling、kernel、显存、通信、训练 recipe、post-training、inference。

课程最后一直强调一个词：**efficiency**。课件把它按模块列了一遍：systems 本身就是效率问题；tokenization 直接处理 bytes 很优雅，但在今天的架构下太费算力；很多架构改动是为了省显存或 FLOPs；数据过滤是为了不把算力浪费在坏数据上；scaling law 则是用小模型上的少量算力来调超参数。课件还说，今天我们受算力约束，以后会变成受数据约束。

一个方法有效还不够，还要继续问：它花多少 FLOPs？吃多少显存？通信开销怎么样？放大以后还成立吗？结果能不能预测？Tokenization 这一讲其实也是同一个思路：不是问“哪种切词看起来最自然”，而是问压缩率、词表大小、稀疏性和模型计算之间怎么平衡。

这也是我目前觉得这门课最有价值的一点。很多“大模型八股”——tokenizer、FlashAttention、KV cache、scaling law、data dedup、PPO / DPO / GRPO——如果单独去背，很容易变成互相断开的术语。但从“我要真的训练出一个模型”这个问题出发，它们其实都是某个具体决策的答案。

接下来我还是准备把重点放在 assignment 上。实现和测试尽量在本地完成，需要真正训练或 profiling 的实验再放到学校的 A100 上。至少这一次，我不太想再以“把课程看完”为目标，而是想看看能不能真的把这些以前只是听过的东西，变成自己能实现、能解释，也知道为什么这么设计的东西。

## References

- [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/)
- [CS336 2026 lecture materials](https://github.com/stanford-cs336/lectures)
- [Lecture 1 source](https://github.com/stanford-cs336/lectures/blob/main/lecture_01.py)
- [CS336 学习记录 02：Resource Accounting](/writing/cs336-resource-accounting/)
