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

export const DEFAULT_ACADEMIC_YEAR = "2025/2026";
export const DEFAULT_TERMS = ["Fall", "Spring", "Summer"];

const DEMO_GRADES_BY_CODE = {
  CS101: "A",
  CS102: "B+",
  MA101: "B",
  HUM101: "A-",
  CS103: "A-",
  MA105: "B+",
  ENG101: "A",
  PHY101: "B",
};

const cleanText = (value) => value?.toString().trim() || "";

const cleanCode = (value) => cleanText(value).toUpperCase();

export const normalizeTerm = (value) => {
  const text = cleanText(value).toLowerCase();

  if (text.includes("spring")) return "Spring";
  if (text.includes("summer")) return "Summer";
  if (text.includes("fall") || text.includes("autumn")) return "Fall";
  if (text) return cleanText(value);

  return "Fall";
};

export const getCourseLevelFromSemester = (semesterId) => {
  const semester = Number(semesterId);

  if (!Number.isFinite(semester)) {
    return 1;
  }

  if (semester <= 2) return 1;
  if (semester <= 4) return 2;
  if (semester <= 6) return 3;
  return 4;
};

export const getTermFromSemester = (semesterId) => {
  const semester = Number(semesterId);

  if ([1, 3, 5, 7].includes(semester)) return "Fall";
  if ([2, 4, 6, 8].includes(semester)) return "Spring";

  return "Summer";
};

export const getSemesterIdForYearTerm = (academicYear, term, studentLevel, currentAcademicYear) => {
  const yearsBack = getAcademicYearOffset(currentAcademicYear, academicYear);
  const levelForYear = studentLevel - yearsBack;
  const normalizedTerm = normalizeTerm(term);

  if (levelForYear < 1 || levelForYear > studentLevel) {
    return null;
  }

  if (normalizedTerm === "Fall") {
    return (levelForYear - 1) * 2 + 1;
  }

  if (normalizedTerm === "Spring") {
    return (levelForYear - 1) * 2 + 2;
  }

  return null;
};

export const parseAcademicYearStart = (academicYear) => {
  const match = cleanText(academicYear).match(/^(\d{4})/);

  return match ? Number(match[1]) : Number(getCurrentAcademicYear().slice(0, 4));
};

export const shiftAcademicYearBack = (academicYear, yearsBack) => {
  const startYear = parseAcademicYearStart(academicYear) - yearsBack;

  return `${startYear}/${startYear + 1}`;
};

export const getAcademicYearOffset = (currentAcademicYear, targetAcademicYear) =>
  parseAcademicYearStart(currentAcademicYear) - parseAcademicYearStart(targetAcademicYear);

export const getAcademicYearForCourse = (courseLevel, studentLevel, currentAcademicYear) => {
  const yearsBack = studentLevel - courseLevel;

  return shiftAcademicYearBack(currentAcademicYear, yearsBack);
};

export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (month >= 9) {
    return `${year}/${year + 1}`;
  }

  if (month >= 2) {
    return `${year - 1}/${year}`;
  }

  return `${year - 1}/${year}`;
};

export const getCurrentTerm = () => {
  const month = new Date().getMonth() + 1;

  if (month >= 9 || month === 1) {
    return "Fall";
  }

  if (month >= 2 && month <= 5) {
    return "Spring";
  }

  return "Summer";
};

export const getStudentAcademicYears = (studentLevel, currentAcademicYear = getCurrentAcademicYear()) => {
  const level = Math.max(1, Math.min(4, Number(studentLevel) || 1));

  return Array.from({ length: level }, (_, index) => shiftAcademicYearBack(currentAcademicYear, index));
};

export const normalizeResultStatus = (status, grade) => {
  const statusText = cleanText(status).toLowerCase();
  const gradeText = cleanText(grade).toUpperCase();

  if (statusText === "not started" || statusText === "not_started") {
    return "not started";
  }

  if (statusText === "in progress" || statusText === "in_progress" || statusText === "enrolled") {
    return "in progress";
  }

  if (statusText === "failed" || gradeText === "F") {
    return "failed";
  }

  if (statusText === "passed" || statusText === "completed") {
    return "passed";
  }

  if (gradeText && gradeText !== "-" && gradeText !== "F") {
    return "passed";
  }

  if (!gradeText || gradeText === "-") {
    return "not started";
  }

  return "not started";
};

export const formatStatusLabel = (status) => {
  if (status === "passed") return "Passed";
  if (status === "failed") return "Failed";
  if (status === "in progress") return "In Progress";
  if (status === "not started") return "Not Started";

  return cleanText(status) || "Not Started";
};

export const hasGradedResult = (row) => {
  const grade = cleanText(row.grade).toUpperCase();

  return grade && grade !== "-";
};

export const isPassedResult = (row) => normalizeResultStatus(row.status, row.grade) === "passed";

export const isFailedResult = (row) => normalizeResultStatus(row.status, row.grade) === "failed";

export const getCourseIconKey = (courseCode) => {
  const code = cleanCode(courseCode);

  if (code.startsWith("CS4") || code.startsWith("AI") || code.startsWith("ML")) return "trophy";
  if (code.startsWith("MA") || code.startsWith("STAT")) return "sigma";
  if (code.startsWith("CS") || code.startsWith("SE")) return "monitor";

  return "book";
};

export const calculateSemesterGpa = (rows) => {
  const gradedRows = rows.filter(hasGradedResult);

  if (!gradedRows.length) {
    return "0.00";
  }

  const totalCredits = gradedRows.reduce(
    (total, row) => total + Number(row.credit_hours || row.credits || 0),
    0,
  );

  if (!totalCredits) {
    return "0.00";
  }

  const totalPoints = gradedRows.reduce((total, row) => {
    const credits = Number(row.credit_hours || row.credits || 0);
    const grade = cleanText(row.grade).toUpperCase();

    return total + (GRADE_POINTS[grade] ?? 0) * credits;
  }, 0);

  return (totalPoints / totalCredits).toFixed(2);
};

export const getAvailableAcademicYears = (rows, studentLevel, currentAcademicYear = getCurrentAcademicYear()) => {
  const fromStudent = getStudentAcademicYears(studentLevel, currentAcademicYear);
  const fromRows = [...new Set(rows.map((row) => row.academic_year).filter(Boolean))];

  if (fromRows.length > 0) {
    return [...new Set([...fromStudent, ...fromRows])].sort((first, second) =>
      parseAcademicYearStart(second) - parseAcademicYearStart(first),
    );
  }

  return fromStudent;
};

export const getAvailableTerms = (rows, academicYear) => {
  const termsInYear = [
    ...new Set(
      rows
        .filter((row) => row.academic_year === academicYear)
        .map((row) => normalizeTerm(row.term))
        .filter(Boolean),
    ),
  ];

  const baseTerms = ["Fall", "Spring"];

  if (termsInYear.includes("Summer")) {
    baseTerms.push("Summer");
  }

  return baseTerms;
};

export const filterResultsByPeriod = (rows, academicYear, term, studentLevel, currentAcademicYear) => {
  const semesterId = getSemesterIdForYearTerm(academicYear, term, studentLevel, currentAcademicYear);
  const normalizedTerm = normalizeTerm(term);

  return rows.filter((row) => {
    if (semesterId !== null && row.semester_id) {
      return row.semester_id === semesterId;
    }

    return row.academic_year === academicYear && normalizeTerm(row.term) === normalizedTerm;
  });
};

export const resolveTranscriptStatus = ({
  courseLevel,
  studentLevel,
  enrolledCourseCodes,
  courseCode,
  backendEntry,
}) => {
  if (backendEntry && hasGradedResult(backendEntry)) {
    return normalizeResultStatus(backendEntry.status, backendEntry.grade);
  }

  if (backendEntry?.status) {
    return normalizeResultStatus(backendEntry.status, backendEntry.grade);
  }

  if (courseLevel < studentLevel) {
    return "passed";
  }

  if (courseLevel === studentLevel) {
    return "in progress";
  }

  if (enrolledCourseCodes.includes(cleanCode(courseCode))) {
    return "in progress";
  }

  return "not started";
};

export const buildTranscriptFromCatalog = ({
  catalog,
  studentLevel,
  enrolledCourseCodes = [],
  currentAcademicYear = getCurrentAcademicYear(),
  backendResultsByCode = new Map(),
}) => {
  const enrolledCodes = enrolledCourseCodes.map(cleanCode);
  const rows = [];

  for (const [index, course] of catalog.entries()) {
    const semesterId = Number(course.semester_id);
    const courseLevel = getCourseLevelFromSemester(semesterId);

    if (courseLevel > studentLevel) {
      continue;
    }

    const academicYear = getAcademicYearForCourse(courseLevel, studentLevel, currentAcademicYear);
    const term = getTermFromSemester(semesterId);
    const courseCode = cleanCode(course.course_code);
    const backendEntry = backendResultsByCode.get(courseCode);
    const status = resolveTranscriptStatus({
      courseLevel,
      studentLevel,
      enrolledCourseCodes: enrolledCodes,
      courseCode,
      backendEntry,
    });
    const demoGrade = !backendEntry && courseLevel < studentLevel
      ? DEMO_GRADES_BY_CODE[courseCode]
      : undefined;
    const grade = backendEntry && hasGradedResult(backendEntry)
      ? cleanText(backendEntry.grade).toUpperCase()
      : demoGrade
        ? cleanText(demoGrade).toUpperCase()
        : "-";

    rows.push(
      normalizeSemesterResultRow(
        {
          academic_year: backendEntry?.academic_year || backendEntry?.academicYear || academicYear,
          term: backendEntry?.term || term,
          semester_id: semesterId,
          course_code: courseCode,
          course_title: course.course_title,
          credit_hours: course.credit_hours,
          grade,
          status,
        },
        index,
      ),
    );
  }

  return rows.sort((first, second) => {
    if (first.semester_id !== second.semester_id) {
      return first.semester_id - second.semester_id;
    }

    return first.course_code.localeCompare(second.course_code);
  });
};

export const normalizeSemesterResultRow = (entry, index = 0) => {
  const grade = cleanText(entry.grade || entry.final_grade || entry.letter_grade) || "-";
  const status = normalizeResultStatus(entry.status, grade);
  const semesterId = Number(entry.semester_id ?? entry.semester ?? 0) || null;

  return {
    id: `${cleanCode(entry.course_code || entry.code)}-${semesterId || index}`,
    academic_year:
      cleanText(entry.academic_year || entry.academicYear) || getCurrentAcademicYear(),
    term: normalizeTerm(entry.term || entry.semester_term || (semesterId ? getTermFromSemester(semesterId) : "Fall")),
    semester_id: semesterId,
    course_code: cleanCode(entry.course_code || entry.code || entry.course?.course_code),
    course_title:
      cleanText(entry.course_title || entry.course || entry.title || entry.course?.course_title) ||
      "Course",
    credit_hours: Number(entry.credit_hours ?? entry.credits ?? entry.credit ?? 3) || 3,
    credits: Number(entry.credit_hours ?? entry.credits ?? entry.credit ?? 3) || 3,
    grade: hasGradedResult({ grade }) ? cleanText(grade).toUpperCase() : "-",
    status,
    statusLabel: formatStatusLabel(status),
    icon: getCourseIconKey(entry.course_code || entry.code),
  };
};
