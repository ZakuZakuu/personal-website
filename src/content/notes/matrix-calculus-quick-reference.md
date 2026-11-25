---
title: '矩阵微积分速查：范数、Trace 与梯度'
description: 从元素求和理解矩阵微分，快速查找平方损失、正则化和 Hessian 判别的常用公式。
date: 2026-11-25
tags: [linear-algebra, calculus, machine-learning]
course: AIR5059
---

这份速查表记录做题时容易忘记的维度、系数和判别条件。默认函数足够光滑，向量为列向量，梯度与变量形状一致。

## 快速索引

| 需要查找                          | 核心提示                                                 |
| --------------------------------- | -------------------------------------------------------- |
| [向量与矩阵范数](#向量与矩阵范数) | Frobenius 范数是所有矩阵元素组成的向量的 L2 范数。       |
| [Trace 和微分](#trace-和微分)     | 对应位置相乘求和可写成 $\operatorname{tr}(A^\top B)$。   |
| [常用梯度](#常用梯度)             | 平方误差是 $X^\top R$；注意 $1/2$ 和平均系数。           |
| [Hessian 与驻点](#hessian-与驻点) | 先确认梯度为零，再看特征值；零特征值可能使二阶判别失效。 |

接着查：[岭回归与稀疏性](#岭回归l1-与稀疏性) · [分类损失与反向传播](#分类损失与反向传播) · [梯度检查](#梯度检查)

## 向量与矩阵范数

对于向量 $x$，$\|x\|_1=\sum_i|x_i|$，$\|x\|_2=\sqrt{\sum_i x_i^2}$，$\|x\|_\infty=\max_i|x_i|$。平方范数 $\|x\|_2^2=x^\top x$ 是平方和，本身不是范数。

对于矩阵 $R$，Frobenius 范数满足

$$
\|R\|_F^2=\sum_{i,j}R_{ij}^2=\operatorname{tr}(R^\top R).
$$

矩阵的 $\|R\|_2$ 通常指谱范数，即最大奇异值，一般不等于 $\|R\|_F$。

## Trace 和微分

Trace 是方阵对角线之和。它可以表达两个同形状矩阵对应元素乘积的和：

$$
\operatorname{tr}(A^\top B)=\sum_{i,j} A_{ij}B_{ij}.
$$

因此，标量损失 $L$ 对矩阵 $W$ 的微分可写为

$$
dL=\sum_{i,j}\frac{\partial L}{\partial W_{ij}}\,dW_{ij}
=\operatorname{tr}((\nabla_W L)^\top dW).
$$

将式子整理成 $dL=\operatorname{tr}(G^\top dW)$，就能读出 $\nabla_W L=G$。梯度形状与 $W$ 相同。

常用规则：$d\operatorname{tr}(A)=\operatorname{tr}(dA)$，$d(AB)=(dA)B+A(dB)$，$d(A^\top)=(dA)^\top$。矩阵乘法不能随意换序；在各乘积有定义时，trace 允许循环移动：$\operatorname{tr}(ABC)=\operatorname{tr}(BCA)$。

## 常用梯度

以下 $X,y,Y$ 固定。先记残差为预测减目标，并保留损失中的系数。

| 标量目标                     | 对参数的梯度   |
| ---------------------------- | -------------- |
| $\frac12\|w\|_2^2$           | $w$            |
| $\frac{\lambda}{2}\|w\|_2^2$ | $\lambda w$    |
| $\frac12\|Xw-y\|_2^2$        | $X^\top(Xw-y)$ |
| $\frac12\|XW-Y\|_F^2$        | $X^\top(XW-Y)$ |
| $\|XW\|_F^2$                 | $2X^\top XW$   |

例如 $r=Xw-y$，则 $dr=X\,dw$，所以

$$
d\left(\tfrac12r^\top r\right)=r^\top dr=(X^\top r)^\top dw.
$$

如果误差项前没有 $1/2$，梯度多一个 $2$；如果整个误差项除以样本数 $n$，对应梯度也除以 $n$。因此 ridge 目标 $J=\frac12\|Xw-y\|_2^2+\frac\lambda2\|w\|_2^2$ 的梯度是 $X^\top(Xw-y)+\lambda w$。

## Hessian 与驻点

先解 $\nabla f=0$ 找驻点，再检查该点的 Hessian $H$。对于足够光滑的函数：

| Hessian 特征值       | 驻点结论                                   |
| -------------------- | ------------------------------------------ |
| 全正 / 全负          | 严格局部极小值 / 严格局部极大值            |
| 有正有负             | 鞍点，即使同时存在零特征值也是如此         |
| 有零且其余同号或全零 | 二阶判别法无法确定；进一步看函数值或高阶项 |

零矩阵既半正定又半负定。例如 $x^4$ 与 $-x^4$ 在原点二阶导数均为零，原点却分别是极小值和极大值。

对于二阶对称矩阵 $H=\begin{bmatrix}a&b\\b&c\end{bmatrix}$，若 $\det H<0$ 则不定；若 $\det H>0$，由 $a>0$ 或 $a<0$ 分别判断正定或负定。若 $\det H=0$，上述快捷方法不能判定驻点类型。更高维时，仅看整个行列式不够，可用特征值或顺序主子式判别法。

## 岭回归、L1 与稀疏性

普通最小二乘令梯度为零，得到正规方程 $X^\top Xw=X^\top y$。加入 L2 惩罚后，岭回归的正规方程为

$$
(X^\top X+\lambda I)w=X^\top y.
$$

当 $\lambda>0$ 时，对任意非零向量 $v$，$v^\top(X^\top X+\lambda I)v=\|Xv\|_2^2+\lambda\|v\|_2^2>0$。因此系数矩阵正定、可逆，即使 $X$ 的列线性相关，岭回归也有唯一解。

L2 通常将系数缩小；L1 惩罚 $\lambda\sum_i|w_i|$ 可以让某些系数恰好为零，产生**稀疏解**。绝对值在零点有尖角，普通导数不存在；其次梯度集合是 $\partial |w|\rvert_{w=0}=[-1,1]$。凸目标在最优点的次梯度集合包含零。

一维例子 $\min_w\frac12(w-a)^2+\lambda|w|$ 展示了这个效果：

$$
w^*=\begin{cases}a-\lambda,&a>\lambda,\\0,&|a|\leq\lambda,\\a+\lambda,&a<-\lambda.\end{cases}
$$

它将 $a$ 向零推近 $\lambda$；足够接近零时直接归零。多参数模型中，部分坐标归零不代表整个向量都归零。

## 分类损失与反向传播

Sigmoid $p=\sigma(z)=1/(1+e^{-z})$ 将实数映射到 $(0,1)$，其导数是 $p(1-p)$。对二分类交叉熵 $\ell=-y\log p-(1-y)\log(1-p)$，链式法则化简为

$$
\frac{d\ell}{dz}=p-y.
$$

对 softmax 和 one-hot 标签的交叉熵，同样有 $\nabla_z L=p-y$。若批量 logits 为 $Z=HW$，交叉熵按 $b$ 个样本取平均，并加入 $\frac\lambda2\|W\|_F^2$，则

$$
\nabla_W J=\frac1b H^\top(P-Y)+\lambda W.
$$

维度检查：$H\in\mathbb R^{b\times d}$，$P,Y\in\mathbb R^{b\times K}$，所以梯度与 $W$ 一样都是 $d\times K$。

## 梯度检查

对第 $i$ 个坐标，中心差分用两个函数值估算导数：

$$
(g_{\rm num})_i=\frac{f(w+\epsilon e_i)-f(w-\epsilon e_i)}{2\epsilon}.
$$

再与解析梯度或自动微分结果比较。$\epsilon$ 太大时截断误差明显，太小时浮点舍入可能占主导。检查时用小规模输入和双精度；关闭 dropout 或固定同一个掩码，并避免 ReLU 恰在零点等不可微位置。

损失是均值而梯度误用总和时，$b$ 个样本会产生约 $b$ 倍的偏差。梯度检查通常用于调试自定义求导实现，常规训练的自动微分不会自动逐次做数值检查；通过检查也不能证明模型整体正确。

