---
title: "QED2503J.黄袍加身非富贵"
slug: "qed2503-j"
date: 2026-02-26
image: cover.png
categories:
  - 算法竞赛
tags:
  - 区间DP
math: true
toc: true
comments: false
---
## 题意
给定一条 $x$ 轴，上面分布着 $n$ 个点，每个点具有三个属性：$x_i$ , $w_i$ , $v_i$ ，分别刻画了点的坐标，初始奖励值和奖励值每分钟的衰减速率。我们从原点出发，每分钟移动一个单位，在时间 $t_i$ 第一次访问目标点时会获得奖励：$bonus_i = w_i - v_i t_i$ 。我们需要在至少访问所有目标点一次的前提下，使得我们访问目标点时得到的奖励值总和 $\sum_{i=1}^n bonus_i$ 取得最大值。
## 思路
我们设第一次访问到第 $i$ 个点时我们的总时间 $t_i$ ，于是我们可以注意到：
$$
\sum_{i=1}^n bonus_i = \sum_{i=1}^n (w_i-v_i t_i)=\sum_{i=1}^n w_i - \sum_{i=1}^n v_i t_i
$$
$\sum_{i=1}^n w_i$ 是常数，因此问题等价于最小化惩罚值 $\sum v_i t_i$。

将点按 $x$ 坐标升序排序。在最优移动策略中，访问过的点在坐标轴上必然构成一个连续区间（因为来回跳跃只会增加未访问点的衰减时间）。因此，我们可以用**区间 DP** 来描述状态：设当前已经访问了区间 $[x_l, x_r]$ 内的所有点，且爱丽丝位于该区间的左端点 $x_l$ 或右端点 $x_r$。由于有两种情况，所以我们用两个 DP 数组来分别记录我们在这两点上时，当前惩罚值的最小值。

我们定义：
- $fl_{l, r}$ ：我们在区间 $[x_l, x_r]$ 的左端点上，此时的惩罚值最小值。
- $fr_{l r}$：我们在区间 $[x_l, x_r]$ 的右端点上，此时的惩罚值最小值。

接下来处理状态转移。例如，对于状态 $fl_{l, r}$ ，因为我们此时在区间左端点 $x_l$ ，所以我们有可能是从区间 $[x_{l + 1}, x_r]$ 的左端点向左转移而来，也就是 $fl_{l+1,r}$ ，也有可能是从区间 $[x_{l+1}, x_r]$ 的右端点向左转移而来，也就是 $fr_{l+1,r}$ 。那惩罚值怎么计算呢？可以发现我们**已经通过 $fl$ 和$fr$ 记录了先前两种状态的最小惩罚值了**，因此我们只需要累加上在转移过程中的新增惩罚值就行了，也就是用我们在转移过程中所花的时间，乘上未被覆盖的目标点的奖励值衰减速率总和（这一部分可以从过对起点和终点的坐标作差以及对每个目标点的奖励值衰减速率预处理一个前缀和来快速计算），我们把这段新增的从点 $x_i$ 到点 $x_j$ 的惩罚值简记为 $penalty_{i, j}$ 。
对于状态 $fr_{l,r}$ 也是同理。

最后我们就可以得出状态转移方程：
$$
\begin{align}
fl_{l,r} = \min(fl_{l+1,r}+penalty_{l,l+1},fr_{l+1,r}+penalty_{l,r}) \\
fr_{l,r} = \min(fl_{l,r-1}+penalty_{l,r},fr_{l,r-1}+penalty_{r-1,r})
\end{align}
$$
其中 $penalty_{i, j} = [\text{sumv} - (pre[r+1] - pre[l])] \times (x_j - x_i)$ ，（前缀和数组使用左闭右开区间，其中的 $l$ 和 $r$ 为已访问区间的左右端点下标）

我们从原点出发，但原点不一定恰好有点。为方便处理，我们在点集中添加一个原点 $(0, 0, 0)$ 表示起点。将该点与所有目标点一起排序，并令其所在下标 $pos$ 满足 $fl[pos][pos] = fr[pos][pos] = 0$，其余状态的初始值设为 $+\infty$。

最后我们得到的答案即为 $\text{ans} = \sum_{i=1}^n w_i - \min(fl[0][n-1], fr[0][n-1])$

## Code
```cpp
#include <bits/stdc++.h>

using i64 = long long;

constexpr i64 INF = 1E18;

struct Point {
    i64 x, w, v;
};

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n;
    std::cin >> n;

    std::vector<Point> a(n);
    for (int i = 0; i < n; i++) {
        std::cin >> a[i].x >> a[i].w >> a[i].v;
    }

    Point zero;
    zero.x = 0, zero.w = 0, zero.v = 0;
    a.push_back(zero);
    n++;

    std::sort(a.begin(), a.end(), [](Point& x, Point& y) {
        return x.x < y.x;
    });

    std::vector<i64> pre(n + 1);
    i64 sumv = 0, sumw = 0;
    for (int i = 0; i < n; i++) {
        pre[i + 1] = pre[i] + a[i].v;
        sumv += a[i].v;
        sumw += a[i].w;
    }

    std::vector fl(n, std::vector<i64>(n, INF));
    std::vector fr(n, std::vector<i64>(n, INF));

    for (int i = 0; i < n; i++) {
        auto v = a[i];
        if (v.x == 0 && v.w == 0 && v.v == 0) {
            fl[i][i] = 0;
            fr[i][i] = 0;
        }
    }

    for (int l = n - 2; l >= 0; l--) {
        for (int r = l + 1; r < n; r++) {
            i64 ldt1 = a[l + 1].x - a[l].x;
            i64 ldt2 = a[r].x - a[l].x;
            i64 ldv = sumv - (pre[r + 1] - pre[l + 1]);

            i64 rdt1 = a[r].x - a[r - 1].x;
            i64 rdt2 = a[r].x - a[l].x;
            i64 rdv = sumv - (pre[r] - pre[l]);

            fl[l][r] = std::min(fl[l + 1][r] + (ldt1 * ldv), fr[l + 1][r] + (ldt2 * ldv));
            fr[l][r] = std::min(fr[l][r - 1] + (rdt1 * rdv), fl[l][r - 1] + (rdt2 * rdv));
        }
    }

    i64 ans = sumw - std::min(fl[0][n - 1], fr[0][n - 1]);
    std::cout << ans << "\n";

    return 0;
}
```