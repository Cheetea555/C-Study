/* Validate explicit content relationships and generate a reproducible gap report. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const Common = require('../assets/common.js'), Content = require('../assets/content.js');
const root = path.resolve(__dirname, '..');
function load() {
  return Common.subjects.map(({ id, name, folder }) => {
    const dir = path.join(root, folder), files = fs.readdirSync(dir).sort();
    return { id, name, folder, syllabus: require(path.join(dir, 'app.js')).SYLLABUS,
      lessons: Object.assign({}, ...files.filter(f => /^data-lessons.*\.js$/.test(f)).map(f => require(path.join(dir, f)).LESSONS)),
      questions: files.filter(f => /^data-q.*\.js$/.test(f)).flatMap(f => require(path.join(dir, f)).QUESTIONS) };
  });
}
function analyze(subjects) {
  const globalPoints = new Set();
  return subjects.map(subject => {
    const chapters = new Map(), points = new Map(), lessons = new Map(), questions = new Map();
    function unique(map, id, value, label) { if (map.has(id)) throw Error(label + '重复: ' + id); map.set(id, value); }
    for (const chapter of subject.syllabus) {
      unique(chapters, chapter.id, chapter, '章节');
      for (const point of chapter.points) {
        if (globalPoints.has(point.id)) throw Error('考点重复: ' + point.id);
        globalPoints.add(point.id); unique(points, point.id, chapter.id, '考点');
      }
    }
    function references(row, label, required) {
      if (!chapters.has(row.ch)) throw Error(label + '章节不存在: ' + row.id);
      if (row.pointIds === undefined && !required) return;
      if (!Array.isArray(row.pointIds) || !row.pointIds.length || new Set(row.pointIds).size !== row.pointIds.length) throw Error(label + '考点列表无效: ' + row.id);
      for (const id of row.pointIds) if (points.get(id) !== row.ch) throw Error(label + '考点不存在或跨章: ' + row.id + ' -> ' + id);
    }
    for (const question of subject.questions) { unique(questions, question.id, question, '题目'); references(question, '题目', false); }
    for (const [chapterId, rows] of Object.entries(subject.lessons)) for (const lesson of rows) {
      unique(lessons, lesson.id, lesson, '课程'); references(lesson, '课程', true);
      if (lesson.ch !== chapterId || !Array.isArray(lesson.quiz) || new Set(lesson.quiz).size !== lesson.quiz.length) throw Error('课程章节或配套题列表无效: ' + lesson.id);
      for (const id of lesson.quiz) {
        const question = questions.get(id);
        if (!question || question.ch !== lesson.ch) throw Error('配套题不存在或跨章: ' + lesson.id + ' -> ' + id);
        if (question.pointIds && !question.pointIds.some(point => lesson.pointIds.includes(point))) throw Error('配套题与课程考点无交集: ' + lesson.id + ' -> ' + id);
      }
    }
    const index = Content.create(subject.syllabus, subject.lessons, subject.questions);
    const rows = subject.syllabus.map(chapter => {
      const pointRows = chapter.points.map(point => ({ id: point.id, title: point.title,
        lessonIds: index.lessonsFor(point.id).map(lesson => lesson.id), questionIds: index.questionsFor(point.id).map(question => question.id) }));
      for (const point of pointRows) if (!point.lessonIds.length) throw Error('考点缺少课程: ' + point.id);
      const chapterQuestions = subject.questions.filter(question => question.ch === chapter.id);
      return { id: chapter.id, name: chapter.name, points: pointRows, questionCount: chapterQuestions.length,
        linkedQuestions: chapterQuestions.filter(question => question.pointIds?.length).length,
        unlinkedQuestionIds: chapterQuestions.filter(question => !question.pointIds?.length).map(question => question.id) };
    });
    return { id: subject.id, name: subject.name, folder: subject.folder, chapters: rows,
      pointCount: points.size, lessonCount: lessons.size, questionCount: questions.size,
      practicedPoints: rows.flatMap(chapter => chapter.points).filter(point => point.questionIds.length).length,
      linkedQuestions: subject.questions.filter(question => question.pointIds?.length).length };
  });
}
const safe = text => String(text).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
function render(report) {
  const lines = ['# 内容关联覆盖报告', '', '> 自动生成：`node scripts/build-content-coverage.js`。CI 使用 `--check` 检查新鲜度与引用完整性。', '',
    '只统计明确写入的 `pointIds`，不按章节或配套题自动推断。课程覆盖表示存在关联课程；专项题覆盖表示存在关联题目，均不代表内容已通过独立审核或学习者已掌握。多考点题在题目总数中按题 ID 只计一次。', '',
    '| 科目 | 考点 | 课程 | 有专项题的考点 | 已关联题 / 题目总数 |', '|---|---:|---:|---:|---:|'];
  for (const subject of report) lines.push('| ' + subject.name + ' | ' + subject.pointCount + ' | ' + subject.lessonCount + ' | ' + subject.practicedPoints + ' | ' + subject.linkedQuestions + ' / ' + subject.questionCount + ' |');
  lines.push('', '未关联题仍可从章节题库与原配套练习使用，不计为专项题覆盖。待补考点可能已有章节练习，但尚未建立明确关联。', '');
  for (const subject of report) {
    lines.push('## ' + subject.name, '', '| 章节 | 课程覆盖 / 考点数 | 专项题覆盖 / 考点数 | 已关联题 / 章节题数 |', '|---|---:|---:|---:|');
    for (const chapter of subject.chapters) lines.push('| ' + safe(chapter.name) + ' | ' + chapter.points.filter(point => point.lessonIds.length).length + ' / ' + chapter.points.length + ' | ' + chapter.points.filter(point => point.questionIds.length).length + ' / ' + chapter.points.length + ' | ' + chapter.linkedQuestions + ' / ' + chapter.questionCount + ' |');
    lines.push('', '<details>', '<summary>待补关联明细</summary>', '');
    for (const chapter of subject.chapters) {
      const missing = chapter.points.filter(point => !point.questionIds.length);
      if (!missing.length && !chapter.unlinkedQuestionIds.length) continue;
      lines.push('### ' + chapter.name, '');
      for (const point of missing) lines.push('- `' + point.id + '`：' + safe(point.title));
      if (chapter.unlinkedQuestionIds.length) lines.push('', '未关联题：' + chapter.unlinkedQuestionIds.map(id => '`' + id + '`').join('、') + '。');
      lines.push('');
    }
    lines.push('</details>', '');
  }
  return lines.join('\n');
}
function build() { return analyze(load()); }
if (require.main === module) {
  const report = build(), output = render(report), target = path.join(root, 'docs/content-coverage.md');
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== output) { console.error('Content coverage report is stale. Run node scripts/build-content-coverage.js.'); process.exitCode = 1; }
    else console.log('PASS content references and coverage report (' + report.reduce((sum, s) => sum + s.linkedQuestions, 0) + '/' + report.reduce((sum, s) => sum + s.questionCount, 0) + ' questions linked)');
  } else { fs.writeFileSync(target, output); console.log('Generated content coverage report'); }
}
module.exports = { load, analyze, build, render };
