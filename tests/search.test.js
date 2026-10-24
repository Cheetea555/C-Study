/* Content recall, ranking, deep-link actions and public index freshness. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const StudyReview = require('../assets/review.js');
const Search = require('../assets/search.js');
const Content = require('../assets/content.js');
const Common = require('../assets/common.js');
const generated = require('../assets/search-index.js');
const { build, serialize } = require('../scripts/build-search-index.js');
const root = path.resolve(__dirname, '..');
assert.deepEqual(generated, build(), '内容修改后必须重新生成索引');
assert.equal(fs.readFileSync(path.join(root, 'assets/search-index.js'), 'utf8').replace(/\r\n/g, '\n'), serialize(generated), '生成产物应确定且可检查，兼容 Windows 换行');
assert.equal(new Set(generated.records.map(record => record.key)).size, generated.records.length);
for (const [type, count] of Object.entries({ point: 420, lesson: 156, question: 368, card: 256 })) assert.equal(generated.records.filter(record => record.type === type).length, count);
assert.equal(/localStorage|getState|\.mistakes|\.logs/.test(fs.readFileSync(path.join(root, 'assets/search-page.js'), 'utf8')), false, '搜索不应读取私人记录');
const engine = Search.create(generated.records, generated.subjects);
const cases = [
  ['TLB', '408:point:408.co03.p09'], ['ｔｌｂ', '408:card:C045'],
  ['pv', '408:lesson:Los02-2'], ['信号量', '408:card:C071'],
  ['求导', 'math2:card:F041'], ['定语从句', 'en2:lesson:Le07-2'],
  ['感性认识', 'politics:point:politics.p04.p02'], ['先接后继', '408:lesson:Lds02-2'],
  ['链表 删除', '408:lesson:Lds02-2'], ['impossible', 'en2:card:E001']
];
for (const [query, expected] of cases) assert.ok(engine.search(query).slice(0, 8).some(record => record.key === expected), query + ' 应召回 ' + expected);
const paragraph = engine.search('先接后继', { type: 'lesson' })[0];
assert.equal(paragraph.matched, '概念与方法');
assert.ok(paragraph.snippet.includes('先接后继'));
assert.equal(Content.parseRoute(new URL(paragraph.href, 'http://local/').hash).text, '先接后继');
assert.ok(engine.search('链表', { subject: '408', type: 'question' }).every(record => record.subject === '408' && record.type === 'question'));
assert.equal(engine.search('链表', { subject: 'en2' }).length, 0);
assert.deepEqual(engine.search('完全不存在的验收关键词'), []);
assert.deepEqual(engine.search(' '), []);
assert.deepEqual(engine.search('<img src=x onerror=alert(1)>'), []);
assert.equal(engine.search('空指针域', { type: 'question' }).find(record => record.id === 'Qds05-5').snippet, '', '只命中题干时不应附带答案或解析');
assert.equal(engine.search('空指针域', { type: 'question' }).find(record => record.id === 'Qds05-5').matched, '题干');
assert.equal(Search.toText('a < b 且 c > d'), 'a < b 且 c > d', '数学比较符号必须保留');
const highlighted = Search.highlight('ＴＬＢ 与快表 <b>', ['tlb', '快表']);
assert.equal(highlighted.map(part => part.text).join(''), 'ＴＬＢ 与快表 <b>');
assert.deepEqual(highlighted.filter(part => part.match).map(part => part.text), ['ＴＬＢ', '快表']);
const escaped = highlighted.map(part => part.match ? '<mark>' + Common.esc(part.text) + '</mark>' : Common.esc(part.text)).join('');
assert.ok(!escaped.includes('<b>'));
const fake = Search.create([{ key: 'x', subject: '408', type: 'card', id: 'X', title: 'improve', chapter: '', sections: [] }], generated.subjects);
assert.equal(fake.search('pv').length, 0, '缩写不能命中无关英文词的内部');
assert.equal(serialize({ text: '</script>\u2028' }).includes('</script>'), false);

for (const subject of Common.subjects) {
  const folder = path.join(root, subject.folder), files = fs.readdirSync(folder);
  const context = vm.createContext({ StudyReview, console, URLSearchParams, setTimeout: () => 0 });
  for (const file of files.filter(file => /^data-(?:q|formulas).*\.js$/.test(file))) vm.runInContext(fs.readFileSync(path.join(folder, file), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(folder, 'app.js'), 'utf8'), context);
  vm.runInContext(`
    S = defaultState();
    let visited = '', source = '', saves = 0;
    const elements = new Map(); el = id => { if (!elements.has(id)) elements.set(id, {}); return elements.get(id); };
    goTab = name => { visited = name; };
    renderFormulas = () => {};
    save = () => { saves++; return true; };
    this.StudyUI = { setQuestionSource: id => { source = id; } };
    const question = QUESTIONS[0];
    S.qz[question.id] = {ok:true, times:4};
    pqSession = {qid:question.id, revealed:true, judged:true, picked:question.ans};
    if (!A.openQuestion(question.id) || visited !== 'pq' || source !== question.id) throw Error('未定位搜索题目');
    if (filteredQuestions().length !== 1 || filteredQuestions()[0].id !== question.id) throw Error('应只显示目标题');
    if (pqSession.revealed || pqSession.judged || pqSession.picked !== -1) throw Error('不能泄露旧答案');
    if (S.qz[question.id].times !== 4 || S.attempts.length || saves) throw Error('定位不能记录作答');
    if (A.openQuestion('missing') || filteredQuestions()[0].id !== question.id) throw Error('无效题目破坏现有题集');
    kpSubject = 'missing'; kpQuery = 'hidden';
    if (!A.openPoint(SYLLABUS[0].points[0].id) || visited !== 'kp' || kpSubject !== '全部' || kpQuery) throw Error('考点定位未清除过滤');
    fQuery = 'hidden'; fOnlyFav = true; fQuiz = true;
    if (!A.openCard(FORMULAS[0].id) || visited !== 'learn' || fQuery || fOnlyFav || fQuiz) throw Error('速查卡定位未清除过滤');
    if (Object.keys(S.kp).length || S.attempts.length || saves) throw Error('内容定位不能改变掌握记录或作答');
    if (A.openPoint('missing') || A.openCard('missing')) throw Error('无效目标应返回失败');
  `, context);
  const subjectRecords = generated.records.filter(record => record.subject === subject.id);
  for (const record of subjectRecords) {
    const result = engine.search(record.title, { subject: subject.id, type: record.type }).find(item => item.id === record.id);
    assert.ok(result, '索引中每项都可用标题召回：' + record.key);
    const route = Content.parseRoute(new URL(result.href, 'http://local/').hash);
    assert.equal(route[{ point: 'point', lesson: 'lesson', question: 'question', card: 'card' }[record.type]], record.id);
  }
  console.log('PASS ' + subject.name + ' · 四类内容索引 / 标题召回 / 深链接 / 导航不记作答');
}
console.log('PASS 搜索别名 / 多词 / 排序 / 正文摘要 / 筛选 / 无结果 / 安全高亮 / 确定性生成');
