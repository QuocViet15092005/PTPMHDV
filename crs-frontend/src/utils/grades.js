const gradePoints = { A: 4, 'B+': 3.5, B: 3, 'C+': 2.5, C: 2, 'D+': 1.5, D: 1, F: 0 };

export function summarizeGrades(registrations) {
  let weightedPoints = 0;
  let gradedCredits = 0;
  let earnedCredits = 0;
  for (const registration of registrations) {
    if (registration.status !== 'ACTIVE') continue;
    const credits = registration.course?.credits;
    const points = registration.gradePoint ?? gradePoints[registration.letterGrade];
    if (!Number.isFinite(credits) || credits <= 0 || !Number.isFinite(points)) continue;
    gradedCredits += credits;
    weightedPoints += points * credits;
    if (points > 0) earnedCredits += credits;
  }
  return { earnedCredits, gradedCredits, gpa: gradedCredits ? (weightedPoints / gradedCredits).toFixed(2) : 'Chưa có' };
}
