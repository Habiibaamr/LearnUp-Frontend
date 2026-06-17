import {
  CANONICAL_COURSE_BY_CODE,
  CANONICAL_COURSE_CATALOG,
  getLevelDisplayLabel,
  getSemesterLevel,
} from "../data/courseCatalog.js";
import { getStudentNumericLevel } from "./studentLevel.js";

export { getStudentNumericLevel };

const KNOWN_STATUSES = new Set(["passed", "enrolled", "available", "locked"]);

const cleanCode = (value) => value?.toString().trim().toUpperCase() || "";

export const getCourseLevel = (course) => {
  const explicitLevel = Number(course?.level);

  if (Number.isFinite(explicitLevel) && explicitLevel >= 1 && explicitLevel <= 4) {
    return explicitLevel;
  }

  return getSemesterLevel(course?.semester_id ?? course?.semester) || 1;
};

export const formatCreditHours = (creditHours) => {
  const numeric = Number(creditHours);

  if (Number.isFinite(numeric)) {
    return `${numeric} Credit${numeric === 1 ? "" : "s"}`;
  }

  const text = String(creditHours || "").trim();

  return text || "3 Credits";
};

export const buildPassedCourseCodes = ({
  studentLevel,
  courses = CANONICAL_COURSE_CATALOG,
  explicitPassedCodes = [],
}) => {
  const passedCodes = new Set(explicitPassedCodes.map(cleanCode).filter(Boolean));

  for (const course of courses) {
    if (getCourseLevel(course) < studentLevel) {
      passedCodes.add(cleanCode(course.course_code));
    }
  }

  return passedCodes;
};

export const buildEnrolledCourseCodes = (enrolledCourses = []) =>
  new Set(
    enrolledCourses
      .map((course) => cleanCode(course?.course_code || course?.code))
      .filter(Boolean),
  );

export const getUnmetPrerequisites = (course, passedCodes) =>
  (course?.prerequisites || [])
    .map(cleanCode)
    .filter((code) => code && !passedCodes.has(code));

export const getLockReason = (course, studentLevel, passedCodes) => {
  const courseLevel = getCourseLevel(course);

  if (courseLevel > studentLevel) {
    return `Locked: available in Level ${getLevelDisplayLabel(courseLevel)}`;
  }

  const unmet = getUnmetPrerequisites(course, passedCodes);

  if (unmet.length > 0) {
    return `Locked: prerequisite not completed: ${unmet.join(", ")}`;
  }

  return "Locked";
};

export const calculateCourseStatus = ({
  course,
  studentLevel,
  passedCodes,
  enrolledCodes,
}) => {
  const courseCode = cleanCode(course?.course_code || course?.code);
  const rawStatus = String(course?.status || "").toLowerCase();

  if (enrolledCodes.has(courseCode) || rawStatus === "enrolled") {
    return "enrolled";
  }

  if (rawStatus === "passed") {
    return "passed";
  }

  const courseLevel = getCourseLevel(course);

  if (courseLevel < studentLevel) {
    return "passed";
  }

  if (courseLevel > studentLevel) {
    return "locked";
  }

  const unmet = getUnmetPrerequisites(course, passedCodes);

  return unmet.length === 0 ? "available" : "locked";
};

export const decorateCourseWithStatus = ({
  course,
  studentLevel,
  passedCodes,
  enrolledCodes,
}) => {
  const status = calculateCourseStatus({
    course,
    studentLevel,
    passedCodes,
    enrolledCodes,
  });
  const courseLevel = getCourseLevel(course);
  const lockReason = status === "locked" ? getLockReason(course, studentLevel, passedCodes) : "";
  const prerequisites = Array.isArray(course.prerequisites)
    ? course.prerequisites.map(cleanCode)
    : [];

  return {
    ...course,
    course_code: cleanCode(course.course_code || course.code),
    course_title: course.course_title || course.title || course.name || "Course",
    level: courseLevel,
    levelLabel: `LEVEL ${courseLevel}`,
    levelDisplay: getLevelDisplayLabel(courseLevel),
    prerequisites,
    status,
    type: status,
    lockReason,
    creditLabel: formatCreditHours(course.credit_hours ?? course.credits),
    meta: `${formatCreditHours(course.credit_hours ?? course.credits)}${
      lockReason ? ` • ${lockReason}` : ""
    }`,
  };
};

export const buildStudentCourseBoard = ({
  courses,
  studentLevel,
  passedCourseCodes = [],
  enrolledCourses = [],
}) => {
  const passedCodes = buildPassedCourseCodes({
    studentLevel,
    courses,
    explicitPassedCodes: passedCourseCodes,
  });
  const enrolledCodes = buildEnrolledCourseCodes(enrolledCourses);

  return courses
    .map((course) =>
      decorateCourseWithStatus({
        course,
        studentLevel,
        passedCodes,
        enrolledCodes,
      }),
    )
    .sort((first, second) => {
      if (first.semester_id !== second.semester_id) {
        return first.semester_id - second.semester_id;
      }

      return first.course_code.localeCompare(second.course_code);
    });
};

export const buildAcademicMapLevels = (courses, studentLevel) => {
  const grouped = new Map([
    ["100", []],
    ["200", []],
    ["300", []],
    ["400", []],
  ]);

  for (const course of courses) {
    const columnKey = getLevelDisplayLabel(getCourseLevel(course));
    grouped.get(columnKey)?.push(course);
  }

  return [...grouped.entries()].map(([level, columnCourses]) => {
    const columnLevel = Number(level) / 100;
    let tone = "locked";

    if (columnLevel < studentLevel) {
      tone = "passed";
    } else if (columnLevel === studentLevel) {
      tone = columnLevel === 3 ? "current" : "enrolled";
    }

    return {
      level,
      tone,
      courses: columnCourses.map((course) => ({
        status: course.status,
        code: course.course_code,
        title: course.course_title,
        meta: course.meta,
        prerequisites: course.prerequisites,
        lockReason: course.lockReason,
      })),
    };
  });
};

export const getCourseBoardMessage = (course) => {
  if (course.type === "available") {
    if (course.prerequisites?.length) {
      return `You are eligible for this course. Prerequisites completed: ${course.prerequisites.join(", ")}.`;
    }

    return "You are eligible for this course based on your academic level.";
  }

  if (course.type === "enrolled") {
    return "You have successfully enrolled in this course.";
  }

  if (course.type === "passed") {
    return "You have successfully passed this course.";
  }

  return course.lockReason || "You cannot enroll in this course yet.";
};

export { KNOWN_STATUSES };
