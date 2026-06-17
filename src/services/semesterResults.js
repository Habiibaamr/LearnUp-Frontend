import { CANONICAL_COURSE_BY_CODE } from "../data/courseCatalog.js";
import { mergeCourseBoardCatalog, normalizeOfferingCourse } from "./courseBoard.js";
import {
  buildTranscriptFromCatalog,
  getCurrentAcademicYear,
  normalizeSemesterResultRow,
} from "../utils/semesterResultLogic.js";
import { getStudentNumericLevel } from "../utils/studentLevel.js";
import { apiClient } from "./apiClient.js";
import {
  loadLocalEnrolledCourseCodes,
  mergeEnrolledCourseCodes,
} from "./courseEnrollment.js";

const RESULT_ENDPOINTS = [
  "/student/semester-results",
  "/student/me/semester-results",
  "/student/grades",
  "/student/result",
  "/student/transcript",
];

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

const extractResultRows = (payload) =>
  getArrayPayload(payload, [
    "results",
    "semester_results",
    "grades",
    "transcript",
    "items",
    "data",
    "courses",
  ]);

const extractEnrollmentRecords = (payload) =>
  getArrayPayload(payload, [
    "enrolled_courses",
    "enrollments",
    "registrations",
    "courses",
    "items",
    "data",
  ]);

async function fetchBackendSemesterResults() {
  for (const path of RESULT_ENDPOINTS) {
    try {
      const response = await apiClient.get(path);
      const rows = extractResultRows(response);

      if (rows.length > 0) {
        return rows.map((row, index) => normalizeSemesterResultRow(row, index));
      }
    } catch (error) {
      if (error?.status === 401) {
        throw error;
      }
    }
  }

  return [];
}

const getEnrolledCourseCodes = async (student) => {
  let enrollmentRecords = [];

  try {
    const coursesResponse = await apiClient.get("/student/me/courses");
    enrollmentRecords = extractEnrollmentRecords(coursesResponse);
  } catch {
    enrollmentRecords = [];
  }

  return mergeEnrolledCourseCodes(
    enrollmentRecords.map((entry) => cleanCode(entry?.course_code || entry?.code)),
    loadLocalEnrolledCourseCodes(student),
  );
};

const mapBackendResultsByCode = (backendRows) => {
  const byCode = new Map();

  for (const row of backendRows) {
    byCode.set(row.course_code, row);
  }

  return byCode;
};

const hasCompleteBackendTranscript = (backendRows, studentLevel) => {
  if (!backendRows.length) {
    return false;
  }

  return backendRows.every((row) => row.academic_year && row.term && row.semester_id);
};

export async function fetchStudentSemesterResults(student = null) {
  const studentLevel =
    getStudentNumericLevel(student) ??
    getStudentNumericLevel({ level: student?.student_level }) ??
    1;
  const currentAcademicYear = getCurrentAcademicYear();
  const catalog = mergeCourseBoardCatalog([]);
  const enrolledCourseCodes = await getEnrolledCourseCodes(student);

  let backendRows = [];

  try {
    backendRows = await fetchBackendSemesterResults();
  } catch (error) {
    if (error?.status === 401) {
      throw error;
    }
  }

  if (hasCompleteBackendTranscript(backendRows, studentLevel)) {
    return backendRows;
  }

  const backendResultsByCode = mapBackendResultsByCode(backendRows);

  return buildTranscriptFromCatalog({
    catalog,
    studentLevel,
    enrolledCourseCodes,
    currentAcademicYear,
    backendResultsByCode,
  });
}

export { getCurrentAcademicYear };
