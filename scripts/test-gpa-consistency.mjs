import { CANONICAL_COURSE_CATALOG } from "../src/data/courseCatalog.js";
import {
  calculateWeightedGpaValue,
  getStudentAcademicKey,
} from "../src/utils/academicGrades.js";
import { getEffectiveGpa, getRiskStatus } from "../src/utils/studentAcademic.js";
import { buildTranscriptFromCatalog } from "../src/utils/semesterResultLogic.js";

const levelTwoStudent = {
  student_id: 27,
  university_id: "STU-NOURHAN",
  email: "nourhan@eru.edu.eg",
  level: 2,
  cgpa: null,
};

const transcript = buildTranscriptFromCatalog({
  catalog: CANONICAL_COURSE_CATALOG,
  studentLevel: 2,
  currentAcademicYear: "2025/2026",
  studentKey: getStudentAcademicKey(levelTwoStudent),
});
const transcriptCgpa = calculateWeightedGpaValue(transcript);
const dashboardCgpa = getEffectiveGpa(levelTwoStudent);
const failingStudentGpa = getEffectiveGpa({
  level: 2,
  course_registrations: [
    { grade: "F", credit_hours: 3 },
    { grade: "F", credit_hours: 4 },
  ],
});

const checks = [
  ["Level 1 missing GPA is allowed", getEffectiveGpa({ level: 1, cgpa: null }) === null],
  ["Level 2 missing GPA receives deterministic CGPA", dashboardCgpa !== null],
  [
    "Dashboard CGPA matches generated transcript CGPA",
    dashboardCgpa?.toFixed(4) === transcriptCgpa?.toFixed(4),
  ],
  ["Deterministic CGPA is stable", dashboardCgpa === getEffectiveGpa(levelTwoStudent)],
  ["Real all-F registrations preserve GPA 0.00", failingStudentGpa === 0],
  ["Risk uses calculated GPA", getRiskStatus(failingStudentGpa).label === "At Risk"],
];

let failed = 0;

for (const [label, passed] of checks) {
  if (passed) {
    console.log("PASS:", label);
  } else {
    failed += 1;
    console.error("FAIL:", label);
  }
}

console.log("Level 2 deterministic CGPA:", dashboardCgpa?.toFixed(2));

if (failed > 0) {
  process.exitCode = 1;
}
