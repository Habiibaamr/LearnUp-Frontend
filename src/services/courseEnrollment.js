import { apiClient } from "./apiClient.js";

const cleanCode = (value) => value?.toString().trim().toUpperCase() || "";

export const getEnrollmentStorageKey = (student) => {
  const identity =
    student?.email ||
    student?.university_id ||
    student?.universityId ||
    student?.id ||
    student?.studentId ||
    "anonymous";

  return `learnup_enrolled_courses_${identity}`;
};

export const loadLocalEnrolledCourseCodes = (student) => {
  if (!student) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getEnrollmentStorageKey(student));

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.map(cleanCode).filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const saveLocalEnrolledCourseCodes = (student, courseCodes) => {
  if (!student) {
    return;
  }

  try {
    const normalized = [...new Set(courseCodes.map(cleanCode).filter(Boolean))];
    window.localStorage.setItem(getEnrollmentStorageKey(student), JSON.stringify(normalized));
  } catch {
    // Ignore storage write issues.
  }
};

export const mergeEnrolledCourseCodes = (...lists) =>
  [...new Set(lists.flat().map(cleanCode).filter(Boolean))];

const getEnrollmentPathCandidates = (course) => {
  const offeringId = course?.course_offering_id ?? course?.offering_id;
  const courseId = course?.course_id ?? course?.id;

  return [
    offeringId ? `/student/me/add-course/${offeringId}` : null,
    courseId ? `/student/me/add-course-by-course/${courseId}` : null,
  ].filter(Boolean);
};

export async function enrollInCourse(course) {
  const paths = getEnrollmentPathCandidates(course);

  for (const path of paths) {
    try {
      await apiClient.post(path);
      return { enrolled: true, source: "backend", path };
    } catch (error) {
      if (error?.status === 404 || error?.status === 405) {
        continue;
      }

      throw error;
    }
  }

  return { enrolled: false, source: "local" };
}
