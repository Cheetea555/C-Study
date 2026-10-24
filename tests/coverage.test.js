'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const Coverage = require('../scripts/build-content-coverage.js');
const source = Coverage.load(), report = Coverage.analyze(source), copy = value => JSON.parse(JSON.stringify(value));
assert.equal(report.reduce((sum, subject) => sum + subject.pointCount, 0), 420);
assert.equal(report.reduce((sum, subject) => sum + subject.lessonCount, 0), 156);
assert.equal(report.reduce((sum, subject) => sum + subject.questionCount, 0), 368);
assert.equal(report.reduce((sum, subject) => sum + subject.linkedQuestions, 0), 29, '明确关联 29 题，不以课程引用推断其他题');
const memory = report.find(subject => subject.id === '408').chapters.find(chapter => chapter.id === 'os03');
assert.equal(memory.linkedQuestions, 1, '内存管理仅显式关联页面置换计算题');
for (const [id, chapterId, count] of [['math2','c01',10],['408','ds02',5],['408','ds03',5],['en2','e03',5],['politics','p04',3]]) {
  const chapter = report.find(subject => subject.id === id).chapters.find(chapter => chapter.id === chapterId);
  assert.equal(chapter.questionCount, count); assert.equal(chapter.linkedQuestions, count);
}
const math = report.find(subject => subject.id === 'math2').chapters.find(chapter => chapter.id === 'c01');
assert.equal(math.linkedQuestions, 10, '多考点题不重复计入章节题数');
assert.ok(math.points.some(point => !point.questionIds.length), '课程覆盖完整不等于专项练习覆盖完整');
assert.ok(report.every(subject => subject.chapters.every(chapter => chapter.points.every(point => point.lessonIds.length))));
const lessons = id => Object.values(source.find(subject => subject.id === id).lessons).flat();
assert.deepEqual(lessons('en2').find(lesson => lesson.id === 'Le03-1').quiz, ['Qe03-1']);
assert.ok(lessons('en2').find(lesson => lesson.id === 'Le03-2').quiz.includes('Qe03-2'));
assert.ok(lessons('politics').find(lesson => lesson.id === 'Lp04-1').quiz.includes('Qp04-3'));
assert.ok(!lessons('politics').find(lesson => lesson.id === 'Lp04-2').quiz.includes('Qp04-3'));
function rejected(mutate, expected) { const broken = copy(source); mutate(broken); assert.throws(() => Coverage.analyze(broken), expected); }
rejected(rows => rows[0].questions.push(copy(rows[0].questions[0])), /题目重复/);
rejected(rows => { rows[0].questions[0].pointIds = ['missing']; }, /考点不存在/);
rejected(rows => { rows[0].questions[0].pointIds = [rows[0].syllabus[1].points[0].id]; }, /跨章/);
rejected(rows => { rows[0].questions[0].pointIds = []; }, /考点列表无效/);
rejected(rows => { rows[0].questions[0].pointIds.push(rows[0].questions[0].pointIds[0]); }, /考点列表无效/);
rejected(rows => { rows[0].lessons.c01[0].quiz = ['missing']; }, /配套题不存在/);
rejected(rows => { rows[0].lessons.c01[0].quiz = ['q01-1']; }, /考点无交集/);
rejected(rows => { rows[0].lessons.c01[0].pointIds = []; }, /考点列表无效/);
rejected(rows => { rows[0].lessons.c01[0].pointIds.shift(); }, /考点缺少课程/);
assert.equal(fs.readFileSync(path.join(__dirname,'../docs/content-coverage.md'),'utf8').replace(/\r\n/g,'\n'), Coverage.render(report));
console.log('PASS content coverage · real chapter mappings / unique question totals / missing coverage / invalid and mismatched references / generated report');
