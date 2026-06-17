import { COURSE_PREREQUISITES, CANONICAL_COURSE_CATALOG } from "../data/courseCatalog.js";

export { COURSE_PREREQUISITES as PREREQUISITES };

export const getPrerequisites = (courseCode) =>
  [...(COURSE_PREREQUISITES[courseCode] || [])];

export const normalizeCourse = (course) => {
  const courseCode = course.course_code?.toString().trim().toUpperCase() || "";

  return {
    ...course,
    course_code: courseCode,
    prerequisites:
      course.prerequisites?.length > 0
        ? course.prerequisites
        : getPrerequisites(courseCode),
  };
};

export const getCourseLevel = (course) => {
  const semester = Number(course?.semester_id || course?.semester || 1);

  if (semester <= 2) return 1;
  if (semester <= 4) return 2;
  if (semester <= 6) return 3;
  return 4;
};

export const isPrerequisitePassed = (prereqCode, studentLevel, allCourses) => {
  const prereqCourse = allCourses.find((course) => course.course_code === prereqCode);

  if (!prereqCourse) {
    return true;
  }

  return getCourseLevel(prereqCourse) < studentLevel;
};

export const calculateCourseStatus = (course, studentLevel, enrolledCourseCodes = [], allCourses = []) => {
  const courseCode = course.course_code;
  const courseLevel = getCourseLevel(course);

  if (enrolledCourseCodes.includes(courseCode)) {
    return "enrolled";
  }

  if (courseLevel < studentLevel) {
    return "passed";
  }

  if (courseLevel > studentLevel) {
    return "locked";
  }

  const prerequisites = course.prerequisites || [];
  const allPrereqsPassed = prerequisites.every((code) =>
    isPrerequisitePassed(code, studentLevel, allCourses),
  );

  if (!allPrereqsPassed) {
    return "locked";
  }

  return "available";
};

export const getCourseBoardMessage = (course) => {
  if (course.calculatedStatus === "available") {
    if (course.prerequisites?.length) {
      return `You are eligible for this course. Prerequisites completed: ${course.prerequisites.join(", ")}.`;
    }

    return "You are eligible for this course based on your academic level.";
  }

  if (course.calculatedStatus === "enrolled") {
    return "You have successfully enrolled in this course.";
  }

  if (course.calculatedStatus === "passed") {
    return "You have successfully passed this course.";
  }

  if (course.lockReason) {
    return course.lockReason;
  }

  const courseLevel = getCourseLevel(course);

  if (courseLevel > course.studentLevel) {
    return `Locked: available in Level ${courseLevel * 100}`;
  }

  const unmet = (course.prerequisites || []).filter(
    (code) => !isPrerequisitePassed(code, course.studentLevel, course.allCourses || []),
  );

  if (unmet.length > 0) {
    return `Locked: prerequisite not completed: ${unmet.join(", ")}`;
  }

  return "You cannot enroll in this course yet.";
};

export const formatCreditHours = (creditHours) => {
  const numeric = Number(creditHours);

  if (Number.isFinite(numeric)) {
    return `${numeric} Credit${numeric === 1 ? "" : "s"}`;
  }

  return "3 Credits";
};

export const buildCourseBoardCourses = ({
  courses,
  studentLevel,
  enrolledCourseCodes = [],
}) => {
  const normalizedCourses = courses.map((course) => {
    const normalized = normalizeCourse(course);

    return {
      ...normalized,
      course_code: normalized.course_code?.toString().trim().toUpperCase() || "",
    };
  });

  return normalizedCourses
    .map((course) => {
      const calculatedStatus = calculateCourseStatus(
        course,
        studentLevel,
        enrolledCourseCodes,
        normalizedCourses,
      );
      const courseLevel = getCourseLevel(course);
      const lockReason =
        calculatedStatus === "locked"
          ? courseLevel > studentLevel
            ? `Locked: available in Level ${courseLevel * 100}`
            : `Locked: prerequisite not completed: ${(course.prerequisites || [])
                .filter((code) => !isPrerequisitePassed(code, studentLevel, normalizedCourses))
                .join(", ")}`
          : "";

      return {
        ...course,
        studentLevel,
        allCourses: normalizedCourses,
        calculatedStatus,
        type: calculatedStatus,
        level: courseLevel,
        levelLabel: `LEVEL ${courseLevel}`,
        creditLabel: formatCreditHours(course.credit_hours),
        lockReason,
      };
    })
    .sort((first, second) => {
      if (first.semester_id !== second.semester_id) {
        return first.semester_id - second.semester_id;
      }

      return first.course_code.localeCompare(second.course_code);
    });
};

export const getCanonicalCourseCatalog = () => [...CANONICAL_COURSE_CATALOG];

const getLevelColumnKey = (courseLevel) => String(courseLevel * 100);

export const shouldShowPrerequisiteArrow = (courseCode, currentLevelKey, roadmapLevels) => {
  const currentLevel = Number(currentLevelKey) / 100;
  const nextLevelKey = getLevelColumnKey(currentLevel + 1);
  const nextColumn = roadmapLevels.find((column) => column.level === nextLevelKey);

  if (!nextColumn) {
    return false;
  }

  return nextColumn.courses.some((course) => (course.prerequisites || []).includes(courseCode));
};

export const buildAcademicMapLevels = ({
  courses,
  studentLevel,
  enrolledCourseCodes = [],
}) => {
  const boardCourses = buildCourseBoardCourses({
    courses,
    studentLevel,
    enrolledCourseCodes,
  });

  const columns = new Map([
    ["100", []],
    ["200", []],
    ["300", []],
    ["400", []],
  ]);

  for (const course of boardCourses) {
    const columnKey = getLevelColumnKey(course.level);
    columns.get(columnKey)?.push({
      status: course.calculatedStatus,
      code: course.course_code,
      title: course.course_title,
      meta: course.creditLabel,
      prerequisites: course.prerequisites || [],
      lockReason: course.lockReason,
    });
  }

  const roadmapLevels = [...columns.entries()].map(([level, columnCourses]) => {
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
      courses: columnCourses,
    };
  });

  return roadmapLevels.map((column) => ({
    ...column,
    courses: column.courses.map((course) => ({
      ...course,
      showArrow: shouldShowPrerequisiteArrow(course.code, column.level, roadmapLevels),
      meta: course.prerequisites?.length
        ? `${course.meta} • Prerequisites: ${course.prerequisites.join(", ")}`
        : course.meta,
    })),
  }));
};
