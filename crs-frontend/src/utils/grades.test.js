import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeGrades } from './grades.js';

test('GPA weights credits, includes failed courses, excludes ungraded/cancelled courses', () => {
  const rows = [
    { status: 'ACTIVE', course: { credits: 3 }, letterGrade: 'A', gradePoint: 4 },
    { status: 'ACTIVE', course: { credits: 2 }, letterGrade: 'F', gradePoint: 0 },
    { status: 'ACTIVE', course: { credits: 4 }, letterGrade: null },
    { status: 'CANCELLED', course: { credits: 6 }, letterGrade: 'A' },
  ];
  assert.deepEqual(summarizeGrades(rows), { earnedCredits: 3, gradedCredits: 5, gpa: '2.40' });
});

test('zero is a real failing grade, not a missing grade', () => {
  assert.deepEqual(summarizeGrades([{ status: 'ACTIVE', course: { credits: 3 }, score: 0, letterGrade: 'F', gradePoint: 0 }]),
    { earnedCredits: 0, gradedCredits: 3, gpa: '0.00' });
});

test('old letter grades remain supported and missing course data does not produce NaN', () => {
  assert.equal(summarizeGrades([{ status: 'ACTIVE', course: { credits: 2 }, letterGrade: 'B+' }]).gpa, '3.50');
  assert.equal(summarizeGrades([{ status: 'ACTIVE', letterGrade: 'A' }]).gpa, 'Chưa có');
  assert.equal(summarizeGrades([]).gpa, 'Chưa có');
});
