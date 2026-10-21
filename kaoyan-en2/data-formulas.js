'use strict';
/* 英语二速查卡手册：句型 / 方法 / 词缀 / 搭配。 */
var FORMULA_CATS = [
  { id: 'all', name: '全部分类' },
  { id: 'v1', name: '词汇·词缀与僻义' },
  { id: 'v2', name: '词汇·高频搭配' },
  { id: 'g1', name: '语法·长难句信号' },
  { id: 'r1', name: '阅读·题型解法' },
  { id: 'r2', name: '完形与新题型' },
  { id: 't1', name: '翻译·结构译法' },
  { id: 'w1', name: '写作·小作文句型' },
  { id: 'w2', name: '写作·图表作文句型' }
];

var FORMULAS = [
/* v1 */
{ id: 'E001', cat: 'v1', tag: '高频', name: '否定前缀四件套',
  f: 'un-（unfair）/ in-（im-, il-, ir-：impossible, illegal, irregular）/ dis-（disagree）/ mis-（mislead 误导）' },
{ id: 'E002', cat: 'v1', tag: '高频', name: '方向与程度前缀',
  f: 'inter-（相互/之间）/ trans-（跨越 transfer）/ sub-（下面）/ over-（过度）/ under-（不足）/ re-（再次）/ pre-（预先）' },
{ id: 'E003', cat: 'v1', tag: '高频', name: '常见后缀',
  f: '名词：-tion / -ment / -ness / -ity / -ship；形容词：-able / -ful / -less / -ous / -ive；表人：-ist / -er / -ian' },
{ id: 'E004', cat: 'v1', tag: '高频', name: '八大高频词根',
  f: 'spect=look（inspect 检查 / prospect 前景）；dict=say（predict 预言）；struct=build（construct）；duct=lead（conduct）；port=carry（transport）；fer=carry（transfer）；mit/miss=send（transmit）；ject=throw（project）' },
{ id: 'E005', cat: 'v1', tag: '高频', name: '熟词僻义清单（真题向）',
  f: 'address=处理；school=学派；book=预订；interest=利益；odd=奇怪；subject=使遭受；weather=度过；discipline=学科；game=猎物；fine=罚款',
  tip: '语义讲不通时第一反应查僻义。' },

/* v2 */
{ id: 'E010', cat: 'v2', tag: '高频', name: 'to 后接 doing 的高频词',
  f: 'be committed to doing / be used to doing / look forward to doing / object to doing / be devoted to doing / pay attention to doing',
  tip: '这些 to 全是介词，后接名词或动名词。' },
{ id: 'E011', cat: 'v2', tag: '高频', name: '完形高频固定搭配 A',
  f: 'take … into account 考虑；have access to 可获得；in terms of 就…而言；account for 解释/占比；contribute to 促成' },
{ id: 'E012', cat: 'v2', tag: '常用', name: '完形高频固定搭配 B',
  f: 'rely on 依靠；be involved in 参与；be aware of 意识到；result in 导致 / result from 由…造成；at the expense of 以…为代价' },
{ id: 'E013', cat: 'v2', tag: '常用', name: '形近词对（完形最爱）',
  f: 'adapt 适应 / adopt 采纳；effect 效果(n) / affect 影响(v)；considerable 可观 / considerate 体贴；principal 主要 / principle 原则' },
{ id: 'E014', cat: 'v2', tag: '常用', name: '近义强度阶梯',
  f: 'increase < surge/soar 激增；decrease < decline/drop < plummet 骤降；important < vital/crucial 关键' },

/* g1 */
{ id: 'E020', cat: 'g1', tag: '高频', name: '长难句切分点',
  f: '连词（and/but）· 从句引导词（that/which/who/when/while/although/if）· 介词短语边界（in/on/for/of 开头）——三处下刀切意群' },
{ id: 'E021', cat: 'g1', tag: '高频', name: '定语从句 vs 同位语从句（that）',
  f: 'that 在从句中作成分（主/宾）= 定语从句；不作任何成分、只起连接 = 同位语/名词性从句。检验：去掉 that 从句仍完整 → 同位语从句' },
{ id: 'E022', cat: 'g1', tag: '高频', name: '分词逻辑主语口诀',
  f: '句首分词看主语：主语执行动作 → doing（Seeing the crowd, he…）；主语承受动作 → done（Seen from the hill, the city…）' },
{ id: 'E023', cat: 'g1', tag: '常用', name: '倒装触发词',
  f: 'Never / Not until / Only + 状语 / Hardly / Seldom 开头 → 部分倒装（助动词提前）：Never before has the city…' },
{ id: 'E024', cat: 'g1', tag: '常用', name: '强调句框架',
  f: 'It is/was + 被强调部分 + that/who + 其余。写作反向利用：It was not until… that…（直到…才…）' },

/* r1 */
{ id: 'E030', cat: 'r1', tag: '高频', name: '阅读做题流程',
  f: '读题干（不读选项）→ 划定位词（专名/数字 > 名词 > 动词）→ 段落顺序定位 → 精读定位句±1 句 → 选项与原文同义比对' },
{ id: 'E031', cat: 'r1', tag: '高频', name: '细节题：答案 = 同义替换',
  f: '正确项是定位句的改写（换词/换句式）；原词大量复现 = 原词陷阱；逐词核对动词方向（正/反/程度）' },
{ id: 'E032', cat: 'r1', tag: '高频', name: '主旨题',
  f: '串各段首句 + 高频词；主旨常在首段末句或 However 之后；选项过大（过度引申）过小（某段内容）均排除' },
{ id: 'E033', cat: 'r1', tag: '高频', name: '推理题铁律',
  f: '只走半步：从原文直接顺出的结论；不引入新信息/常识；绝对化措辞（only/never/all/completely）基本可排除' },
{ id: 'E034', cat: 'r1', tag: '高频', name: '例证题与态度题',
  f: '例证题：答案在例子前后的观点句（例子是证词、观点是判决）；态度题：抓形容词副词色彩，转折后是真心话，英语二多为客观中性' },
{ id: 'E035', cat: 'r1', tag: '常用', name: '原文高频考点区',
  f: 'but/however/yet 之后；引语与观点动词（argue/believe/suggest/claim）之后；因果关系词（because/result in）之后；数字与例子周围' },

/* r2 */
{ id: 'E040', cat: 'r2', tag: '高频', name: '完形四大逻辑词表',
  f: '转折：however / but / nevertheless；因果：therefore / thus / consequently；递进：moreover / likewise / similarly；对比：while / whereas / in contrast' },
{ id: 'E041', cat: 'r2', tag: '高频', name: '完形做题铁律',
  f: '首句不设空必读（定主旨）；纠结空先跳（后文有复现提示）；上下文语境第一 > 搭配 > 词义辨析；时间 15~18 分钟' },
{ id: 'E042', cat: 'r2', tag: '高频', name: '新题型·两类与流程',
  f: '多项对应：左列专名回文定位 → 观点在引语/argue 之后；小标题：段首二句+末句+高频词 → 选覆盖全段的项' },
{ id: 'E043', cat: 'r2', tag: '常用', name: '新题型与阅读的区别',
  f: '新题型多为原词对应（少同义替换）——认出即匹配；做完用“剩余选项复核”检查一遍' },

/* t1 */
{ id: 'E050', cat: 't1', tag: '高频', name: '翻译三步法',
  f: '拆（连词/引导词/介词处切意群）→ 译（逐块直译+代词明确指代）→ 组（按中文重心在后重排，补逻辑词）' },
{ id: 'E051', cat: 't1', tag: '高频', name: '定语从句译法',
  f: '短从句（8 词内）→ 前置“…的”；长从句 → 拆成并列分句（重复先行词或用“它”）：…, and it …' },
{ id: 'E052', cat: 't1', tag: '高频', name: '被动语态译法',
  f: 'It is believed that… → 人们认为/据信；be considered → 被视为/可以说是；无施动者 → 中文直接省“被”' },
{ id: 'E053', cat: 't1', tag: '常用', name: '译后自查三问',
  f: '关键词译对了吗？有漏译吗？读出来像中国话吗？——三问各对应“准确/完整/通顺”三条评分线' },

/* w1 */
{ id: 'E060', cat: 'w1', tag: '高频', name: '小作文三段框架',
  f: '① I am Li Ming, … . I am writing to（目的）② To begin with… / Moreover… / Finally… ③ I would appreciate it if… / Looking forward to your reply.' },
{ id: 'E061', cat: 'w1', tag: '高频', name: '万能理由五件套',
  f: 'convenient and efficient 方便高效 / promote communication 促进交流 / relieve stress 缓解压力 / broaden one’s horizons 开阔视野 / benefit physical and mental health 有益身心' },
{ id: 'E062', cat: 'w1', tag: '常用', name: '书信功能句',
  f: '建议：It would be beneficial to…；感谢：I am truly grateful for…；道歉：Please accept my sincere apology for…；邀请：It would be our honor if you could…' },
{ id: 'E063', cat: 'w1', tag: '常用', name: '格式与语域',
  f: '称呼 Dear Sir or Madam / Dear Mr. Smith；落款 Yours sincerely, Li Ming；正式文体：无缩写（do not）、无口语词' },

/* w2 */
{ id: 'E070', cat: 'w2', tag: '高频', name: '图表作文第一段（描述）',
  f: 'What is clearly shown in the chart is + 主体 + 趋势 + 数据：The number of … increased steadily from A in 2018 to B in 2023.（只描述不评论）' },
{ id: 'E071', cat: 'w2', tag: '高频', name: '图表作文第二段（原因）',
  f: 'Two factors may account for this trend. To begin with, …（万能理由1展开）. Moreover, …（万能理由2展开）.' },
{ id: 'E072', cat: 'w2', tag: '高频', name: '图表作文第三段（预测/建议）',
  f: 'From my perspective, this trend is likely to continue in the foreseeable future, provided that …（条件/建议）' },
{ id: 'E073', cat: 'w2', tag: '高频', name: '数据描述句型库',
  f: '上升：increase / rise / grow / surge（激增）；下降：decrease / decline / drop / plummet（骤降）；占比：account for 30%；比较：nearly twice as many … as …；平稳：remain stable at' },
{ id: 'E074', cat: 'w2', tag: '高频', name: '图表作文时态铁律',
  f: '过去年份的数据 → 过去时（increased）；持续到现在 → 现在完成时（has increased）；图表标题/普遍现象 → 现在时' },
{ id: 'E075', cat: 'w2', tag: '常用', name: '写作语法自查三查',
  f: '一查主谓一致（The number of… + 单数动词）；二查时态统一；三查 although/but、because/so 不连用' }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { FORMULAS: FORMULAS, FORMULA_CATS: FORMULA_CATS };
