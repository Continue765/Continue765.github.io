---
title: "2026牛客多校第8场 K"
slug: "NC_summer_7_K"
date: 2026-08-13
categories:
  - 算法竞赛
tags:
  - 图论
  - 网络流
math: true
toc: true
---

## 题意

有两棵以 $1$ 为根的有根树，分别有 $a$ 和 $b$ 个顶点，每个顶点有容量上限。有 $n$ 个物品，第 $i$ 个物品有美丽值，并且在第一棵树中位于顶点 $x_i$，在第二棵树中位于顶点 $y_i$。选择一个物品会占用两棵树中从对应顶点到根路径上所有节点的容量。要求恰好选择 $k$ 个物品，且两棵树每个节点的容量限制都不能被超过，求所选物品美丽值总和的最大值。

## 建模

看到有题目具有容量上限和价值最大两个要求，于是考虑想到将题目建模为费用流：

对于每一个饰品 $i$ ，我们连一条从  $x_i$ 指向 $y_i$ ，容量为 $1$ ，费用为 $-w_i$ 的有向边。容量为 $1$ 保证每个饰品只能被选择一次，费用取负用于把取最大值给转化成求最小费用。

接着我们以一棵树的根为源点，另外一颗树的根为汇点进行建模，对于树上的边，我们可以将每个结点的容量转化为树边的容量，建一条容量为 $c_i$，费用为 $0$ 的边。

跑费用流时，若我们最终得到的最大流无法达到 $k$ ，则题目无解。

## 势能初始化

饰品边的费用为负，不能直接使用 Dijkstra。引入势能 $h$，将边权改为：

$$
c'(u,v)=c(u,v)+h(u)-h(v)
$$

令 $W=\max_i w_i$，源点和第一棵树的势能设为 $0$，第二棵树和汇点的势能设为 $-W$。

这样，树边的新费用均为 $0$，饰品边的新费用为：

$$
-w_i+0-(-W)=W-w_i\ge0
$$

因此所有初始有容量的边的新费用都非负，可以使用 Dijkstra。每轮最短路后，对可达点更新 $h(v)\leftarrow h(v)+dist(v)$，即可继续增广。

## Code

```cpp
#include <bits/stdc++.h>

using namespace std;

using i64 = int64_t;

constexpr i64 inf = 1e18;

template <typename T>
struct MinCostFlow {
    struct Edge_ {
        int to;
        T cap;
        T cost;
        Edge_(int to_, T cap_, T cost_) : to(to_), cap(cap_), cost(cost_) {}
    };

    int n;
    vector<Edge_> e;
    vector<vector<int>> adj;
    vector<T> h, dist;
    vector<int> pre;

    bool dijkstra(int s, int t) {
        dist.assign(n, inf);
        pre.assign(n, -1);
        priority_queue<pair<T, int>, vector<pair<T, int>>, greater<pair<T, int>>> que;
        dist[s] = 0;
        que.emplace(0, s);
        while (!que.empty()) {
            auto [d, u] = que.top();
            que.pop();
            if (dist[u] != d) {
                continue;
            }
            for (auto& i : adj[u]) {
                int v = e[i].to;
                if (e[i].cap > 0 && dist[v] > d + h[u] - h[v] + e[i].cost) {
                    dist[v] = d + h[u] - h[v] + e[i].cost;
                    pre[v] = i;
                    que.emplace(dist[v], v);
                }
            }
        }
        return dist[t] != inf;
    }

    MinCostFlow() {}
    MinCostFlow(int n_) {
        init(n_);
    }

    void init(int n_) {
        n = n_;
        e.clear();
        adj.assign(n, {});
        h.assign(n, {});
    }

    void addEdge(int u, int v, T cap, T cost) {
        adj[u].push_back(e.size());
        e.emplace_back(v, cap, cost);
        adj[v].push_back(e.size());
        e.emplace_back(u, 0, -cost);
    }

    void set(const vector<T>& potential) {
        h = potential;
    }

    pair<T, T> flow(int s, int t, T need = inf) {
        T flow = 0;
        T cost = 0;
        while (flow < need && dijkstra(s, t)) {
            for (int i = 0; i < n; i++) {
                if (dist[i] != inf) {
                    h[i] += dist[i];
                }
            }
            T aug = need - flow;
            for (int i = t; i != s; i = e[pre[i] ^ 1].to) {
                aug = min(aug, e[pre[i]].cap);
            }
            for (int i = t; i != s; i = e[pre[i] ^ 1].to) {
                e[pre[i]].cap -= aug;
                e[pre[i] ^ 1].cap += aug;
            }
            flow += aug;
            cost += aug * h[t];
        }
        return {flow, cost};
    }

    struct Edge {
        int from;
        int to;
        T cap;
        T cost;
        T flow;
    };

    vector<Edge> edges() {
        vector<Edge> a;
        for (int i = 0; i < e.size(); i += 2) {
            Edge x;
            x.from = e[i + 1].to;
            x.to = e[i].to;
            x.cap = e[i].cap + e[i + 1].cap;
            x.cost = e[i].cost;
            x.flow = e[i + 1].cap;
            a.push_back(x);
        }
        return a;
    }
};

void solve() {
    int n, a, b, k;
    cin >> n >> a >> b >> k;

    int S = 0, A = 1, B = A + a, T = B + b;
    MinCostFlow<i64> mcf(T + 1);

    for (int i = 0; i < a; i++) {
        int p, c;
        cin >> p >> c;
        p--;
        int from = (i == 0 ? S : A + p);
        int to = A + i;
        mcf.addEdge(from, to, c, 0);
    }
    for (int i = 0; i < b; i++) {
        int p, c;
        cin >> p >> c;
        p--;
        int from = B + i;
        int to = (i == 0 ? T : B + p);
        mcf.addEdge(from, to, c, 0);
    }

    i64 maxW = 0;
    for (int i = 0; i < n; i++) {
        int x, y;
        i64 w;
        cin >> x >> y >> w;
        x--, y--;
        maxW = max(maxW, w);
        mcf.addEdge(A + x, B + y, 1, -w);
    }

    vector<i64> p(T + 1, 0);
    fill(p.begin() + B, p.end(), -maxW);

    mcf.set(p);
    auto [flow, cost] = mcf.flow(S, T, k);
    cout << (flow == k ? -cost : -1) << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T;
    cin >> T;

    while (T--) {
        solve();
    }

    return 0;
}
```



