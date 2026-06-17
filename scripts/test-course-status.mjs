import { CANONICAL_COURSE_CATALOG } from "../src/data/courseCatalog.js";
import { buildCourseBoardCourses } from "../src/utils/courseBoardLogic.js";

const board = buildCourseBoardCourses({
  courses: CANONICAL_COURSE_CATALOG,
  studentLevel: 2,
  enrolledCourseCodes: [],
});

const byTab = (status) => board.filter((course) => course.calculatedStatus === status).map((course) => course.course_code);

const level1Codes = ["CS101", "CS102", "MA101", "HUM101", "CS103", "MA105", "ENG101", "PHY101"];
const passedMissing = level1Codes.filter((code) => !byTab("passed").includes(code));

console.log("Passed", byTab("passed"));
console.log("Available", byTab("available"));
console.log("Locked count", byTab("locked").length);
console.log("Enrolled", byTab("enrolled"));

const checks = [
  ["Board not empty", board.length === 32],
  ["All Level 1 passed", passedMissing.length === 0, passedMissing],
  ["CS201 available", byTab("available").includes("CS201")],
  ["8 available at level 2", byTab("available").length === 8],
  ["16 locked", byTab("locked").length === 16],
  ["0 enrolled without backend data", byTab("enrolled").length === 0],
];

let failed = 0;
for (const [label, ok, detail] of checks) {
  if (!ok) {
    failed += 1;
    console.error("FAIL:", label, detail || "");
  } else {
    console.log("PASS:", label);
  }
}

if (failed > 0) process.exitCode = 1;
