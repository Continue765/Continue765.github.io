---
title: "ABC433 D：183183"
slug: "abc433-d"
date: 2025-11-23
image: cover.jpg
categories:
    - 算法竞赛
tags:
    - AtCoder
    - 数论
draft: false
math: true
toc: false
comments: false
---

题目链接：[AtCoder ABC433 D](https://atcoder.jp/contests/abc433/tasks/abc433_d)

## Problem Statement

For positive integers $x,y$, define $f(x,y)$ as follows:

- The value obtained by interpreting $x,y$ in decimal notation without leading zeros as strings, concatenating them in this order to obtain a string $S$, and then interpreting $S$ as an integer in decimal notation.

For example, $f(12,3)=123$ and $f(100,40)=10040$.

You are given positive integers $N,M$ and a sequence of $N$ positive integers $A=(A_1,A_2,\ldots,A_N)$.

Find the number of pairs of integers $(i,j)$ that satisfy all of the following conditions.

- $1\le i,j\le N$
- $f(A_i,A_j)$ is a multiple of $M$.

## Constraints

- \(1\le N\le 2\times 10^5\)
- \(1\le M\le 10^9\)
- \(1\le A_i\le 10^9\)
- All input values are integers.

## Input

The input is given from Standard Input in the following format:

```text
N M
A_1 A_2 \ldots A_N
```

## Output

Output the number of pairs of integers $(i,j)$ that satisfy all the conditions.

## Sample Input 1

```text
2 11
2 42
```

## Sample Output 1

```text
2
```

- When $(i,j)=(1,1)$: $f(A_1,A_1)=22$ is a multiple of $11$.
- When $(i,j)=(1,2)$: $f(A_1,A_2)=242$ is a multiple of $11$.
- When $(i,j)=(2,1)$: $f(A_2,A_1)=422$ is not a multiple of $11$.
- When $(i,j)=(2,2)$: $f(A_2,A_2)=4242$ is not a multiple of $11$.

Therefore, the valid pairs are $(i,j)=(1,1)$ and $(i,j)=(1,2)$, so the answer is $2$.

## 分析

我们需要在数列 $A$ 中统计满足条件的有序数对 $(i,j)$：将 $A_i$ 和 $A_j$ 拼接后，所得的数是 $M$ 的倍数。

设 $A_j$ 有 $k$ 位，则拼接后的结果可以表示为

$$
f(A_i,A_j)=10^kA_i+A_j
$$

因此，$f(A_i,A_j)$ 能被 $M$ 整除，当且仅当

$$
A_j\equiv -10^kA_i\pmod M
$$

我们按照数字的位数维护数组 $g$。其中，$g[k]$ 保存所有位数为 $k$ 的数对 $M$ 取模后的结果，并将每个数组排序。

接着枚举每个 $A_i$。对于每一种可能的位数 $k$，计算目标余数

$$
(M-10^kA_i\bmod M)\bmod M
$$

然后在 $g[k]$ 中用二分查找统计等于该余数的元素个数，并累加到答案中。

## 代码

```cpp
#include <bits/stdc++.h>

using i64 = long long;

int main() {
  std::ios::sync_with_stdio(false);
  std::cin.tie(nullptr);

  int N, M;
  std::cin >> N >> M;
  std::vector<int> A(N), mod(N);
  for (int& v : A) std::cin >> v;
  std::vector<std::vector<int>> g(11);

  for (int v : A) g[std::to_string(v).size()].push_back(v % M);
  for (auto& gg : g) std::sort(gg.begin(), gg.end());

  i64 ans = 0;
  for (i64 Ai : A) {
    for (int k = 1; k < 11; k++) {
      Ai *= 10;
      Ai %= M;
      int key = (M - Ai) % M;
      ans += std::lower_bound(g[k].begin(), g[k].end(), key + 1) - std::lower_bound(g[k].begin(), g[k].end(), key);
    }
  }

  std::cout << ans << "\n";

  return 0;
}
```
