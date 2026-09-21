---
title: CS336 学习记录 02：从 FLOPs 到 Roofline
description: 第二节前半段，从浮点数、einops、FLOPs、MFU，一路算到算术强度和 Roofline，开始把“GPU 为什么跑不满”这件事具体化。
date: 2026-09-21
updated: 2026-09-21
tags: [LLM, CS336, systems, GPU, performance]
series: [cs336]
featured: false
draft: false
---

第二节开始进入 **resource accounting**。这一讲到目前为止几乎没有什么“新的模型结构”，反而一直在算：一个 tensor 占多少显存，一次矩阵乘法有多少 FLOPs，GPU 理论上能算多快，真实为什么又跑不到那个数字。

刚开始看 motivating questions 的时候我就觉得特别眼熟：

- 70B 模型训练 15T tokens，在 1024 张 H100 上要多久？
- 8 张 80GB H100，用 AdamW 最多能训练多大的模型？

这种题真的很像国内算法岗或者大模型训练岗面试里会出现的估算题。教授也直接把它叫做 back-of-the-envelope / napkin math：不追求一开始就把所有细节算到特别精确，而是先对资源量级有感觉。

这一讲开头还顺便更新了一下他们的 scaling 实验：更大规模的 Marin run 继续贴近之前的小规模 forecast。这里用的 Paloma macro loss，本质上还是在 held-out 的多个 domain 上看 language modeling loss，再做比较均匀的 macro average。它不直接等于 reasoning、chat 或 agent 能力，但很适合拿来观察 scaling，因为是一个连续、比较平滑的指标。

## 浮点数第一次和“训练资源”连了起来

FP32、FP16、BF16 这些名字以前当然见过，但这次比较完整地把它们和范围、精度、显存占用放到一起看。

浮点数本质上就是二进制科学计数法：

$$
x = (-1)^s \times 1.f \times 2^e
$$

sign 决定正负，exponent 决定动态范围，fraction / mantissa 决定精度。

FP32 有 8 bit exponent 和 23 bit fraction；FP16 把 exponent 缩到 5 bit，所以动态范围明显变小。像课上直接演示的 $10^{-8}$，转成 FP16 就会 underflow 到 0。BF16 则保留了和 FP32 一样的 8 bit exponent，只把 fraction 压到 7 bit，所以动态范围基本没问题，代价是分辨率变粗。

这个 trade-off 我现在会这样记：

```text
FP16：精度还行，但动态范围容易出问题
BF16：动态范围够大，但小数细节比较粗
FP32：稳，但显存和计算都更贵
```

所以实际训练会用 mixed precision。课里的典型配置是：

```text
parameters / activations / gradients -> BF16
optimizer states                    -> FP32
```

这里以前我只知道“混合精度能省显存、加速”，现在更能理解为什么 optimizer state 倾向保留 FP32：AdamW 的一阶、二阶动量会长期累计很小的变化，对数值精度更敏感。

### FP4 已经不是“单个数自己扛住一切”了

FP8 之后又讲到了 NVFP4。4 bit 一共就 16 种编码，E2M1 能表示的基础数值非常粗：

$$
0,\ 0.5,\ 1,\ 1.5,\ 2,\ 3,\ 4,\ 6
$$

以及对应的负数。

一开始看这个范围会觉得很离谱：参数和 activation 怎么可能只在这么几个值之间选？

关键在于 FP4 不再只靠单个 4-bit value 表示真实数量级，而是让一小块数共享额外的 scale。可以把它想成：

$$
x_{real} \approx x_{FP4} \times scale
$$

于是 4 bit 本体负责“局部相对大小”，scale 负责“这一小块整体是什么数量级”。

代价也很明显：同一个 block 里的数共享 scale，如果邻居之间量级差得太大，outlier 会把 scale 拉大，小数值就更容易被量化掉。这里让我第一次比较具体地感觉到，低精度不是简单地“少几个 bit”，而是需要额外的表示设计才能真的拿来训练。

## einops：从“第几个维度”换成“这个维度是什么”

接下来讲 einops。这个库本身不是什么新算法，更像是让 tensor 操作从位置思维变成语义思维。

比如以前写：

```python
z = x @ y.transpose(-2, -1)
```

脑子里还得先想 `-2`、`-1` 分别是什么。

einops 可以直接写：

```python
z = einsum(
    x, y,
    "batch seq1 hidden, batch seq2 hidden -> batch seq1 seq2"
)
```

这里一眼就能看出：两个输入在 `hidden` 维上相乘并求和，输出保留 `batch seq1 seq2`。

`reduce` 更适合单个 tensor 上做 sum / mean / max 之类的 reduction；`rearrange` 则可以显式拆、合维度。例如：

```python
rearrange(x, "... (heads hidden) -> ... heads hidden", heads=2)
```

如果原来最后一维长度是 8，就会按 $8=2\times4$ 拆成 `heads=2, hidden=4`。Transformer 里经常要在

$$
(B,S,D)
$$

和

$$
(B,S,H,D_h)
$$

之间来回切，这种写法确实比一串 `view + transpose + permute` 更不容易看错。

## FLOP 原来就是这样一点点数出来的

这一段开始正式算 FLOPs。

一次浮点加法或者乘法通常都记作 1 FLOP。点积：

$$
a_1b_1+a_2b_2+\cdots+a_Db_D
$$

有 $D$ 次乘法和 $D-1$ 次加法，所以严格来说是：

$$
2D-1
$$

做大规模估算时直接近似成 $2D$。

如果：

$$
X\in\mathbb{R}^{B\times D},\quad
W\in\mathbb{R}^{D\times K}
$$

那么矩阵乘法：

$$
Y=XW
$$

大约需要：

$$
2BDK
$$

FLOPs。

课件里有一句我觉得挺关键：$B$ 可以看成 data points / tokens，而 $DK$ 就是这一层的参数量。所以 forward pass 可以先粗略理解为：

$$
2\times(\#tokens)\times(\#parameters)
$$

这也就是上一节见过的

$
\boxed{\text{training FLOPs}\approx6ND}
$

的雏形：forward 已经能看到 $2\times(\#tokens)\times(\#parameters)$ 这个结构。至于 backward 为什么会再补出大约 $4ND$，老师会在后半段继续展开，我今天先不提前写。

以前 $6ND$ 看起来比较像一个需要记住的经验式，现在至少已经能看到，它最终是从一个个矩阵乘法的乘加操作数出来的。

课上还有同学问到 Strassen 之类 sub-cubic matrix multiplication。老师的回答也挺符合这门课的风格：理论上当然存在渐近复杂度更低的矩阵乘法算法，但真实大模型系统里的优化通常更关心 tiling、memory hierarchy、Tensor Core、kernel、并行和通信这些 system 问题。

也就是不一定把 $O(n^3)$ 改成 $O(n^{2.8})$，而是想办法让这个 $O(n^3)$ 真正在 GPU 上跑得接近硬件峰值。

## FLOP/s 不只是显卡型号后面的一个数字

这里又把 FLOPs 和 FLOP/s 区分了一遍：

- **FLOPs**：做了多少浮点运算
- **FLOP/s**：每秒能做多少浮点运算

而且显卡 spec 里的 FLOP/s 必须先问一个问题：

> 什么 data type？

同一张卡在 FP32、BF16、FP8 下的峰值差别很大；是否使用 Tensor Core、是否把 sparsity 算进去，也会影响宣传数字。

我自己平时常用学校的 A100，又会拿笔记本 3060 跑一些小东西，所以这里开始有了一点量级感。A100 的 BF16 Tensor Core 是几百 TFLOP/s，H100 课件里用的是不算结构化 sparsity 时大约 989 TFLOP/s。以后再看到“某卡有多少 TFLOPS”，不能只拿一个数字横着比。

### CUDA 为什么计时前后要 synchronize

GPU 默认很多操作是异步提交的。

Python 执行：

```python
a @ b
```

不一定会停在那里等 GPU 真算完，而是把任务提交到 CUDA stream 后继续往下走。

所以 benchmark 前后要：

```python
torch.cuda.synchronize()
```

否则测到的可能只是 CPU 把任务扔给 GPU 花了多久，而不是 GPU 真正完成 matmul 的时间。

这个细节以前写训练代码基本不会主动想，但做性能分析时就完全不能忽略。

## MFU：理论峰值有多少真的变成模型计算了

接下来是 **Model FLOPs Utilization（MFU，模型 FLOPs 利用率）**：

$$
\text{MFU}
=
\frac{\text{actual model FLOP/s}}
{\text{promised / peak FLOP/s}}
$$

课上说 0.5 左右已经算相当不错。

这里所谓“ignore communication / overhead”，不是说通信和 overhead 不影响性能，而是它们不算进 numerator 的有效 model FLOPs。通信、同步、kernel launch、数据搬运、等待其他 GPU 这些事情都会占时间，于是最后 MFU 会掉下来。

我现在更愿意把 MFU 理解成：

> 这张 GPU 的理论计算能力，有多少最终转成了模型真正需要的数学计算。

## 算术强度：有时候 GPU 根本不是“算不动”

这一讲到目前最有用的概念应该还是 **Arithmetic Intensity（算术强度）**：

$$
\text{Arithmetic Intensity}
=
\frac{\text{FLOPs}}
{\text{Bytes moved}}
$$

单位是 FLOP/Byte。

它不是“计算占总时间的比例”，而是每搬 1 Byte 数据，能做多少次浮点运算。

这里有一个很容易漏掉的小细节：算 bytes 的时候要把**读取和写回都算上**。

例如 BF16 ReLU，每个元素：

```text
read x   -> 2 bytes
write y  -> 2 bytes
compute  -> roughly 1 operation
```

所以：

$$
AI_{ReLU}=\frac{1}{4}=0.25\ \text{FLOP/Byte}
$$

GELU 虽然每个元素可以粗略按 20 FLOPs 算，算术强度比 ReLU 高不少，但依然很低。也就是说这些 elementwise operation 单独执行时，GPU 往往不是缺计算能力，而是在等数据。

## Accelerator Intensity：硬件自己也有一个“算力 / 带宽比”

课件又定义了 accelerator intensity。我之后在国内交流里会更倾向叫它 **硬件算力/带宽比**，Roofline 里也常对应 **ridge point（屋脊点）**：

$$
\text{Accelerator Intensity}
=
\frac{\text{Peak FLOP/s}}
{\text{Memory Bandwidth}}
$$

H100 在课里的 BF16 口径下大约是 300 FLOP/Byte。

于是判断 bottleneck 就很直接：

$$
AI_{algorithm}<AI_{hardware}
\Rightarrow \text{memory-bound}
$$

$$
AI_{algorithm}>AI_{hardware}
\Rightarrow \text{compute-bound}
$$

我自己的直觉就是：如果硬件每搬 1 Byte 理论上能做 300 FLOPs，但这个算法每搬 1 Byte 只安排了 0.25 FLOP，那显然算力是“吃不饱”的，瓶颈就在 memory bandwidth。

## 从 dot product 到 matmul，终于理解 batch size 为什么能把 GPU 喂满

老师接着分别算了 dot product、matrix-vector product 和 matrix-matrix multiplication 的 arithmetic intensity。

如果都把维度记成 $n$：

```text
dot product          compute ~ O(n)
matrix-vector        compute ~ O(n^2)
matrix-matrix        compute ~ O(n^3)
```

但矩阵本身的搬运规模主要还是 $O(n^2)$。

所以 matrix-vector multiplication 里，计算和大矩阵的搬运大致还是同一量级，算术强度很低；到了 matrix-matrix multiplication，数据搬运还是 $O(n^2)$，计算却涨到 $O(n^3)$，同一批数据被重复利用了很多次，算术强度就会随着矩阵规模增长。

这里我第一次特别直观地理解了 **batch size 和 GPU 利用率的关系**。

单个样本做线性层更像：

$$
Wx
$$

是 matrix-vector product。

但如果一次把很多样本 / token 堆起来：

$$
XW
$$

就变成了大 GEMM。同一份权重矩阵从 HBM 搬进来以后，可以服务很多个 token，搬运成本被更多计算摊薄，于是算术强度提高，也更容易把 Tensor Core 喂满。

这也顺便解释了老师对 inference 的预告：autoregressive decode 每一步生成的 token 很少，小 batch 下大量线性层更接近 matrix-vector / skinny matrix multiplication，所以经常是 memory-bandwidth-bound；训练和 prefill 一次处理很多 token，更容易形成大 GEMM，因此更容易 compute-bound。

## Roofline：把“到底卡在算还是搬”画成一张图

到这里 Roofline Model 基本就是前面所有概念的汇总。

![Roofline 模型示意图：横轴是算术强度，纵轴是实际 FLOP/s；低算术强度区域受显存带宽限制，高算术强度区域受峰值算力限制。](https://jax-ml.github.io/scaling-book/assets/img/roofline-improved-1400.webp)

*Roofline Model。CS336 Lecture 2 直接引用了这张 JAX Scaling Book 图。*

它对应的核心关系是：

$$
\text{realized FLOP/s}
=
\min(
\text{peak FLOP/s},
\text{bandwidth}\times\text{arithmetic intensity}
)
$$

左边算术强度比较低时：

$$
\text{performance}\approx BW\times AI
$$

提高显存带宽或者提高数据复用，都可能让性能继续往上涨。

到了拐点以后，计算单元已经吃满，再增加 arithmetic intensity 也无法突破硬件 peak FLOP/s，于是进入 compute-bound 区域。

图里同时画了两个 bandwidth，也让我意识到一个以前比较容易忽略的点：

> memory-bound / compute-bound 不是算法自身一个绝对不变的标签，而是 workload 和 hardware 的关系。

同一个算法，在带宽比较低的硬件上可能 memory-bound，换成更高带宽的硬件以后就可能碰到 compute ceiling。

今天先学到 Roofline 这里。第二节后面还会继续进入 backward、optimizer、training loop、gradient accumulation 和 activation checkpointing。现在还没看，所以先不提前写；等明天把剩下的内容学完，再把这一篇继续补完整。

## References

- [Stanford CS336 2026 Lecture 2 source](https://github.com/stanford-cs336/lectures/blob/main/lecture_02.py)
- [JAX Scaling Book: Roofline Analysis](https://jax-ml.github.io/scaling-book/roofline/)
- [einops documentation](https://einops.rocks/)
- [Mixed Precision Training](https://arxiv.org/abs/1710.03740)
- [NVIDIA NVFP4 overview](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/)
