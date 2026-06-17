import {
  CANONICAL_COURSE_BY_CODE,
  CANONICAL_COURSE_CATALOG,
  COURSE_PREREQUISITES,
  getSemesterLevel,
} from "../data/courseCatalog.js";
import { filterRealisticStudentCourses } from "../utils/courseVisibility.js";
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

const parseSemesterId = (...values) => {
  for (const value of values) {
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

  return null;
};

const isDummyOffering = (course) => {
  const code = cleanCode(course?.course_code || course?.code);
  const title = String(course?.course_title || course?.title || "");

  return (
    /^UXD-/i.test(code) ||
    /^CSE\d{4}$/i.test(code) ||
    /^Introduction to Topic\s+\d+$/i.test(title)
  );
};

const normalizePrerequisites = (course, courseCode) => {
  const raw = course?.prerequisites ?? course?.prerequisite_codes ?? course?.prerequisiteCourses;

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") {
          return cleanCode(item);
        }

        return cleanCode(item?.course_code || item?.code || item?.prerequisite_code);
      })
      .filter(Boolean);
  }

  return [...(COURSE_PREREQUISITES[courseCode] || CANONICAL_COURSE_BY_CODE.get(courseCode)?.prerequisites || [])];
};

export const normalizeCatalogCourse = (course, index = 0) => {
  const courseCode = cleanCode(
    course?.course_code || course?.code || course?.course?.course_code || course?.course?.code,
  );
  const canonical = CANONICAL_COURSE_BY_CODE.get(courseCode);
  const semesterId =
    parseSemesterId(
      course?.semester_id,
      course?.semester,
      course?.semester_number,
      course?.semesterNumber,
      course?.semester?.semester_id,
      course?.semester?.id,
      canonical?.semester_id,
    ) ?? canonical?.semester_id ?? 1;
  const level = Number.isFinite(Number(course?.level))
    ? Number(course.level)
    : getSemesterLevel(semesterId) || canonical?.level || 1;

  return {
    course_offering_id:
      course?.course_offering_id ??
      course?.offering_id ??
      course?.id ??
      canonical?.course_offering_id ??
      index + 1,
    course_id: course?.course_id ?? course?.id ?? canonical?.course_id ?? index + 1,
    course_code: courseCode || canonical?.course_code || `COURSE-${index + 1}`,
    course_title:
      course?.course_title ||
      course?.title ||
      course?.name ||
      course?.course?.course_title ||
      canonical?.course_title ||
      "Course",
    semester_id: semesterId,
    level,
    status: String(course?.status || course?.registration_status || "open").toLowerCase(),
    credit_hours:
      course?.credit_hours ??
      course?.credits ??
      course?.course?.credit_hours ??
      canonical?.credit_hours ??
      3,
    prerequisites: normalizePrerequisites(course, courseCode),
  };
};

const mergeCatalogCourses = (backendCourses) => {
  const merged = new Map();

  for (const canonicalCourse of CANONICAL_COURSE_CATALOG) {
    merged.set(canonicalCourse.course_code, { ...canonicalCourse });
  }

  for (const [index, backendCourse] of backendCourses.entries()) {
    const normalized = normalizeCatalogCourse(backendCourse, index);
    const code = normalized.course_code;

    if (!code || isDummyOffering(normalized)) {
      continue;
    }

    const existing = merged.get(code);

    merged.set(code, {
      ...(existing || CANONICAL_COURSE_BY_CODE.get(code) || {}),
      ...normalized,
      prerequisites: normalized.prerequisites.length
        ? normalized.prerequisites
        : existing?.prerequisites || CANONICAL_COURSE_BY_CODE.get(code)?.prerequisites || [],
    });
  }

  return [...merged.values()].sort((first, second) => {
    if (first.semester_id !== second.semester_id) {
      return first.semester_id - second.semester_id;
    }

    return first.course_code.localeCompare(second.course_code);
  });
};

const extractEnrollmentCourses = (payload) => {
  const registrations = getArrayPayload(payload, [
    "enrolled_courses",
    "enrollments",
    "registrations",
    "courses",
    "items",
    "data",
    "course_board",
  ]);

  return registrations
    .map((entry, index) => normalizeCatalogCourse(entry, index))
    .filter((course) => course.course_code);
};

const extractPassedCourseCodes = (payload) => {
  const passed = getArrayPayload(payload, ["passed_courses", "completed_courses", "passed", "history"]);

  return passed
    .map((entry) => cleanCode(typeof entry === "string" ? entry : entry?.course_code || entry?.code))
    .filter(Boolean);
};

export async function fetchStudentCourseCatalog() {
  let backendOfferings = [];
  let enrolledCourses = [];
  let passedCourseCodes = [];

  try {
    const courseBoard = await apiClient.get("/student/me/course-board");
    backendOfferings = getArrayPayload(courseBoard, [
      "courses",
      "course_offerings",
      "offerings",
      "items",
      "data",
      "course_board",
    ]);
    enrolledCourses = extractEnrollmentCourses(courseBoard);
    passedCourseCodes = extractPassedCourseCodes(courseBoard);
  } catch {
    // Fall back to admin offerings when the student board endpoint is unavailable.
  }

  if (backendOfferings.length === 0) {
    try {
      const offeringsResponse = await apiClient.get("/admin/course-offerings");
      backendOfferings = getArrayPayload(offeringsResponse, [
        "course_offerings",
        "offerings",
        "courses",
        "items",
        "data",
      ]);
    } catch {
      backendOfferings = [];
    }
  }

  const realisticOfferings = filterRealisticStudentCourses(backendOfferings);
  const sourceOfferings = realisticOfferings.length > 0 ? realisticOfferings : backendOfferings;

  return {
    courses: mergeCatalogCourses(sourceOfferings),
    enrolledCourses,
    passedCourseCodes,
  };
}
