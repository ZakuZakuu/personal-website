---
title: CS336 学习记录 02：Resource Accounting
description: 第二节从浮点数、FLOPs 和 Roofline，一路算到反向传播、训练显存、梯度累积和 activation checkpointing，把大模型训练里的资源账真正算了一遍。
date: 2026-09-21
updated: 2026-09-22
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

的雏形：forward 已经能看到 $2\times(\#tokens)\times(\#parameters)$ 这个结构。后半段把 backward 也数完以后，这个 6 才真正落下来。

以前 $6ND$ 看起来比较像一个需要记住的经验式，现在终于能看到，它就是从一个个矩阵乘法的乘加操作数出来的。

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

_Roofline Model。CS336 Lecture 2 直接引用了这张 JAX Scaling Book 图。_

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

## Backward 为什么大约是 forward 的两倍

后半段重新回到一个两层线性网络：

$
H_2=H_1W_2
$

如果每个样本是一行，那么这一层 forward 的计算量大约是：

$
2BD^2
$

反向时需要做两件事。第一件是把梯度继续传给前一层：

$
\nabla_{H_1}L=\nabla_{H_2}L\,W_2^T
$

第二件是算当前权重自己的梯度：

$
\nabla_{W_2}L=H_1^T\nabla_{H_2}L
$

这两项本质上又各是一次同量级的 GEMM，所以 backward 大约是：

$
2BD^2+2BD^2=4BD^2
$

也就是 forward 的两倍。

这里顺便把反向传播最核心的逻辑重新捡了一遍：weight gradient 是为了更新当前层参数；hidden gradient 本身不是要被优化，而是为了继续往前传播，让更前面的层能算出自己的 weight gradient。到了最原始输入，如果它本身不是可训练变量，一般也就没必要继续算 input gradient 了。

这两个公式我准备直接留着当回忆：

$
\boxed{\nabla_X L=\nabla_Y L\,W^T}
$

$
\boxed{\nabla_W L=X^T\nabla_Y L}
$

我这里还把符号搞混了一次。这个 toy MLP 里，$B$ 是 data points，$D$ 是 hidden dimension，所以一层的参数量大约是 $D^2$：

$
6BD^2
$

而 scaling law 常写的

$
6ND
$

里，$N$ 通常是参数量，$D$ 才是训练 token 数。也就是说这里更准确的对应是：

    B              <-> D_scaling（token / data 数）
    D_hidden^2     <-> N_scaling（参数量）

所以以后最好直接在脑子里把 $6ND$ 翻译成：

> 6 × parameters × tokens

而不是只记字母。

课件还特意强调，这个近似对 **short context Transformer** 也很好。原因是 Transformer 里大部分参数和计算也在 Q/K/V projection、attention output projection、MLP projection 这些线性层里；但 attention 还有 $O(S^2d)$ 的 $QK^T$ 和 $AV$。context 很长以后，这个二次项就不能继续忽略，$6ND$ 也会越来越不准。

## 训练显存不只有 parameters

接下来 optimizer 这一段，重点其实不是某个优化器本身，而是开始把训练时占显存的东西逐项数出来。

老师先用一句很紧凑的路线把几个经典 optimizer 串起来：

    SGD + gradient 的指数平均        -> Momentum
    SGD + 累积 gradient^2            -> AdaGrad
    AdaGrad + gradient^2 改成指数平均 -> RMSProp
    RMSProp + gradient 的指数平均     -> Adam

我一开始甚至把这四句看成了“四种开销”，后来才发现它只是在快速回顾 optimizer 的演化关系。

对于一个 $L$ 层、每层 $D\times D$ 的 toy network，batch size 为 $B$，训练显存主要可以分成四类：

| 内容 | 为什么要存 | 这个例子里的开销 |
| --- | --- | --- |
| Parameters | 模型权重本身 | BF16：$2D^2L$ bytes |
| Activations | backward 时需要 forward 的中间结果 | BF16：$2BDL$ bytes |
| Gradients | 每个参数对应一个梯度 | BF16：$2D^2L$ bytes |
| Optimizer states | 保存历史梯度统计 | AdaGrad：$4D^2L$；Adam：$8D^2L$ bytes |

Adam 对每个参数要保存一阶矩 $m$ 和二阶矩 $v$，通常都用 FP32，所以单 optimizer states 就是：

$
4+4=8\ \text{bytes/parameter}
$

在这套简化假设下，如果先不算 activation，Adam 训练一个参数至少就要：

$
2\ \text{(parameter)}
+2\ \text{(gradient)}
+8\ \text{(optimizer states)}
=12\ \text{bytes}
$

这也把前面那道“8 张 80GB H100 能装多大模型”的 napkin math 接上了。

这里还顺手发现视频画面里有一处变量名写法会让人以为又乘了一次 byte；官方源码里 gradient memory 是 \`2 * num_parameters\`，AdaGrad state 是 \`4 * num_parameters\`。这种 resource accounting 最稳的办法还是顺手检查一下单位：现在乘的是“参数个数”，还是已经算好的“bytes”。

老师还强调了一个很有用的区分：**memory capacity 决定能不能 fit，memory bandwidth 和 compute 才直接决定跑得多快。**

也就是说，单纯从 40GB 换成 80GB，如果模型和 batch 原本已经能完整放进 40GB，而且算力、带宽都一样，并不会因为容量翻倍就直接跑快一倍。但容量会间接限制 batch size、checkpointing、offload、并行方式，所以最后还是可能影响实际吞吐。

## Gradient accumulation：一次塞不下，就分几次算

大 batch 往往更稳定，也更容易形成大的 GEMM，但 activation memory 会随着 batch size 增长。如果想要 effective batch size = 1024，而显存一次只能塞 256 个样本，就可以拆成 4 个 micro-batch：

    256 -> forward/backward -> 累积 gradient，不更新
    256 -> forward/backward -> 继续累积
    256 -> forward/backward -> 继续累积
    256 -> forward/backward -> 继续累积
                             -> optimizer.step()
                             -> zero_grad()

所以：

$
\text{effective batch size}
=
\text{micro batch size}
\times
\text{accumulation steps}
$

这里就是：

$
1024=256\times4
$

如果 loss 的 reduction 和 scaling 处理一致，那么把四个 micro-batch 的梯度求和再平均，和一次真正对 1024 个样本求平均梯度在理想条件下可以数学等价。

它真正省掉的是**峰值 activation memory**：同一时刻只需要保留 256 个样本的 activation，而不是 1024 个。parameters、parameter gradients 和 optimizer states 并不会因此变小。

所以 gradient accumulation 可以很直接地理解成：

> 用更多次顺序计算，换更小的单次 batch 显存占用。

总 FLOPs 并没有凭空减少，实际还可能因为更多 kernel launch 稍微慢一点。

## Activation checkpointing：activation 不存也行，缺了再算

另一个方法是 **Activation Checkpointing**，也常叫 gradient checkpointing 或 rematerialization。

正常训练为了 backward，会把每一层的 activation 都存下来。checkpointing 则只保留一部分 checkpoint，backward 需要中间 activation 时，就从最近的 checkpoint 重新 forward 算一遍。

所以它的哲学和 gradient accumulation 很像，都是：

$
\boxed{\text{more compute} \leftrightarrow \text{less memory}}
$

只是两者动的地方不同：gradient accumulation 减少的是一次同时处理的样本数；activation checkpointing 减少的是同一个 micro-batch 里长期保存的中间层 activation。

### 为什么常说每隔 $\sqrt L$ 层存一次

假设有 $L$ 层，每隔 $k$ 层保存一个 checkpoint。

长期保存的 checkpoint 大约有：

$
\frac{L}{k}
$

个。

而 backward 重算当前 segment 时，这一段最多还要临时保留大约 $k$ 个 activation。所以这类分段策略的峰值 activation memory 可以粗略写成：

$
M(k)\propto\frac{L}{k}+k
$

这里两项都是 memory：前者是全局 checkpoint，后者是当前重算 segment 的临时 activation，并不是把 memory 和 compute 加在一起。

让两项平衡：

$
\frac{L}{k}=k
$

得到：

$
k=\sqrt L
$

于是峰值 activation memory 是：

$
O(\sqrt L)
$

同时每个 segment 只需要额外重算一次，总 recomputation 仍然是 $O(L)$。

这里还有一个容易混的极端情况：

- 全部 activation 都存：memory $O(L)$，几乎没有重算；
- 什么都不存，并且为了每一层 backward 都从最开始重新算到那里：memory 可以做到 $O(1)$，但 compute 会变成 $O(L^2)$；
- 每隔 $\sqrt L$ 层存一次，再按 segment 重算：memory $O(\sqrt L)$，额外 recomputation $O(L)$。

所以“0 个 checkpoint”的 $O(1)$ memory 和上面的分段公式并不是完全同一种执行策略。只是不存 checkpoint、然后 backward 前完整重算一次并把整段 activation 暂存下来，峰值显存仍然会回到 $O(L)$；要做到真正的 $O(1)$，就得不断从头重算，代价才会涨到 $O(L^2)$。

## 这一讲最后留下来的其实是一套 resource accounting 习惯

第二节学完以后，感觉它真正想训练的不是背某个公式，而是看到一段训练代码以后，先主动问几件事：

- tensor 有哪些：parameters、gradients、activations、optimizer states、data；
- 这些 tensor 各自是什么 dtype，占多少 bytes；
- 主要运算有多少 FLOPs，真实 FLOP/s 离硬件 peak 多远；
- arithmetic intensity 多高，到底是 compute-bound 还是 memory-bound；
- 如果模型或 batch fit 不下，是减小 micro-batch、做 checkpointing，还是换并行和 offload 策略。

这样再看课程最后那几条 summary 就顺很多了：$6\times$ data points $\times$ parameters 是 compute 的粗账；Roofline 是判断速度瓶颈；gradient accumulation 和 activation checkpointing 则是在显存不够时重新安排“存”和“算”的关系。

## References

- [Stanford CS336 2026 Lecture 2 source](https://github.com/stanford-cs336/lectures/blob/main/lecture_02.py)
- [JAX Scaling Book: Roofline Analysis](https://jax-ml.github.io/scaling-book/roofline/)
- [einops documentation](https://einops.rocks/)
- [Mixed Precision Training](https://arxiv.org/abs/1710.03740)
- [NVIDIA NVFP4 overview](https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/)
