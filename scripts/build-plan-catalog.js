/* Public metadata only; the browser never loads subject engines to build a plan. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const Common = require('../assets/common.js');
const root = path.resolve(__dirname, '..');
function build() {
  return { v: 1, subjects: Common.subjects.map(({ id, name, folder, key }) => {
    const dir = path.join(root, folder), app = require(path.join(dir, 'app.js'));
    const lessons = Object.assign({}, ...fs.readdirSync(dir).sort().filter(file => /^data-lessons.*\.js$/.test(file)).map(file => require(path.join(dir, file)).LESSONS));
    const rows = app.SYLLABUS.flatMap(ch => lessons[ch.id] || []), ids = new Set();
    for (const lesson of rows) {
      if (ids.has(lesson.id) || !Number.isInteger(lesson.mins) || lesson.mins < 1 || !Array.isArray(lesson.quiz)) throw Error('Invalid planner lesson: ' + lesson.id);
      ids.add(lesson.id);
    }
    return { id, name, folder, key, maxScore: ['math2', '408'].includes(id) ? 150 : 100, defaults: app.defaultState(),
      lessons: rows.map(lesson => ({ id: lesson.id, title: lesson.title, minutes: lesson.mins, quiz: lesson.quiz })) };
  }) };
}
function serialize(catalog) {
  const value = JSON.stringify(catalog).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return '/* Generated public lesson metadata. Run node scripts/build-plan-catalog.js. */\n(function(root){const catalog=' + value + ';if(typeof module!=="undefined"&&module.exports)module.exports=catalog;else root.StudyPlanCatalog=catalog;})(typeof window!=="undefined"?window:this);\n';
}
if (require.main === module) {
  const output = serialize(build()), target = path.join(root, 'assets/plan-catalog.js');
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== output) { console.error('Planner catalog is stale. Run node scripts/build-plan-catalog.js.'); process.exitCode = 1; }
    else console.log('PASS planner catalog matches public lessons');
  } else { fs.writeFileSync(target, output); console.log('Generated planner catalog'); }
}
module.exports = { build, serialize };
