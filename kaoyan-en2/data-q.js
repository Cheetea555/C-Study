'use strict';
/* 英语二习题库：8 章 × 5 题 = 40 题。 */
var QUESTIONS = [

/* ============ e01 考纲词汇 ============ */
{ id: 'Qe01-1', ch: 'e01', diff: 1, type: 'choice',
  q: '熟词僻义：句子 “The government must address the issue of aging population.” 中 address 的意思是（　）',
  opts: ['写地址', '发表演讲', '处理、解决', '称呼'],
  ans: 2,
  sol: 'address 是英语二高频熟词僻义：address an issue = 处理问题。类似必记：school（学派）、book（预订）、interest（利益）、game（猎物）。' },

{ id: 'Qe01-2', ch: 'e01', diff: 2, type: 'choice',
  q: '选择填空：Companies must quickly ___ to the rapidly changing market, or they will be left behind.',
  opts: ['adopt', 'adapt', 'adept', 'adjust to'],
  ans: 1,
  sol: 'adapt to = 适应；adopt = 采纳/收养；adept 是形容词“熟练的”；adjust to 虽也表“适应”，但空后已有 to 且需动词原形……注意 D 项 adjust to 若填入则成 “adjust to to the market”，重复错误。adapt/adopt 这对形近词是完形常客。' },

{ id: 'Qe01-3', ch: 'e01', diff: 2, type: 'choice',
  q: '固定搭配：She is deeply committed ___ improving the education of rural children.',
  opts: ['to', 'in', 'for', 'with'],
  ans: 0,
  sol: 'be committed to 中的 to 是介词，后接名词/动名词：be committed to doing sth.。同类陷阱词：be used to doing / look forward to doing / object to doing——“to 后加 doing”整组背。' },

{ id: 'Qe01-4', ch: 'e01', diff: 2, type: 'choice',
  q: '词义理解：与 substantial 意思最接近的词是（　）',
  opts: ['considerable', 'subsequent', 'artificial', 'superficial'],
  ans: 0,
  sol: 'substantial = 大量的、可观的 ≈ considerable。其余是形近干扰：subsequent 随后的、artificial 人造的、superficial 肤浅的。阅读词义题常见套路：正确项是“认识的同义词”，干扰项是“长得像的另一个词”。' },

{ id: 'Qe01-5', ch: 'e01', diff: 2, type: 'fill',
  q: '熟词僻义填空（写中文词义）：“Different schools of thought have emerged on this issue.” 中 school 的意思是______。',
  ans: '学派',
  sol: 'school of thought = 思想流派/学派。真题中考过的熟词僻义还有：odd（奇怪的）、subject（使遭受）、weather（度过）、discipline（学科）。遇到“认识但讲不通”的词，先怀疑僻义。' },

/* ============ e02 词根词缀 ============ */
{ id: 'Qe02-1', ch: 'e02', diff: 1, type: 'choice',
  q: '前缀 inter- 的含义是（由 international / interview / interact 归纳）',
  opts: ['之间、相互', '跨越、转移', '下面、次级', '反对、逆'],
  ans: 0,
  sol: 'inter- = 之间/相互：international（国家之间）、interview（互相看→面试）、interact（互动）。B 是 trans-（transfer 转移），C 是 sub-（subway），D 是 counter-（counterattack）。' },

{ id: 'Qe02-2', ch: 'e02', diff: 2, type: 'choice',
  q: '后缀判断：下列单词中表示“人”的后缀是（　）',
  opts: ['-ness（happiness）', '-ment（development）', '-ist（scientist）', '-tion（production）'],
  ans: 2,
  sol: '-ist 表“…的人/主义者”：scientist、artist、economist。-ness/-ment/-tion 都是名词后缀但表抽象事物。认识后缀还能帮写作换词性：develop → development，happy → happiness。' },

{ id: 'Qe02-3', ch: 'e02', diff: 2, type: 'choice',
  q: 'mislead 一词中前缀 mis- 的含义及整词词义是（　）',
  opts: ['错误地；误导', '缺少；缺少引导', '再次；再次引导', '提前；提前引导'],
  ans: 0,
  sol: 'mis- = 错误地：mislead 误导、misunderstand 误解、misuse 滥用。同类高频否定前缀：mal-（功能失常）、dis-（相反动作）。' },

{ id: 'Qe02-4', ch: 'e02', diff: 3, type: 'choice',
  q: '下列哪个单词含有词根 spect（= look，看）？（　）',
  opts: ['predict', 'inspect', 'conduct', 'manufacture'],
  ans: 1,
  sol: 'spect = look：inspect（往里看→检查）、respect（反复看→尊重）、prospect（向前看→前景）。A 的 dict = say（预言），C 的 duct = lead（引导），D 的 fact/manu = 做/手（制造）。考场遇到生词：先拆词缀再认词根，猜出大意后用上下文验证。' },

{ id: 'Qe02-5', ch: 'e02', diff: 1, type: 'choice',
  q: 'bilingual 一词的词义是（bi- = 二，lingua = 语言）',
  opts: ['语言的', '双语的', '方言的', '舌头的'],
  ans: 1,
  sol: 'bi-（二）+ lingua（语言）+ -al（形容词后缀）= 双语的。同族：bicycle、bilateral（双边的）；对比：tri-（三）、multi-（多）、mono-（单）。用词根拼词义，是猜词题的正规军打法。' },

/* ============ e03 长难句 ============ */
{ id: 'Qe03-1', ch: 'e03', diff: 2, type: 'choice',
  q: '句子 “What matters most in learning a foreign language is consistent practice.” 的主干结构是（　）',
  opts: ['What matters most 是主语从句，is 是系动词，practice 是表语', 'matters 是谓语动词', 'learning 是主语', 'practice 是宾语'],
  ans: 0,
  sol: '主语从句 What matters most（最重要的东西）+ is + 表语 consistent practice（持续的练习）。判断主干先找“有时态的动词”——这里唯一的谓语是 is，前面的从句整体当主语。长难句第一刀永远切在谓语上。' },

{ id: 'Qe03-2', ch: 'e03', diff: 2, type: 'choice',
  q: '填引导词：The professor ___ lecture I attended yesterday will give a talk next week.',
  opts: ['who', 'whose', 'which', 'whom'],
  ans: 1,
  sol: '空后 lecture 是名词，需要“谁的”来连接：whose lecture = 教授的讲座（whose 既可指人也可指物）。做题口诀：引导词后直接跟名词，先考虑 whose。' },

{ id: 'Qe03-3', ch: 'e03', diff: 3, type: 'choice',
  q: '同位语从句填空：The fact ___ he failed the exam surprised all of us.',
  opts: ['which', 'that', 'what', 'whether（此处不通）'],
  ans: 1,
  sol: 'that 引导同位语从句，解释 fact 的内容，that 在从句中不充当成分——这是与定语从句 that 的根本区别（定语从句的 that 在从句里作主语或宾语）。同位语从句常挂在 fact / news / idea / belief 之后。' },

{ id: 'Qe03-4', ch: 'e03', diff: 3, type: 'choice',
  q: '强调句 “It was not until midnight that he came back.” 还原为普通语序是（　）',
  opts: ['He did not come back until midnight.', 'He came back at midnight sharp.', 'Not until midnight came he back.', 'He never came back.'],
  ans: 0,
  sol: '强调句框架 It was … that … 去掉后句子残缺还原：not until midnight → He did not come back until midnight（注意还原后要借助助动词 did）。写作中反向运用：把时间状语塞进 It was not until … that … 就是现成的高级句型。' },

{ id: 'Qe03-5', ch: 'e03', diff: 2, type: 'choice',
  q: '分词用法：___ from the hilltop, the whole city looks like a giant garden.',
  opts: ['Seen', 'Seeing', 'To see', 'See'],
  ans: 0,
  sol: '逻辑主语是 the whole city（城市“被看”），所以用过去分词 Seen。判断口诀：句首分词看主语——主语是动作的执行者用 doing，是承受者用 done。这也是写作中制造“高级感”最易错的结构。' },

/* ============ e04 完形填空 ============ */
{ id: 'Qe04-1', ch: 'e04', diff: 2, type: 'choice',
  q: '逻辑关系：Traditional teaching methods are effective. ___, they cannot meet the needs of digital-age learners. 空格处应填（　）',
  opts: ['Therefore', 'However', 'Moreover', 'Likewise'],
  ans: 1,
  sol: '前句肯定、后句指出局限 → 转折关系，填 However。Therefore 因果、Moreover 递进、Likewise 类比。完形逻辑题的固定动作：把前后句各压缩成一句中文，先定“顺/反/因/果”再选词。' },

{ id: 'Qe04-2', ch: 'e04', diff: 1, type: 'choice',
  q: '表示“因果”关系的连接词是（　）',
  opts: ['nevertheless', 'therefore', 'whereas', 'instead'],
  ans: 1,
  sol: 'therefore / thus / consequently / as a result 表因果；nevertheless 表让步转折、whereas 表对比、instead 表替代转折。逻辑连接词是完形的高频送分点，四大类各背 3 个。' },

{ id: 'Qe04-3', ch: 'e04', diff: 2, type: 'choice',
  q: '固定搭配填空：When making the decision, you should take his opinion into ___.',
  opts: ['account', 'consideration（搭配不同）', 'mind（搭配不同）', 'thought'],
  ans: 0,
  sol: 'take … into account = 把……考虑在内，是固定搭配原形。B、C 的正确形式分别是 take … into consideration / keep … in mind——完形最爱考“看起来都对、搭配不同”的三兄弟，靠整句背诵区分。' },

{ id: 'Qe04-4', ch: 'e04', diff: 2, type: 'choice',
  q: '完形解题中“词汇复现原则”指的是（　）',
  opts: ['正确答案常与本空前后（或全文）在语义上同义或同现', '反复出现的单词就是答案本身', '四个选项中选最长的一个', '凭语感直接选'],
  ans: 0,
  sol: '复现原则：命题人常让正确选项与上下文的某个词构成同义改写或搭配关系（同现 = 经常一起出现的词，如 doctor 与 patient）。它是“上下文语境”这一完形第一原则的具体落点。' },

{ id: 'Qe04-5', ch: 'e04', diff: 1, type: 'choice',
  q: '对比关系填空：Some people prefer to shop online, ___ others enjoy wandering in physical stores.',
  opts: ['while', 'so', 'because', 'unless'],
  ans: 0,
  sol: '前后是两类人的对比 → while（然而/而）。while 三大用法：时间“当…时”、让步“虽然”、对比“而”。完形中表对比的还有 whereas / in contrast / on the other hand。' },

/* ============ e05 阅读理解 ============ */
{ id: 'Qe05-1', ch: 'e05', diff: 2, type: 'choice',
  q: '阅读主旨题的正确选项特征是（　）',
  opts: ['覆盖全文核心话题，范围适中', '只概括某一段的内容', '范围越大越宏观越正确', '包含原文出现最多的原词'],
  ans: 0,
  sol: '主旨项要“不大不小”：过窄 = 只讲一段（以偏概全），过宽 = 超出文章范围（过度引申）。D 是经典陷阱：把原词堆在一起 ≠ 主旨，正确答案通常是同义改写而非原词复现。' },

{ id: 'Qe05-2', ch: 'e05', diff: 2, type: 'choice',
  q: '细节题的答案与原文的关系通常是（　）',
  opts: ['原文关键词的原词复现', '原文的同义替换（paraphrase）', '根据常识合理推断', '原文未提及但符合逻辑的内容'],
  ans: 1,
  sol: '正确项 = 定位句的同义改写（换词、换句式、换说法）；原词大量复现的选项反而是命题人挖的坑（“原词陷阱”）。C、D 都违反细节题“忠于定位句”的铁律。' },

{ id: 'Qe05-3', ch: 'e05', diff: 2, type: 'choice',
  q: '推理题（infer / suggest）正确答案的判断标准是（　）',
  opts: ['原文信息的下一步适度推理，不引入新信息', '可以引入常识中正确的内容', '推理链条越长越体现水平', '选择表述最绝对的选项'],
  ans: 0,
  sol: '考研推理是“半步推理”：从原文能直接顺出来的结论。引入原文没有的常识（即使那常识是对的）就是过度推理；绝对化措辞（only / never / all）的选项基本可排除。' },

{ id: 'Qe05-4', ch: 'e05', diff: 2, type: 'choice',
  q: '例证题（The author mentions … to …）的答案应该去哪里找？（　）',
  opts: ['例子内部的细节', '例子前后的观点句', '文章首段', '全文结论'],
  ans: 1,
  sol: '例子为观点服务：答案在例子之前（引出）或之后（总结）的论点句。在例子内部找细节 = 命题人最希望你犯的错。这条规律可一句话记死：例子是证词，观点才是判决。' },

{ id: 'Qe05-5', ch: 'e05', diff: 3, type: 'choice',
  q: '阅读做题顺序的最佳实践是（　）',
  opts: ['先通读全文再做题', '先读题干划关键词，再回文定位精读', '先看选项再猜答案', '从最后一题开始做'],
  ans: 1,
  sol: '“先题后文”：读题干（暂不读选项，防先入为主）→ 划定位词（人名/数字/专有名词优先）→ 按段落顺序定位 → 精读定位句及上下各一句 → 比对选项。通读全文再做题在考场上时间不够，且读时没有目标、记不住重点。' },

/* ============ e06 新题型 ============ */
{ id: 'Qe06-1', ch: 'e06', diff: 1, type: 'choice',
  q: '考研英语二新题型（Part B）常考的类型是（　）',
  opts: ['排序题', '多项对应与小标题对应', '完形补段', '段落翻译'],
  ans: 1,
  sol: '英语二新题型考过：多项对应（人物—观点匹配）、小标题对应、标题—段落匹配、左右栏对应等；排序题是英语一的常客。英语二新题型比阅读简单：基本是“原词定位”，很少同义改写。' },

{ id: 'Qe06-2', ch: 'e06', diff: 2, type: 'choice',
  q: '多项对应题的解题关键是（　）',
  opts: ['通读全文理解每句话', '用左列人名/专有名词回文定位，再与选项匹配', '按选项长度匹配', '按常识判断'],
  ans: 1,
  sol: '流程：圈出左列关键词（人名、机构名、专有名词）→ 回原文找该词出现处 → 精读其前后句（观点常在直接引语或 argue/believe/suggest 之后）→ 与右列选项比对。新题型的选项词形常与原文高度一致，认出即可匹配。' },

{ id: 'Qe06-3', ch: 'e06', diff: 2, type: 'choice',
  q: '小标题选择题中，一个合适的标题必须（　）',
  opts: ['与该段反复出现的话题词一致，且覆盖全段大意', '只概括段首第一句', '使用段中最长的句子', '与全文标题相同'],
  ans: 0,
  sol: '好标题 = 段落高频词 + 全段概括。只对应某一句的选项是干扰项（以偏概全）。技巧：先读段落首二句和末句、扫高频名词，再回选项找“同话题”的那个。' },

{ id: 'Qe06-4', ch: 'e06', diff: 2, type: 'choice',
  q: '新题型做完后的最佳检查方式是（　）',
  opts: ['凭感觉再读一遍', '通读全文逐句翻译', '用排除法复核：每个选项只用一次，剩余选项与剩余空位是否更合理', '不做检查，时间留给作文'],
  ans: 2,
  sol: '新题型选项互斥（各用一次），最稳的复核是“剩余匹配检查”：如果某个未用选项放到某空明显更顺，说明前面有错。这比通读省时且命中率高。' },

{ id: 'Qe06-5', ch: 'e06', diff: 2, type: 'choice',
  q: '新题型与阅读 Part A 在出题方式上的最大区别是（　）',
  opts: ['新题型更难，需要深层推理', '新题型多为原词对应，很少同义替换', '新题型不需要看原文', '新题型只考语法'],
  ans: 1,
  sol: '阅读 Part A 的答案通常是同义改写（要理解），新题型的答案多为原词/近形词对应（要定位）。这决定了复习策略：新题型主攻“定位与细心”，10 分钟拿 8 分以上是常规操作。' },

/* ============ e07 英译汉 ============ */
{ id: 'Qe07-1', ch: 'e07', diff: 1, type: 'choice',
  q: '英语二翻译（15 分）的考查形式与评分重点是（　）',
  opts: ['句子汉译英；语法优先', '段落英译汉；准确、完整、通顺', '段落汉译英；词汇优先', '篇章摘要；逻辑优先'],
  ans: 1,
  sol: '英语二翻译 = 一篇约 150 词的完整段落英译汉。评分看四点：关键词译对（准确）、无漏译（完整）、中文通顺（通顺）、无重大误解。三大失分点：代词指代错、定语从句硬译、被动语态直译成“被”。' },

{ id: 'Qe07-2', ch: 'e07', diff: 3, type: 'choice',
  q: '长句 “The report, which was based on a survey of 2,000 households, reveals a growing gap between urban and rural areas.” 的最佳译文是（　）',
  opts: ['这份基于 2000 户家庭调查的报告揭示了城乡之间日益扩大的差距。', '这份报告，它是基于 2000 户家庭调查的，揭示了城乡差距。', '报告揭示了差距，基于 2000 户调查，城乡之间越来越大。', '这份报告基于调查，2000 个家庭，揭示城乡差距在增长。'],
  ans: 0,
  sol: '非限制性定语从句短小 → 前置译成“基于……的报告”（A），比保留从句结构的 B 通顺。C 语序散乱、D 漏译且断句破碎。翻译三大铁律：修饰挂对主干、代词明确化、中文一句话说完整。' },

{ id: 'Qe07-3', ch: 'e07', diff: 2, type: 'choice',
  q: '“It is widely believed that regular exercise benefits both physical and mental health.” 的最佳译文是（　）',
  opts: ['它被广泛相信，规律运动有益身心健康。', '人们普遍认为，规律运动有益于身心健康。', '它广泛相信规律运动有益。', '规律运动被相信有益身心健康。'],
  ans: 1,
  sol: 'It is believed that… 型被动句的黄金译法：化被动为主动——“人们认为/据信/一般认为”。A/C/D 都保留了“它/被”的翻译腔。被动语态是英语二翻译的必考结构，这一条转化规则值 2 分。' },

{ id: 'Qe07-4', ch: 'e07', diff: 2, type: 'choice',
  q: '翻译长句时的第一刀通常切在哪里？（　）',
  opts: ['连词、从句引导词、介词短语边界', '任意逗号处', '主语之后', '句号处'],
  ans: 0,
  sol: '切分点三选一：连词（and/but）、从句引导词（that/which/when）、介词短语（in/on/for 开头）。切完每个“意群”先直译，再按中文习惯重排。逗号只是参考，不是切分依据。' },

{ id: 'Qe07-5', ch: 'e07', diff: 3, type: 'fill',
  q: '翻译句子并写出关键结构处理：“He is the very person whom we can rely on in times of difficulty.”（中文译文）',
  ans: '他正是我们在困难时期可以依靠的人',
  sol: '定语从句 whom we can rely on 修饰 person → 前置译成“可以依靠的人”。要点：rely on 介词挂引导词后（rely on whom），译时把 rely on 还原到从句内部。very = 正是，起强调作用。' },

/* ============ e08 写作 ============ */
{ id: 'Qe08-1', ch: 'e08', diff: 1, type: 'choice',
  q: '英语二小作文（应用文）不常考的类型是（　）',
  opts: ['建议信', '感谢信', '读书报告', '通知告示'],
  ans: 2,
  sol: '小作文考“私人/公务信函 + 告示”：建议信最常考，感谢/邀请/道歉/咨询次之，通知告示偶考。读书报告不在考查范围。格式（称呼、正文、落款）+ 语域（正式）占基础分。' },

{ id: 'Qe08-2', ch: 'e08', diff: 1, type: 'choice',
  q: '英语二大作文与英语一最大的区别是（　）',
  opts: ['英语二考图画作文', '英语二考图表作文（chart / table / graph）', '英语二只考提纲作文', '两者完全相同'],
  ans: 1,
  sol: '英语一大作文 = 漫画作文（寓意议论），英语二大作文 = 图表作文（描述图表 + 分析原因 + 预测建议）。第一段“看图说话”是英语二的独门功夫：描述而不评论，为第二段分析留空间。' },

{ id: 'Qe08-3', ch: 'e08', diff: 2, type: 'choice',
  q: '图表描述句：过去五年某APP用户数从200万增长到500万，下列正确且得体的英文是（　）',
  opts: ['The number of users increased from 2 million to 5 million over the past five years.', 'The number of users increase from 2 million to 5 million last five years.', 'The users was increased to 5 million from 2 million in past five years.', 'The number of users rise from 2 million to 5 million before five years.'],
  ans: 0,
  sol: 'B 主谓不一致（increase 应为 increased）、C 语态与主谓混乱（users were）、D 时态错误（rise 应为 rose）且 before 用法错。图表句三要素：主语（The number of…）、过去时、from…to… 结构。这三处错误正是考研写作最常见的扣分点。' },

{ id: 'Qe08-4', ch: 'e08', diff: 2, type: 'choice',
  q: '病句挑错：Although he was exhausted, but he kept working until midnight. 错误在于（　）',
  opts: ['although 与 but 不能连用（去掉 but）', 'exhausted 拼写错误', 'kept 应为 keep', 'until 用法错误'],
  ans: 0,
  sol: '汉语“虽然…但是…”成对出现，英语只用其一：although/though 与 but 互斥（与 yet 也冲突）。同类错误：because 与 so 不能连用。中式连接词是写作扣分重灾区，改作文时优先自查这类。' },

{ id: 'Qe08-5', ch: 'e08', diff: 2, type: 'choice',
  q: '图表作文的标准三段结构是（　）',
  opts: ['描述图表 → 分析原因（2~3条）→ 预测趋势或提出建议', '发表观点 → 举例论证 → 重申观点', '背景介绍 → 图表描述 → 总结全文', '翻译图表 → 分析数据 → 联系自身'],
  ans: 0,
  sol: '英语二大作文模板结构：第一段“是什么”（客观描述：标题+主体+总体趋势+关键数据），第二段“为什么”（两条原因，每条 reason + 展开句），第三段“会怎样”（预测或建议）。B 是英语一图画作文结构，别串台。' }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { QUESTIONS: QUESTIONS };
