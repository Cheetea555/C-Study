# 🎓 考研四科学习中心（C-Study）

![零依赖](https://img.shields.io/badge/dependencies-zero-brightgreen) ![离线可用](https://img.shields.io/badge/works-offline-green) ![纯前端](https://img.shields.io/badge/tech-原生HTML·CSS·JS-blue) [![CI](https://github.com/Cheetea555/C-Study/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/Cheetea555/C-Study/actions/workflows/ci.yml) ![爱发电](https://img.shields.io/badge/支持-爱发电-946ce6)

一套为考研初试（**数学二 / 408 / 英语二 / 政治**）自建的一站式本地学习应用：四个科目各是一个独立单页应用，共用同一套自研学习引擎——分阶段计划、教学中心、内置题库、艾宾浩斯错题本、速查卡手册、真题成绩曲线、学习计时与统计诊断。

**零依赖、零构建、离线可用**：纯原生 HTML/CSS/JS，无需安装、无需联网，clone 下来双击 HTML 即用；全部数据保存在浏览器本地。

<p align="center">
  <img src="docs/screenshots/portal-workspace.jpg" width="880" alt="四科学习工作台总览">
</p>
<p align="center">
  <img src="docs/screenshots/math2-workspace.jpg" width="880" alt="数学二 · 今日概览">
</p>

## 🚀 快速开始

**在线使用**（无需下载）：

👉 **https://cheetea555.github.io/C-Study/**

**本地使用**：

```bash
git clone https://github.com/Cheetea555/C-Study.git
```

或直接下载 ZIP 解压。然后：

1. 双击根目录 **`index.html`** —— 四科总览导航页（可直接当浏览器起始页）；
2. 也可以直接双击任意一科的 `index.html` 进入该科应用（推荐 Chrome / Edge）；
3. 在各科「设置与数据」中确认考试日期、每日目标与目标分数，开始使用。

没有安装步骤、没有构建步骤、不需要网络。

> 📌 在线版与本地版的数据分别保存在各自浏览器的 localStorage 中，互不相通；无论哪种方式，都请养成每周导出备份的习惯（见[数据与备份](#-数据与备份)）。

新版界面提供桌面侧栏、手机底部导航、首页继续学习、课程搜索与定位、题目重新作答、逐题错题复习和跨页面计时。界面与验收说明见 [前端体验说明](docs/frontend-ux.md)。

本轮改进增加四科数据保护、固定考点 ID、逐次作答记录，以及 408「线性表」的考点专项练习和返回讲解。实施范围与验收见 [首批改进记录](docs/implementation-progress.md)。

第二批增加 [四科统一搜索](search.html)，可查课程正文、考点、题干与解析、速查卡，并定位到对应内容。实现与验收见 [统一搜索实施记录](docs/search-implementation.md)。

第四批增加 [四科全局时间计划](plan.html)：按工作日、周末、休息日与科目权重，在同一预算内优先安排到期复习，再安排课程和练习。实际用时需归档计时或补记。跨科读取建议使用同一 HTTP 站点；使用说明、数据边界与验收见 [全局计划实施记录](docs/planner-implementation.md)。

第五批将考点专项练习、解析回看和错题补课入口扩展到四科，累计关联 5 章的 28 道题、26 个考点；所有 420 个考点均可回看关联课程。未关联专项题的考点会明确提示。实现与验收见 [四科内容关联实施记录](docs/content-linking-implementation.md)，逐章缺口见 [内容关联覆盖报告](docs/content-coverage.md)。

第六批增加 [四科备份与恢复](backup.html)：汇总四科学习记录及全局预算、收集单科文件、预览并选择恢复项目，保留覆盖前原文，失败时回滚并标明冲突。文件模式可收集和拆分下载，统一恢复使用同源 HTTP 页面。使用方法与验证边界见 [完整备份实施记录](docs/backup-implementation.md)。

第七批增加 [408 页面置换演示](algorithms.html)：FIFO / LRU 可先预测再揭示，支持自定义序列、回退与重置，从课程、考点和解析进入。同步核对相关讲解；明确的题目关联累计为 6 章、29 题、27 个考点。实现与验收见 [分步演示实施记录](docs/replacement-implementation.md)。

## ✨ 共同引擎（四科同源）

| 能力 | 说明 |
|---|---|
| 全局时间计划 | 统一四科可用时间与机动留白，扣除当天日志和未归档计时，先复习再安排新课；未完成内容按最新进度重排 |
| 分阶段计划 | 按「今天 → 考试日」自动划分 **基础 35% / 强化 35% / 真题 20% / 冲刺 10%**，章节窗口按考点数加权；修改考试日期自动重排，不影响学习记录 |
| 教学中心 | 每课 = 学习目标 + 概念与方法（讲「为什么」）+ 可先自做的例题 + 常见错误；一键「学完本课」自动标记考点，一键「做配套练习」只刷本课相关题 |
| 考点与练习关联 | 知识地图回看课程、按明确考点选题、解析和错题返回讲解；尚无专项题的考点显示缺口 |
| 内置题库 | 选择 / 填空 / 解答，即时判分 + 详细解析；做错自动进错题本 |
| 艾宾浩斯错题本 | 手动录入 + 自动录入；**自动记录所选错项并保存选项快照**（详情里正确项标绿、错选标红），按 1/2/4/7/15/30 天安排复习队列 |
| 速查卡手册 | 高频结论 / 公式 / 句型卡，支持分类、搜索、☆ 收藏与**默写模式**（遮住内容先默写再核对） |
| 真题卷与统计 | 成绩录入 + 走势图 + 目标分参考线；学习计时、连续打卡、章节投入、已确认错误原因分布 |
| 数据本地化 | 各科独立 localStorage 存储，互不影响；JSON 备份导出 / 导入迁移 |
| 四科备份与恢复 | 汇总四科与全局计划、显示缺失项、分别收集或拆分文件，按项目恢复，保留原文并支持回滚 |

## 📚 四科内容一览

全部内容内置、离线可用（合计 **65 章 · 420 考点 · 156 课 · 368 题 · 256 张速查卡**）。

| 科目 | 目录 | 知识体系 | 教学 | 题库 | 速查卡 | 满分 / 默认目标 |
|---|---|---|---|---|---|---|
| 📐 [数学二](kaoyan-math2/README.md) | `kaoyan-math2/` | 15 章 · 142 考点（高数 9 + 线代 6） | 53 课 · 109 例题 | 150 题 | 105 条公式 | 150 / 120 |
| 💻 [408](kaoyan-408/README.md) | `kaoyan-408/` | 26 章 · 165 考点（数据结构 / 组成原理 / 操作系统 / 网络） | 55 课 · 110 例题 | 130 题 | 77 张 | 150 / 100 |
| ✍️ [英语二](kaoyan-en2/README.md) | `kaoyan-en2/` | 8 章 · 40 考点（词汇 / 长难句 / 五大题型） | 16 课 · 32 例题 | 40 题 | 39 张 | 100 / 70 |
| 🚩 [政治](kaoyan-politics/README.md) | `kaoyan-politics/` | 16 章 · 73 考点（马原 / 毛中特 / 史纲 / 思修法治 / 时政） | 32 课 · 50 例题 | 48 题 | 35 张 | 100 / 70 |

各科的内容细节、复习建议与数据文件说明，见各科目录下的 README。

## 📁 目录结构

```
C-Study/
├── index.html              # 四科总览导航页（双击打开 / Pages 入口）
├── backup.html             # 四科备份、文件收集与选择性恢复
├── plan.html               # 四科全局时间预算与今日任务
├── search.html             # 四科统一搜索与精确定位
├── algorithms.html         # 408 页面置换分步演示与预测
├── assets/                 # 四科共用样式、导航与学习体验；全部资源本地加载
├── tests/workspace.test.js # 新界面交互与总览统计的回归测试
├── kaoyan-math2/           # 考研数学二 · 学习中心
├── kaoyan-408/             # 考研 408 · 学习中心
├── kaoyan-en2/             # 考研英语二 · 学习中心
└── kaoyan-politics/        # 考研政治 · 学习中心
```

四个科目目录的结构完全一致：

```
kaoyan-<科目>/
├── index.html          # 单页应用骨架
├── app.js              # 学习引擎与全部交互逻辑
├── data-notes.js       # 章节详解（考频 / 方法 / 易错）
├── data-lessons*.js    # 教学中心课程数据
├── data-q*.js          # 习题库数据
├── data-formulas.js    # 速查卡 / 公式手册数据
└── test*.js            # Node 测试脚本（无需测试框架）
```

## 🛠️ 开发

### 技术选型

- 纯原生 HTML/CSS/JS，**无任何外部依赖**（无框架、无 CDN、无构建工具）。这是刻意的设计：任何电脑上 clone 下来双击就能用，复习环境不受网络与工具链影响；
- 数学式排版用自研轻量标记在页面内渲染（分数上下叠放、矩阵带括号、行列式带竖线），不引入 MathJax / KaTeX；
- 数据持久化用 localStorage（各科独立键），备份格式为 JSON。

### 跑测试

每科自带 5 个测试脚本（纯 Node，无依赖）：

```powershell
cd kaoyan-math2            # 或其他任一科目目录
Get-ChildItem *.js | ForEach-Object { node --check $_.FullName } # 逐文件语法校验
node test.js               # 引擎纯函数：日期 / 计划生成 / 复习调度 / 打卡
node test-data.js          # 题库结构与章节覆盖
node test-lessons.js       # 课程结构 / 例题 / 配套题引用
node test-formulas.js      # 速查卡结构与排版可解析
node test-mistake.js       # 错题自动记录：快照 / 去重 / 旧数据兼容 / 持久化
```

四科 × 5 = 20 个测试，当前全部通过；CI 会在每次 push 时自动运行全部测试（见顶部徽章）。**改动任何数据文件后，请运行对应测试自动校验。**

在仓库根目录运行 `node tests/workspace.test.js`，额外验证四科的重新作答、筛选题集稳定、自评去重、存储异常反馈，以及总览数据与课程题库的一致性。该测试也已接入 CI。

另外运行 `node tests/storage.test.js` 和 `node tests/content.test.js`，验证异常记录保护、备份校验、恢复与失败回滚、多页冲突、旧考点迁移、课程覆盖和逐次作答。运行 `node tests/search.test.js` 验证四科搜索召回、排序、深链接和索引一致性。运行 `node tests/review.test.js` 验证复发调度、明确归因、同日防连评和保存失败回滚。运行 `node tests/planner.test.js` 验证全局预算、休息日、进度识别、限定复习与设置保护。运行 `node tests/coverage.test.js` 验证明确的考点引用、课程配套题匹配与覆盖报告。运行 `node tests/backup.test.js` 验证四科备份、文件收集与拆分、选择性恢复、中断回滚和文件模式边界。运行 `node tests/replacement.test.js` 验证 FIFO / LRU 算法与分步预测流程。四科原有 20 个脚本与根目录 9 个脚本合计 29 个，均已接入 CI。

四科 HTML 共用 `assets/study.css`；`assets/workspace.js` 负责导航、课程定位、逐题复习和计时条，`assets/common.js` 负责科目信息和汇总计算，`assets/portal.js` 负责总览呈现。修改公共界面时请检查四科，而不仅是一科。

`assets/review.js` 共用复习调度、复发记录和明确归因，详见 [第三批实施说明](docs/review-implementation.md)。

`assets/storage.js` 共用记录校验、旧进度迁移和备份恢复；`assets/content.js` 提供内容反向索引、关联入口渲染与深链接解析。大纲考点现为 `{ id, legacyKey, title }`，课程和已明确关联的题目使用 `pointIds` 引用；重排或改名时保持 `id` 和 `legacyKey` 不变，新考点使用新 ID，不能重新生成旧 ID。已标注题目的课程配套引用须与课程考点存在交集。

修改考点、课程或题目关联后，运行 `node scripts/build-content-coverage.js` 更新 [覆盖报告](docs/content-coverage.md)；CI 使用 `node scripts/build-content-coverage.js --check` 检查引用完整性及报告一致性。报告只统计显式关联，不按章节推断，也不代表内容独立审校结果。

`assets/search.js` 提供搜索与别名规则，`assets/search-page.js` 渲染结果。修改大纲、课程、题库或速查卡后，运行 `node scripts/build-search-index.js` 更新提交的 `assets/search-index.js`；CI 使用 `node scripts/build-search-index.js --check` 阻止索引落后于内容。最终用户无需运行生成器。

`assets/planner.js` 提供跨科排程与独立设置存储，`assets/planner-page.js` 渲染预算和任务。修改课程顺序、时长、配套题引用或应用默认值后，运行 `node scripts/build-plan-catalog.js` 更新 `assets/plan-catalog.js`；CI 使用 `--check` 检查一致性。详见 [第四批实施说明](docs/planner-implementation.md)。

`assets/backup.js` 复用单科和全局设置校验，提供完整备份、文件收集与拆分、恢复预览、原文保留和冲突检测；`assets/backup-page.js` 负责交互。多键恢复不具备原子事务保证，结果与限制见 [第六批实施说明](docs/backup-implementation.md)。

### 加内容

所有内容都在 `data-*.js` 数据文件里，字段格式见各科 README 的「开发者说明」：

| 想加什么 | 改哪里 |
|---|---|
| 题目 | `data-q*.js` |
| 课程 | `data-lessons*.js` |
| 速查卡 / 公式 | `data-formulas.js` |
| 章节详解 | `data-notes.js` |

## 💾 数据与备份

- 所有学习记录保存在**当前浏览器**的 localStorage，各科独立键：`kaoyan-math2.v1` / `kaoyan-408.v1` / `kaoyan-en2.v1` / `kaoyan-pol.v1`。换浏览器、换电脑数据不会自动跟走；
- 全局计划设置单独存于 `c-study.planner.v1`，在计划页备份和恢复；不包含在各科备份中，也不覆盖各科日目标或章节日期。
- [四科备份页](backup.html) 可在同源环境汇总四科及全局计划，列出缺失或异常项，也可收集已有文件并拆分下载。统一恢复替换勾选项目，先保存原文，失败时尝试回滚并报告逐项结果；恢复后重新打开相关科目页。
- `file://` 下只进行收集、下载与拆分；统一恢复需同源 HTTP 页面。继续双击使用时，把拆分文件导入对应科目。备份页只读取已保存记录，不会把缺失科目补成空白默认值。
- ⚠️ **请养成每周备份的习惯**：各科「设置与数据 → 数据备份」导出 JSON；清理浏览器缓存前务必先导出；新设备用「导入备份」迁移。
- 新备份包含科目和格式版本，导错科目时会拒绝。旧备份仍可导入；若旧文件没有足够信息识别科目，会要求确认归属。
- 记录损坏、版本不支持或另一页面已更新时，会暂停写入并保留浏览器原文。「设置与数据 → 数据恢复」可导出当前记录、下载原文和覆盖前记录、恢复有效快照、重新读取或重试保存。重新读取前请先导出页面尚未保存的修改。
- 浏览器内的快照和覆盖前记录仍会随站点数据清理而丢失，不能替代下载到本机的备份。跨标签页冲突检测也不提供严格的并发事务保证。

## ℹ️ 其他说明

- 默认考试日期 **2026-12-19**（2026 年 12 月初试、官方编号 2027 考研的预计时间，以研招网正式通知为准），各科均可在「设置与数据」中修改，计划自动重排；
- 本项目为个人备考自建工具，仅供学习交流；
- 许可（双轨）：**代码**（`index.html` / `app.js` / `test*.js` 及工程逻辑）以 [MIT License](LICENSE) 开源；`data-*.js` 中的**题目、章节详解、速查卡等学习内容**采用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.zh)（署名 + 非商业使用），未经授权不得用于商业用途。

## ☕ 支持作者

本项目用业余时间开发与维护，公开仓库永久免费。如果它对你的备考有帮助，欢迎到爱发电请作者喝杯咖啡：

👉 **[爱发电 · Cheetea555](https://afdian.com/a/Cheetea555)**

## 💎 增值内容（付费）

以下持续劳动产出的年度增量内容**单独分发、不入本仓库**，本仓库的引擎与基础内容永远保持免费可用：

- 🚩 **政治年度时政卡**：每年 10~11 月更新的当年热点全套；
- 📝 冲刺模拟卷 / 扩展题库 / 作文模板包（按需陆续推出，见爱发电主页）。

---

<p align="center">祝上岸 🎉</p>
