---
title: CS336 学习记录 03：从 Pre-Norm 到 RoPE
description: 第三节前半段从 Pre-Norm、RMSNorm、SwiGLU 和 Parallel Layers，一路理到 RoPE 为什么能用 2D 块对角旋转保留相对位置。开头整理了现代架构改动的速查表，正文按课程顺序保留推导与直觉。
date: 2026-11-27
updated: 2026-11-27
tags: [LLM, CS336, architecture, transformer, RoPE]
series: [cs336]
featured: false
draft: false
---

第三节开始讲 **Architectures and Hyperparameters**。以前看大模型架构演进，经常觉得就是一堆名词堆在一起——Pre-Norm、RMSNorm、SwiGLU、RoPE——好像大家都在用，也就跟着记下来了。但结合前面刚算完的 resource accounting 再回来看这一讲，很多改动突然就能对上号：有些是为了训练稳定，有些是为了省 memory-bound 的显存搬运，有些则是在尽量不增加参数量的前提下换更好的表达能力。

下面先放一张速查表，回头查各个组件的作用和公式时看这一节就够了；点每一行开头的名字会跳到正文对应部分。正文按课程顺序，从归一化与残差流一路理到激活函数、并行层和位置编码。

## 速查

### 架构改动速查

| 组件 | 现代做法 / 公式 | 备注 |
| --- | --- | --- |
| [Pre-Norm](#pre-norm) | $x + \text{Sublayer}(\text{Norm}(x))$ | 保持一条干净的残差主干，深层网络梯度更稳 |
| [RMSNorm](#rmsnorm) | $\text{RMSNorm}(x) = \dfrac{x}{\sqrt{\frac{1}{d}\sum x_i^2 + \epsilon}} \odot g$ | 去掉减均值和 bias，省的是 memory-bound 搬运，不是 FLOPs |
| [SwiGLU](#swiglu) | $\text{SwiGLU}(x) = (\text{SiLU}(xW_1) \odot xW_3)W_2$ | 多了一个门控矩阵，隐藏层维度从 $4d$ 缩到 $\frac{8}{3}d$ 对齐参数量 |
| [Parallel Layers](#parallel-layers) | $x + \text{Attn}(\text{Norm}(x)) + \text{MLP}(\text{Norm}(x))$ | PaLM 曾用来提吞吐，但有效深度减半，主流模型已回退到串行 |
| [RoPE](#rope) | 将 $d$ 维拆成 $d/2$ 组 2D 平面，按 $m\theta_i$ 旋转 | 作用在每层 Attention 的 $Q$、$K$ 上，内积只依赖相对位置 $m - n$ |

## Pre-Norm

**现代 Transformer 几乎全部从 Post-Norm 切到了 Pre-Norm，核心是把归一化挪进分支里，留出一条不被打断的残差主干。**

原始 Transformer 用的是 Post-Norm，把 LayerNorm 放在残差相加之后；Pre-Norm 则把归一化放到 Attention 和 MLP 的输入端：

$$
x_{l+1} = x_l + \text{Sublayer}(\text{Norm}(x_l))
$$

这样反向传播时，梯度可以顺着主干上的恒等路径直接往回传，不需要每过一层都被归一化层缩放一次。网络变深以后，训练稳定性会明显好于 Post-Norm，也更容易摆脱对极其精细 warmup 的强依赖。

## RMSNorm

**RMSNorm 去掉了 LayerNorm 里的减均值和 bias，真正赚到的不是 FLOPs，而是减少 memory-bound 算子的数据搬运。**

回顾 [Lecture 2 笔记](/writing/cs336-resource-accounting/#算术强度)里的 Roofline 视角，归一化属于典型的 elementwise / reduction 操作，算术强度很低，瓶颈在显存带宽而不在计算单元。LayerNorm 需要先算均值、再算方差，还要带上可学习的平移参数 bias；RMSNorm 只按均方根做缩放：

$$
\text{RMSNorm}(x) = \frac{x}{\sqrt{\frac{1}{d}\sum_{i=1}^d x_i^2 + \epsilon}} \odot g
$$

去掉均值统计和 bias 以后，计算步骤更少、读写内存更省，同时现代模型也顺带把很多线性层里的 bias 一并去掉了——在效果几乎无损的前提下，能少搬一点数据、少占一点显存，系统效率就能更干净。

**易混点**：以前很容易下意识觉得“RMSNorm 更快是因为少算了均值，省了 FLOPs”。但归一化的 FLOPs 在整个 Transformer 里本来就占比极小，它真正省下来的是 memory-bound 环节的读写开销和 kernel 延迟。

## SwiGLU

**SwiGLU 在前馈网络里引入了门控分支，为了让总参数量和传统 $4d$ 的 FFN 保持一致，中间维度通常调整为 $\frac{8}{3}d$。**

传统 FFN 只有两个线性投影（$d \to 4d \to d$），参数量是 $2 \times 4d^2 = 8d^2$。SwiGLU 多引入了一个门控投影，需要三个矩阵 $W_1, W_3, W_2$：

$$
\text{SwiGLU}(x) = \left(\text{SiLU}(xW_1) \odot xW_3\right)W_2
$$

如果中间维度继续保持 $4d$，三个矩阵的参数量就会涨到 $3 \times 4d^2 = 12d^2$。为了在同参数量级下公平对齐，把中间维度设成 $d_{\text{ff}} = \frac{8}{3}d$，这样总参数量正好回到：

$$
3 \times d \times \frac{8}{3}d = 8d^2
$$

工程实现里通常还会把 $\frac{8}{3}d$ 向上或就近取整到 64、128 或 256 的倍数，以配合 Tensor Core 对矩阵维度的对齐要求。

## Parallel Layers

**把 Attention 和 MLP 并行计算确实能提高吞吐，但会让网络的有效串行深度减半，主流架构最终还是回到了串行结构。**

标准 Transformer 里，每一层先算 Attention，再把更新后的表示送进 MLP；PaLM 提出过并行版本，让两个子层共享同一个归一化后的输入，各自算完直接加回残差流：

$$
x_{l+1} = x_l + \text{Attn}(\text{Norm}(x_l)) + \text{MLP}(\text{Norm}(x_l))
$$

QA 环节有同学专门问到这件事：PaLM 原论文当时很有把握地说并行结构几乎没有性能损失、还能把吞吐提上去几个百分点，为什么后来大家又不用了？讲师的解释挺实在——在更大规模或更精细的对比里，这种改法确实还是有一定效果损失（直观上原本“先汇总上下文、再逐 token 加工”的两步串行变浅了），不过这一块目前也确实缺少非常严格、系统化的受控 ablation 实验。

## RoPE

**RoPE 不再把位置向量加到词向量上，而是把高维向量两两拆成 $d/2$ 个 2D 平面分别做旋转，让 $Q$ 和 $K$ 的内积只依赖内容和相对位置差 $m - n$。**

先看为什么早期“把位置编码直接加到 embedding 上”显得别扭。如果 $q_m = x_m + p_m$、$k_n = x_n + p_n$，做点积展开后会出现四项：

$$
(x_m + p_m)^\top (x_n + p_n) = x_m^\top x_n + x_m^\top p_n + p_m^\top x_n + p_m^\top p_n
$$

中间那两项“内容乘位置”和“位置乘内容”的 cross terms 非常反直觉——词义向量和位置向量之间强行做内积，很难说有什么清晰的几何含义。

RoPE 的想法直观得多：既然关心的不是绝对位置 $m$ 和 $n$，而是它们之间的相对距离 $m - n$，那就直接按位置给向量做旋转。位置 $m$ 转 $m\theta$，位置 $n$ 转 $n\theta$，只要相对位置不变，两者旋转角的差 $(m - n)\theta$ 就固定不变，而且旋转不改变向量模长。

### 拆成 2D 平面旋转

高维空间里旋转方式太多，直接构造一般的高维旋转既复杂又贵。RoPE 的做法非常直接：**把一个 $d$ 维向量按维度两两配对，拆成 $d/2$ 组互不干扰的 2D 平面**，每组内部只做最普通的平面旋转：

```text
假设 head_dim = 6 -> 拆成 3 组 2D 平面:
  (x_0, x_1) -- 2D 旋转角 m * θ_0 --> (x'_0, x'_1)
  (x_2, x_3) -- 2D 旋转角 m * θ_1 --> (x'_2, x'_3)
  (x_4, x_5) -- 2D 旋转角 m * θ_2 --> (x'_4, x'_5)
```

数学上这等价于沿着对角线把 $d/2$ 个 $2 \times 2$ 旋转矩阵拼成一个块对角稀疏矩阵：

$$
R_{\theta, m} = \begin{pmatrix}
\cos m\theta_1 & -\sin m\theta_1 & & \\
\sin m\theta_1 & \cos m\theta_1 & & \\
& & \ddots & \\
& & & \cos m\theta_{d/2} & -\sin m\theta_{d/2} \\
& & & \sin m\theta_{d/2} & \cos m\theta_{d/2}
\end{pmatrix}
$$

不同 2D 组配有不同的旋转频率 $\theta_i$，由固定的几何级数公式给出（经典 base 为 $10000$，长上下文模型会调大）：

$$
\theta_i = \text{base}^{-2(i-1)/d}, \quad i \in \{1, 2, \dots, d/2\}
$$

靠前的维度对 $\theta_i$ 大、转得快，捕捉近距离的局部位置变化；靠后的维度对 $\theta_i$ 小、转得慢，用来分辨更远的距离。我一开始看到这里还挺惊讶——真就这么直接，把高维两两配对、每组做平面旋转，靠多组频率拼出表达力，居然就能干净地消掉绝对位置。

**易混点**：这里我自己踩过三个容易想歪的细节，记下来免得写代码时混掉：

1. **作用对象是每层 Attention 的 $Q$ 和 $K$，不是 Token Embedding**（也不作用在 $V$ 上）。不是拿到词向量就先乘一个旋转矩阵，而是在每一层线性投影出 $q$、$k$ 之后再分别施加位置 $m$、$n$ 的旋转，这样点积 $q_m^\top k_n$ 里才会自然消成相对位置 $(m - n)$。
2. **不是随机初始化，也不是可训练参数**。旋转角由位置索引 $m$ 和固定频率公式 $\theta_i$ 直接算出来；位置 $m = 0$ 时旋转角为 $0$（相当于不旋转），往后随 $m$ 线性累加。一般也不放开让梯度去改 $\theta_i$，避免破坏相对位置平移不变性。
3. **工程上不会真的构造一个 $d \times d$ 的大矩阵做乘法**。虽然数学上是块对角矩阵，但 PyTorch 里直接把最后一维拆成两两一组，用预先算好的 `cos`、`sin` 做逐元素乘加（`x * cos + rotate_half(x) * sin`），显存和速度都划算得多。

## 待续

今天先学到 Lecture 3 前半段（约 40 分钟，到 RoPE 和 Parallel Layers 的 QA）这里。这一讲后面还有超参数经验法则、训练稳定性与 QK-Norm、以及 GQA / MQA 等内容；等后半段看完，再把这一篇继续补完整。

## References

- [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/)
- [CS336 2026 lecture materials](https://github.com/stanford-cs336/lectures)
- [CS336 学习记录 02：Resource Accounting](/writing/cs336-resource-accounting/)
- [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864)
- [PaLM: Scaling Language Modeling with Pathways](https://arxiv.org/abs/2204.02311)
