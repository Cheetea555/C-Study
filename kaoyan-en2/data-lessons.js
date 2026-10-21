'use strict';
/* 英语二教学数据：8 章 × 2 课 = 16 课。 */
var LESSONS = {

e01: [
{ id: 'Le01-1', ch: 'e01', title: '词汇分层与背词节奏', mins: 15, pts: [0,2,3,4], quiz: ['Qe01-1','Qe01-4','Qe01-5'],
  goal: '建立“分层背词 + 滚动复习”的系统，而不是每天从 abandon 开始。',
  concept: [
    '5500 大纲词分层：高频 2000（认识+会用）、中频 1500（认识）、低频/超纲（混脸熟）。精力分配 5:3:1。',
    '每日节奏：新词 60~80 + 复习 120~150，按 1/2/4/7/15/30 天滚动（本应用错题本可托管“混过的词”）。',
    '语境记忆优于词表记忆：每个高频词配一个真题例句；真题生词全部入错题本——真题词汇复现率极高。',
    '背词截止线：考前 2 个月停止背新词，全力滚动高频词与真题生词。'
  ],
  examples: [
    { q: '你在真题里第 3 次见到 substantial，仍不确定词义，该怎么处理？', sol: '立即入错题本（描述里写原句），标注“熟词不熟”。它已有 3 次复现记录，属于最高优先级词汇；明天的复习队列会自动安排它，六轮过后归档为掌握。真题高频词的复现规律比任何词表都准。' },
    { q: '每天只有 40 分钟背单词，怎么分配？', sol: '10 分钟过昨日新词（快速自测）+ 20 分钟背 40 个新词（每个词 30 秒：读—看例句—遮住回忆）+ 10 分钟扫今天的复习队列（错题本到期词汇）。宁可每天少背，不可断更——连续性是艾宾浩斯的命根子。' }
  ],
  pitfalls: ['从 A 背到 Z 从不复习 = 背了就忘；只背中文释义不读例句 = 阅读里认不出。'] },

{ id: 'Le01-2', ch: 'e01', title: '熟词僻义专攻', mins: 15, pts: [1], quiz: [],
  goal: '拿下英语二最爱考的“认识词的陌生义”。',
  concept: [
    '熟词僻义三大来源：一词多义（address）、词性转换（book 动词=预订）、专业语境（school=学派）。',
    '判断信号：这个词我认识，但放进句子里讲不通 → 90% 是僻义。',
    '处理方式：把僻义当“新词”记入错题本，附真题原句；见一次记一次，直到条件反射。'
  ],
  examples: [
    { q: '翻译：Experts from various schools of thought attended the forum.', sol: 'school 此处 = 学派/流派：来自不同思想流派的专家出席了论坛。若按“学校”硬译，句子直接不通——这就是僻义的第一信号：语义卡壳时先查僻义，不要怀疑自己的语法。' },
    { q: '翻译：The new policy may subject small businesses to higher risks.', sol: 'subject 作动词 = 使遭受（be subject to = 易受……影响）：新政策可能使小企业面临更高风险。subject 的动词用法与“科目/主题”义在真题中都出现过，两义都要记。' }
  ],
  pitfalls: ['不要把所有僻义都背——只记真题出现过的；僻义没有语感捷径，靠积累。'] }
],

e02: [
{ id: 'Le02-1', ch: 'e02', title: '前缀后缀速查体系', mins: 20, pts: [0,1], quiz: ['Qe02-1','Qe02-2','Qe02-3'],
  goal: '把词缀变成“猜词工具箱”，考场上遇到生词不慌。',
  concept: [
    '否定前缀四件套：un- / in-（im-,il-,ir-）/ dis- / mis-；方向前缀：inter-（间）/ trans-（跨）/ sub-（下）/ over-（过度）。',
    '名词后缀：-tion/-ment/-ness/-ity/-ship；形容词后缀：-able/-ful/-less/-ous/-ive；表人：-ist/-er/-ian。',
    '词缀的第一用途是“写作换词性”（happy→happiness），第二用途才是猜词。'
  ],
  examples: [
    { q: '猜词：The plan was criticized as impractical and unrealistic.', sol: 'im-（否定）+ practical（实际的）= 不切实际；un- + realistic = 不现实的。两个否定前缀叠加批评之意，无需查词即可读懂全句。猜出大意后回上下文验证一次。' },
    { q: '写作中想表达“失业”，只知道 employ（雇佣），怎么办？', sol: 'employ → employment（-ment 名词化，就业）→ unemployment（un- 否定，失业）→ the unemployment rate（失业率，图表作文高频词）。一条词缀链解决图表作文核心词汇。' }
  ],
  pitfalls: ['in- 有时不是否定（inside 在里面）；猜词永远是“假设”，要用上下文验证。'] },

{ id: 'Le02-2', ch: 'e02', title: '高频词根与猜词实战', mins: 20, pts: [2,3], quiz: ['Qe02-4','Qe02-5'],
  goal: '掌握 8 个高频词根，覆盖上百个大纲词。',
  concept: [
    'spect = look：inspect/respect/prospect/spectator；dict = say：predict/dictate/contradict。',
    'struct = build：construct/instruct/structure；duct = lead：conduct/introduce/product；port = carry：import/export/transport。',
    '猜词三步：切词缀 → 认词根 → 组合出大意（动词/名词方向），再用上下文验证。'
  ],
  examples: [
    { q: '猜词：Many experts predict a steady economic recovery in the foreseeable future.', sol: 'pre-（提前）+ dict（说）= 预言；fore-（前）+ see（看）+ -able（能够）= 可预见的。拆完两词，句子“专家预言经济在可预见的未来稳步复苏”就通了——生词密度再高的句子也扛不住词根拆解。' },
    { q: 'transport / transfer / transmit 都含“移动”之义，如何区分？', sol: 'port（携带）：transport = 运输（携带 through）；trans + fer（拿/带）：transfer = 转移/转乘；trans + mit（送）：transmit = 传送（信号/疾病）。同缀不同根 → 词义分家：认根不认面。' }
  ],
  pitfalls: ['词根会有变体（duct/duce、spect/spic），别死抠拼写；真题猜词的目标是“读懂大意”，不是精确释义。'] }
],

e03: [
{ id: 'Le03-1', ch: 'e03', title: '长难句拆解三步法', mins: 30, pts: [0,4], quiz: ['Qe03-1','Qe03-2'],
  goal: '任何长句先切谓语、再拎主干、最后挂修饰。',
  concept: [
    '第一步找谓语：所有“有时态的动词”里，真正的谓语只有一套主谓；其余都是从句谓语或非谓语（doing/done/to do 不作谓语）。',
    '第二步拎主干：主语 + 谓语 + 宾语/表语，先翻译主干这个“骨架句”。',
    '第三步挂修饰：定语（从句/分词/介词短语）挂名词，状语挂动词或整句；同位语和插入语（两个逗号之间）先摘出。',
    '拆解的产物直接服务阅读（读懂）和翻译（切意群），一技两用。'
  ],
  examples: [
    { q: '拆解：The survey conducted by a leading research institute shows that people who exercise regularly tend to report higher levels of happiness.', sol: '谓语 shows；主干 = The survey shows that…。修饰：conducted by…（分词后置定语修饰 survey）；that 从句是 shows 的宾语；who exercise regularly 定语从句修饰 people。骨架句“这项调查显示经常锻炼的人往往报告更高的幸福感”一出，修饰成分只是往里填肉。' },
    { q: '拆解：What makes this study remarkable, however, is its unusually large sample size.', sol: '插入语 however 先摘掉；主语从句 What makes this study remarkable + is + 表语 its unusually large sample size。两逗号之间的成分 90% 可先删——删完主干现形。' }
  ],
  pitfalls: ['把 doing/done 当谓语（它们没有时态）；主干还没找到就逐词翻译。'] },

{ id: 'Le03-2', ch: 'e03', title: '三大从句与特殊结构', mins: 30, pts: [1,2,3], quiz: ['Qe03-3','Qe03-4','Qe03-5'],
  goal: '从句辨析 + 倒装/强调/分词，长难句的最后几块硬骨头。',
  concept: [
    '定语从句：修饰名词，引导词在从句中作成分；名词性从句：整个从句当名词，that 不作成分——这是判断的分水岭。',
    '状语从句看引导词含义（when/while/although/if/because），修饰对象是句子不是名词。',
    '强调句 It is … that …（去掉框架句子仍完整）；倒装常由否定词（Not until / Never / Only）开头触发；分词看逻辑主语（主动 doing / 被动 done）。',
    '独立主格“名词 + 分词”作状语，阅读认识即可，写作慎用。'
  ],
  examples: [
    { q: '判断：The news that he won the prize spread quickly. / The news that he told me spread quickly. 哪个是同位语从句？', sol: '第一个：that he won the prize 是 news 的内容（that 不作成分）→ 同位语从句。第二个：that 在从句中作 told 的宾语 → 定语从句（“他告诉我的那个消息”）。检验法：从句去掉 that 后若仍完整 → 同位语从句。' },
    { q: '还原倒装：Never before has the city witnessed such a rapid change.', sol: '否定词 Never 置首触发部分倒装（助动词 has 提前）。还原：The city has never before witnessed such a rapid change（这座城市从未经历过如此迅速的变化）。写作反向利用：Never before have I … 是现成的强调开篇句。' }
  ],
  pitfalls: ['whose 后必跟名词；although 与 but 不连用；分词逻辑主语必须与主句主语一致，否则成悬垂分词。'] }
],

e04: [
{ id: 'Le04-1', ch: 'e04', title: '完形逻辑关系题', mins: 20, pts: [1], quiz: ['Qe04-1','Qe04-2','Qe04-5'],
  goal: '逻辑题是完形中最可训练的题型，目标全对。',
  concept: [
    '四大逻辑：转折（however/but/nevertheless）、因果（therefore/thus/because）、并列递进（moreover/likewise/similarly）、对比（while/whereas/in contrast）。',
    '判断流程：把空前空后各压缩成一句中文 → 定关系 → 选词。别看选项先定关系，是正确率的保证。',
    '注意“隐性转折”：后句出现 however 时，前句常是让步铺垫（作者真实态度在后句）。'
  ],
  examples: [
    { q: '填逻辑词：The plan seems perfect. ___, its cost has been seriously underestimated.', sol: '前句“看似完美”、后句“成本被低估”→ 转折，填 However / Nevertheless。压缩中文后关系一目了然——先译后选是逻辑题的降维打法。' },
    { q: '填逻辑词：The city has invested heavily in public transport; ___, traffic congestion has eased noticeably.', sol: '“重金投入公交”与“拥堵明显缓解”是因果（结果呼应）→ Therefore / As a result。注意分号只表并列，关系要靠语义判断，标点是烟雾弹。' }
  ],
  pitfalls: ['moreover（递进）与 however（转折）是最大混淆对；逻辑题不需要认识每个选项词，但四大类代表词必须秒认。'] },

{ id: 'Le04-2', ch: 'e04', title: '完形词汇题与做题流程', mins: 25, pts: [0,2,3,4], quiz: ['Qe04-3','Qe04-4'],
  goal: '用上下文与搭配双保险对付词汇空，建立 15 分钟做题流程。',
  concept: [
    '做题顺序：先读首句（不设空，定主旨）→ 快速通读 → 逐空作答，纠结空标记跳过 → 借助后文复现回头补。',
    '上下文复现：正确选项常与前后的词同义或同现（同现 = 惯常搭配共现，如 doctor–patient）。',
    '固定搭配靠积累：take into account / be committed to / have access to / in terms of。',
    '时间预算：完形 15~18 分钟，性价比最低，把它安排在写作之后做也完全可行。'
  ],
  examples: [
    { q: '策略：一篇完形你有 4 个空完全没思路，怎么办？', sol: '标记后先跳过，做完后文回来：后文对同一话题的用词常给出复现提示；仍无思路则选“与全文态度一致的常见搭配词”，并把这 4 个空的搭配记入错题本。完形的目标分数是 6 分+，不是满分，战略性取舍是聪明做法。' },
    { q: '辨析：adopt / adapt / adjust 三个词如何一次记牢？', sol: 'adopt = 采纳/收养（opt 源自“选择”→ 选择采纳）；adapt = 适应（apt 适合→使适合）；adjust = 微调（just 正→调正）。每个词锚定一个源义，再各配一个真题搭配：adopt a policy / adapt to the change / adjust the plan。' }
  ],
  pitfalls: ['完形最大的坑是“恋战”：一道空超过 1 分钟就先走；做完不复查全文态度一致性。'] }
],

e05: [
{ id: 'Le05-1', ch: 'e05', title: '阅读定位与同义替换', mins: 30, pts: [0,1], quiz: ['Qe05-2','Qe05-5'],
  goal: '把阅读从“英语考试”变成“定位工程”：先题后文、同义比对。',
  concept: [
    '流程：读题干（不读选项）→ 划定位词（专有名词/数字/年代 > 名词 > 动词）→ 顺序定位 → 精读定位句及上下各一句 → 比对选项。',
    '正确项 = 定位句的同义改写（换词换句式）；原词大量复现的选项多为陷阱。',
    '英语二出题基本按段落顺序：第 n 题的定位点在第 n−1 题之后，可用来缩小搜索范围。',
    '转折词（but/however/yet）之后、引语与观点动词（argue/believe/suggest）之后是高频考点区。'
  ],
  examples: [
    { q: '题干：According to Paragraph 2, why do young people prefer online shopping? 定位词选什么？', sol: '优先级：young people（人群名词）+ online shopping（话题名词）> prefer（动词，易被改写）。回文找到两词共现的段落句，精读它与其后一句（原因常在下一句：because/since/as 或冒号解释处）。' },
    { q: '定位句说 The policy has failed to ease the burden. 选项 A 写 The policy has reduced the burden. 该选吗？', sol: '不选。failed to ease = 未能减轻，与 reduced（减轻了）意思相反——这是“原词陷阱 + 反义改写”的复合坑。比对时逐个动词判断方向（正/反/程度），方向错一票否决。' }
  ],
  pitfalls: ['不读原文直接“顺眼选”；用常识代替原文；比对时只看名词不看动词方向。'] },

{ id: 'Le05-2', ch: 'e05', title: '主旨、推理与例证题', mins: 30, pts: [2,3,4,5], quiz: ['Qe05-1','Qe05-3','Qe05-4'],
  goal: '掌握四大客观题的“选项特征学”，正确率稳定在 80% 以上。',
  concept: [
    '主旨题：串各段首句 + 高频词；选项“过大过小”均排除；主旨常在首段末句或转折之后。',
    '推理题：只走“半步”——从原文直接顺出的结论；绝对化措辞（only/never/all）基本可排除。',
    '例证题：答案在例子前后的观点句，“例子是证词、观点是判决”。',
    '态度题：抓形容词/副词情感色彩；客观中性（objective / neutral）在英语二中最常见。',
    '精读训练法：每天 1 篇真题阅读，逐句翻译定位句 + 分析错题选项（为什么错比为什么对更重要）。'
  ],
  examples: [
    { q: '文章首段讲某政策初衷，第二段 However 后列三条失败表现，末段专家建议调整。主旨选什么？', sol: '主旨在 However 之后：该政策实施效果不达预期（及调整的必要性）。首段的“初衷”是铺垫，以首段为纲的选项以偏概全——转折之后是重心，是主旨题的第一定律。' },
    { q: '选项中出现 “The author probably agrees that online education will completely replace traditional classrooms.” 能选吗？', sol: '几乎必错：completely replace 绝对化 + 过度引申（原文至多说“快速发展/形成补充”）。含 all/completely/never/only 的选项在推理题中正确率极低——绝对化 = 高危信号。' }
  ],
  pitfalls: ['推理题引入“正确的常识”仍是错（必须是“原文的下一步”）；例证题跳进例子细节。'] }
],

e06: [
{ id: 'Le06-1', ch: 'e06', title: '多项对应：定位即得分', mins: 20, pts: [0,1], quiz: ['Qe06-1','Qe06-2','Qe06-5'],
  goal: '多项对应是新题型主力题型：用专名回文定位，观点句直接匹配选项。',
  concept: [
    '题型特征：左列是人名/机构/专有名词，右列是观点语句，一一匹配。',
    '与阅读最大的区别：新题型多为原词对应、少同义替换——认出即匹配，不需要深层推理。',
    '流程：圈左列关键词 → 回原文找该词出现处 → 精读其前后句（观点常在直接引语或 argue/believe/suggest 之后）→ 与右列选项比对。',
    '同一人物多次出现时，注意题目顺序与原文顺序基本对应。'
  ],
  examples: [
    { q: '多项对应：左列人物 Smith 的观点与哪个选项匹配？原文：Smith argues that remote work, contrary to popular belief, actually strengthens team collaboration.', sol: '定位词 Smith；观点动词 argues 之后是核心：remote work strengthens collaboration（远程办公加强协作）。正确选项必是这句的同义表达，如 “Working from home may enhance teamwork”。引语/观点动词之后 = 答案所在地。' },
    { q: '某人物名在原文出现 3 次，该看哪一处？', sol: '先看题目顺序（第 2 题对应第 2 次出现的可能性最大），再在每次出现处找“观点动词/引号”——不带观点的提及（如引出人物身份）可跳过。定位要“词 + 观点信号”双确认，只对词不对意是新手最大失误。' }
  ],
  pitfalls: ['新题型失分主因是“抢时间不核对”，用剩余选项复核一遍只需 1 分钟。'] },

{ id: 'Le06-2', ch: 'e06', title: '小标题对应与整卷复核', mins: 15, pts: [2,3], quiz: ['Qe06-3','Qe06-4'],
  goal: '小标题题的“覆盖全段”原则 + 做完后的剩余选项复核法。',
  concept: [
    '小标题对应：给段落选标题，标题必须覆盖全段大意，不能只对应某一句。',
    '读段技巧：段落首二句 + 末句 + 扫高频名词；标题选项与段落高频词同话题。',
    '干扰项特征：以偏概全（只概括段中某个例子）、范围过大（把全篇主题当某段标题）。',
    '复核法：每个选项只用一次，做完把“未用选项 × 剩余空位”再匹配一遍，明显更顺则回改。'
  ],
  examples: [
    { q: '某段首句讲城市绿地面积十年间下降 40%，后文列举空气、噪音与心理健康的连锁影响。标题选 “Green space matters” 还是 “Air pollution is worsening”？', sol: '选前者：全段主角是 green space（高频词+首句主语），air pollution 只是后果之一。后者以偏概全——只对应该段一句。小标题 = 段落高频词 + 全段覆盖，两条都要满足。' },
    { q: '七个标题选五个（有两个干扰项），做完还剩 8 分钟，怎么用？', sol: '第一步剩余复核：两个未用干扰项放到已填空位验证“为什么不能是它”（通常是范围不对）；第二步把五个答案连起来读一遍——好标题串起来正好是文章脉络图。这两步共 3 分钟，能把新题型锁死在 8 分以上。' }
  ],
  pitfalls: ['小标题被段中“最长最难的句子”吸走注意力——高频名词才是段落之锚。'] }
],

e07: [
{ id: 'Le07-1', ch: 'e07', title: '翻译三步法：拆、译、组', mins: 30, pts: [0,1,4], quiz: ['Qe07-1','Qe07-2','Qe07-4'],
  goal: '把 150 词段落拆成意群逐块翻译，再按中文习惯重组。',
  concept: [
    '拆：在连词、从句引导词、介词短语边界切分，一长句切 2~4 个意群。',
    '译：每个意群先直译；代词（it/they/this）必须明确指代对象再动笔。',
    '组：英语重心在前（结论先行）、汉语重心在后（铺垫渐进），按中文习惯重排语序，必要时补逻辑词。',
    '自查三问：关键词译对了吗？有漏译吗？读出来像中国话吗？'
  ],
  examples: [
    { q: '翻译：Despite the rapid growth of online shopping, many consumers still prefer physical stores, where they can see and touch the products before buying.', sol: '拆三块：① Despite the rapid growth of online shopping（让步）② many consumers still prefer physical stores（主干）③ where they can see and touch…（定语从句修饰 stores）。组：尽管网购发展迅速，许多消费者仍然偏爱实体店——在店里，他们购买前可以看到并触摸商品。长定语从句拆成独立分句是最常用的“松绑”手法。' },
    { q: '翻译中的代词处理：The company launched the program in 2020. It has since benefited over 10,000 employees.', sol: 'It 指代 the program（不是 company）：该项目自 2020 年启动以来，已使一万多名员工受益。代词指代错误是翻译一票否决项——动笔前先问“它指谁”。' }
  ],
  pitfalls: ['逐词硬译产出“翻译腔”；漏译从句与状语（完整性也占分）。'] },

{ id: 'Le07-2', ch: 'e07', title: '定语从句与被动语态译法', mins: 25, pts: [2,3], quiz: ['Qe07-3','Qe07-5'],
  goal: '两大必考结构的固定译法，直接决定翻译档位。',
  concept: [
    '定语从句：八个词以内 → 前置“……的”；更长 → 拆成并列分句（重复先行词或用“它”）。',
    '被动语态：优先化被动为主动——It is believed that… → 人们认为/据信；be considered… → 被视为/可以说是（保留“被”仅当确有被动意味）。',
    '词性转换：名词转动词（the growth of → ……增长了）让中文更顺；增译补出隐含的逻辑主语。',
    '减译：英语的形式连接词（that/which 冠词）中文不必逐一对应。'
  ],
  examples: [
    { q: '翻译：Those who take part in regular physical activities are generally believed to enjoy better health.', sol: '定语从句 who take part in… 较短 → 前置：经常参加体育锻炼的人；are believed → 化被动：人们普遍认为。成品：人们普遍认为，经常参加体育锻炼的人身体更健康。两大手法各用一次。' },
    { q: '翻译：A report was released last month, which revealed a sharp decline in reading habits among teenagers.', sol: '被动 → 主动：上个月发布了一份报告（无施动者时中文直接省“被”）；which 从句较长 → 拆分句：报告显示，青少年的阅读习惯急剧下降。拆句后节奏立刻像中文。' }
  ],
  pitfalls: ['“被”字连篇是翻译腔的标志；定语从句无论长短一律前置会让句子头重脚轻。'] }
],

e08: [
{ id: 'Le08-1', ch: 'e08', title: '小作文框架与万能句', mins: 25, pts: [0,1], quiz: ['Qe08-1'],
  goal: '用“三段框架 + 五个万能理由”覆盖所有小作文题型。',
  concept: [
    '格式：称呼（Dear Sir or Madam / Dear Mr. Smith）+ 正文三段 + 落款（Yours sincerely, Li Ming）——格式分白送，别丢。',
    '三段框架：① 自我介绍 + 写信目的（I am writing to …）② 分点展开（To begin with… / Moreover… / Finally…）③ 礼貌收尾（I would appreciate it if … / Looking forward to your reply.）。',
    '万能理由五件套：方便高效（convenient and efficient）、促进交流（promote communication）、缓解压力（relieve stress）、开阔视野（broaden one’s horizons）、有益身心（benefit physical and mental health）。',
    '语域：正式场合不用缩写（don’t → do not）、不用口语词（a lot of → a great deal of）。'
  ],
  examples: [
    { q: '写建议信开头段：向图书馆提两条改进建议。', sol: 'Dear Sir or Madam, / I am Li Ming, a regular visitor to our university library. I am writing to offer a couple of suggestions on improving its services.（自我介绍 + 目的，两句完成第一段。）模板骨架 + 换话题词，就是所有小作文的开头。' },
    { q: '写结尾段：期待对方考虑你的建议。', sol: 'I would greatly appreciate it if you could take my suggestions into consideration. Thank you for your time, and I look forward to your reply. / Yours sincerely, Li Ming——这个结尾对建议信/投诉信/咨询信通用，背到肌肉记忆。' }
  ],
  pitfalls: ['忘写称呼落款直接扣 2 分；小作文是“格式+功能句”比赛，不是炫技场，别写长难句堆砌。'] },

{ id: 'Le08-2', ch: 'e08', title: '大作文：图表描述与三段展开', mins: 35, pts: [2,3,4,5], quiz: ['Qe08-2','Qe08-3','Qe08-4','Qe08-5'],
  goal: '图表作文第一段客观描述 + 第二段给原因 + 第三段预测/建议，15 分稳拿 10+。',
  concept: [
    '第一段（描述）：What is clearly shown in the chart is that… + 主体 + 趋势 + 关键数据（最高/最低/变化幅度）。只描述不评论。',
    '时态铁律：数据是过去年份 → 过去时（increased）；持续到现在 → 现在完成时（has increased）；图表标题用现在时。',
    '第二段（原因）：Two factors may account for this phenomenon. 其一 reason + 展开，其二 reason + 展开（用万能理由五件套充展开）。',
    '第三段（预测/建议）：From my perspective, this trend is likely to continue in the foreseeable future, provided that…。',
    '语法自查三查：主谓一致（The number of… + 单数动词）、时态统一、although/but 不连用。'
  ],
  examples: [
    { q: '第一段模板实战：图表为 2018–2023 年某市共享单车用户量（200 万→500 万，持续上升）。', sol: 'What is clearly shown in the chart is the number of shared-bike users in a certain city, which increased steadily from 2 million in 2018 to 5 million in 2023.——模板 + 主体 + from…to…，三要素齐了。注意 The number + 单数动词 increased。' },
    { q: '第二段写两条原因（共享单车用户增长）。', sol: 'Two factors may account for this trend. To begin with, bike-sharing provides a convenient and efficient solution to the “last mile” problem in daily commuting. Moreover, growing public awareness of green travel and environmental protection has encouraged more people to choose shared bikes over private cars.——万能理由“方便高效 + 环保意识”组合，任何增长类图表都能套。' }
  ],
  pitfalls: ['第一段就急着评论（分析留到第二段）；数据是 2018 年还用现在时；只描述一个数据点没有对比。'] }
]
};

if (typeof module !== 'undefined' && module.exports) module.exports = { LESSONS: LESSONS };
