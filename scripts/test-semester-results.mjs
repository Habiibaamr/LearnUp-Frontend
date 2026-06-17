import { CANONICAL_COURSE_CATALOG } from "../src/data/courseCatalog.js";
import {
  buildTranscriptFromCatalog,
  filterResultsByPeriod,
  getAvailableAcademicYears,
  getStudentAcademicYears,
} from "../src/utils/semesterResultLogic.js";

const currentAcademicYear = "2025/2026";
const studentLevel = 2;

const transcript = buildTranscriptFromCatalog({
  catalog: CANONICAL_COURSE_CATALOG,
  studentLevel,
  enrolledCourseCodes: ["CS201"],
  currentAcademicYear,
});

const years = getStudentAcademicYears(studentLevel, currentAcademicYear);
const fall2024 = filterResultsByPeriod(transcript, "2024/2025", "Fall", studentLevel, currentAcademicYear);
const spring2024 = filterResultsByPeriod(transcript, "2024/2025", "Spring", studentLevel, currentAcademicYear);
const fall2025 = filterResultsByPeriod(transcript, "2025/2026", "Fall", studentLevel, currentAcademicYear);
const spring2025 = filterResultsByPeriod(transcript, "2025/2026", "Spring", studentLevel, currentAcademicYear);

const codes = (rows) => rows.map((row) => row.course_code);

console.log("Years", years);
console.log("2024/2025 Fall", codes(fall2024), fall2024.map((r) => r.status));
console.log("2024/2025 Spring", codes(spring2024));
console.log("2025/2026 Fall", codes(fall2025), fall2025.map((r) => [r.course_code, r.status]));
console.log("2025/2026 Spring", codes(spring2025));

const checks = [
  ["Years for level 2", years.join(",") === "2025/2026,2024/2025"],
  ["Sem1 in 2024/2025 Fall", codes(fall2024).join(",") === "CS101,CS102,HUM101,MA101"],
  ["Sem1 passed not in progress", fall2024.every((r) => r.status === "passed")],
  ["Sem2 in 2024/2025 Spring", codes(spring2024).join(",") === "CS103,ENG101,MA105,PHY101"],
  ["Sem3 in 2025/2026 Fall", codes(fall2025).join(",") === "CS201,CS202,MA201,STAT201"],
  ["CS201 in progress when enrolled", fall2025.find((r) => r.course_code === "CS201")?.status === "in progress"],
  ["CS101 not in 2025/2026 Fall", !codes(fall2025).includes("CS101")],
  ["Sem4 in 2025/2026 Spring", codes(spring2025).join(",") === "CS203,CS204,CS205,SE201"],
  ["Registered credits Fall 2025", fall2025.reduce((t, r) => t + r.credit_hours, 0) === 13],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) {
    failed += 1;
    console.error("FAIL:", label);
  } else {
    console.log("PASS:", label);
  }
}

if (failed > 0) process.exitCode = 1;
