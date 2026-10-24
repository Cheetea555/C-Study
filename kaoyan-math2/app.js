'use strict';
/* =====================================================================
   考研数学二 · 学习中心 —— 纯前端单页应用
   数据全部保存在浏览器 localStorage，离线可用，无任何外部依赖。
   纯函数部分可在 Node 中独立测试（见 test.js）。
   ===================================================================== */

/* ---------------- 日期工具（纯函数） ---------------- */
function pad2(n){ return (n < 10 ? '0' : '') + n; }
function fmtDate(d){ return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function parseDate(s){ const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function todayStr(){ return fmtDate(new Date()); }
function addDays(s, n){ const d = parseDate(s); d.setDate(d.getDate() + n); return fmtDate(d); }
function diffDays(a, b){ return Math.round((parseDate(b) - parseDate(a)) / 86400000); }

/* ---------------- 业务常量（纯数据） ---------------- */
const REVIEW_STEPS = reviewEngine().STEPS; // 艾宾浩斯复习间隔（天）
const REASONS = ['未归因', '概念不清', '思路方法', '计算失误', '审题粗心'];
const KP_STATUS = ['未开始', '学习中', '需复习', '已掌握'];

/* 数学二考试范围：高等数学 + 线性代数（不含概率统计） */
const SYLLABUS = [
  { id: "c01", subject: "高等数学", name: "第一章 函数、极限、连续", points: [
    { id: "math2.c01.p01", legacyKey: "c01-0", title: "函数的概念与特性（有界、单调、奇偶、周期）" },
    { id: "math2.c01.p02", legacyKey: "c01-1", title: "复合函数与反函数" },
    { id: "math2.c01.p03", legacyKey: "c01-2", title: "基本初等函数与初等函数" },
    { id: "math2.c01.p04", legacyKey: "c01-3", title: "数列极限的定义与性质" },
    { id: "math2.c01.p05", legacyKey: "c01-4", title: "函数极限的定义与性质" },
    { id: "math2.c01.p06", legacyKey: "c01-5", title: "无穷小与无穷大的概念及关系" },
    { id: "math2.c01.p07", legacyKey: "c01-6", title: "极限四则运算法则" },
    { id: "math2.c01.p08", legacyKey: "c01-7", title: "两个重要极限及应用" },
    { id: "math2.c01.p09", legacyKey: "c01-8", title: "无穷小的比较与等价无穷小替换" },
    { id: "math2.c01.p10", legacyKey: "c01-9", title: "洛必达法则求未定式极限" },
    { id: "math2.c01.p11", legacyKey: "c01-10", title: "泰勒公式求极限（常用麦克劳林展开）" },
    { id: "math2.c01.p12", legacyKey: "c01-11", title: "函数的连续性" },
    { id: "math2.c01.p13", legacyKey: "c01-12", title: "间断点及其分类（第一类、第二类）" },
    { id: "math2.c01.p14", legacyKey: "c01-13", title: "闭区间上连续函数的性质（最值、介值、零点定理）" },
  ]},
  { id: "c02", subject: "高等数学", name: "第二章 导数与微分", points: [
    { id: "math2.c02.p01", legacyKey: "c02-0", title: "导数的定义与几何意义" },
    { id: "math2.c02.p02", legacyKey: "c02-1", title: "可导、连续的关系" },
    { id: "math2.c02.p03", legacyKey: "c02-2", title: "求导四则运算法则" },
    { id: "math2.c02.p04", legacyKey: "c02-3", title: "复合函数求导（链式法则）" },
    { id: "math2.c02.p05", legacyKey: "c02-4", title: "反函数求导" },
    { id: "math2.c02.p06", legacyKey: "c02-5", title: "基本初等函数导数公式" },
    { id: "math2.c02.p07", legacyKey: "c02-6", title: "高阶导数（常用函数的 n 阶导）" },
    { id: "math2.c02.p08", legacyKey: "c02-7", title: "隐函数求导" },
    { id: "math2.c02.p09", legacyKey: "c02-8", title: "对数求导法" },
    { id: "math2.c02.p10", legacyKey: "c02-9", title: "参数方程确定的函数求导" },
    { id: "math2.c02.p11", legacyKey: "c02-10", title: "微分的定义与几何意义" },
    { id: "math2.c02.p12", legacyKey: "c02-11", title: "微分在近似计算中的应用" },
  ]},
  { id: "c03", subject: "高等数学", name: "第三章 微分中值定理与导数应用", points: [
    { id: "math2.c03.p01", legacyKey: "c03-0", title: "费马引理与罗尔定理" },
    { id: "math2.c03.p02", legacyKey: "c03-1", title: "拉格朗日中值定理" },
    { id: "math2.c03.p03", legacyKey: "c03-2", title: "柯西中值定理" },
    { id: "math2.c03.p04", legacyKey: "c03-3", title: "带拉格朗日余项的泰勒公式" },
    { id: "math2.c03.p05", legacyKey: "c03-4", title: "方程根的存在性与个数讨论" },
    { id: "math2.c03.p06", legacyKey: "c03-5", title: "利用导数证明不等式" },
    { id: "math2.c03.p07", legacyKey: "c03-6", title: "函数的单调性" },
    { id: "math2.c03.p08", legacyKey: "c03-7", title: "函数的极值及判别（第一/第二充分条件）" },
    { id: "math2.c03.p09", legacyKey: "c03-8", title: "曲线的凹凸性与拐点" },
    { id: "math2.c03.p10", legacyKey: "c03-9", title: "曲线的渐近线（水平、垂直、斜）" },
    { id: "math2.c03.p11", legacyKey: "c03-10", title: "函数图形的描绘" },
    { id: "math2.c03.p12", legacyKey: "c03-11", title: "最值与实际应用题" },
    { id: "math2.c03.p13", legacyKey: "c03-12", title: "曲率、曲率圆与曲率半径" },
  ]},
  { id: "c04", subject: "高等数学", name: "第四章 不定积分", points: [
    { id: "math2.c04.p01", legacyKey: "c04-0", title: "原函数与不定积分的概念" },
    { id: "math2.c04.p02", legacyKey: "c04-1", title: "基本积分公式表" },
    { id: "math2.c04.p03", legacyKey: "c04-2", title: "直接积分法" },
    { id: "math2.c04.p04", legacyKey: "c04-3", title: "第一类换元法（凑微分法）" },
    { id: "math2.c04.p05", legacyKey: "c04-4", title: "第二类换元法（三角代换、根式代换）" },
    { id: "math2.c04.p06", legacyKey: "c04-5", title: "分部积分法" },
    { id: "math2.c04.p07", legacyKey: "c04-6", title: "有理函数的积分（部分分式）" },
    { id: "math2.c04.p08", legacyKey: "c04-7", title: "简单无理函数与三角有理式积分" },
  ]},
  { id: "c05", subject: "高等数学", name: "第五章 定积分", points: [
    { id: "math2.c05.p01", legacyKey: "c05-0", title: "定积分的定义与几何意义" },
    { id: "math2.c05.p02", legacyKey: "c05-1", title: "定积分的性质（比较、估值、积分中值定理）" },
    { id: "math2.c05.p03", legacyKey: "c05-2", title: "变限积分函数及其求导" },
    { id: "math2.c05.p04", legacyKey: "c05-3", title: "牛顿-莱布尼茨公式" },
    { id: "math2.c05.p05", legacyKey: "c05-4", title: "定积分的换元法" },
    { id: "math2.c05.p06", legacyKey: "c05-5", title: "定积分的分部积分法" },
    { id: "math2.c05.p07", legacyKey: "c05-6", title: "利用对称性、周期性计算定积分" },
    { id: "math2.c05.p08", legacyKey: "c05-7", title: "常用积分结论（区间再现等）" },
    { id: "math2.c05.p09", legacyKey: "c05-8", title: "无穷限反常积分" },
    { id: "math2.c05.p10", legacyKey: "c05-9", title: "无界函数反常积分（瑕积分）" },
    { id: "math2.c05.p11", legacyKey: "c05-10", title: "用定积分定义计算数列极限" },
  ]},
  { id: "c06", subject: "高等数学", name: "第六章 定积分的应用", points: [
    { id: "math2.c06.p01", legacyKey: "c06-0", title: "定积分的元素法（微元法）" },
    { id: "math2.c06.p02", legacyKey: "c06-1", title: "直角坐标下平面图形的面积" },
    { id: "math2.c06.p03", legacyKey: "c06-2", title: "极坐标下平面图形的面积" },
    { id: "math2.c06.p04", legacyKey: "c06-3", title: "旋转体的体积（绕 x 轴 / y 轴、柱壳法）" },
    { id: "math2.c06.p05", legacyKey: "c06-4", title: "平行截面面积已知的立体体积" },
    { id: "math2.c06.p06", legacyKey: "c06-5", title: "平面曲线的弧长" },
    { id: "math2.c06.p07", legacyKey: "c06-6", title: "旋转曲面的侧面积" },
    { id: "math2.c06.p08", legacyKey: "c06-7", title: "定积分的物理应用（功、压力、质心等）" },
  ]},
  { id: "c07", subject: "高等数学", name: "第七章 常微分方程", points: [
    { id: "math2.c07.p01", legacyKey: "c07-0", title: "微分方程的基本概念（阶、解、通解、特解）" },
    { id: "math2.c07.p02", legacyKey: "c07-1", title: "可分离变量的微分方程" },
    { id: "math2.c07.p03", legacyKey: "c07-2", title: "齐次微分方程" },
    { id: "math2.c07.p04", legacyKey: "c07-3", title: "一阶线性微分方程" },
    { id: "math2.c07.p05", legacyKey: "c07-4", title: "可降阶的高阶微分方程" },
    { id: "math2.c07.p06", legacyKey: "c07-5", title: "线性微分方程解的性质与结构" },
    { id: "math2.c07.p07", legacyKey: "c07-6", title: "二阶常系数齐次线性微分方程" },
    { id: "math2.c07.p08", legacyKey: "c07-7", title: "二阶常系数非齐次线性微分方程" },
    { id: "math2.c07.p09", legacyKey: "c07-8", title: "高阶常系数线性微分方程" },
    { id: "math2.c07.p10", legacyKey: "c07-9", title: "微分方程的几何应用" },
    { id: "math2.c07.p11", legacyKey: "c07-10", title: "微分方程的物理应用" },
  ]},
  { id: "c08", subject: "高等数学", name: "第八章 多元函数微分学", points: [
    { id: "math2.c08.p01", legacyKey: "c08-0", title: "二元函数的极限与连续" },
    { id: "math2.c08.p02", legacyKey: "c08-1", title: "偏导数的定义与计算" },
    { id: "math2.c08.p03", legacyKey: "c08-2", title: "全微分的定义" },
    { id: "math2.c08.p04", legacyKey: "c08-3", title: "可微、可偏导、连续的关系判断" },
    { id: "math2.c08.p05", legacyKey: "c08-4", title: "复合函数求偏导（链式法则）" },
    { id: "math2.c08.p06", legacyKey: "c08-5", title: "隐函数（含方程组）求偏导" },
    { id: "math2.c08.p07", legacyKey: "c08-6", title: "高阶偏导数" },
    { id: "math2.c08.p08", legacyKey: "c08-7", title: "二元函数的极值及充分条件" },
    { id: "math2.c08.p09", legacyKey: "c08-8", title: "条件极值与拉格朗日乘数法" },
    { id: "math2.c08.p10", legacyKey: "c08-9", title: "多元函数的最值应用题" },
  ]},
  { id: "c09", subject: "高等数学", name: "第九章 二重积分", points: [
    { id: "math2.c09.p01", legacyKey: "c09-0", title: "二重积分的概念与性质" },
    { id: "math2.c09.p02", legacyKey: "c09-1", title: "直角坐标下化为二次积分（X 型 / Y 型）" },
    { id: "math2.c09.p03", legacyKey: "c09-2", title: "交换积分次序" },
    { id: "math2.c09.p04", legacyKey: "c09-3", title: "极坐标下二重积分的计算" },
    { id: "math2.c09.p05", legacyKey: "c09-4", title: "利用对称性与奇偶性化简" },
    { id: "math2.c09.p06", legacyKey: "c09-5", title: "被积函数含绝对值 / 最值的分块处理" },
    { id: "math2.c09.p07", legacyKey: "c09-6", title: "二重积分的应用（体积、面积）" },
  ]},
  { id: "c10", subject: "线性代数", name: "第一章 行列式", points: [
    { id: "math2.c10.p01", legacyKey: "c10-0", title: "n 阶行列式的定义" },
    { id: "math2.c10.p02", legacyKey: "c10-1", title: "行列式的性质" },
    { id: "math2.c10.p03", legacyKey: "c10-2", title: "按行（列）展开定理" },
    { id: "math2.c10.p04", legacyKey: "c10-3", title: "余子式与代数余子式" },
    { id: "math2.c10.p05", legacyKey: "c10-4", title: "数值型行列式的计算（化三角形、递推）" },
    { id: "math2.c10.p06", legacyKey: "c10-5", title: "抽象行列式的计算（利用矩阵运算）" },
    { id: "math2.c10.p07", legacyKey: "c10-6", title: "范德蒙德行列式" },
    { id: "math2.c10.p08", legacyKey: "c10-7", title: "行列式与可逆、秩的联系" },
  ]},
  { id: "c11", subject: "线性代数", name: "第二章 矩阵", points: [
    { id: "math2.c11.p01", legacyKey: "c11-0", title: "矩阵的概念与运算（加、乘、转置、幂）" },
    { id: "math2.c11.p02", legacyKey: "c11-1", title: "特殊矩阵（对称、反对称、对角、正交）" },
    { id: "math2.c11.p03", legacyKey: "c11-2", title: "伴随矩阵的定义与性质" },
    { id: "math2.c11.p04", legacyKey: "c11-3", title: "逆矩阵的定义、性质与求法" },
    { id: "math2.c11.p05", legacyKey: "c11-4", title: "矩阵可逆的充要条件" },
    { id: "math2.c11.p06", legacyKey: "c11-5", title: "分块矩阵及其运算" },
    { id: "math2.c11.p07", legacyKey: "c11-6", title: "初等变换与初等矩阵" },
    { id: "math2.c11.p08", legacyKey: "c11-7", title: "矩阵的秩的定义与求法" },
    { id: "math2.c11.p09", legacyKey: "c11-8", title: "矩阵方程的求解" },
    { id: "math2.c11.p10", legacyKey: "c11-9", title: "矩阵秩的重要不等式与结论" },
  ]},
  { id: "c12", subject: "线性代数", name: "第三章 向量组", points: [
    { id: "math2.c12.p01", legacyKey: "c12-0", title: "n 维向量与线性组合" },
    { id: "math2.c12.p02", legacyKey: "c12-1", title: "线性表出的判定" },
    { id: "math2.c12.p03", legacyKey: "c12-2", title: "线性相关与线性无关" },
    { id: "math2.c12.p04", legacyKey: "c12-3", title: "向量组部分与整体的相关性结论" },
    { id: "math2.c12.p05", legacyKey: "c12-4", title: "极大线性无关组" },
    { id: "math2.c12.p06", legacyKey: "c12-5", title: "向量组的秩与矩阵秩的关系" },
    { id: "math2.c12.p07", legacyKey: "c12-6", title: "向量组的等价" },
    { id: "math2.c12.p08", legacyKey: "c12-7", title: "内积、施密特正交化与正交矩阵" },
  ]},
  { id: "c13", subject: "线性代数", name: "第四章 线性方程组", points: [
    { id: "math2.c13.p01", legacyKey: "c13-0", title: "齐次线性方程组解的结构" },
    { id: "math2.c13.p02", legacyKey: "c13-1", title: "基础解系与通解" },
    { id: "math2.c13.p03", legacyKey: "c13-2", title: "非齐次方程组解的结构与通解" },
    { id: "math2.c13.p04", legacyKey: "c13-3", title: "解的存在性与唯一性判定（秩判据）" },
    { id: "math2.c13.p05", legacyKey: "c13-4", title: "克拉默法则" },
    { id: "math2.c13.p06", legacyKey: "c13-5", title: "含参数线性方程组的讨论" },
    { id: "math2.c13.p07", legacyKey: "c13-6", title: "两个方程组的公共解与同解" },
  ]},
  { id: "c14", subject: "线性代数", name: "第五章 特征值与特征向量", points: [
    { id: "math2.c14.p01", legacyKey: "c14-0", title: "特征值与特征向量的定义与求法" },
    { id: "math2.c14.p02", legacyKey: "c14-1", title: "特征值的性质（和、积与迹、行列式的关系）" },
    { id: "math2.c14.p03", legacyKey: "c14-2", title: "相似矩阵的定义与性质" },
    { id: "math2.c14.p04", legacyKey: "c14-3", title: "矩阵可相似对角化的条件" },
    { id: "math2.c14.p05", legacyKey: "c14-4", title: "实对称矩阵特征值与特征向量的性质" },
    { id: "math2.c14.p06", legacyKey: "c14-5", title: "实对称矩阵的正交相似对角化" },
    { id: "math2.c14.p07", legacyKey: "c14-6", title: "利用对角化求矩阵的高次幂" },
    { id: "math2.c14.p08", legacyKey: "c14-7", title: "由特征值特征向量反求矩阵" },
  ]},
  { id: "c15", subject: "线性代数", name: "第六章 二次型", points: [
    { id: "math2.c15.p01", legacyKey: "c15-0", title: "二次型及其矩阵表示" },
    { id: "math2.c15.p02", legacyKey: "c15-1", title: "矩阵的合同" },
    { id: "math2.c15.p03", legacyKey: "c15-2", title: "正交变换化二次型为标准形" },
    { id: "math2.c15.p04", legacyKey: "c15-3", title: "配方法化二次型为标准形" },
    { id: "math2.c15.p05", legacyKey: "c15-4", title: "惯性定理与规范形" },
    { id: "math2.c15.p06", legacyKey: "c15-5", title: "正定二次型与正定矩阵的定义" },
    { id: "math2.c15.p07", legacyKey: "c15-6", title: "正定性的判定条件" },
  ]},
];

/* ---------------- 计划生成 / 复习调度（纯函数） ---------------- */

function phaseFor(idx, total){
  const r = idx / Math.max(1, total);
  if (r < 0.35) return '基础阶段';
  if (r < 0.70) return '强化阶段';
  if (r < 0.90) return '真题阶段';
  return '冲刺阶段';
}

/* 按知识点数量为权重，把 [startDate, examDate) 的每一天分给各章节 */
function generatePlan(startDate, examDate, syllabus){
  const total = Math.max(1, diffDays(startDate, examDate));
  const totalPts = syllabus.reduce((a, c) => a + c.points.length, 0);
  let cumPts = 0, cursor = 0;
  const chapters = syllabus.map((ch, i) => {
    const s = Math.min(cursor, total - 1);
    cumPts += ch.points.length;
    let e;
    if (i === syllabus.length - 1) { e = total - 1; }
    else { e = Math.min(total - 1, Math.max(s, Math.round(total * cumPts / totalPts) - 1)); }
    cursor = Math.max(cursor, e + 1);
    return { id: ch.id, s, e, start: addDays(startDate, s), end: addDays(startDate, e), phase: phaseFor(s, total) };
  });
  return { startAt: startDate, examDate, totalDays: total, chapters };
}

/* 复习调度：remembered=true 进入下一轮间隔；false 明天重来 */
function reviewEngine(){
  return typeof StudyReview !== 'undefined' ? StudyReview : require('../assets/review.js');
}
function scheduleNext(m, remembered, today){
  return reviewEngine().scheduleNext(m, remembered, today);
}

function dueMistakes(list, today){
  return list.filter(m => !m.mastered && m.nextReview && m.nextReview <= today);
}

/* 距上次备份导出的天数；从未备份返回 -1 */
function backupDueDays(lastBackup, today){
  return lastBackup ? diffDays(lastBackup, today) : -1;
}

function calcStreak(dates, today){
  const set = new Set(dates);
  let d = today, n = 0;
  if (!set.has(d)) d = addDays(d, -1); // 今天还没学不打断连续
  while (set.has(d)){ n += 1; d = addDays(d, -1); }
  return n;
}

function uid(){ return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

/* ---------------- 状态与持久化 ---------------- */

const STORE_KEY = 'kaoyan-math2.v1';
let S = null;
let persistence = null;
let kpSubject = '全部', kpQuery = '';
let pqFilter = { ch: '', diff: 0, scope: 'all' }; // 刷题筛选
let pqScopeSnapshot = null; // Keep the current practice set stable while answers change.
let pqIndex = 0;                                   // 当前题号
let pqSession = { qid: null, picked: -1, revealed: false }; // 当前题的作答状态
let fQuery = '', fCatFilter = 'all', fQuiz = false, fOnlyFav = false; // 公式手册筛选
let fRevealed = new Set(); // 默写模式下已翻开的公式
let mFilter = { status: 'active', chapter: '', reason: '' };
let tickN = 0;

function defaultState(){
  return {
    v: 1,
    settings: { examDate: '2026-12-19', dailyGoal: 240, targetScore: 120 },
    kp: {},            // { 'c01-3': { status: 0-3, updatedAt } }
    attempts: [],     // 每次提交的独立记录；旧版聚合次数不会补造为历史。
    qz: {},            // 刷题记录：{ 题目id: { ok, times, lastAt, lastPick(选择题最近一次所选下标) } }
    lessons: {},       // 教学进度：{ 课id: { done, doneAt } }
    favF: {},          // 公式收藏：{ 公式id: true }
    logs: [],          // { id, date, minutes, chapterId, note }
    mistakes: [],      // { id, date, source, chapterId, reason, desc, wrong, opts(选择题选项快照), ansIdx, wrongIdx, correct, stage, nextReview, history, mastered }
    papers: [],        // { id, date, name, type, score, note }
    plan: null,
    timer: { running: false, startTs: 0, accumSec: 0, chapterId: null }
  };
}

function persistenceStore(){
  if (!persistence){
    const engine = typeof StudyStorage !== 'undefined' ? StudyStorage : require('../assets/storage.js');
    persistence = engine.create({ key: STORE_KEY, subjectId: 'math2', maxScore: 150, syllabus: SYLLABUS, defaults: defaultState, getStorage: () => localStorage });
  }
  return persistence;
}
function storageStatus(){
  const info = persistenceStore().info();
  if (typeof StudyUI !== 'undefined') StudyUI.setStorageStatus(info.ok, info);
  return info;
}
function refreshImportedState(){
  pqScopeSnapshot = null; pqSession = { qid: null, picked: -1, revealed: false };
  if (typeof StudyUI !== 'undefined') StudyUI.clearPracticeSource();
  renderAll(); syncTimerBtn(); updateTimerDisplay(); storageStatus();
}
function retrySave(){
  if (save()) toast('记录已保存');
}
function exportRawData(){
  const raw = persistenceStore().original();
  if (raw === null){ toast('没有可下载的浏览器原始记录'); return; }
  StudyStorage.download(raw, STORE_KEY + '-original-' + todayStr() + '.json');
  toast('原始记录下载已发起，请确认文件已保存');
}
function exportPreservedData(){
  try {
    const raw = persistenceStore().archived();
    if (raw === null){ toast('尚无覆盖前保留的记录'); return; }
    StudyStorage.download(raw, STORE_KEY + '-preserved-' + todayStr() + '.json');
    toast('覆盖前记录下载已发起，请确认文件已保存');
  } catch (e) { toast('无法读取覆盖前记录：' + e.message); }
}
function retryStorage(){
  if (!confirm('重新读取会放弃当前页面尚未保存的修改。请先导出当前记录。确定继续？')) return;
  const result = persistenceStore().read();
  storageStatus();
  if (!result.info.ok){ toast('记录仍无法读取，请保留原始记录后尝试恢复快照'); return; }
  S = result.state;
  if (!S.plan){ S.plan = generatePlan(todayStr(), S.settings.examDate, SYLLABUS); S.plan.generatedAt = todayStr(); }
  refreshImportedState();
  toast('已重新读取浏览器记录');
}
function restoreSnapshot(){
  try {
    const next = persistenceStore().snapshot();
    if (!confirm('将恢复最近一次有效快照，覆盖前会保留浏览器原始记录。请先导出当前页面尚未保存的修改。确定继续？')) return;
    if (!persistenceStore().save(next, { replace: true })){ storageStatus(); toast('恢复失败，原记录未被覆盖'); return; }
    S = next; refreshImportedState(); toast('快照已恢复');
  } catch (e) { toast('恢复失败：' + e.message); }
}

function load(){
  S = persistenceStore().read().state;
  // 延续旧版跨会话保护，暂停离开超过四小时的计时。
  if (S.timer.running && Date.now() - S.timer.startTs > 4 * 3600 * 1000){
    S.timer.accumSec += 4 * 3600; S.timer.running = false; S.timer.startTs = 0;
  }
  storageStatus();
}

function save(){
  const ok = persistenceStore().save(S);
  storageStatus();
  return ok;
}

/* ---------------- 通用小工具 ---------------- */

function el(id){ return document.getElementById(id); }
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
/* 轻量数学排版：@{分子|分母} 分数，@m{a,b;c,d} 矩阵，@d{..} 行列式（题库与详解为预置内容，非用户输入） */
function mathHtml(s){
  let t = esc(s);
  const buildMat = (spec, kind) => {
    const rows = spec.split(';').map(r =>
      '<span class="mrow">' + r.split(',').map(c => '<span>' + c.trim() + '</span>').join('') + '</span>').join('');
    const bL = kind === 'det' ? '<span class="mbar"></span>' : '<span class="mbr l"></span>';
    const bR = kind === 'det' ? '<span class="mbar"></span>' : '<span class="mbr r"></span>';
    return '<span class="mmat">' + bL + '<span class="mrows">' + rows + '</span>' + bR + '</span>';
  };
  t = t.replace(/@d\{([^{}]*)\}/g, (m, spec) => buildMat(spec, 'det'));
  t = t.replace(/@m\{([^{}]*)\}/g, (m, spec) => buildMat(spec, 'mat'));
  t = t.replace(/@\{([^{}|]*)\|([^{}]*)\}/g, (m, a, b) =>
    '<span class="mfr"><span class="mfr-n">' + a + '</span><span class="mfr-d">' + b + '</span></span>');
  return t;
}
/* 列表预览用：把排版标记降级为纯文本 */
function plainMath(s){
  return String(s == null ? '' : s)
    .replace(/@\{([^{}|]*)\|([^{}]*)\}/g, '($1)/($2)')
    .replace(/@[md]\{([^{}]*)\}/g, '[$1]');
}
function chapterById(id){ return SYLLABUS.find(c => c.id === id); }
function shortChapter(id){
  const c = chapterById(id);
  return c ? c.name.replace(/^第[^章]*章\s*/, '') : '未分类';
}
function toast(msg){
  if (typeof document === 'undefined') return; // Node 测试环境无 DOM
  const t = document.createElement('div');
  document.querySelectorAll('.toast').forEach(item => item.remove());
  t.className = 'toast'; t.setAttribute('role', 'status');
  t.textContent = (typeof StudyUI !== 'undefined' && !StudyUI.storageOK() && /已|成功/.test(msg) && !/下载/.test(msg)) ? '操作尚未保存，请先导出备份。' : msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
function progressBar(p){
  const w = Math.max(0, Math.min(100, Math.round(p)));
  return '<div class="pbar"><div class="pfill" style="width:' + w + '%"></div></div>';
}
function statCard(icon, label, big, sub){
  return '<div class="card stat"><div><span class="icon">' + icon + '</span> <span class="muted">' + label + '</span></div>' +
         '<div class="big">' + big + '</div>' + (sub ? '<div>' + sub + '</div>' : '') + '</div>';
}

/* ---------------- 知识点 / 日志辅助 ---------------- */

function kpStatus(pid){
  return (S.kp[pid] && typeof S.kp[pid].status === 'number') ? S.kp[pid].status : 0;
}
function setKp(pid, st){ S.kp[pid] = { status: st, updatedAt: todayStr() }; }
function chapterDone(c){
  let d = 0;
  c.points.forEach(p => { if (kpStatus(p.id) === 3) d++; });
  return d;
}
function kpTotals(){
  let total = 0, done = 0, learning = 0, review = 0;
  SYLLABUS.forEach(c => c.points.forEach(p => {
    const st = kpStatus(p.id);
    total++;
    if (st === 3) done++; else if (st === 2) review++; else if (st === 1) learning++;
  }));
  return { total, done, learning, review };
}
function addLog(minutes, chapterId, date, note){
  S.logs.push({ id: uid(), date: date || todayStr(), minutes: Math.max(1, Math.round(minutes)), chapterId: chapterId || null, note: note || '' });
  save();
}
function minutesOn(date){
  return S.logs.filter(l => l.date === date).reduce((a, l) => a + l.minutes, 0);
}
function phaseNow(){
  if (!S.plan) return '';
  const idx = diffDays(S.plan.startAt, todayStr());
  if (idx < 0) return '基础阶段';
  if (idx >= S.plan.totalDays) return '冲刺阶段';
  return phaseFor(idx, S.plan.totalDays);
}

/* ---------------- 页面渲染 ---------------- */

function renderHeader(){
  const n = diffDays(todayStr(), S.settings.examDate);
  let html;
  if (n > 0) html = '距初试 <b>' + n + '</b> 天 · ' + S.settings.examDate;
  else if (n === 0) html = '<b>今天初试，加油！</b>';
  else html = '初试已结束 · ' + S.settings.examDate;
  el('countdown').innerHTML = html;
}

/* 仪表盘备份提醒：距上次导出超 7 天、或已有学习数据却从未备份时显示 */
function renderBackupTip(today){
  let tip = document.getElementById('backupTip');
  let head;
  const d = backupDueDays(S.settings.lastBackup, today);
  if (d >= 7) head = '已 ' + d + ' 天未导出备份';
  else if (d < 0 && (S.logs.length || S.mistakes.length)) head = '你还未导出过备份';
  else { if (tip) tip.remove(); return; }
  if (!tip){
    tip = document.createElement('div');
    tip.id = 'backupTip';
    tip.className = 'backup-tip';
    document.getElementById('tab-dash').prepend(tip);
  }
  tip.innerHTML = '⚠️ ' + head + '——清理浏览器缓存会丢失全部学习记录。请到「设置与数据 → 数据备份」导出 JSON 并妥善保存。';
}

function renderDash(){
  const t = todayStr();
  renderBackupTip(t);
  const kp = kpTotals();
  const due = dueMistakes(S.mistakes, t);
  const streak = calcStreak(S.logs.map(l => l.date), t);
  const tm = minutesOn(t), goal = Math.max(1, S.settings.dailyGoal);

  el('statCards').innerHTML =
    statCard('📅', '剩余备考', Math.max(0, diffDays(t, S.settings.examDate)) + '<span class="unit">天</span>',
      '<span class="phase-chip">' + phaseNow() + '</span>') +
    statCard('⏱️', '今日学习', tm + '<span class="unit">/ ' + goal + ' 分钟</span>', progressBar(tm / goal * 100)) +
    statCard('🔁', '待复习错题', due.length + '<span class="unit">题</span>', due.length ? '<span class="muted">建议今天清零</span>' : '<span class="muted">已清零，很棒 ✅</span>') +
    statCard('🔥', '连续打卡', streak + '<span class="unit">天</span>', '') +
    statCard('📐', '知识点已掌握', kp.done + '<span class="unit">/ ' + kp.total + '</span>', progressBar(kp.done / kp.total * 100));

  renderCurrentPlan();
  renderReviewQueue(due);
  renderKpSummary();
  if (typeof StudyUI !== 'undefined') StudyUI.refresh();
}

function renderCurrentPlan(){
  const t = todayStr();
  let html;
  if (!S.plan){
    html = '<p class="muted">尚未生成计划，请到「设置与数据」生成。</p>';
  } else {
    const idx = diffDays(S.plan.startAt, t);
    const cur = S.plan.chapters.filter(c => idx >= c.s && idx <= c.e);
    html = '<div class="phase-chip">' + phaseNow() + '</div>';
    if (cur.length === 0){
      html += idx > S.plan.totalDays - 1
        ? '<p>计划周期已结束，进入考前自主安排：真题模拟 + 错题回顾 + 公式默写。</p>'
        : '<p class="muted">今天不在任何章节窗口内。</p>';
    } else {
      cur.forEach(c => {
        const ch = chapterById(c.id);
        const done = chapterDone(ch), tot = ch.points.length;
        const left = Math.max(0, diffDays(t, c.end));
        const les = LESSONS[ch.id] || [];
        const ldn = les.filter(x => S.lessons[x.id] && S.lessons[x.id].done).length;
        html += '<div class="plan-item"><b>' + esc(ch.name) + '</b>' +
          '<div class="muted">' + c.start + ' ~ ' + c.end + ' · 剩 ' + left + ' 天 · 掌握 ' + done + '/' + tot + ' · 已学 ' + ldn + '/' + les.length + ' 课</div>' +
          progressBar(done / tot * 100) + '</div>';
      });
      html += '<div class="row" style="margin-top:10px">' +
        '<button class="btn sm" onclick="A.startPlannedLesson()">开始本课学习</button>' +
        '<button class="btn ghost sm" onclick="A.goTab(\'kp\')">去标记知识点 →</button></div>';
    }
  }
  el('currentPlan').innerHTML = html;
}

function renderReviewQueue(due){
  const list = due.slice(0, 8);
  let html = list.length
    ? list.map(m =>
        '<div class="rq"><span class="tag">' + esc(shortChapter(m.chapterId)) + '</span>' +
        '<div class="rq-main"><b>' + esc(m.source) + '</b>' +
        '<div class="muted">' + esc(m.desc.length > 46 ? plainMath(m.desc).slice(0, 46) + '…' : plainMath(m.desc)) + '</div></div>' +
        '<div class="rq-btns"><button class="btn sm ok" onclick="A.review(\'' + m.id + '\',true)">会了</button>' +
        '<button class="btn sm warn" onclick="A.review(\'' + m.id + '\',false)">不会</button>' +
        '<button class="btn sm ghost" onclick="A.editMistake(\'' + m.id + '\')">详情</button></div></div>'
      ).join('')
    : '<p class="muted">✅ 今日没有待复习错题。</p>';
  if (due.length > 8){
    html += '<p class="muted">还有 ' + (due.length - 8) + ' 题，<a href="#" onclick="A.goTab(\'mistake\');return false;">去错题本</a> 处理。</p>';
  } else if (!due.length && S.mistakes.length){
    const next = S.mistakes.filter(m => !m.mastered && m.nextReview).map(m => m.nextReview).sort()[0];
    if (next) html += '<p class="muted">下一次复习：' + next + '</p>';
  }
  el('reviewQueue').innerHTML = html;
}

function renderKpSummary(){
  const bySub = {};
  SYLLABUS.forEach(c => {
    const v = bySub[c.subject] = bySub[c.subject] || { t: 0, d: 0 };
    v.t += c.points.length; v.d += chapterDone(c);
  });
  el('kpSummary').innerHTML = Object.keys(bySub).map(s => {
    const v = bySub[s];
    return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13px">' +
      '<span>' + s + '</span><span class="muted">' + v.d + '/' + v.t + '</span></div>' + progressBar(v.d / v.t * 100) + '</div>';
  }).join('');
}

function renderKP(){
  // 保留用户手动展开的章节
  const openIds = new Set(
    Array.from(document.querySelectorAll('details.chapter')).filter(d => d.open).map(d => d.dataset.cid)
  );
  const q = (kpQuery || '').trim();
  const t = todayStr();
  const idx = S.plan ? diffDays(S.plan.startAt, t) : -1;

  el('kpList').innerHTML = SYLLABUS
    .filter(c => kpSubject === '全部' || c.subject === kpSubject)
    .filter(c => !q || c.name.toLowerCase().indexOf(q.toLowerCase()) >= 0 || c.points.some(p => p.title.toLowerCase().indexOf(q.toLowerCase()) >= 0))
    .map(c => {
      const done = chapterDone(c), tot = c.points.length;
      const isCur = S.plan && S.plan.chapters.some(pc => pc.id === c.id && idx >= pc.s && idx <= pc.e);
      const chips = c.points.map((p, i) => {
        const pid = p.id, st = kpStatus(pid);
        return '<div class="kp-point"><button data-point-id="' + esc(pid) + '" class="kp-chip st' + st + '" title="点击切换状态（当前：' + KP_STATUS[st] + '）" onclick="A.cycleKp(\'' + pid + '\')"><span class="dot"></span>' + esc(p.title) + '</button>' + contentEngine().pointLinks(contentIndex(), pid) + '</div>';
      }).join('');
      return '<details class="chapter" data-cid="' + c.id + '"' + ((openIds.has(c.id) || isCur) ? ' open' : '') + '>' +
        '<summary><span class="ch-name">' + esc(c.name) + '</span>' +
        '<span class="ch-meta">' + c.subject + ' · 已掌握 ' + done + '/' + tot + '</span>' +
        '<span class="ch-bar">' + progressBar(done / tot * 100) + '</span></summary>' +
        '<div class="note-wrap">' + renderNote(c.id) + '</div><div class="kp-grid">' + chips + '</div></details>';
    }).join('');
}

function renderMistakeList(){
  const t = todayStr();
  let arr = S.mistakes.slice();
  if (mFilter.status === 'due') arr = dueMistakes(S.mistakes, t);
  else if (mFilter.status === 'active') arr = arr.filter(m => !m.mastered);
  else if (mFilter.status === 'relapsed') arr = arr.filter(m => !m.mastered && (m.recurrences || []).length);
  else if (mFilter.status === 'mastered') arr = arr.filter(m => m.mastered);
  if (mFilter.chapter) arr = arr.filter(m => m.chapterId === mFilter.chapter);
  if (mFilter.reason) arr = arr.filter(m => reviewEngine().reasonStatus(m).category === mFilter.reason);
  arr.sort((a, b) => ((a.nextReview || '9999-99-99') < (b.nextReview || '9999-99-99') ? -1 : 1));

  el('mistakeList').innerHTML = arr.length
    ? arr.map(m => {
        const due = !m.mastered && m.nextReview && m.nextReview <= t;
        const badge = m.mastered
          ? '<span class="tag ok2">已掌握</span>'
          : '<span class="tag ' + (due ? 'hot' : '') + '">' + (due ? '今日待复习' : '下次 ' + m.nextReview) + '</span>';
        const reviewBtns = !due ? '' :
          '<button class="btn sm ok" onclick="A.review(\'' + m.id + '\',true)">会了</button>' +
          '<button class="btn sm warn" onclick="A.review(\'' + m.id + '\',false)">还不会</button>';
        return '<div class="mistake-card' + (m.mastered ? ' ok' : '') + '" data-mistake-id="' + esc(m.id) + '">' +
          '<div class="m-head"><span class="tag">' + esc(shortChapter(m.chapterId)) + '</span>' +
          '<span class="tag warn">' + esc(reviewEngine().reasonStatus(m).label) + '</span>' + badge +
          '<span class="muted">' + m.date + '</span></div>' +
          '<div class="m-src">' + esc(m.source) + '</div>' +
          '<div class="m-desc">' + esc(m.desc.length > 90 ? plainMath(m.desc).slice(0, 90) + '…' : plainMath(m.desc)) + '</div>' +
          (m.wrong ? '<div class="m-desc" style="color:var(--hot)">✍ ' + esc(m.wrong.length > 70 ? m.wrong.slice(0, 70) + '…' : m.wrong) + '</div>' : '') +
          '<div class="m-actions">' + reviewBtns +
          '<button class="btn sm" onclick="A.editMistake(\'' + m.id + '\')">详情/编辑</button>' +
          '<button class="btn sm danger" onclick="A.delMistake(\'' + m.id + '\')">删除</button></div></div>';
      }).join('')
    : '<p class="muted">这里还没有错题。做错就记进来，复习队列会自动安排。</p>';
  if (typeof StudyUI !== 'undefined') StudyUI.mistakesRendered();
}

/* ---------------- 知识点详解 ---------------- */

function renderNote(chId){
  const n = NOTES[chId];
  if (!n) return '';
  return '<details class="notebox"><summary>📖 本章考点详解（考频 ' + n.freq + '）</summary><div class="nb">' +
    '<p>' + mathHtml(n.intro) + '</p>' +
    n.sections.map(s => '<h4>▸ ' + esc(s.h) + '</h4><ul>' + s.ul.map(li => '<li>' + mathHtml(li) + '</li>').join('') + '</ul>').join('') +
    '</div></details>';
}

/* ---------------- 刷题模块 ---------------- */

let contentRegistry = null;
function contentEngine(){ return typeof StudyContent !== 'undefined' ? StudyContent : require('../assets/content.js'); }
function contentIndex(){
  if (!contentRegistry) contentRegistry = contentEngine().create(SYLLABUS, LESSONS, QUESTIONS);
  return contentRegistry;
}
function relatedKnowledgeHtml(questionId){ return contentEngine().relatedHtml(contentIndex(), questionId); }
function lessonPointLinks(lesson){ return contentEngine().lessonPoints(contentIndex(), lesson); }
function practicePoint(pointId){
  const index = contentIndex(), point = index.point(pointId), questions = index.questionsFor(pointId);
  const lesson = index.lessonsFor(pointId)[0];
  if (typeof StudyUI !== 'undefined') StudyUI.setPracticeSource(lesson ? lesson.id : null, pointId);
  pqFilter = { ch: point ? point.chapterId : '', diff: 0, scope: 'all', ids: questions.map(q => q.id), pointId };
  pqScopeSnapshot = null; pqIndex = 0;
  pqSession = { qid: questions[0] ? questions[0].id : null, picked: -1, revealed: false, judged: false };
  el('pqChapter').value = pqFilter.ch; el('pqDiff').value = '0'; el('pqScope').value = 'all';
  goTab('pq');
  if (!point || !questions.length) toast('该考点尚未关联专项题，请返回课程或知识地图。');
}
// Search navigation changes visible content without recording an answer.
function openQuestion(id){
  const question = QUESTIONS.find(q => q.id === id);
  if (!question) return false;
  if (typeof StudyUI !== 'undefined') StudyUI.setQuestionSource(id);
  pqFilter = { ch: question.ch, diff: 0, scope: 'all', ids: [id], questionId: id };
  pqScopeSnapshot = null; pqIndex = 0;
  pqSession = { qid: id, picked: -1, revealed: false, judged: false };
  el('pqChapter').value = question.ch; el('pqDiff').value = '0'; el('pqScope').value = 'all';
  goTab('pq'); return true;
}
function openPoint(id){
  if (!SYLLABUS.some(ch => ch.points.some(point => point.id === id))) return false;
  kpSubject = '全部'; kpQuery = '';
  el('kpSubjectSel').value = '全部'; el('kpSearch').value = '';
  goTab('kp'); return true;
}
function openCard(id){
  if (!FORMULAS.some(card => card.id === id)) return false;
  fQuery = ''; fCatFilter = 'all'; fOnlyFav = false; fQuiz = false;
  el('fSearch').value = ''; el('fCat').value = 'all';
  el('fOnlyFav').checked = false; el('fQuiz').checked = false;
  goTab('learn'); renderFormulas(); return true;
}
function filteredQuestions(){
  if (Array.isArray(pqFilter.ids)){
    // 教学配套模式：只做本课指定的题目（按教学顺序）
    return QUESTIONS.filter(q => pqFilter.ids.indexOf(q.id) >= 0);
  }
  if (pqFilter.scope !== 'all' && pqScopeSnapshot) return QUESTIONS.filter(q => pqScopeSnapshot.includes(q.id));
  const list = QUESTIONS.filter(q => {
    if (pqFilter.ch && q.ch !== pqFilter.ch) return false;
    if (pqFilter.diff && q.diff !== pqFilter.diff) return false;
    const rec = S.qz[q.id];
    if (pqFilter.scope === 'undone' && rec) return false;
    if (pqFilter.scope === 'wrong' && !(rec && !rec.ok)) return false;
    if (pqFilter.scope === 'right' && !(rec && rec.ok)) return false;
    return true;
  });
  if (pqFilter.scope !== 'all') pqScopeSnapshot = list.map(q => q.id);
  return list;
}

function pqCur(){
  const list = filteredQuestions();
  return list.length ? list[Math.min(pqIndex, list.length - 1)] : null;
}

function recordAnswer(q, ok, pick){
  const old = S.qz[q.id];
  const lastPick = (typeof pick === 'number' && pick >= 0) ? pick : (old ? old.lastPick : undefined);
  S.qz[q.id] = { ok: ok, times: (old ? old.times : 0) + 1, lastAt: todayStr() };
  if (typeof lastPick === 'number') S.qz[q.id].lastPick = lastPick;
  S.attempts = S.attempts || [];
  S.attempts.push({
    id: uid(), questionId: q.id, contentVersion: '2026-10', answeredAt: new Date().toISOString(),
    answer: q.type === 'choice' && typeof pick === 'number' && pick >= 0 ? pick : null,
    correct: !!ok, score: ok ? 1 : 0, maxScore: 1, isFirst: !old,
    mode: pqFilter.ids && !pqFilter.pointId && !pqFilter.questionId ? 'lesson' : (old ? 'retry' : 'practice'),
    gradingMethod: q.type === 'choice' ? 'automatic' : 'self', pointIds: (q.pointIds || []).slice()
  });
  if (!ok) addQToMistake(q, (typeof pick === 'number' && pick >= 0) ? pick : -1, S.attempts[S.attempts.length - 1]);
  save();
}

function addQToMistake(q, pick, attempt){
  const hasPick = q.type === 'choice' && typeof pick === 'number' && pick >= 0 && q.opts && q.opts[pick] != null;
  const wrongTxt = hasPick ? '我选了 ' + 'ABCD'[pick] + '．' + plainMath(q.opts[pick]) : '';
  const today = todayStr(), at = attempt ? attempt.answeredAt : new Date().toISOString();
  const exist = S.mistakes.find(m => m.qid === q.id && !m.mastered) || S.mistakes.find(m => m.qid === q.id);
  if (exist){
    if (!reviewEngine().relapse(exist, { id: uid(), date: today, at, attemptId: attempt && attempt.id, wrong: wrongTxt, wrongIdx: hasPick ? pick : null })) return;
    if (q.type === 'choice' && q.opts){ exist.opts = q.opts.slice(); exist.ansIdx = q.ans; }
    exist.wrong = wrongTxt; exist.wrongIdx = hasPick ? pick : null;
    toast('再次答错：已记录复发并放回今日复习，历史记录保留');
    return;
  }
  S.mistakes.unshift({
    id: uid(), qid: q.id, date: today,
    source: '题库 · ' + shortChapter(q.ch) + ' · ' + q.id,
    chapterId: q.ch, reason: '未归因', reasonConfirmed: false, reasonConfirmedAt: null,
    desc: q.q, wrong: wrongTxt,
    opts: (q.type === 'choice' && q.opts) ? q.opts.slice() : null,
    ansIdx: q.type === 'choice' ? q.ans : null, wrongIdx: hasPick ? pick : null,
    correct: '【答案】' + (q.type === 'choice' ? 'ABCD'[q.ans] : q.ans) + '\n【解析】' + q.sol,
    stage: 0, nextReview: addDays(today, 1), history: [], mastered: false, recurrences: [], lastWrongAt: at
  });
  toast('做错了，已加入错题本（明天复习）；错因待你确认');
}

function practiceCard(q, list){
  const i = list.indexOf(q) + 1, n = list.length;
  const rec = S.qz[q.id];
  const diffName = ['', '基础', '中等', '强化'][q.diff] || '中等';
  const typeName = q.type === 'choice' ? '选择' : (q.type === 'fill' ? '填空' : '解答');
  let body = '';
  if (q.type === 'choice'){
    body = '<div class="opts">' + q.opts.map((o, oi) => {
      let cls = 'opt';
      let attr = ' onclick="A.pickOpt(' + oi + ')"';
      if (pqSession.revealed){
        if (oi === q.ans) cls += ' right';
        else if (oi === pqSession.picked) cls += ' wrongpick';
        else cls += ' dim';
        attr = ' disabled';
      }
      return '<button class="' + cls + '"' + attr + '><span class="letter">' + 'ABCD'[oi] + '</span><span>' + mathHtml(o) + '</span></button>';
    }).join('') + '</div>';
  } else if (!pqSession.revealed){
    body = '<button class="btn" onclick="A.revealAns()">查看答案与解析</button>';
  }
  let sol = '';
  if (pqSession.revealed){
    const ansText = q.type === 'choice' ? 'ABCD'[q.ans] : mathHtml(String(q.ans));
    sol = '<div class="q-sol"><p><b>正确答案：' + ansText + '</b>' +
      (rec ? '<span class="muted">（上次：' + (rec.ok ? '✅ 对' : '❌ 错') + '）</span>' : '') + '</p>' +
      '<div style="white-space:pre-wrap;line-height:2">' + mathHtml(q.sol) + '</div>' +
      (q.type === 'choice' ? '' :
        '<div class="row" style="margin-top:10px"><button class="btn ok" ' + (pqSession.judged ? 'disabled' : '') + ' onclick="A.selfJudge(true)">✅ 我做对了</button><button class="btn warn" ' + (pqSession.judged ? 'disabled' : '') + ' onclick="A.selfJudge(false)">❌ 我做错了</button></div>') +
      '</div>';
  }
  const feedback = pqSession.revealed && rec && (q.type === 'choice' || pqSession.judged)
    ? '<div class="answer-result" role="status">' + (rec.ok ? '✓ 本次答对了' : '本次答错了 · 已加入错题本') + '</div>' : '';
  const retry = pqSession.revealed ? '<button class="btn sm ghost" onclick="A.retryQuestion()">重新作答</button>' : '';
  return '<div class="card q-card">' +
    '<div class="practice-progress pbar" aria-label="当前题目进度"><div class="pfill" style="width:' + (i / n * 100) + '%"></div></div>' +
    '<div class="m-head"><span class="tag">' + esc(shortChapter(q.ch)) + '</span><span class="tag">' + diffName + '</span>' +
    '<span class="tag">' + typeName + '题</span><span class="muted">' + q.id + ' · 第 ' + i + '/' + n + ' 题</span></div>' +
    '<p class="q-text">' + mathHtml(q.q) + '</p>' + body + feedback + retry + sol + (pqSession.revealed ? relatedKnowledgeHtml(q.id) : '') +
    '<div class="row" style="margin-top:14px;justify-content:space-between">' +
    '<button class="btn ghost" ' + (i <= 1 ? 'disabled' : '') + ' onclick="A.pqNav(-1)">← 上一题</button>' +
    '<button class="btn ghost" ' + (i >= n ? 'disabled' : '') + ' onclick="A.pqNav(1)">下一题 →</button></div></div>';
}

function renderPractice(){
  const list = filteredQuestions();
  const n = list.length;
  if (pqIndex >= n) pqIndex = Math.max(0, n - 1);
  const done = list.filter(q => S.qz[q.id]).length;
  const right = list.filter(q => S.qz[q.id] && S.qz[q.id].ok).length;
  if (Array.isArray(pqFilter.ids)){
    el('pqInfo').innerHTML = (pqFilter.questionId ? '搜索定位：' : pqFilter.pointId ? '考点专项：' + esc((contentIndex().point(pqFilter.pointId) || { title: '暂不存在的考点' }).title) + ' · ' : '教学配套练习：') + n + ' 题 <button class="btn sm ghost" onclick="A.clearPqIds()">' + (pqFilter.questionId ? '返回章节题库' : '退出配套模式') + '</button>';
  } else {
    el('pqInfo').textContent = n ? ('共 ' + n + ' 题 · 已做 ' + done + ' · 最近答对率 ' + (done ? Math.round(right / done * 100) : 0) + '%') : '共 0 题';
  }
  if (!n){ el('pqArea').innerHTML = '<div class="card"><p class="muted">当前筛选条件下没有题目，换个条件试试。</p></div>'; return; }
  const q = list[pqIndex];
  if (pqSession.qid !== q.id){
    const rec = S.qz[q.id];
    pqSession = { qid: q.id, picked: rec ? (typeof rec.lastPick === 'number' ? rec.lastPick : (rec.ok ? q.ans : -1)) : -1, revealed: !!rec, judged: !!rec };
  }
  el('pqArea').innerHTML = practiceCard(q, list);
  if (typeof StudyUI !== 'undefined') StudyUI.practiceRendered();
}

function pickOpt(oi){
  const q = pqCur();
  if (!q || pqSession.revealed) return;
  pqSession.picked = oi;
  pqSession.revealed = true;
  recordAnswer(q, oi === q.ans, oi);
  renderPractice(); renderDash(); renderMistakeList();
  if (oi === q.ans) toast('✅ 回答正确！');
}
function revealAns(){
  const q = pqCur();
  if (!q) return;
  pqSession.revealed = true;
  renderPractice();
}
function selfJudge(ok){
  const q = pqCur();
  if (!q || !pqSession.revealed || pqSession.judged) return;
  pqSession.judged = true;
  recordAnswer(q, ok);
  renderPractice(); renderDash(); renderMistakeList();
  if (ok) toast('✅ 已记录：本题做对');
}
function retryQuestion(){
  const q = pqCur();
  if (!q) return;
  pqSession = { qid: q.id, picked: -1, revealed: false, judged: false };
  renderPractice();
}
function pqNav(d){
  const list = filteredQuestions();
  pqIndex = Math.min(Math.max(0, pqIndex + d), list.length - 1);
  renderPractice();
  if (typeof document !== 'undefined') {
    const card = document.querySelector('.q-card');
    if (card) card.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
}

/* ---------------- 教学中心 ---------------- */

function findLesson(id){
  for (const k of Object.keys(LESSONS)){
    const l = LESSONS[k].find(x => x.id === id);
    if (l) return l;
  }
  return null;
}
function lessonDoneCount(chId){
  return (LESSONS[chId] || []).filter(l => S.lessons[l.id] && S.lessons[l.id].done).length;
}

function lessonCard(l){
  const done = S.lessons[l.id] && S.lessons[l.id].done;
  const quizN = l.quiz ? l.quiz.length : 0;
  return '<details class="lesson' + (done ? ' done' : '') + '" data-lid="' + l.id + '">' +
    '<summary><span class="ls-title">' + (done ? '✅ ' : '📘 ') + esc(l.title) + '</span>' +
    '<span class="muted">约 ' + l.mins + ' 分钟 · ' + l.pointIds.length + ' 个考点' + (quizN ? ' · 配套 ' + quizN + ' 题' : '') + '</span></summary>' +
    '<div class="ls-body">' +
    '<p class="ls-goal">🎯 ' + mathHtml(l.goal) + '</p>' +
    lessonPointLinks(l) + '<h4>概念与方法</h4><ul>' + l.concept.map(x => '<li>' + mathHtml(x) + '</li>').join('') + '</ul>' +
    '<h4>例题（先遮住自做，再展开核对）</h4>' +
    l.examples.map((e, i) => '<details class="ex"><summary>例 ' + (i + 1) + '　' + mathHtml(e.q) + '</summary>' +
      '<div class="ex-sol"><b>解答：</b>' + mathHtml(e.sol) + '</div></details>').join('') +
    '<h4>⚠️ 常见错误</h4><ul>' + l.pitfalls.map(x => '<li>' + mathHtml(x) + '</li>').join('') + '</ul>' +
    '<div class="row" style="margin-top:12px">' +
    '<button class="btn ' + (done ? 'ghost' : 'ok') + '" onclick="A.markLesson(\'' + l.id + '\')">' + (done ? '↩ 取消学完' : '✅ 学完本课') + '</button>' +
    '<button class="btn ghost" onclick="A.practiceLesson(\'' + l.id + '\')">✏️ 做配套练习</button>' +
    '</div></div></details>';
}

function renderLearn(){
  // 保留用户手动展开的章节与课程
  const openCh = new Set(Array.from(document.querySelectorAll('#learnList details.chapter')).filter(d => d.open).map(d => d.dataset.cid));
  const openLs = new Set(Array.from(document.querySelectorAll('#learnList details.lesson')).filter(d => d.open).map(d => d.dataset.lid));
  const total = Object.keys(LESSONS).reduce((a, k) => a + LESSONS[k].length, 0);
  const done = Object.keys(LESSONS).reduce((a, k) => a + lessonDoneCount(k), 0);
  el('learnSummary').innerHTML =
    '<h3>📚 教学中心</h3>' +
    '<p style="margin:6px 0"><b>已学完 ' + done + ' / ' + total + ' 课</b>' + progressBar(done / total * 100) + '</p>' +
    '<p class="muted">学习闭环：读「概念与方法」→ 遮住解答做例题、展开核对 → 点「做配套练习」检验 → 点「学完本课」（本课考点自动标为学习中）→ 回「知识点」页细分掌握度。</p>';
  const t = todayStr();
  const idx = S.plan ? diffDays(S.plan.startAt, t) : -1;
  el('learnList').innerHTML = SYLLABUS.map(c => {
    const arr = LESSONS[c.id];
    if (!arr || !arr.length) return '';
    const dn = lessonDoneCount(c.id);
    const isCur = S.plan && S.plan.chapters.some(pc => pc.id === c.id && idx >= pc.s && idx <= pc.e);
    return '<details class="chapter" data-cid="' + c.id + '"' + ((openCh.has(c.id) || isCur) ? ' open' : '') + '>' +
      '<summary><span class="ch-name">' + esc(c.name) + '</span>' +
      '<span class="ch-meta">' + c.subject + ' · 已学 ' + dn + '/' + arr.length + ' 课</span>' +
      '<span class="ch-bar">' + progressBar(dn / arr.length * 100) + '</span></summary>' +
      arr.map(l => lessonCard(l)).join('') + '</details>';
  }).join('');
  if (typeof StudyUI !== 'undefined') StudyUI.filterLessons();
}

function markLesson(id){
  const l = findLesson(id);
  if (!l) return;
  if (S.lessons[id] && S.lessons[id].done){
    delete S.lessons[id];
    toast('已取消本课的学完标记');
  } else {
    S.lessons[id] = { done: true, doneAt: todayStr() };
    // 本课覆盖的考点若还未开始，自动标为「学习中」
    l.pointIds.forEach(pid => {
      if (kpStatus(pid) === 0) setKp(pid, 1);
    });
    toast('🎉 已学完！本课考点已自动标为「学习中」');
  }
  save();
  renderLearn(); renderDash(); renderKP();
}

function practiceLesson(id){
  const l = findLesson(id);
  if (!l) return;
  if (typeof StudyUI !== 'undefined') StudyUI.setPracticeSource(id);
  pqScopeSnapshot = null;
  pqFilter = { ch: l.ch, diff: 0, scope: 'all', ids: (l.quiz && l.quiz.length) ? l.quiz.slice() : null };
  el('pqChapter').value = l.ch;
  el('pqDiff').value = '0';
  el('pqScope').value = 'all';
  pqIndex = 0;
  goTab('pq');
  renderPractice();
}

function clearPqIds(){
  if (typeof StudyUI !== 'undefined') StudyUI.clearPracticeSource();
  pqScopeSnapshot = null;
  pqFilter.ids = null;
  pqIndex = 0;
  renderPractice();
}

/* ---------------- 公式手册 ---------------- */

function renderFormulas(){
  const q = (fQuery || '').trim().toLowerCase();
  const list = FORMULAS.filter(f => {
    if (fCatFilter !== 'all' && f.cat !== fCatFilter) return false;
    if (fOnlyFav && !S.favF[f.id]) return false;
    if (q && f.name.toLowerCase().indexOf(q) < 0 && plainMath(f.f).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  el('fInfo').textContent = '显示 ' + list.length + ' / ' + FORMULAS.length + ' 条';
  el('formulaCount').textContent = '（共 ' + FORMULAS.length + ' 条 · 已收藏 ' + Object.keys(S.favF).length + ' 条）';
  el('formulaList').innerHTML = list.map(f => {
    const fav = !!S.favF[f.id];
    const covered = fQuiz && !fRevealed.has(f.id);
    const tagCls = f.tag === '高频' ? ' hot2' : (f.tag === '了解' ? '' : ' warn');
    return '<div class="fcard" data-card-id="' + esc(f.id) + '">' +
      '<div class="f-top"><span class="f-name">' + esc(f.name) + '</span>' +
      '<span class="tag' + tagCls + '">' + f.tag + '</span>' +
      '<button class="fstar' + (fav ? ' on' : '') + '" title="收藏" onclick="A.toggleFav(\'' + f.id + '\')">' + (fav ? '★' : '☆') + '</button></div>' +
      '<div class="f-body' + (covered ? ' covered' : '') + '"' + (covered ? ' onclick="A.revealF(\'' + f.id + '\')"' : '') + '>' +
      (covered ? '🤔 先在纸上默写，点击核对' : mathHtml(f.f)) + '</div>' +
      (f.tip ? '<div class="f-tip muted">💡 ' + mathHtml(f.tip) + '</div>' : '') +
      '</div>';
  }).join('') || '<p class="muted">没有匹配的公式，换个关键词或分类。</p>';
  if (typeof StudyUI !== 'undefined') StudyUI.decorateFormulas();
}

function toggleFav(id){
  if (S.favF[id]) delete S.favF[id];
  else S.favF[id] = true;
  save();
  renderFormulas();
}
function revealF(id){
  fRevealed.add(id);
  renderFormulas();
}

function svgScoreChart(papers, target){
  const arr = papers.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!arr.length) return '<p class="muted">暂无成绩。按套计时模拟一套真题，把分数录进来。</p>';
  const W = 680, H = 240, P = 36, n = arr.length;
  const x = i => P + (W - 2 * P) * (n === 1 ? 0.5 : i / (n - 1));
  const y = v => H - P - (H - 2 * P) * (v / 150);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="成绩走势">';
  [0, 50, 100, 150].forEach(v => {
    s += '<line x1="' + P + '" y1="' + y(v) + '" x2="' + (W - P) + '" y2="' + y(v) + '" class="grid"/>' +
         '<text x="8" y="' + (y(v) + 4) + '" class="ax">' + v + '</text>';
  });
  s += '<line x1="' + P + '" y1="' + y(target) + '" x2="' + (W - P) + '" y2="' + y(target) + '" class="target"/>' +
       '<text x="' + (W - P) + '" y="' + (y(target) - 4) + '" class="ax" text-anchor="end">目标 ' + target + '</text>';
  if (n > 1) s += '<polyline points="' + arr.map((p, i) => x(i) + ',' + y(p.score)).join(' ') + '" class="line"/>';
  arr.forEach((p, i) => {
    s += '<circle cx="' + x(i) + '" cy="' + y(p.score) + '" r="4" class="dotc"><title>' +
         esc(p.name) + '：' + p.score + ' 分（' + p.date + '）</title></circle>';
  });
  const step = Math.ceil(n / 8);
  arr.forEach((p, i) => {
    if (i % step === 0 || i === n - 1) s += '<text x="' + x(i) + '" y="' + (H - 10) + '" class="ax" text-anchor="middle">' + p.date.slice(5) + '</text>';
  });
  return s + '</svg>';
}

function renderPapers(){
  el('paperChart').innerHTML = svgScoreChart(S.papers, S.settings.targetScore);
  const arr = S.papers.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  el('paperTable').innerHTML = arr.length
    ? '<table><tr><th>日期</th><th>名称</th><th>类型</th><th>分数</th><th>得分率</th><th></th></tr>' +
      arr.map(p => '<tr><td>' + p.date + '</td><td>' + esc(p.name) + (p.note ? ' <span class="muted">' + esc(p.note) + '</span>' : '') +
        '</td><td>' + esc(p.type) + '</td><td><b>' + p.score + '</b></td><td>' + Math.round(p.score / 150 * 100) + '%</td>' +
        '<td><button class="btn sm danger" onclick="A.delPaper(\'' + p.id + '\')">删除</button></td></tr>').join('') + '</table>'
    : '<p class="muted">暂无成绩记录。</p>';
}

function renderStats(){
  const totalMin = S.logs.reduce((a, l) => a + l.minutes, 0);
  const days = new Set(S.logs.map(l => l.date)).size;
  const kp = kpTotals();
  const active = S.mistakes.filter(m => !m.mastered).length;

  const qa = Object.keys(S.qz).length;
  const qr = Object.keys(S.qz).filter(k => S.qz[k].ok).length;
  el('statsCards').innerHTML =
    statCard('⏳', '累计学习', (totalMin / 60).toFixed(1) + '<span class="unit">小时</span>', '<span class="muted">共 ' + days + ' 天有记录</span>') +
    statCard('📊', '日均时长', days ? Math.round(totalMin / days) + '<span class="unit">分钟/天</span>' : '—', '<span class="muted">按有记录的天数平均</span>') +
    statCard('📝', '错题总数', S.mistakes.length + '<span class="unit">题</span>', '<span class="muted">未掌握 ' + active + ' · 已掌握 ' + (S.mistakes.length - active) + '</span>') +
    statCard('📐', '知识点掌握', kp.done + '<span class="unit">/ ' + kp.total + '</span>', progressBar(kp.done / kp.total * 100)) +
    statCard('✏️', '题库刷题', qa + '<span class="unit">/ ' + QUESTIONS.length + ' 题</span>',
      '<span class="muted">最近答对率 ' + (qa ? Math.round(qr / qa * 100) : 0) + '%</span>');

  const metrics = (typeof StudyCommon !== 'undefined' ? StudyCommon : require('../assets/common.js')).attemptSummary(S.attempts);
  el('statsCards').innerHTML += statCard('📝', '新记录中的首答', metrics.firstTotal ? Math.round(metrics.firstCorrect / metrics.firstTotal * 100) + '%' : '—', '<span class="muted">' + metrics.firstCorrect + ' / ' + metrics.firstTotal + ' 次；旧聚合记录不补造首答</span>') +
    statCard('📋', '全部新增作答', metrics.total ? Math.round(metrics.correct / metrics.total * 100) + '%' : '—', '<span class="muted">' + metrics.correct + ' / ' + metrics.total + ' 次，含重做与自评</span>');

  // 近 30 天柱状图
  const days30 = [];
  for (let i = 29; i >= 0; i--){ const d = addDays(todayStr(), -i); days30.push({ d, m: minutesOn(d) }); }
  const mx = Math.max(60, Math.max.apply(null, days30.map(x => x.m)));
  el('bars30').innerHTML = '<div class="bars">' + days30.map(x =>
    '<div class="bcol" title="' + x.d + '：' + x.m + ' 分钟"><div class="bfill' + (x.m > 0 ? ' on' : '') + '" style="height:' + Math.max(2, Math.round(x.m / mx * 100)) + '%"></div></div>'
  ).join('') + '</div>';

  // 各章节时长
  const map = {};
  S.logs.forEach(l => { const k = l.chapterId || ''; map[k] = (map[k] || 0) + l.minutes; });
  const rows = Object.keys(map).map(k => ({ name: k ? shortChapter(k) : '未分类', v: map[k] })).sort((a, b) => b.v - a.v);
  const mxh = Math.max(1, Math.max.apply(null, rows.map(r => r.v)));
  el('chapterHours').innerHTML = rows.length
    ? rows.map(r => '<div class="hbar-row"><span class="hbar-name">' + esc(r.name) + '</span>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:' + Math.round(r.v / mxh * 100) + '%"></div></div>' +
        '<span class="muted" style="width:56px;text-align:right">' + (r.v / 60).toFixed(1) + 'h</span></div>').join('')
    : '<p class="muted">暂无学习记录。</p>';

  // 错误原因分布
  const summary = reviewEngine().reasonSummary(S.mistakes, REASONS), rc = summary.counts;
  const reasons = Object.keys(rc), mxr = Math.max(1, ...Object.values(rc));
  el('reasonDist').innerHTML = reasons.map(r =>
    '<div class="hbar-row"><span class="hbar-name">' + esc(r) + '</span>' +
    '<div class="hbar-track"><div class="hbar-fill warn" style="width:' + Math.round(rc[r] / mxr * 100) + '%"></div></div>' +
    '<span class="muted" style="width:40px;text-align:right">' + rc[r] + '</span></div>').join('') +
    '<p class="muted" style="margin-top:8px">已确认 ' + summary.confirmed + ' 条；未归因或待确认 ' + summary.pending + ' 条。旧标签保留，确认后才计入对应原因。</p>';

  const logs = S.logs.slice().sort((a, b) => (a.date === b.date ? (a.id < b.id ? 1 : -1) : (a.date < b.date ? 1 : -1))).slice(0, 20);
  el('logList').innerHTML = logs.length
    ? logs.map(l => '<div class="log-row"><span>' + l.date + '</span><span>' + esc(l.chapterId ? shortChapter(l.chapterId) : '未分类') +
        '</span><span><b>' + l.minutes + '</b> 分钟</span><span class="muted">' + esc(l.note || '') + '</span>' +
        '<button class="btn sm danger" onclick="A.delLog(\'' + l.id + '\')">删</button></div>').join('')
    : '<p class="muted">暂无学习记录。</p>';
}

function renderSettings(){
  el('sExam').value = S.settings.examDate;
  el('sGoal').value = S.settings.dailyGoal;
  el('sTarget').value = S.settings.targetScore;

  if (S.plan){
    const T = S.plan.totalDays;
    const seg = [
      ['基础阶段', 0, Math.ceil(T * 0.35) - 1],
      ['强化阶段', Math.ceil(T * 0.35), Math.ceil(T * 0.70) - 1],
      ['真题阶段', Math.ceil(T * 0.70), Math.ceil(T * 0.90) - 1],
      ['冲刺阶段', Math.ceil(T * 0.90), T - 1]
    ];
    el('planInfo').innerHTML =
      '<p class="muted">当前计划：' + S.plan.startAt + ' → ' + S.plan.examDate + '（共 ' + T + ' 天，生成于 ' + (S.plan.generatedAt || '—') + '）</p>' +
      '<table><tr><th>阶段</th><th>日期范围</th></tr>' +
      seg.map(x => '<tr><td>' + x[0] + '</td><td>' + addDays(S.plan.startAt, x[1]) + ' ~ ' + (x[2] >= x[1] ? addDays(S.plan.startAt, x[2]) : '—') + '</td></tr>').join('') +
      '</table>' +
      '<div style="margin-top:10px"><button class="btn ghost" onclick="A.regenPlan()">按今天重新分配章节计划</button></div>';
  } else {
    el('planInfo').innerHTML = '<p class="muted">尚未生成。</p><button class="btn" onclick="A.regenPlan()">生成计划</button>';
  }
  el('storageInfo').textContent = '当前数据体积约 ' + (JSON.stringify(S).length / 1024).toFixed(1) + ' KB。';
}

function renderAll(){
  renderHeader(); renderDash(); renderLearn(); renderFormulas(); renderKP(); renderMistakeList(); renderPractice(); renderPapers(); renderStats(); renderSettings();
}

/* ---------------- 计时器 ---------------- */

function fmtHMS(sec){
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return (h ? h + ':' : '') + pad2(m) + ':' + pad2(s);
}
function updateTimerDisplay(){
  const T = S.timer;
  const sec = Math.floor(T.accumSec + (T.running ? (Date.now() - T.startTs) / 1000 : 0));
  el('timerDisplay').textContent = fmtHMS(sec);
  if (typeof StudyUI !== 'undefined') StudyUI.updateTimer();
}
function syncTimerBtn(){ el('timerBtn').textContent = S.timer.running ? '⏸ 暂停' : '▶ 开始'; }
function tick(){
  updateTimerDisplay();
  tickN++;
  if (tickN % 60 === 0){ renderHeader(); renderDash(); } // 跨天/跨小时自动刷新
}

/* ---------------- 表单提交 ---------------- */

function onMistakeSubmit(e){
  e.preventDefault();
  const date = el('mDate').value || todayStr();
  const m = {
    id: uid(), date,
    source: el('mSrc').value.trim(),
    chapterId: el('mChapter').value,
    reason: el('mReason').value || REASONS[0],
    desc: el('mDesc').value.trim(),
    wrong: el('mWrong').value.trim(),
    correct: el('mCorrect').value.trim(),
    stage: 0, nextReview: addDays(date, 1), history: [], mastered: false
  };
  if (!m.source || !m.desc || !m.chapterId){ toast('请至少填写题源、章节和描述'); return; }
  reviewEngine().setReason(m, m.reason, m.reason !== '未归因', new Date().toISOString());
  m.recurrences = [];
  const next = JSON.parse(JSON.stringify(S)); next.mistakes.unshift(m);
  if (!commitMistakeChange(next)) return;
  e.target.reset();
  el('mDate').value = todayStr();
  el('mChapter').value = SYLLABUS[0].id;
  el('mistakeAdd').removeAttribute('open');
  renderMistakeList(); renderDash();
  toast('已入错题本：下次复习 ' + m.nextReview);
}

function onPaperSubmit(e){
  e.preventDefault();
  const score = parseFloat(el('pScore').value);
  if (!(score >= 0 && score <= 150)){ toast('分数应在 0 ~ 150 之间'); return; }
  S.papers.push({
    id: uid(), date: el('pDate').value || todayStr(),
    name: el('pName').value.trim() || '未命名', type: el('pType').value,
    score, note: el('pNote').value.trim()
  });
  save();
  e.target.reset();
  el('pDate').value = todayStr();
  renderPapers();
  toast('成绩已记录');
}

function onSettingsSubmit(e){
  e.preventDefault();
  const exam = el('sExam').value;
  if (!exam){ toast('请设置考试日期'); return; }
  const examChanged = exam !== S.settings.examDate;
  S.settings.examDate = exam;
  S.settings.dailyGoal = parseInt(el('sGoal').value, 10) || 240;
  S.settings.targetScore = parseInt(el('sTarget').value, 10) || 120;
  if (examChanged){
    S.plan = generatePlan(todayStr(), exam, SYLLABUS);
    S.plan.generatedAt = todayStr();
  }
  save(); renderAll();
  toast(examChanged ? '设置已保存，学习计划已按新考试日更新' : '设置已保存');
}

/* 错题详情里的选项快照：绿=正确答案，红=我当时的错选 */
function mistakeOptsHtml(m){
  if (!m || !Array.isArray(m.opts) || !m.opts.length) return '';
  return '<label style="margin-top:8px">题目选项（绿=正确答案' + (typeof m.wrongIdx === 'number' ? '，红=我当时的错选' : '') + '）</label>' +
    '<div class="opts" style="margin-top:4px">' + m.opts.map((o, oi) => {
      let cls = 'opt';
      if (oi === m.ansIdx) cls += ' right';
      else if (oi === m.wrongIdx) cls += ' wrongpick';
      else cls += ' dim';
      return '<div class="' + cls + '" style="cursor:default"><span class="letter">' + 'ABCD'[oi] + '</span><span>' + mathHtml(o) + '</span></div>';
    }).join('') + '</div>';
}

function editMistake(id){
  const m = S.mistakes.find(x => x.id === id);
  if (!m) return;
  const statusLine = m.mastered
    ? '✅ 已掌握 · 累计复习 ' + m.history.length + ' 次'
    : '第 ' + (m.stage + 1) + '/' + REVIEW_STEPS.length + ' 轮 · 下次复习 ' + m.nextReview + ' · 已复习 ' + m.history.length + ' 次';
  openModal(
    '<h3>错题详情</h3><p class="muted">' + esc(statusLine) + '</p>' +
    (typeof StudyUI !== 'undefined' ? StudyUI.mistakeHistoryHtml(m) : '') +
    '<form onsubmit="return A.saveMistakeEdit(event,\'' + m.id + '\')">' +
    '<div class="row"><div class="fld"><label>题源</label><input id="eSrc" value="' + esc(m.source) + '"></div>' +
    '<div class="fld"><label>章节</label><select id="eChapter"></select></div>' +
    '<div class="fld"><label>错误原因</label><select id="eReason"></select></div>' +
    '<div class="fld"><label>记录日期</label><input type="date" id="eDate" value="' + m.date + '"></div></div>' +
    '<label class="reason-confirm"><input type="checkbox" id="eReasonConfirmed"' + (reviewEngine().reasonStatus(m).confirmed ? ' checked' : '') + '>我已核对本次错误原因（未勾选则保留为待确认）</label>' +
    '<label style="margin-top:10px">题目 / 错因描述</label><textarea id="eDesc" rows="3">' + esc(m.desc) + '</textarea>' +
    mistakeOptsHtml(m) +
    '<label style="margin-top:8px">我当时的错解</label><textarea id="eWrong" rows="2">' + esc(m.wrong) + '</textarea>' +
    '<label style="margin-top:8px">正确思路 / 关键步骤</label><textarea id="eCorrect" rows="3">' + esc(m.correct) + '</textarea>' +
    '<div class="row" style="margin-top:14px"><button class="btn" type="submit">保存修改</button>' +
    (m.mastered
      ? '<button class="btn warn" type="button" onclick="A.toggleMastered(\'' + m.id + '\')">取消掌握</button>'
      : '<button class="btn ok" type="button" onclick="A.toggleMastered(\'' + m.id + '\')">直接标记已掌握</button>') +
    '<button class="btn danger" type="button" onclick="A.delMistake(\'' + m.id + '\')">删除</button>' +
    '<button class="btn ghost" type="button" onclick="A.closeModal()">关闭</button></div></form>'
  );
  el('eChapter').innerHTML = chapterOptions(false);
  // 兼容导入数据中的未知章节：原样保留，避免保存时被悄悄改成第一章
  if (!chapterById(m.chapterId)){
    const o = document.createElement('option');
    o.value = m.chapterId; o.textContent = '未知章节：' + m.chapterId;
    el('eChapter').appendChild(o);
  }
  el('eChapter').value = m.chapterId;
  el('eReason').innerHTML = Array.from(new Set(REASONS.concat(m.reason || '未归因'))).map(r => '<option>' + esc(r) + '</option>').join('');
  el('eReason').value = m.reason || '未归因';
}

/* ---------------- 数据导入导出 ---------------- */

function exportData(){
  S.settings.lastBackup = todayStr();
  StudyStorage.download(persistenceStore().backup(S), STORE_KEY + '-backup-' + todayStr() + '.json');
  save();
  toast('备份下载已发起，请确认文件已保存');
}

function importData(file){
  const r = new FileReader();
  r.onload = () => {
    try {
      const prepared = persistenceStore().prepareImport(r.result);
      const unidentified = prepared.unidentified ? '该旧备份无法自动识别科目，请确认它属于本科目。\n' : '';
      if (!confirm(unidentified + prepared.summary + '\n导入将覆盖本科当前记录，并保留覆盖前的原文。请先导出当前页面尚未保存的修改。确定继续？')) return;
      if (!persistenceStore().save(prepared.state, { replace: true })){
        storageStatus(); toast('导入失败，当前学习记录未被替换'); return;
      }
      S = prepared.state; refreshImportedState(); toast('备份已导入并保存');
    } catch (e) { toast('导入失败：' + e.message); }
  };
  r.onerror = () => toast('无法读取备份文件，当前记录未改变');
  r.readAsText(file);
}

function clearData(){
  if (!confirm('确定清空本科目的全部记录？建议先导出当前记录。')) return;
  if (!confirm('再次确认清空？覆盖前将保留浏览器原始记录，可在数据恢复中恢复。')) return;
  const next = defaultState();
  next.plan = generatePlan(todayStr(), next.settings.examDate, SYLLABUS);
  next.plan.generatedAt = todayStr();
  if (!persistenceStore().save(next, { replace: true })){
    storageStatus(); toast('清空失败，原记录未被替换'); return;
  }
  S = next; refreshImportedState(); toast('本科记录已清空');
}

/* ---------------- 事件动作（供内联 onclick 调用） ---------------- */

function goTab(name){
  if (!document.getElementById('tab-' + name)) return;
  const renderers = { dash: renderDash, learn: renderLearn, pq: renderPractice, mistake: renderMistakeList, kp: renderKP, paper: renderPapers, stats: renderStats, settings: renderSettings };
  if (renderers[name]) renderers[name]();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
  if (typeof StudyUI !== 'undefined') StudyUI.onTab(name);
}
function cycleKp(pid){
  setKp(pid, (kpStatus(pid) + 1) % 4);
  save(); renderKP(); renderDash();
}
function commitMistakeChange(next){
  if (!persistenceStore().save(next)){
    storageStatus(); toast('修改尚未保存，当前错题记录未改变，请导出备份或重试'); return false;
  }
  S = next; storageStatus(); return true;
}
function confirmMistakeReason(id, reason){
  const current = S.mistakes.find(x => x.id === id);
  if (!current || (!REASONS.includes(reason) && reason !== current.reason)) return false;
  const next = JSON.parse(JSON.stringify(S)), m = next.mistakes.find(x => x.id === id);
  reviewEngine().setReason(m, reason, reason !== '未归因', new Date().toISOString());
  if (!commitMistakeChange(next)) return false;
  renderMistakeList(); renderDash();
  toast(m.reasonConfirmed ? '本次错误原因已确认' : '已保留为未归因'); return true;
}
function review(id, ok){
  const current = S.mistakes.find(x => x.id === id), today = todayStr();
  if (!current || !reviewEngine().isDue(current, today)) return false;
  const next = JSON.parse(JSON.stringify(S)), m = next.mistakes.find(x => x.id === id);
  scheduleNext(m, ok, today);
  if (!commitMistakeChange(next)) return false;
  renderMistakeList(); renderDash();
  toast(ok ? (m.mastered ? '最后一轮通过，此题已掌握！' : '已记录：进入下一轮复习') : '已记录：明天再复习一次');
  return true;
}
function delMistake(id){
  if (!confirm('确定删除这道错题？')) return;
  S.mistakes = S.mistakes.filter(m => m.id !== id);
  save(); closeModal(); renderMistakeList(); renderDash();
}
function saveMistakeEdit(ev, id){
  ev.preventDefault();
  const next = JSON.parse(JSON.stringify(S)), m = next.mistakes.find(x => x.id === id);
  if (!m) return false;
  m.source = el('eSrc').value.trim() || m.source;
  m.chapterId = el('eChapter').value || m.chapterId;
  reviewEngine().setReason(m, el('eReason').value, el('eReasonConfirmed').checked, new Date().toISOString());
  m.date = el('eDate').value || m.date;
  m.desc = el('eDesc').value.trim(); m.wrong = el('eWrong').value.trim(); m.correct = el('eCorrect').value.trim();
  if (!commitMistakeChange(next)) return false;
  closeModal(); renderMistakeList(); renderDash(); toast('已保存');
  return false;
}
function toggleMastered(id){
  const next = JSON.parse(JSON.stringify(S)), m = next.mistakes.find(x => x.id === id);
  if (!m) return false;
  if (m.mastered){ m.mastered = false; m.stage = 0; m.nextReview = addDays(todayStr(), 1); }
  else { m.mastered = true; m.nextReview = null; }
  if (!commitMistakeChange(next)) return false;
  closeModal(); renderMistakeList(); renderDash();
  toast(m.mastered ? '已标记为掌握' : '已放回复习队列');
}
function delPaper(id){
  if (!confirm('删除这条成绩记录？')) return;
  S.papers = S.papers.filter(p => p.id !== id);
  save(); renderPapers();
}
function delLog(id){
  if (!confirm('删除这条学习记录？')) return;
  S.logs = S.logs.filter(l => l.id !== id);
  save(); renderDash(); renderStats();
}
function toggleTimer(){
  const T = S.timer;
  if (T.running){
    T.accumSec += (Date.now() - T.startTs) / 1000;
    T.running = false; T.startTs = 0;
  } else {
    T.startTs = Date.now();
    T.running = true;
    T.chapterId = el('timerChapter').value || null;
  }
  save(); syncTimerBtn(); updateTimerDisplay();
}
function finishTimer(){
  const T = S.timer;
  const total = T.accumSec + (T.running ? Math.max(0, (Date.now() - T.startTs) / 1000) : 0);
  if (total <= 0){ toast('还没有开始计时'); return; }
  const minutes = Math.max(1, Math.round(total / 60));
  const next = JSON.parse(JSON.stringify(S));
  next.logs.push({ id: uid(), date: todayStr(), minutes, chapterId: T.chapterId || el('timerChapter').value || null, note: '计时学习' });
  Object.assign(next.timer, { running: false, startTs: 0, accumSec: 0 });
  if (!persistenceStore().save(next)){
    storageStatus(); toast('计时归档失败，计时与原记录仍保留，请导出备份或重试'); return;
  }
  S = next; storageStatus(); syncTimerBtn(); updateTimerDisplay();
  renderDash(); renderStats();
  toast('已记录 ' + minutes + ' 分钟学习');
}
function quickAdd(){
  const min = parseInt(el('quickMin').value, 10);
  if (!min || min <= 0){ toast('请输入有效的分钟数'); return; }
  addLog(min, el('quickChapter').value || null, el('quickDate').value || todayStr(), '手动补记');
  el('quickMin').value = '';
  renderDash(); renderStats();
  toast('已记录 ' + min + ' 分钟');
}
function regenPlan(){
  if (!confirm('将按「今天 → 考试日」重新分配各章节的时间窗口。知识点掌握状态、错题、学习记录都不会变。继续？')) return;
  S.plan = generatePlan(todayStr(), S.settings.examDate, SYLLABUS);
  S.plan.generatedAt = todayStr();
  save(); renderAll();
  toast('学习计划已更新');
}
function openModal(html){ el('modalBox').innerHTML = html; el('modal').classList.remove('hidden'); if (typeof StudyUI !== 'undefined') StudyUI.modalOpened(); }
function closeModal(){ el('modal').classList.add('hidden'); if (typeof StudyUI !== 'undefined') StudyUI.modalClosed(); }

const A = {
  openQuestion, openPoint, openCard,
  goTab, cycleKp, review, confirmMistakeReason, editMistake, delMistake, saveMistakeEdit, toggleMastered,
  pickOpt, revealAns, selfJudge, retryQuestion, pqNav, markLesson, practiceLesson, practicePoint, clearPqIds, toggleFav, revealF,
  delPaper, delLog, toggleTimer, finishTimer, quickAdd, regenPlan,
  exportData, clearData, closeModal, retrySave, exportRawData, exportPreservedData, retryStorage, restoreSnapshot
};

/* ---------------- 初始化 ---------------- */

function chapterOptions(includeUncategorized){
  const opts = SYLLABUS.map(c =>
    '<option value="' + c.id + '">' + (c.subject === '高等数学' ? '高数' : '线代') + ' · ' + esc(shortChapter(c.id)) + '</option>').join('');
  return (includeUncategorized ? '<option value="">未分类</option>' : '') + opts;
}

function fillSelects(){
  const withUncat = chapterOptions(true);
  el('timerChapter').innerHTML = withUncat;
  el('timerChapter').value = S.timer.chapterId || '';
  el('quickChapter').innerHTML = withUncat;
  el('mChapter').innerHTML = chapterOptions(false);
  el('mChapter').value = SYLLABUS[0].id;
  el('mfChapter').innerHTML = '<option value="">全部章节</option>' + chapterOptions(false);
  el('mReason').innerHTML = REASONS.map(r => '<option>' + r + '</option>').join('');
  el('mfReason').innerHTML = '<option value="">全部原因</option>' + REASONS.map(r => '<option>' + r + '</option>').join('');
  el('pqChapter').innerHTML = '<option value="">全部章节</option>' + chapterOptions(false);
  el('fCat').innerHTML = FORMULA_CATS.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');
  el('kpSubjectSel').innerHTML = ['全部', '高等数学', '线性代数'].map(s => '<option>' + s + '</option>').join('');
  el('mDate').value = todayStr();
  el('pDate').value = todayStr();
  el('quickDate').value = todayStr();
}

function init(){
  load();
  if (!S.plan){
    S.plan = generatePlan(todayStr(), S.settings.examDate, SYLLABUS);
    S.plan.generatedAt = todayStr();
    save();
  }
  fillSelects();

  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => goTab(b.dataset.tab)));
  el('mistakeForm').addEventListener('submit', onMistakeSubmit);
  el('paperForm').addEventListener('submit', onPaperSubmit);
  el('settingsForm').addEventListener('submit', onSettingsSubmit);
  el('importFile').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });
  el('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  el('timerChapter').addEventListener('change', e => {
    // 计时进行中改选章节：随改随记，结束时按此章节归档
    if (S.timer.running){ S.timer.chapterId = e.target.value || null; save(); }
  });
  el('kpSubjectSel').addEventListener('change', e => { kpSubject = e.target.value; renderKP(); });
  el('kpSearch').addEventListener('input', e => { kpQuery = e.target.value; renderKP(); });
  el('mfStatus').addEventListener('change', e => { mFilter.status = e.target.value; renderMistakeList(); });
  el('mfChapter').addEventListener('change', e => { mFilter.chapter = e.target.value; renderMistakeList(); });
  el('mfReason').addEventListener('change', e => { mFilter.reason = e.target.value; renderMistakeList(); });
  ['pqChapter', 'pqDiff', 'pqScope'].forEach(id => el(id).addEventListener('change', () => {
    pqScopeSnapshot = null;
    if (typeof StudyUI !== 'undefined') StudyUI.clearPracticeSource();
    pqFilter.ch = el('pqChapter').value;
    pqFilter.diff = parseInt(el('pqDiff').value, 10) || 0;
    pqFilter.scope = el('pqScope').value;
    pqFilter.ids = null; // 手动筛选即退出教学配套模式
    pqIndex = 0;
    renderPractice();
  }));
  el('fSearch').addEventListener('input', e => { fQuery = e.target.value; renderFormulas(); });
  el('fCat').addEventListener('change', e => { fCatFilter = e.target.value; renderFormulas(); });
  el('fQuiz').addEventListener('change', e => { fQuiz = e.target.checked; fRevealed.clear(); renderFormulas(); });
  el('fOnlyFav').addEventListener('change', e => { fOnlyFav = e.target.checked; renderFormulas(); });

  window.addEventListener('storage', event => {
    if (event.key === STORE_KEY || event.key === null){
      persistenceStore().checkExternal();
      storageStatus();
    }
  });
  renderAll();
  syncTimerBtn();
  updateTimerDisplay();
  if (typeof StudyUI !== 'undefined') StudyUI.mount({
    storeKey: STORE_KEY, getState: () => S, actions: A, save,
    syllabus: SYLLABUS, lessons: LESSONS, reasons: REASONS, today: todayStr,
    due: dueMistakes, math: mathHtml, chapterName: shortChapter, toast, openModal, questionLinks: relatedKnowledgeHtml
  });
  storageStatus();
  setInterval(tick, 1000);
}

if (typeof document !== 'undefined'){
  if (typeof window !== 'undefined') window.A = A;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}

/* ---------------- Node 测试导出 ---------------- */
if (typeof module !== 'undefined' && module.exports){
  module.exports = {
    pad2, fmtDate, parseDate, todayStr, addDays, diffDays,
    REVIEW_STEPS, REASONS, KP_STATUS, SYLLABUS,
    phaseFor, generatePlan, scheduleNext, dueMistakes, calcStreak, uid, backupDueDays,
    defaultState, recordAnswer, addQToMistake, mistakeOptsHtml,
    __testSetState: s => { S = s; }
  };
}
