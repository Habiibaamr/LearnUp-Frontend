export const resultTerms = ["Spring", "Summer", "Fall"];

export const academicYears = [
  "2025/2026",
  "2024/2025",
  "2023/2024",
  "2022/2023",
  "2021/2022",
];

// Mock semester results stay in place until a confirmed results endpoint is wired.
export const semesterResults = [
  {
    academicYear: "2025/2026",
    term: "Fall",
    courses: [
      { icon: "trophy", course: "Machine Learning", code: "CS-401", credits: 3, grade: "A", status: "Passed" },
      { icon: "sigma", course: "Ethics in AI", code: "CS-305", credits: 3, grade: "A-", status: "Passed" },
      { icon: "monitor", course: "Operating Systems", code: "CS-302", credits: 3, grade: "B+", status: "Passed" },
      { icon: "book", course: "Calculus II", code: "MTH-202", credits: 3, grade: "F", status: "Failed" },
    ],
  },
  {
    academicYear: "2025/2026",
    term: "Spring",
    courses: [
      { icon: "book", course: "Data Structures", code: "CS-201", credits: 3, grade: "A", status: "Passed" },
      { icon: "monitor", course: "Computer Architecture", code: "CS-202", credits: 3, grade: "B+", status: "Passed" },
      { icon: "sigma", course: "Linear Algebra", code: "MTH-204", credits: 3, grade: "B", status: "Passed" },
    ],
  },
  {
    academicYear: "2025/2026",
    term: "Summer",
    courses: [
      { icon: "book", course: "Technical Writing", code: "HUM-210", credits: 2, grade: "A-", status: "Passed" },
      { icon: "monitor", course: "Web Fundamentals", code: "CS-220", credits: 3, grade: "B+", status: "Passed" },
    ],
  },
  {
    academicYear: "2024/2025",
    term: "Fall",
    courses: [
      { icon: "book", course: "Programming 2", code: "CS-102", credits: 3, grade: "A", status: "Passed" },
      { icon: "sigma", course: "Discrete Mathematics", code: "MTH-105", credits: 4, grade: "B", status: "Passed" },
      { icon: "monitor", course: "Digital Logic", code: "CS-110", credits: 3, grade: "C+", status: "Passed" },
    ],
  },
  {
    academicYear: "2024/2025",
    term: "Spring",
    courses: [
      { icon: "book", course: "Programming 1", code: "CS-101", credits: 3, grade: "B+", status: "Passed" },
      { icon: "sigma", course: "Calculus I", code: "MTH-101", credits: 3, grade: "D", status: "Passed" },
      { icon: "monitor", course: "Physics for Computing", code: "PHY-101", credits: 3, grade: "F", status: "Failed" },
    ],
  },
  {
    academicYear: "2023/2024",
    term: "Fall",
    courses: [
      { icon: "book", course: "Computer Skills", code: "GEN-101", credits: 2, grade: "A", status: "Passed" },
      { icon: "trophy", course: "English for Technology", code: "ENG-101", credits: 2, grade: "A-", status: "Passed" },
    ],
  },
];
