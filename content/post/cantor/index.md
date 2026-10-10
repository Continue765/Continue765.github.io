---
title: "浅谈康托展开"
slug: "cantor"
date: 2026-09-20
image: "cover.png"
categories:
  - 算法竞赛
tags:
  - 组合数学
math: true
toc: true
---

### 何为康托展开
把一个自然数展开成 **阶乘进制(factorial number system)** 的数位序列。即将任意 x ∈ ℕ 唯一地写成

$$
x = \sum_{i \geq 0} d_i \cdot i!, \qquad 0 \leq d_i \leq i
$$

那么我们就称 $(d_n,..., d_2, d_1, d_0)$ 为 $x$ 的 **康托展开(Cantor expansion)**。

例如：$463 = 3 × 5! + 4 × 4! + 1 × 3! + 0 × 2! + 1 × 1! + 0 × 0!$

则 $463$ 的康托展开为 $(341010)$

### Lehmer 码
设 $a = (a_1, a_2, \dots, a_n)$ 是 $\{1, 2, \dots, n\}$ 的一个排列。它的 **Lehmer 码(Lehmer Code)** 是一个序列

$$
c = (c_1, c_2, \dots, c_n)
$$

其中第 $i$ 位定义为：**排在 $a_i$ 右边、且比 $a_i$ 小的元素个数**，即

$$
c_i = \#\{\, j : j > i,\ a_j < a_i \,\}
$$

由于 $a_i$ 右边最多只有 $n-i$ 个元素，所以

$$
0 \leq c_i \leq n - i
$$

特别地，$c_n = 0$ 恒成立。合法 Lehmer 码的个数为

$$
n \cdot (n-1) \cdots 1 = n!
$$

正好等于排列总数，因此

$$
\text{排列} \longleftrightarrow \text{Lehmer 码}
$$

是一个**双射**。取值范围 $0 \leq c_i \leq n-i$ 恰好就是阶乘进制的数位约束，所以 Lehmer 码天然是阶乘进制的合法数位序列。


### 字典序的排名
将 $a = (a_1, a_2, \dots, a_n)$ 是 $\{1, 2, \dots, n\}$ 的 $n!$ 个排列全部列举出来，将它们按照字典序升序排列，则某一个排列在这个序列中的位次就是这个排列的排名。通过这种方式，每一个长度为 $n$ 的排列都可以被唯一表示。因此这种做法可以用来对排列相关的问题进行状态压缩。

而想要计算一个排列的排名，我们就可以利用上面的**康托展开**与**Lehmer 码**。

由前文我们可以得知，每个排列都有一个 Lehmer 码和它唯一对应，我们将这个 Lehmer 码**逆康托展开**，也就是把 Lehmer 码当作阶乘进制的数位求值，就能得到排列按字典序的排名：
$$
\operatorname{rank}(a) = \sum_{i=1}^{n} c_i \cdot (n-i)!
$$

所以三者的关系是：

$$
\text{排列} \xrightarrow{\ \text{取 Lehmer 码}\ } (c_1, \dots, c_n) \xrightarrow{\ \text{按阶乘进制求值}\ } \text{排名}
$$

### 实现

拿排列 $\rightarrow$ 排名的计算过程来举例子，首先我们需要得到 Lehmer 码。当然也可以 $O(n^2)$ 暴力，但是这种复杂度通常是不被接受的。因此我们还可以考虑利用树状数组来实现 $O(nlogn)$ 的计算方法:

```cpp
vector<int> toLehmer(vector<int>& p) {
    int n = p.size();
    Fenwick<int> fen(n);
    vector<int> c(n);
    for (int i = n - 1; i >= 0; i--) {
        c[i] = fen.sum(p[i]);
        fen.add(p[i], 1);
    }
    return c;
}
```

由此我们可以得到一个排列的 Lehmer 码，接下来就是通过阶乘进制来进行排名的计算了:

```cpp
i64 toRank(vector<int>& p) {
    int n = p.size();
    auto c = toLehmer(p);
    i64 fac = 1, rk = 0;
    for (int i = n - 1; i >= 0; i--) {
        rk += c[i] * fac;
        fac *= (n - i);
    }
    return rk;
}
```

同理我们可以得出通过排名来进行康托展开得到排列的方法:

```cpp
vector<int> fromRank(int n, i64 rk) {
    vector<int> c(n);
    for (int i = 1; i <= n; i++) {
        c[n - i] = rk % i;
        rk /= i;
    }
    return fromLehmer(c);
}
vector<int> fromLehmer(vector<int>& c) {
    int n = c.size();
    vector<int> p(n);
    Fenwick<AddMono<int>> fen(n);
    for (int i = 0; i < n; i++) {
        fen.add(i, 1);
    }
    for (int i = 0; i < n; i++) {
        p[i] = fen.kth(c[i]);
        fen.add(p[i], -1);
    }
    return p;
}
```