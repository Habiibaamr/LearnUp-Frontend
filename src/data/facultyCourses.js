import { facultyStudents } from "./facultyStudents.js";

// Mock faculty course/offering data stays in place until course-offering endpoints are wired.
export const facultyCourseLevels = [
  {
    level: "Level 1",
    label: "Foundation Year",
    courses: [
      { code: "CS-101", title: "Intro to Computing", students: 145 },
      { code: "MAT-110", title: "Calculus I", students: 121 },
      { code: "ENG-102", title: "Academic Writing", students: 110 },
      { code: "PHY-150", title: "General Physics", students: 79 },
      { code: "CS-120", title: "Discrete Structures", students: 130 },
    ],
  },
  {
    level: "Level 2",
    label: "Intermediate Studies",
    courses: [
      { code: "CS-201", title: "Data Structures", students: 120 },
      { code: "CS-220", title: "Algorithm Design", students: 84 },
      { code: "NET-205", title: "Computer Networks", students: 104 },
      { code: "DB-240", title: "Database Systems", students: 115 },
      { code: "OS-210", title: "Operating Systems", students: 95 },
    ],
  },
  {
    level: "Level 3",
    label: "Advanced Specialization",
    courses: [
      { code: "MAT-405", title: "Quantum Physics", students: 42 },
      { code: "CS-350", title: "AI Ethics", students: 64 },
      { code: "SEC-380", title: "Cybersecurity", students: 53 },
      { code: "GPH-312", title: "Comp Graphics", students: 38 },
      { code: "CS-390", title: "Machine Learning", students: 92 },
    ],
  },
  {
    level: "Level 4",
    label: "Graduation Projects",
    courses: [
      { code: "THS-401", title: "Senior Thesis I", students: 15 },
      { code: "CS-450", title: "Capstone Project", students: 72 },
      { code: "CS-420", title: "Cloud Architecture", students: 78 },
      { code: "DS-410", title: "Big Data Systems", students: 31 },
      { code: "SE-402", title: "Soft Engineering II", students: 45 },
    ],
  },
];

const courseEnrollmentIds = {
  "CS-101": ["#UP-9021", "#UP-1209", "#UP-4432", "#UP-5188", "#UP-3507"],
  "MAT-110": ["#UP-1209", "#UP-4432", "#UP-6640", "#UP-3507"],
  "ENG-102": ["#UP-9021", "#UP-5188", "#UP-7714"],
  "PHY-150": ["#UP-4432", "#UP-3507", "#UP-2461"],
  "CS-120": ["#UP-1209", "#UP-5188", "#UP-7714", "#UP-6640"],
  "CS-201": ["#UP-9021", "#UP-4432", "#UP-7714", "#UP-2461"],
  "CS-220": ["#UP-5188", "#UP-7714", "#UP-6640"],
  "NET-205": ["#UP-1209", "#UP-3507", "#UP-2461"],
  "DB-240": ["#UP-9021", "#UP-4432", "#UP-3507", "#UP-2461"],
  "OS-210": ["#UP-1209", "#UP-5188", "#UP-6640"],
  "MAT-405": ["#UP-9021", "#UP-2461"],
  "CS-350": ["#UP-5188", "#UP-7714", "#UP-2461"],
  "SEC-380": ["#UP-1209", "#UP-6640", "#UP-3507"],
  "GPH-312": ["#UP-4432", "#UP-7714"],
  "CS-390": ["#UP-9021", "#UP-5188", "#UP-3507", "#UP-2461"],
  "THS-401": ["#UP-9021", "#UP-5188", "#UP-2461"],
  "CS-450": ["#UP-9021", "#UP-4432", "#UP-5188", "#UP-2461"],
  "CS-420": ["#UP-5188", "#UP-7714", "#UP-3507"],
  "DS-410": ["#UP-4432", "#UP-6640", "#UP-2461"],
  "SE-402": ["#UP-9021", "#UP-1209", "#UP-5188"],
};

export function decodeCourseCode(courseCode) {
  return decodeURIComponent(courseCode || "").toUpperCase();
}

export function getFacultyCourseByCode(courseCode) {
  const normalizedCode = decodeCourseCode(courseCode);

  return facultyCourseLevels
    .flatMap((group) => group.courses)
    .find((course) => course.code === normalizedCode);
}

export function getFacultyCourseStudents(courseCode) {
  const normalizedCode = decodeCourseCode(courseCode);
  const enrolledIds = courseEnrollmentIds[normalizedCode] || [];

  return enrolledIds
    .map((id) => facultyStudents.find((student) => student.id === id))
    .filter(Boolean);
}

export function getAvailableStudentsForCourse(courseCode) {
  const enrolledIds = new Set(getFacultyCourseStudents(courseCode).map((student) => student.id));

  return facultyStudents.filter((student) => !enrolledIds.has(student.id));
}
