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

