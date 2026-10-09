---
title: "计算连通子图的边权和"
slug: "edge_sum_of_subgraph"
date: 2026-08-12
categories:
  - 算法竞赛
tags:
  - 图论
  - 树上问题
math: true
toc: true
---

在做圆方树相关例题的时候碰到了这个 trick (

-----

把点集里面的结点按照 $dfn$ 排序后，循环累加相邻两点的带权距离和，得到的就是边权和的两倍。

```cpp
int k;
cin >> k;

vector<int> S(k);
for (int i = 0; i < k; i++) {
    cin >> S[k];
    S[k]--;
}

sort(S.begin(), S.end(), [&](int& x, int& y) {
    return dfn[x] < dfn[y];
});

i64 sum = 0;
for (int i = 0; i < k; i++) {
    int u = S[i], v = S[(i + 1) % k];
    sum += w[u] + w[v] - 2 * w[lca.get(u, v)];
}

i64 ans = sum / 2;
```

 如果要计算的是连通子图的结点总数，我们可以把每个点给转化为其父边的边权，然后用以上方法统计边权和即可得到结点总数，若要被统计的结点正好是连通子图中深度最浅的结点，则要将 $sum$ 加二，即答案 $ans$ 加一。

```cpp
if (lca.get(S[0], S[k - 1]) < n) {
    sum += 2;
}
```