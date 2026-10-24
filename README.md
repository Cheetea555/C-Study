# 🎓 C-Study · 考研四科学习中心

[![CI](https://github.com/Cheetea555/C-Study/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/Cheetea555/C-Study/actions/workflows/ci.yml) ![原生前端](https://img.shields.io/badge/HTML%20%2F%20CSS%20%2F%20JS-原生-blue) ![无需构建](https://img.shields.io/badge/构建-无需-brightgreen) ![本地存储](https://img.shields.io/badge/数据-浏览器本地-purple)

面向 **数学二、计算机 408、英语二、思想政治** 的个人备考工具。把课程、考点、练习、错题复习和每日计划放在一起，让学习与回顾有迹可循。

**[在线使用](https://cheetea555.github.io/C-Study/)** · [快速开始](#-快速开始) · [功能介绍](#-可以做什么) · [数据与备份](#-数据与备份) · [开发说明](#-开发)

<p align="center">
  <img src="docs/screenshots/portal-workspace.jpg" width="880" alt="C-Study 四科学习总览">
</p>

## ✨ 可以做什么

| 功能 | 使用方式 |
|---|---|
| 四科学习工作台 | 查看今日时长、待复习错题和课程进度，继续上次学习；适配桌面侧栏与手机导航 |
| 课程与考点 | 阅读概念、方法和例题，先自做再核对；从考点回看课程，学完后更新进度 |
| 练习与解析 | 章节练习、课程配套题与已关联考点专项练习；提交后查看解析，支持重新作答和返回讲解 |
| 错题与复习 | 答错自动入本，也可手动录入；保存错选与解析快照，按间隔安排复习，保留复发记录并确认错因 |
| 四科统一搜索 | 检索考点、课程正文、题目与解析、速查卡，按科目和类型筛选并定位到内容 |
| 时间与计划 | 按工作日、周末、休息日和科目权重设置总预算，优先安排到期复习；计时或补记后统计投入 |
| 速查与默写 | 分类查询公式、结论和句型，收藏常用卡片，遮住内容进行自测 |
| 成绩与统计 | 手动录入套卷成绩，查看走势、作答表现和学习时长 |
| 页面置换演示 | 在 408 的 FIFO / LRU 演示中先预测再揭示，支持自定义访问序列、回退与重置 |
| 备份与迁移 | 导出单科或四科备份，预览并选择恢复范围，支持文件收集、拆分与恢复回滚 |

建议从「今日任务 → 学习课程 → 配套练习 → 错题复习 → 返回讲解」开始。尚无专项题关联的考点会显示提示，仍可使用章节练习。

## 📚 内置内容

合计 **65 章 · 420 个考点 · 156 节课程 · 368 道练习 · 256 张速查卡**，内容随仓库提供。

| 科目 | 章节 | 考点 | 课程 | 练习 | 速查卡 |
|---|---:|---:|---:|---:|---:|
| [数学二](kaoyan-math2/README.md) | 15 | 142 | 53 | 150 | 105 |
| [计算机 408](kaoyan-408/README.md) | 26 | 165 | 55 | 130 | 77 |
| [英语二](kaoyan-en2/README.md) | 8 | 40 | 16 | 40 | 39 |
| [思想政治](kaoyan-politics/README.md) | 16 | 73 | 32 | 48 | 35 |

各科 README 提供内容细节与复习建议。套卷功能用于记录成绩；内置练习与真题套卷成绩分别管理。

## 🚀 快速开始

### 在线使用

打开 **[C-Study 在线学习中心](https://cheetea555.github.io/C-Study/)**，选择科目即可使用，无需注册。

首次进入各科「设置与数据」，确认考试日期、目标分数与每日目标；在「四科时间计划」设置总的可用时间。

### 本地使用

下载仓库 ZIP 并解压，或使用 Git：

```bash
git clone https://github.com/Cheetea555/C-Study.git
cd C-Study
```

保留完整目录结构，双击根目录 `index.html`，也可进入任一科目的 `index.html`。应用使用原生 HTML / CSS / JavaScript，本地内容无需安装依赖、构建或联网。

**需要汇总四科记录或统一恢复时，建议使用本地 HTTP 服务。** 已安装 Python 的用户可在仓库根目录运行：

```bash
python -m http.server 8080 --bind 127.0.0.1
```

然后打开 [本地学习中心](http://127.0.0.1:8080/)。双击文件时，浏览器可能隔离不同页面的存储；四科备份页在此模式下支持收集与拆分文件，统一恢复需使用同源 HTTP 页面。

<p align="center">
  <img src="docs/screenshots/math2-workspace.jpg" width="880" alt="数学二课程、计划与学习计时工作台">
</p>

<details>
<summary>查看手机界面</summary>

<p align="center">
  <img src="docs/screenshots/math2-mobile.jpg" width="320" alt="手机端今日学习与底部导航">
</p>

</details>

## 💾 数据与备份

学习记录保存在**当前浏览器的本地存储**，没有账号同步。换设备、换浏览器，或切换在线站点与本地地址，都需要导出、导入备份；即使在同一台电脑上，不同协议、主机或端口的记录也可能独立。

- **日常备份**：每周在各科「设置与数据」导出 JSON；清除站点数据、重装浏览器或换设备前先备份。
- **完整迁移**：同源 HTTP 环境下，从总览进入「四科备份与恢复」，一起导出四科学习记录与全局计划设置。导出前检查是否有缺失或异常项目。
- **选择性恢复**：导入后先预览，再勾选需要恢复的科目或全局设置；会替换勾选项目，恢复后重新打开相关科目页。
- **本地文件迁移**：可收集多个单科备份，或拆分完整备份后，到各科「设置与数据」分别导入。
- **异常恢复**：记录损坏、版本不支持或其他页面更新时，会暂停相关写入并提供原文下载、恢复或重新读取入口。重新读取前先导出尚未保存的修改。

浏览器内的恢复副本会随站点数据清理而丢失，不能代替文件备份。统一恢复提供原文保留和失败回滚，但不具备跨键原子事务保证；恢复时请关闭其他正在编辑的页面。

## 🛠️ 开发

无需构建工具，运行测试和内容生成脚本需要 **Node.js 20 或更高版本**。应用脚本与测试均无第三方包依赖。

```text
C-Study/
├── index.html             # 四科总览
├── search.html            # 统一搜索
├── plan.html              # 全局时间计划
├── backup.html            # 四科备份与恢复
├── algorithms.html        # 页面置换演示
├── assets/                # 公共样式、交互、存储与生成索引
├── kaoyan-math2/           # 数学二：页面、引擎、数据、测试
├── kaoyan-408/             # 计算机 408
├── kaoyan-en2/             # 英语二
├── kaoyan-politics/        # 思想政治
├── scripts/               # 内容索引与覆盖报告生成
└── tests/                 # 公共功能回归测试
```

科目目录依赖根目录 `assets/`，复制和部署时请保留完整结构。修改公共模块后应检查四科。

### 运行检查

在仓库根目录使用 PowerShell 运行全部科目与公共测试：

```powershell
Get-ChildItem -Path 'kaoyan-*/test*.js', 'tests/*.test.js' | ForEach-Object {
    Push-Location $_.DirectoryName
    try {
        node $_.Name
        if ($LASTEXITCODE -ne 0) { throw "测试失败：$($_.FullName)" }
    } finally { Pop-Location }
}
```

CI 逐文件检查 JavaScript 语法、运行测试，并检查生成文件是否与内容一致，详见 [CI 配置](.github/workflows/ci.yml)。

### 修改内容

| 内容 | 科目目录内的文件 |
|---|---|
| 章节详解 | `data-notes.js` |
| 课程与例题 | `data-lessons*.js` |
| 题目与解析 | `data-q*.js` |
| 公式与速查卡 | `data-formulas.js` |

修改考点、大纲、课程或题库后，按需运行以下生成器，并提交更新后的产物：

```bash
node scripts/build-search-index.js
node scripts/build-plan-catalog.js
node scripts/build-content-coverage.js
```

考点的 `id` 和旧记录映射 `legacyKey` 应保持稳定，课程与题目通过 `pointIds` 关联。逐章关联情况见自动生成的 [内容覆盖报告](docs/content-coverage.md)；覆盖表示存在明确关联，不代表内容已独立审校或学习者已经掌握。

## 📄 许可与支持

本项目为个人备考工具，仅供学习交流。使用前请确认考试日期与各科设置，学习内容以适用年度的考试要求为准。

- **代码与工程逻辑**：采用 [MIT License](LICENSE)。
- **`data-*.js` 中的学习内容**：采用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.zh)，需署名并限非商业使用。

公开仓库的引擎与基础内容免费使用。欢迎通过 **[爱发电 · Cheetea555](https://afdian.com/a/Cheetea555)** 支持维护；年度时政卡、扩展题库等增量内容的单独分发安排以主页说明为准。
