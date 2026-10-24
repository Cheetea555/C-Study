/* Regenerate with node scripts/build-search-index.js; --check verifies freshness. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const Common = require('../assets/common.js');
const Search = require('../assets/search.js');
const root = path.resolve(__dirname, '..');
function build() {
  const records = [], keys = new Set();
  const subjects = Common.subjects.map(({ id, name, folder }) => ({ id, name, folder }));
  for (const subject of subjects) {
    const folder = path.join(root, subject.folder), app = require(path.join(folder, 'app.js'));
    const files = fs.readdirSync(folder).sort();
    const lessons = Object.assign({}, ...files.filter(file => /^data-lessons.*\.js$/.test(file)).map(file => require(path.join(folder, file)).LESSONS));
    const questions = files.filter(file => /^data-q.*\.js$/.test(file)).flatMap(file => require(path.join(folder, file)).QUESTIONS);
    const { FORMULAS, FORMULA_CATS } = require(path.join(folder, 'data-formulas.js'));
    const chapters = new Map(app.SYLLABUS.map(chapter => [chapter.id, chapter.name]));
    function section(label, text) { return { label, text: Search.toText(text) }; }
    function add(type, id, title, chapterId, sections, category) {
      const key = subject.id + ':' + type + ':' + id;
      if (keys.has(key)) throw Error('Duplicate search key: ' + key);
      if (chapterId && !chapters.has(chapterId)) throw Error('Unknown chapter: ' + key);
      keys.add(key);
      records.push({ key, subject: subject.id, type, id, title: Search.toText(title), chapterId: chapterId || null,
        chapter: chapters.get(chapterId) || category || '', sections: sections.filter(item => item.text) });
    }
    for (const chapter of app.SYLLABUS) for (const point of chapter.points) add('point', point.id, point.title, chapter.id, []);
    for (const lesson of Object.values(lessons).flat()) add('lesson', lesson.id, lesson.title, lesson.ch, [
      section('学习目标', lesson.goal), ...lesson.concept.map(text => section('概念与方法', text)),
      ...lesson.examples.flatMap(example => [section('课程例题', example.q), section('例题讲解', example.sol)]),
      ...lesson.pitfalls.map(text => section('常见错误', text))
    ]);
    for (const question of questions) add('question', question.id, question.q, question.ch, [
      ...(question.opts || []).map(text => section('选项', text)), section('解析', question.sol)
    ]);
    for (const card of FORMULAS) add('card', card.id, card.name, null, [section('卡片正文', card.f), section('提示', card.tip)], FORMULA_CATS.find(cat => cat.id === card.cat)?.name);
  }
  return { version: 1, subjects, records };
}
function serialize(index) {
  const json = JSON.stringify(index).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return '/* Generated from public content. Do not edit; run node scripts/build-search-index.js. */\n(function(root){const index=' + json + ';if(typeof module!=="undefined"&&module.exports)module.exports=index;else root.StudySearchIndex=index;})(typeof window!=="undefined"?window:this);\n';
}
if (require.main === module) {
  const index = build(), content = serialize(index), target = path.join(root, 'assets/search-index.js');
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== content) { console.error('Search index is stale. Run node scripts/build-search-index.js.'); process.exitCode = 1; }
    else console.log('PASS search index matches public content (' + index.records.length + ' records)');
  } else { fs.writeFileSync(target, content); console.log('Generated ' + index.records.length + ' search records.'); }
}
module.exports = { build, serialize };
