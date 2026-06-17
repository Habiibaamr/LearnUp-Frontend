import {
  CANONICAL_COURSE_BY_CODE,
  CANONICAL_COURSE_CATALOG,
  COURSE_PREREQUISITES,
} from "../data/courseCatalog.js";
import {
  loadLocalEnrolledCourseCodes,
  mergeEnrolledCourseCodes,
} from "./courseEnrollment.js";
import { apiClient } from "./apiClient.js";

const getArrayPayload = (data, keys) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

const cleanCode = (value) => value?.toString().trim().toUpperCase() || "";

const isDummyCourse = (course) => {
  const code = cleanCode(course?.course_code || course?.code);
  const title = String(course?.course_title || course?.title || "");

  return (
    /^UXD-/i.test(code) ||
    /^CSE\d{4}$/i.test(code) ||
    /^Introduction to Topic\s+\d+$/i.test(title)
  );
};

const parseSemesterId = (course, canonical) => {
  const candidates = [
    course?.semester_id,
    course?.semester,
    course?.semester_number,
    course?.semesterNumber,
    course?.semester?.semester_id,
    course?.semester?.id,
    canonical?.semester_id,
  ];

  for (const value of candidates) {
    const numeric = Number(value);

    if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 8) {
      return numeric;
    }

    const match = String(value ?? "").match(/\d+/);

    if (match) {
      const parsed = Number(match[0]);

      if (parsed >= 1 && parsed <= 8) {
        return parsed;
      }
    }
  }

  return canonical?.semester_id || 1;
};

export const normalizeOfferingCourse = (course, index = 0) => {
  const courseCode = cleanCode(
    course?.course_code || course?.code || course?.course?.course_code || course?.course?.code,
  );
  const canonical = CANONICAL_COURSE_BY_CODE.get(courseCode);
  const semesterId = parseSemesterId(course, canonical);

  return {
    course_offering_id:
      course?.course_offering_id ??
      course?.offering_id ??
      course?.id ??
      canonical?.course_offering_id ??
      index + 1,
    course_code: courseCode || canonical?.course_code || "",
    course_title:
      course?.course_title ||
      course?.title ||
      course?.name ||
      course?.course?.course_title ||
      canonical?.course_title ||
      "Course",
    semester_id: semesterId,
    status: String(course?.status || "open").toLowerCase(),
    credit_hours: course?.credit_hours ?? course?.credits ?? canonical?.credit_hours ?? 3,
    prerequisites:
      course?.prerequisites ||
      COURSE_PREREQUISITES[courseCode] ||
      canonical?.prerequisites ||
      [],
  };
};

export const mergeCourseBoardCatalog = (backendCourses = []) => {
  const merged = new Map(
    CANONICAL_COURSE_CATALOG.map((course) => [course.course_code, { ...course }]),
  );

  for (const [index, backendCourse] of backendCourses.entries()) {
    const normalized = normalizeOfferingCourse(backendCourse, index);
    const code = normalized.course_code;

    if (!code || isDummyCourse(normalized)) {
      continue;
    }

    const existing = merged.get(code);

    merged.set(code, {
      ...(existing || CANONICAL_COURSE_BY_CODE.get(code) || {}),
      ...normalized,
      prerequisites:
        normalized.prerequisites?.length > 0
          ? normalized.prerequisites
          : existing?.prerequisites || COURSE_PREREQUISITES[code] || [],
    });
  }

  return [...merged.values()].filter((course) => course.course_code);
};

const extractEnrolledCourseCodes = (payload) => {
  const registrations = getArrayPayload(payload, [
    "enrolled_courses",
    "enrollments",
    "registrations",
    "items",
    "data",
  ]);

  return registrations
    .filter((entry) => {
      const status = String(entry?.status || entry?.registration_status || "").toLowerCase();
      return !status || ["enrolled", "registered", "active"].includes(status);
    })
    .map((entry) => cleanCode(entry?.course_code || entry?.code || entry?.course?.course_code))
    .filter(Boolean);
};

export async function fetchCourseBoardData(student = null) {
  let backendOfferings = [];

  try {
    const offeringsResponse = await apiClient.get("/admin/course-offerings");
    backendOfferings = getArrayPayload(offeringsResponse, [
      "course_offerings",
      "offerings",
      "courses",
      "items",
      "data",
    ]);
  } catch (error) {
    console.log("course offerings fetch failed", error?.status || error?.message);
  }

  const courses = mergeCourseBoardCatalog(backendOfferings);

  let backendEnrolledCourseCodes = [];

  try {
    const enrolledResponse = await apiClient.get("/student/me/courses");
    backendEnrolledCourseCodes = extractEnrolledCourseCodes(enrolledResponse);
  } catch {
    // Backend enrollment list unavailable; local fallback may still apply.
  }

  const enrolledCourseCodes = mergeEnrolledCourseCodes(
    backendEnrolledCourseCodes,
    loadLocalEnrolledCourseCodes(student),
  );

  return {
    courses,
    enrolledCourseCodes,
  };
}
