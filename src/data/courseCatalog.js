export const COURSE_PREREQUISITES = {
  CS103: ["CS101"],
  CS201: ["CS103"],
  CS203: ["CS103"],
  CS301: ["CS201"],
  CS303: ["CS203"],
  CS305: ["CS203"],
  AI301: ["CS201", "MA105"],
  CS401: ["AI301", "STAT201"],
  DS301: ["CS205", "STAT201"],
  CS403: ["CS205"],
  CS302: ["CS202"],
  CS304: ["CS302"],
  CS404: ["CS202", "CS204"],
  SE302: ["SE201"],
  SE401: ["SE302"],
  CS498: ["SE302", "CS301"],
  CS499: ["CS498"],
};

const catalogEntries = [
  { course_code: "CS101", course_title: "Programming 1", semester_id: 1, credit_hours: 3 },
  { course_code: "CS102", course_title: "Computer Systems", semester_id: 1, credit_hours: 3 },
  { course_code: "MA101", course_title: "Calculus 1", semester_id: 1, credit_hours: 4 },
  { course_code: "HUM101", course_title: "Human Rights", semester_id: 1, credit_hours: 2 },
  { course_code: "CS103", course_title: "Programming 2", semester_id: 2, credit_hours: 3 },
  { course_code: "MA105", course_title: "Discrete Math", semester_id: 2, credit_hours: 4 },
  { course_code: "ENG101", course_title: "Technical Writing", semester_id: 2, credit_hours: 2 },
  { course_code: "PHY101", course_title: "Physics", semester_id: 2, credit_hours: 3 },
  { course_code: "CS201", course_title: "Data Structures", semester_id: 3, credit_hours: 3 },
  { course_code: "CS202", course_title: "Computer Architecture", semester_id: 3, credit_hours: 3 },
  { course_code: "MA201", course_title: "Linear Algebra", semester_id: 3, credit_hours: 4 },
  { course_code: "STAT201", course_title: "Probability and Statistics", semester_id: 3, credit_hours: 3 },
  { course_code: "CS203", course_title: "Object Oriented Programming", semester_id: 4, credit_hours: 3 },
  { course_code: "CS204", course_title: "Operating Systems", semester_id: 4, credit_hours: 3 },
  { course_code: "CS205", course_title: "Database Systems", semester_id: 4, credit_hours: 3 },
  { course_code: "SE201", course_title: "Software Engineering 1", semester_id: 4, credit_hours: 3 },
  { course_code: "CS301", course_title: "Algorithms", semester_id: 5, credit_hours: 3 },
  { course_code: "CS302", course_title: "Computer Networks", semester_id: 5, credit_hours: 3 },
  { course_code: "CS303", course_title: "Web Development", semester_id: 5, credit_hours: 3 },
  { course_code: "AI301", course_title: "Introduction to Artificial Intelligence", semester_id: 5, credit_hours: 3 },
  { course_code: "CS304", course_title: "Information Security", semester_id: 6, credit_hours: 3 },
  { course_code: "CS305", course_title: "Mobile Application Development", semester_id: 6, credit_hours: 3 },
  { course_code: "SE302", course_title: "Software Engineering 2", semester_id: 6, credit_hours: 3 },
  { course_code: "DS301", course_title: "Data Mining", semester_id: 6, credit_hours: 3 },
  { course_code: "CS401", course_title: "Machine Learning", semester_id: 7, credit_hours: 3 },
  { course_code: "CS402", course_title: "Cloud Computing", semester_id: 7, credit_hours: 3 },
  { course_code: "SE401", course_title: "Project Management", semester_id: 7, credit_hours: 3 },
  { course_code: "CS498", course_title: "Capstone 1", semester_id: 7, credit_hours: 6 },
  { course_code: "CS403", course_title: "Advanced Databases", semester_id: 8, credit_hours: 3 },
  { course_code: "CS404", course_title: "Distributed Systems", semester_id: 8, credit_hours: 3 },
  { course_code: "CS405", course_title: "Human Computer Interaction", semester_id: 8, credit_hours: 3 },
  { course_code: "CS499", course_title: "Capstone 2 / Graduation Project", semester_id: 8, credit_hours: 6 },
];

export const getSemesterLevel = (semesterId) => {
  const numeric = Number(semesterId);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  if (numeric <= 2) return 1;
  if (numeric <= 4) return 2;
  if (numeric <= 6) return 3;
  return 4;
};

export const getLevelDisplayLabel = (level) => `${level * 100}`;

export const CANONICAL_COURSE_CATALOG = catalogEntries.map((entry, index) => {
  const courseId = index + 1;
  const level = getSemesterLevel(entry.semester_id);

  return {
    course_id: courseId,
    course_offering_id: courseId,
    course_code: entry.course_code,
    course_title: entry.course_title,
    semester_id: entry.semester_id,
    level,
    status: "open",
    credit_hours: entry.credit_hours,
    prerequisites: [...(COURSE_PREREQUISITES[entry.course_code] || [])],
  };
});

export const CANONICAL_COURSE_BY_CODE = new Map(
  CANONICAL_COURSE_CATALOG.map((course) => [course.course_code, course]),
);
