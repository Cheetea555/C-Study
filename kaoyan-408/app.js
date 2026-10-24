'use strict';
/* =====================================================================
   考研408 · 学习中心 —— 纯前端单页应用（数据结构/计算机组成原理/操作系统/计算机网络）
   数据全部保存在浏览器 localStorage，离线可用，无任何外部依赖。
   引擎与《考研数学二·学习中心》同源：计划生成 / 艾宾浩斯错题 / 刷题 / 统计。
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
const REASONS = ['未归因', '概念不清', '原理没懂', '计算失误', '记忆混淆'];
const KP_STATUS = ['未开始', '学习中', '需复习', '已掌握'];

/* 408 考试范围：数据结构 + 计算机组成原理 + 操作系统 + 计算机网络 */
const SYLLABUS = [
  { id: "ds01", subject: "数据结构", name: "第1章 绪论", points: [
    { id: "408.ds01.p01", legacyKey: "ds01-0", title: "数据结构的基本概念（数据/数据元素/数据对象）" },
    { id: "408.ds01.p02", legacyKey: "ds01-1", title: "逻辑结构与存储结构" },
    { id: "408.ds01.p03", legacyKey: "ds01-2", title: "算法的五大特性（有穷性、确定性、可行性、输入、输出）" },
    { id: "408.ds01.p04", legacyKey: "ds01-3", title: "时间复杂度分析（大 O 记法）" },
    { id: "408.ds01.p05", legacyKey: "ds01-4", title: "空间复杂度分析" },
  ]},
  { id: "ds02", subject: "数据结构", name: "第2章 线性表", points: [
    { id: "408.ds02.sequential-storage", legacyKey: "ds02-0", title: "顺序表的定义与特点" },
    { id: "408.ds02.insert-delete-moves", legacyKey: "ds02-1", title: "顺序表插入/删除的移动元素分析" },
    { id: "408.ds02.singly-linked-list", legacyKey: "ds02-2", title: "单链表的定义与基本操作" },
    { id: "408.ds02.doubly-circular-list", legacyKey: "ds02-3", title: "双链表与循环链表" },
    { id: "408.ds02.static-linked-list", legacyKey: "ds02-4", title: "静态链表" },
    { id: "408.ds02.representation-choice", legacyKey: "ds02-5", title: "顺序表与链表的对比与选用" },
  ]},
  { id: "ds03", subject: "数据结构", name: "第3章 栈、队列和数组", points: [
    { id: "408.ds03.p01", legacyKey: "ds03-0", title: "栈的定义与基本操作" },
    { id: "408.ds03.p02", legacyKey: "ds03-1", title: "顺序栈与链栈（共享栈）" },
    { id: "408.ds03.p03", legacyKey: "ds03-2", title: "栈的应用：括号匹配与表达式求值" },
    { id: "408.ds03.p04", legacyKey: "ds03-3", title: "卡特兰数与合法出栈序列" },
    { id: "408.ds03.p05", legacyKey: "ds03-4", title: "队列的定义与循环队列" },
    { id: "408.ds03.p06", legacyKey: "ds03-5", title: "双端队列与队列的应用（缓冲区）" },
    { id: "408.ds03.p07", legacyKey: "ds03-6", title: "数组的存储方式（行优先/列优先）" },
    { id: "408.ds03.p08", legacyKey: "ds03-7", title: "特殊矩阵的压缩存储" },
    { id: "408.ds03.p09", legacyKey: "ds03-8", title: "稀疏矩阵" },
  ]},
  { id: "ds04", subject: "数据结构", name: "第4章 串", points: [
    { id: "408.ds04.p01", legacyKey: "ds04-0", title: "串的定义与存储结构" },
    { id: "408.ds04.p02", legacyKey: "ds04-1", title: "朴素模式匹配算法（BF）" },
    { id: "408.ds04.p03", legacyKey: "ds04-2", title: "KMP 算法思想" },
    { id: "408.ds04.p04", legacyKey: "ds04-3", title: "next 数组的计算" },
  ]},
  { id: "ds05", subject: "数据结构", name: "第5章 树与二叉树", points: [
    { id: "408.ds05.p01", legacyKey: "ds05-0", title: "树的基本术语与性质" },
    { id: "408.ds05.p02", legacyKey: "ds05-1", title: "二叉树的定义与五大性质" },
    { id: "408.ds05.p03", legacyKey: "ds05-2", title: "二叉树的顺序存储与链式存储" },
    { id: "408.ds05.p04", legacyKey: "ds05-3", title: "二叉树的遍历（先/中/后序、层序）" },
    { id: "408.ds05.p05", legacyKey: "ds05-4", title: "由遍历序列重建二叉树" },
    { id: "408.ds05.p06", legacyKey: "ds05-5", title: "线索二叉树" },
    { id: "408.ds05.p07", legacyKey: "ds05-6", title: "树、森林与二叉树的转换及遍历" },
    { id: "408.ds05.p08", legacyKey: "ds05-7", title: "树的应用：表达式树" },
    { id: "408.ds05.p09", legacyKey: "ds05-8", title: "哈夫曼树与哈夫曼编码" },
    { id: "408.ds05.p10", legacyKey: "ds05-9", title: "并查集" },
  ]},
  { id: "ds06", subject: "数据结构", name: "第6章 图", points: [
    { id: "408.ds06.p01", legacyKey: "ds06-0", title: "图的基本术语与存储（邻接矩阵/邻接表）" },
    { id: "408.ds06.p02", legacyKey: "ds06-1", title: "图的遍历：DFS 与 BFS" },
    { id: "408.ds06.p03", legacyKey: "ds06-2", title: "最小生成树：Prim 与 Kruskal" },
    { id: "408.ds06.p04", legacyKey: "ds06-3", title: "最短路径：Dijkstra 与 Floyd" },
    { id: "408.ds06.p05", legacyKey: "ds06-4", title: "拓扑排序" },
    { id: "408.ds06.p06", legacyKey: "ds06-5", title: "关键路径（AOE 网）" },
  ]},
  { id: "ds07", subject: "数据结构", name: "第7章 查找", points: [
    { id: "408.ds07.p01", legacyKey: "ds07-0", title: "顺序查找与折半查找" },
    { id: "408.ds07.p02", legacyKey: "ds07-1", title: "折半查找判定树与 ASL" },
    { id: "408.ds07.p03", legacyKey: "ds07-2", title: "分块查找" },
    { id: "408.ds07.p04", legacyKey: "ds07-3", title: "B 树与 B+ 树的基本概念" },
    { id: "408.ds07.p05", legacyKey: "ds07-4", title: "散列表：构造方法与冲突处理" },
    { id: "408.ds07.p06", legacyKey: "ds07-5", title: "散列查找的 ASL 与装填因子" },
  ]},
  { id: "ds08", subject: "数据结构", name: "第8章 排序", points: [
    { id: "408.ds08.p01", legacyKey: "ds08-0", title: "插入排序：直接插入与希尔" },
    { id: "408.ds08.p02", legacyKey: "ds08-1", title: "交换排序：冒泡与快速" },
    { id: "408.ds08.p03", legacyKey: "ds08-2", title: "选择排序：简单选择与堆" },
    { id: "408.ds08.p04", legacyKey: "ds08-3", title: "归并排序" },
    { id: "408.ds08.p05", legacyKey: "ds08-4", title: "基数排序" },
    { id: "408.ds08.p06", legacyKey: "ds08-5", title: "各排序算法的比较（时间/空间/稳定性/适用场景）" },
    { id: "408.ds08.p07", legacyKey: "ds08-6", title: "外部排序概述" },
  ]},
  { id: "co01", subject: "计算机组成原理", name: "第1章 计算机系统概述", points: [
    { id: "408.co01.p01", legacyKey: "co01-0", title: "计算机系统的层次结构" },
    { id: "408.co01.p02", legacyKey: "co01-1", title: "冯·诺依曼结构特点" },
    { id: "408.co01.p03", legacyKey: "co01-2", title: "计算机性能指标（主频/CPI/MIPS/字长）" },
    { id: "408.co01.p04", legacyKey: "co01-3", title: "基准程序与性能评价" },
  ]},
  { id: "co02", subject: "计算机组成原理", name: "第2章 数据的表示与运算", points: [
    { id: "408.co02.p01", legacyKey: "co02-0", title: "进位计数制及相互转换" },
    { id: "408.co02.p02", legacyKey: "co02-1", title: "原码、反码、补码、移码" },
    { id: "408.co02.p03", legacyKey: "co02-2", title: "定点数的移位运算" },
    { id: "408.co02.p04", legacyKey: "co02-3", title: "补码加减运算与溢出判断" },
    { id: "408.co02.p05", legacyKey: "co02-4", title: "IEEE754 浮点数表示" },
    { id: "408.co02.p06", legacyKey: "co02-5", title: "浮点数加减运算五个步骤" },
  ]},
  { id: "co03", subject: "计算机组成原理", name: "第3章 存储系统", points: [
    { id: "408.co03.p01", legacyKey: "co03-0", title: "存储器层次结构（Cache-主存-辅存）" },
    { id: "408.co03.p02", legacyKey: "co03-1", title: "RAM/ROM 与主存的基本结构" },
    { id: "408.co03.p03", legacyKey: "co03-2", title: "主存与 CPU 的连接（位扩展/字扩展）" },
    { id: "408.co03.p04", legacyKey: "co03-3", title: "SRAM 与 DRAM 的对比" },
    { id: "408.co03.p05", legacyKey: "co03-4", title: "Cache 的工作原理与三种映射方式" },
    { id: "408.co03.p06", legacyKey: "co03-5", title: "Cache 的替换算法与写策略" },
    { id: "408.co03.p07", legacyKey: "co03-6", title: "Cache 性能计算（命中率/平均访问时间）" },
    { id: "408.co03.p08", legacyKey: "co03-7", title: "虚拟存储器与页式管理" },
    { id: "408.co03.p09", legacyKey: "co03-8", title: "TLB 快表" },
  ]},
  { id: "co04", subject: "计算机组成原理", name: "第4章 指令系统", points: [
    { id: "408.co04.p01", legacyKey: "co04-0", title: "指令的基本格式" },
    { id: "408.co04.p02", legacyKey: "co04-1", title: "定长操作码与扩展操作码" },
    { id: "408.co04.p03", legacyKey: "co04-2", title: "指令的地址码与寻址方式" },
    { id: "408.co04.p04", legacyKey: "co04-3", title: "数据寻址方式（立即/直接/间接/变址/相对）" },
    { id: "408.co04.p05", legacyKey: "co04-4", title: "CISC 与 RISC 的对比" },
  ]},
  { id: "co05", subject: "计算机组成原理", name: "第5章 中央处理器", points: [
    { id: "408.co05.p01", legacyKey: "co05-0", title: "CPU 的功能与基本结构" },
    { id: "408.co05.p02", legacyKey: "co05-1", title: "指令的执行过程（取指/间址/执行/中断）" },
    { id: "408.co05.p03", legacyKey: "co05-2", title: "数据通路的基本结构" },
    { id: "408.co05.p04", legacyKey: "co05-3", title: "硬布线控制器" },
    { id: "408.co05.p05", legacyKey: "co05-4", title: "微程序控制器与微指令" },
    { id: "408.co05.p06", legacyKey: "co05-5", title: "指令流水线的基本概念与计算" },
    { id: "408.co05.p07", legacyKey: "co05-6", title: "流水线冒险（结构/数据/控制）及处理" },
    { id: "408.co05.p08", legacyKey: "co05-7", title: "高级流水线（超标量/超流水线）" },
  ]},
  { id: "co06", subject: "计算机组成原理", name: "第6章 总线", points: [
    { id: "408.co06.p01", legacyKey: "co06-0", title: "总线的基本概念与分类" },
    { id: "408.co06.p02", legacyKey: "co06-1", title: "总线的性能指标（带宽计算）" },
    { id: "408.co06.p03", legacyKey: "co06-2", title: "总线仲裁与总线操作" },
    { id: "408.co06.p04", legacyKey: "co06-3", title: "常见总线标准" },
  ]},
  { id: "co07", subject: "计算机组成原理", name: "第7章 输入输出系统", points: [
    { id: "408.co07.p01", legacyKey: "co07-0", title: "I/O 系统基本概念与接口" },
    { id: "408.co07.p02", legacyKey: "co07-1", title: "I/O 端口及其编址方式" },
    { id: "408.co07.p03", legacyKey: "co07-2", title: "程序查询方式" },
    { id: "408.co07.p04", legacyKey: "co07-3", title: "程序中断方式与中断处理过程" },
    { id: "408.co07.p05", legacyKey: "co07-4", title: "DMA 方式" },
    { id: "408.co07.p06", legacyKey: "co07-5", title: "三种 I/O 方式的对比" },
  ]},
  { id: "os01", subject: "操作系统", name: "第1章 操作系统概述", points: [
    { id: "408.os01.p01", legacyKey: "os01-0", title: "操作系统的概念、功能与特征" },
    { id: "408.os01.p02", legacyKey: "os01-1", title: "操作系统的发展与分类" },
    { id: "408.os01.p03", legacyKey: "os01-2", title: "操作系统的运行环境（内核态/用户态）" },
    { id: "408.os01.p04", legacyKey: "os01-3", title: "中断与异常" },
    { id: "408.os01.p05", legacyKey: "os01-4", title: "系统调用" },
    { id: "408.os01.p06", legacyKey: "os01-5", title: "操作系统的体系结构（大内核/微内核）" },
  ]},
  { id: "os02", subject: "操作系统", name: "第2章 进程与线程", points: [
    { id: "408.os02.p01", legacyKey: "os02-0", title: "进程的概念、组成与状态转换" },
    { id: "408.os02.p02", legacyKey: "os02-1", title: "进程控制（PCB/创建/终止/阻塞/唤醒）" },
    { id: "408.os02.p03", legacyKey: "os02-2", title: "进程同步与互斥的基本概念" },
    { id: "408.os02.p04", legacyKey: "os02-3", title: "信号量机制与 PV 操作" },
    { id: "408.os02.p05", legacyKey: "os02-4", title: "经典同步问题（生产者消费者/读者写者）" },
    { id: "408.os02.p06", legacyKey: "os02-5", title: "管程" },
    { id: "408.os02.p07", legacyKey: "os02-6", title: "死锁的概念与四个必要条件" },
    { id: "408.os02.p08", legacyKey: "os02-7", title: "死锁预防与避免（银行家算法）" },
    { id: "408.os02.p09", legacyKey: "os02-8", title: "进程调度算法（FCFS/SJF/RR/优先级/多级反馈）" },
    { id: "408.os02.p10", legacyKey: "os02-9", title: "线程的概念与用户级/内核级线程" },
  ]},
  { id: "os03", subject: "操作系统", name: "第3章 内存管理", points: [
    { id: "408.os03.p01", legacyKey: "os03-0", title: "内存管理的基本概念与功能" },
    { id: "408.os03.p02", legacyKey: "os03-1", title: "连续分配与动态分区算法" },
    { id: "408.os03.p03", legacyKey: "os03-2", title: "分页管理与地址变换" },
    { id: "408.os03.p04", legacyKey: "os03-3", title: "分段管理与段页式" },
    { id: "408.os03.p05", legacyKey: "os03-4", title: "虚拟内存与请求分页" },
    { id: "408.os03.p06", legacyKey: "os03-5", title: "页面置换算法（OPT/FIFO/LRU/Clock）" },
    { id: "408.os03.p07", legacyKey: "os03-6", title: "页面分配策略与抖动" },
    { id: "408.os03.p08", legacyKey: "os03-7", title: "工作集" },
  ]},
  { id: "os04", subject: "操作系统", name: "第4章 文件管理", points: [
    { id: "408.os04.p01", legacyKey: "os04-0", title: "文件与文件系统的概念" },
    { id: "408.os04.p02", legacyKey: "os04-1", title: "文件的逻辑结构" },
    { id: "408.os04.p03", legacyKey: "os04-2", title: "文件目录与 FCB" },
    { id: "408.os04.p04", legacyKey: "os04-3", title: "文件的物理结构（连续/链接/索引）" },
    { id: "408.os04.p05", legacyKey: "os04-4", title: "文件存储空间的管理" },
    { id: "408.os04.p06", legacyKey: "os04-5", title: "文件的共享与保护" },
  ]},
  { id: "os05", subject: "操作系统", name: "第5章 输入输出管理", points: [
    { id: "408.os05.p01", legacyKey: "os05-0", title: "I/O 层次结构与设备控制器" },
    { id: "408.os05.p02", legacyKey: "os05-1", title: "I/O 核心子系统" },
    { id: "408.os05.p03", legacyKey: "os05-2", title: "缓冲区管理（单/双缓冲计算）" },
    { id: "408.os05.p04", legacyKey: "os05-3", title: "设备分配与 SPOOLing" },
    { id: "408.os05.p05", legacyKey: "os05-4", title: "磁盘结构与调度算法" },
  ]},
  { id: "net01", subject: "计算机网络", name: "第1章 体系结构", points: [
    { id: "408.net01.p01", legacyKey: "net01-0", title: "计算机网络的概念、组成与功能" },
    { id: "408.net01.p02", legacyKey: "net01-1", title: "分层结构、协议、接口与服务" },
    { id: "408.net01.p03", legacyKey: "net01-2", title: "OSI 七层模型" },
    { id: "408.net01.p04", legacyKey: "net01-3", title: "TCP/IP 模型" },
    { id: "408.net01.p05", legacyKey: "net01-4", title: "性能指标（带宽/发送时延/传播时延/RTT）" },
  ]},
  { id: "net02", subject: "计算机网络", name: "第2章 物理层", points: [
    { id: "408.net02.p01", legacyKey: "net02-0", title: "通信基础概念（信号/信道/码元/波特）" },
    { id: "408.net02.p02", legacyKey: "net02-1", title: "奈奎斯特（采样）定理" },
    { id: "408.net02.p03", legacyKey: "net02-2", title: "香农定理" },
    { id: "408.net02.p04", legacyKey: "net02-3", title: "编码与调制（曼彻斯特/差分曼彻斯特）" },
    { id: "408.net02.p05", legacyKey: "net02-4", title: "传输介质与物理层设备" },
    { id: "408.net02.p06", legacyKey: "net02-5", title: "信道复用技术（FDM/TDM/WDM）" },
  ]},
  { id: "net03", subject: "计算机网络", name: "第3章 数据链路层", points: [
    { id: "408.net03.p01", legacyKey: "net03-0", title: "数据链路层的功能与组帧方式" },
    { id: "408.net03.p02", legacyKey: "net03-1", title: "差错控制与 CRC 循环冗余校验" },
    { id: "408.net03.p03", legacyKey: "net03-2", title: "滑动窗口协议（GBN/SR）" },
    { id: "408.net03.p04", legacyKey: "net03-3", title: "CSMA/CD 协议与争用期" },
    { id: "408.net03.p05", legacyKey: "net03-4", title: "以太网 MAC 帧与 MAC 地址" },
    { id: "408.net03.p06", legacyKey: "net03-5", title: "交换机的自学习与转发" },
  ]},
  { id: "net04", subject: "计算机网络", name: "第4章 网络层", points: [
    { id: "408.net04.p01", legacyKey: "net04-0", title: "网络层的功能（虚电路/数据报）" },
    { id: "408.net04.p02", legacyKey: "net04-1", title: "IPv4 分组格式" },
    { id: "408.net04.p03", legacyKey: "net04-2", title: "IPv4 地址、子网划分与子网掩码" },
    { id: "408.net04.p04", legacyKey: "net04-3", title: "CIDR 与路由聚合" },
    { id: "408.net04.p05", legacyKey: "net04-4", title: "配套协议：ARP/DHCP/ICMP" },
    { id: "408.net04.p06", legacyKey: "net04-5", title: "IPv6 概述" },
    { id: "408.net04.p07", legacyKey: "net04-6", title: "路由协议（RIP/OSPF/BGP）与路由器" },
  ]},
  { id: "net05", subject: "计算机网络", name: "第5章 传输层", points: [
    { id: "408.net05.p01", legacyKey: "net05-0", title: "传输层的功能与端口" },
    { id: "408.net05.p02", legacyKey: "net05-1", title: "UDP 协议" },
    { id: "408.net05.p03", legacyKey: "net05-2", title: "TCP 报文段与连接管理（三次握手/四次挥手）" },
    { id: "408.net05.p04", legacyKey: "net05-3", title: "TCP 可靠传输（序号/确认/重传）" },
    { id: "408.net05.p05", legacyKey: "net05-4", title: "TCP 流量控制" },
    { id: "408.net05.p06", legacyKey: "net05-5", title: "TCP 拥塞控制（慢开始/拥塞避免/快重传/快恢复）" },
  ]},
  { id: "net06", subject: "计算机网络", name: "第6章 应用层", points: [
    { id: "408.net06.p01", legacyKey: "net06-0", title: "客户/服务器模型与 P2P" },
    { id: "408.net06.p02", legacyKey: "net06-1", title: "DNS 域名系统" },
    { id: "408.net06.p03", legacyKey: "net06-2", title: "FTP 文件传输协议" },
    { id: "408.net06.p04", legacyKey: "net06-3", title: "电子邮件（SMTP/POP3/IMAP）" },
    { id: "408.net06.p05", legacyKey: "net06-4", title: "WWW 与 HTTP" },
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

const STORE_KEY = 'kaoyan-408.v1';
let S = null;
let persistence = null;
let kpSubject = '全部', kpQuery = '';
let mFilter = { status: 'active', chapter: '', reason: '' };
let tickN = 0;
let pqFilter = { ch: '', diff: 0, scope: 'all' }; // 刷题筛选
let pqScopeSnapshot = null; // Keep the practice set stable while answers change.
let pqIndex = 0;                                   // 当前题号
let pqSession = { qid: null, picked: -1, revealed: false }; // 当前题的作答状态
let fQuery = '', fCatFilter = 'all', fQuiz = false, fOnlyFav = false; // 速查卡筛选
let fRevealed = new Set(); // 默写模式下已翻开的卡片

function defaultState(){
  return {
    v: 1,
    settings: { examDate: '2026-12-19', dailyGoal: 240, targetScore: 100 },
    kp: {},            // { 'ds05-3': { status: 0-3, updatedAt } }
    attempts: [],     // 每次提交的独立记录；旧版聚合次数不会补造为历史。
    qz: {},            // 刷题记录：{ 题目id: { ok, times, lastAt, lastPick(选择题最近一次所选下标) } }
    lessons: {},       // 教学进度：{ 课id: { done, doneAt } }
    favF: {},          // 速查卡收藏：{ 卡id: true }
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
    persistence = engine.create({ key: STORE_KEY, subjectId: '408', maxScore: 150, syllabus: SYLLABUS, defaults: defaultState, getStorage: () => localStorage });
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
/* 轻量数学/结构排版：@{分子|分母} 分数，@m{a,b;c,d} 矩阵，@d{..} 行列式（内容为作者预置，非用户输入） */
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
    statCard('🧠', '知识点已掌握', kp.done + '<span class="unit">/ ' + kp.total + '</span>', progressBar(kp.done / kp.total * 100));

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
        ? '<p>计划周期已结束，进入考前自主安排：真题模拟 + 错题回顾 + 速查卡默写。</p>'
        : '<p class="muted">今天不在任何章节窗口内。</p>';
    } else {
      cur.forEach(c => {
        const ch = chapterById(c.id);
        const done = chapterDone(ch), tot = ch.points.length;
        const left = Math.max(0, diffDays(t, c.end));
        const les = LESSONS[ch.id] || [];
        const ldn = les.filter(x => S.lessons[x.id] && S.lessons[x.id].done).length;
        html += '<div class="plan-item"><b>' + esc(ch.name) + '（' + ch.subject + '）</b>' +
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
        '<summary><span class="ch-name">' + esc(c.name) + ' · ' + c.subject + '</span>' +
        '<span class="ch-meta">已掌握 ' + done + '/' + tot + '</span>' +
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

/* ---------------- 知识点详解 ---------------- */

function renderNote(chId){
  const n = NOTES[chId];
  if (!n) return '';
  return '<details class="notebox"><summary>📖 本章考点详解（考频 ' + n.freq + '）</summary><div class="nb">' +
    '<p>' + mathHtml(n.intro) + '</p>' +
    n.sections.map(s => '<h4>▸ ' + esc(s.h) + '</h4><ul>' + s.ul.map(li => '<li>' + mathHtml(li) + '</li>').join('') + '</ul>').join('') +
    '</div></details>';
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
      '<summary><span class="ch-name">' + esc(c.name) + ' · ' + c.subject + '</span>' +
      '<span class="ch-meta">已学 ' + dn + '/' + arr.length + ' 课</span>' +
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

/* ---------------- 速查卡手册 ---------------- */

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
  }).join('') || '<p class="muted">没有匹配的速查卡，换个关键词或分类。</p>';
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

/* ---------------- 图表 ---------------- */

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

/* ---------------- 统计 ---------------- */

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
    statCard('🧠', '知识点掌握', kp.done + '<span class="unit">/ ' + kp.total + '</span>', progressBar(kp.done / kp.total * 100)) +
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

/* ---------------- 设置 ---------------- */

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
  S.settings.targetScore = parseInt(el('sTarget').value, 10) || 100;
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

const SUBJ_SHORT = { '数据结构': '数据', '计算机组成原理': '组原', '操作系统': '系统', '计算机网络': '网络' };
const SUBJECTS = ['数据结构', '计算机组成原理', '操作系统', '计算机网络'];

function chapterOptions(includeUncategorized){
  const opts = SYLLABUS.map(c =>
    '<option value="' + c.id + '">' + (SUBJ_SHORT[c.subject] || c.subject) + ' · ' + esc(shortChapter(c.id)) + '</option>').join('');
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
  el('kpSubjectSel').innerHTML = ['全部'].concat(SUBJECTS).map(s => '<option>' + s + '</option>').join('');
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
