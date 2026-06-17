const MAX_VISIBLE_SEMESTER_NUMBER = 12;

const clean = (value) => {
  if (value === undefined || value === null || typeof value === "object") {
    return "";
  }

  return value.toString().trim();
};

const parseSemesterNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    const text = clean(value);

    if (!text) {
      continue;
    }

    const numeric = Number(text);

    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const semanticMatch = text.match(/\bsem(?:ester)?\.?\s*#?\s*(\d{1,3})\b/i);

    if (semanticMatch) {
      return Number(semanticMatch[1]);
    }
  }

  return null;
};

function getCourseSemesterNumber(course) {
  return parseSemesterNumber(
    course?.semester_number,
    course?.semesterNumber,
    course?.semester_no,
    course?.semester_name,
    course?.semesterName,
    course?.semester_title,
    course?.semesterTitle,
    course?.semester,
    course?.term,
    course?.academic_term,
    course?.academicTerm,
  );
}

function getDummyTopicNumber(course) {
  const text = [
    course?.title,
    course?.course,
    course?.course_title,
    course?.name,
    course?.label,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");
  const match = text.match(/\bIntroduction to Topic\s+(\d{1,3})\b/i);

  return match ? Number(match[1]) : null;
}

export function isRealisticStudentCourse(course) {
  const semesterNumber = getCourseSemesterNumber(course);

  if (
    semesterNumber !== null &&
    (!Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > MAX_VISIBLE_SEMESTER_NUMBER)
  ) {
    return false;
  }

  const topicNumber = getDummyTopicNumber(course);

  if (topicNumber !== null && topicNumber > MAX_VISIBLE_SEMESTER_NUMBER) {
    // TODO: Remove this frontend guard after backend seed data no longer includes dummy Topic 80/100 courses.
    return false;
  }

  return true;
}

export function filterRealisticStudentCourses(courses) {
  return courses.filter(isRealisticStudentCourse);
}
