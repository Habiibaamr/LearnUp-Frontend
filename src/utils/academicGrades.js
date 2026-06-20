export const GRADE_POINTS = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  D: 1.0,
  F: 0,
};

const DEMO_GRADE_PALETTES = [
  ["A", "A-", "B+", "B+", "A-"],
  ["A-", "B+", "B", "A", "B+"],
  ["B+", "B", "A-", "B+", "B-"],
  ["B", "B+", "A-", "B", "C+"],
];

const cleanText = (value) => (
  value === undefined || value === null ? "" : String(value).trim()
);

export const normalizeGrade = (value) => cleanText(value).toUpperCase();

export const stableAcademicHash = (value) => {
  const text = cleanText(value).toLowerCase();
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const getStudentAcademicKey = (student = {}) => {
  const source = student && typeof student === "object" ? student : {};
  const sources = [source, source.student, source.user, source.account, source.profile]
    .filter(Boolean);
  const fields = [
    "student_id",
    "studentId",
    "backendStudentId",
    "university_id",
    "universityId",
    "user_id",
    "userId",
    "email",
    "id",
    "full_name",
    "fullName",
    "name",
  ];

  for (const record of sources) {
    for (const field of fields) {
      const value = cleanText(record?.[field]);
      if (value) {
        return value.toLowerCase();
      }
    }
  }

  return "learnup-student";
};

export const getDeterministicDemoGrade = (studentKey, courseCode, courseIndex = 0) => {
  const key = cleanText(studentKey) || "learnup-student";
  const code = cleanText(courseCode).toUpperCase() || `COURSE-${courseIndex + 1}`;
  const palette = DEMO_GRADE_PALETTES[stableAcademicHash(key) % DEMO_GRADE_PALETTES.length];
  const gradeIndex = stableAcademicHash(`${key}:${code}:${courseIndex}`) % palette.length;

  return palette[gradeIndex];
};

export const calculateWeightedGpaValue = (rows = []) => {
  const gradedRows = rows
    .map((row) => ({
      grade: normalizeGrade(row?.grade ?? row?.final_grade ?? row?.letter_grade),
      credits: Number(
        row?.credit_hours ??
        row?.credits ??
        row?.credit ??
        row?.course?.credit_hours ??
        0
      ),
    }))
    .filter((row) => (
      Object.prototype.hasOwnProperty.call(GRADE_POINTS, row.grade) &&
      Number.isFinite(row.credits) &&
      row.credits > 0
    ));

  if (!gradedRows.length) {
    return null;
  }

  const totalCredits = gradedRows.reduce((total, row) => total + row.credits, 0);
  const totalPoints = gradedRows.reduce(
    (total, row) => total + (GRADE_POINTS[row.grade] * row.credits),
    0,
  );

  return totalCredits > 0 ? totalPoints / totalCredits : null;
};
