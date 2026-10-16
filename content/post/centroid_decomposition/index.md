---
title: "点分治"
slug: "centroid_decomposition"
date: 2026-10-16
categories:
  - 算法竞赛
tags:
  - 图论
  - 树上问题
math: true
toc: true
---
## 什么是点分治

**点分治(Centroid Decomposition)** 是树分治的一种，通常用于处理大规模的树上路径信息问题。

简单来讲，就是每次都选取当前连通块的分治中心，此时连通块中的路径可以分为两类：

1. 点对之间的路径经过分治中心的

2. 点对之间路径不经过分治中心的

此时我们只统计第一种路径的信息，第二种路径我们可以不用管，因为它在后面的递归过程中总会成为第一种路径的。接着我们删除该分治中心，使得当前连通块被分为多个连通块，接着找出剩余每个连通块的分治中心，然后再按照前面的策略递归地处理剩下的连通块。

## 分治中心的选取

我们该如何选取分治中心，使得递归的层数最小呢？通常我们会使用重心。

每个递归子问题的大小最多减半，所以一个点最多进入 $O(\log n)$ 个分治块。

从“每个点被处理几次”的角度，有：

$$
\sum_{\text{所有分治块 }T}|T|=O(n\log n).
$$

因此有：

| 大小为 $m$ 的块内处理耗时              | 常见总耗时上界 |
| -------------------------------------- | -------------- |
| $O(m)$                                 | $O(n\log n)$   |
| $O(m\log m)$，例如排序或逐点操作平衡树 | $O(n\log^2 n)$ |
| $O(qm)$，例如枚举 $q$ 个目标距离       | $O(qn\log n)$  |

如果每个重心都清空一个长度为全局 `n` 的数组，累计可能达到 $O(n^2)$。应当只清空实际访问的位置，或使用时间戳；局部离散化和容器大小也应与当前处理的信息量匹配。

<details>
<summary>我的点分治模板</summary>

借鉴了 $maspy$ 的回调函数的封装方法。该模板接受一颗树和一个回调函数 ```f```

```f(fa, vt, pos)```，局部编号 0 为重心，各分支占连续区间。
```fa[i]```: 局部编号```i```的父节点的局部编号
```vt[i]```: 局部编号```i```对应的原始编号
```pos[i]```: 局部编号```i```的子树的所有点在```vt```所占据的连续下标区间的左端点

```cpp
template <typename T, typename F>
void centroidDecompsition(const Tree<T>& tree, F&& f) {
    const auto& g = tree.g;
    vector<int> siz(tree.n), dead(tree.n), fa, vt, pos;
    auto collect = [&](int u, int p) {
        int l = vt.size();
        vt.push_back(u);
        fa.push_back(p);
        for (int i = l; i < int(vt.size()); i++) {
            int u = vt[i];
            for (auto [v, id] : g.adj[u]) {
                if (dead[v] || (fa[i] != -1 && v == vt[fa[i]])) {
                    continue;
                }
                vt.push_back(v);
                fa.push_back(i);
            }
        }
    };
    auto divide = [&](auto&& self, int u) -> void {
        vt.clear();
        fa.clear();
        collect(u, -1);
        int m = vt.size(), c = -1;
        for (int v : vt) {
            siz[v] = 1;
        }
        for (int i = m - 1; i >= 0; i--) {
            int v = vt[i];
            if (siz[v] >= (m + 1) / 2) {
                c = v;
                break;
            }
            siz[vt[fa[i]]] += siz[v];
        }
        dead[c] = true;
        vt = {c};
        fa = {-1};
        pos = {0, 1};
        for (auto [v, id] : g.adj[c]) {
            if (!dead[v]) {
                collect(v, 0);
                pos.push_back(vt.size());
            }
        }
        f(fa, vt, pos);
        for (auto [v, id] : g.adj[c]) {
            if (!dead[v]) {
                self(self, v);
            }
        }
    };
    divide(divide, tree.root);
}
```

</details>

## 为什么要用点分治

我们先来看道例题：[洛谷 P3806](https://www.luogu.com.cn/problem/P3806)

题意：给定一颗 $n$ 个点的树和 $m$ 次查询，每次查询询问树上是否存在距离为 $k$ 的点对。其中 $1 \le n \le 10^4$, $1 \le m \le 100$, $1 \le k \le 10^7$, $1 \le w \le 10^4$

首先我们看看如何暴力地去做：我们可以先预处理这颗树的 $LCA$ ，然后对于每次查询我们都 $O(n^2)$ 遍历所有点对，然后查询他们之间的距离是否为 $k$ 。总的复杂度为 $O(m \cdot n^2 \log n)$ ，显然会超时。

这个时候我们就可以来考虑点分治了。

对于第一种路径，我们先来 $dfs$ 整个连通块，预处理所有的点到重心的距离，定义 $d_i$ 为点 $i$ 到当前连通块的重心 $c$ 的距离。我们只需要统计当前连通块有多少处于 $c$ 的不同分支的点对 $i$ 和 $j$ ，满足 $i \lt j$ , $d_i + d_j = k$ 。（为什么要不同分支？因为同一分支的点对 $i$ 和 $j$ ，他们之间的路径不会经过 $c$）



如何统计：先开一个空桶，我们逐个处理重心 $c$ 的所有分支，对于每一个分支的每一个点 $i$ ，暴力所有的查询，看桶中是否存在 $k - d_i$ ，如果存在的话，那么距离为 $k$ 的点对就是存在的。在遍历完这个分支后，我们把这个分支的所有点加到桶里面，然后继续处理下一个分支。设当前连通块点的数量为 $s$ ，则时间复杂度为 $O(ms)$。

等我们处理完当前连通块之后，把当前的桶清空，然后去掉当前的重心，当前连通块就会被断成多个连通块。然后再按前面的策略去递归处理其他的连通块。

点分治的层数为 $log(n)$ ，每层的点数不超过 $n$ ，每个点要遍历所有的查询，总的复杂度为 $O(nm\log n)$ ，可以通过。

## 洛谷 P4178 Tree

[链接](https://www.luogu.com.cn/problem/P4178/)

题意：给定一颗 $n$ 个结点的树，每条边有边权，求出两点距离小于 $k$ 的点对数量。

同样还是点分治，我们只用考虑对于处理每个连通块的时候，如何统计经过重心的满足要求的路径数量。

如果做完上面的题目，我们可以容易想到：预处理所有点到当前连通块重心的的距离 $d_i$ ，然后统计不同分支的满足 $d_i + d_j \le k$ 的点对数量就好了。

我们该如何统计这种点对呢？这里提供一种基于容斥原理的方法：

首先我们先统计连通块内的***所有***满足 $d_i + d_j$, $i < j$ 的点对，此时会多统计了同一分支内的满足要求的点对。就如上题所说，这种点对是不合法的。他们的实际路径并不经过分治中心。

于是我们再去遍历每一个 $c$ 的分支，统计在当前分支连通块内满足要求的点对数，接着把 ***总点对数*** - ***分支点对数*** ，就能得到最终答案了。

而给定一个连通块，我们要如何统计连通块中满足要求的点对数量呢？双指针就行了：

```cpp
auto calc = [&](vector<int> dist) -> i64 {
    sort(dist.begin(), dist.end());
    int l = 0, r = int(dist.size()) - 1;
    i64 res = 0;
    while (l < r) {
        if (dist[l] + dist[r] <= k) {
            res += r - l;
            l++;
        } else {
            r--;
        }
    }
    return res;
};
```

### Code(部分)

```cpp
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    Graph<int, false> g(n);
    for (int i = 0; i < n - 1; i++) {
        int u, v;
        i64 w;
        cin >> u >> v >> w;
        u--, v--;
        g.add(u, v, w);
    }

    int k;
    cin >> k;

    Tree tree(g);

    i64 ans = 0;
    centroidDecompsition(tree, [&](vector<int>& fa, vector<int>& id, vector<int>& pos) {
        int m = id.size();
        vector<int> d(m);
        d[0] = 0;
        for (int i = 1; i < m; i++) {
            int u = id[i], v = id[fa[i]];
            int low = (tree.fa[u] == v ? u : v);
            d[i] = d[fa[i]] + g.edges[tree.pe[low]].w;
        }

        auto calc = [&](vector<int> dist) -> i64 {
            sort(dist.begin(), dist.end());
            int l = 0, r = int(dist.size()) - 1;
            i64 res = 0;
            while (l < r) {
                if (dist[l] + dist[r] <= k) {
                    res += r - l;
                    l++;
                } else {
                    r--;
                }
            }
            return res;
        };

        ans += calc(d);

        for (int b = 0; b < int(pos.size()) - 1; b++) {
            auto tmp = vector<int>(d.begin() + pos[b], d.begin() + pos[b + 1]);
            ans -= calc(tmp);
        }
    });

    cout << ans << "\n";

    return 0;
}

```
