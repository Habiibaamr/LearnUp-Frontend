import { apiClient } from "./apiClient.js";
import { enrichInstructorsWithCourseLoads } from "./adminAssignments.js";
import {
  cleanText as clean,
  decorateInstructorDisplay,
  getDepartmentDisplayName,
  getDepartmentIdFromValue,
  getFacultyDisplayName,
  getNestedValue,
  sortInstructorsForDemo,
} from "../utils/instructorDisplay.js";
import { decorateStudentDisplay, sortStudentsForDemo } from "../utils/studentDisplay.js";
import {
  getEffectiveGpa,
  getPassedCreditHours,
} from "../utils/studentAcademic.js";

const optionalString = (value) => {
  const text = clean(value);
  return text || undefined;
};

const parseLevel = (value) => {
  const match = clean(value).match(/\d+/);
  return match ? Number(match[0]) : undefined;
};

const DEMO_ADVISOR_INSTRUCTOR_ID = 1;
const DEMO_PHONE = "01000000000";

export const FACULTY_OPTIONS = [
  { id: 1, label: "Faculty of Artificial Intelligence" },
  { id: 2, label: "Faculty of Computer Science" },
  { id: 3, label: "Faculty of Engineering & Technology" },
  { id: 4, label: "Faculty of Information Systems" },
];

const getFacultyIdFromValue = (value) => {
  const numeric = Number(value);

  if (Number.isInteger(numeric) && numeric > 0) {
    return numeric;
  }

  const normalized = clean(value).toLowerCase();
  return FACULTY_OPTIONS.find((faculty) => faculty.label.toLowerCase() === normalized)?.id;
};

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

const parseLoadValue = (load, index, fallback = 0) => {
  const value = Number(clean(load).split("/")[index]);

  return Number.isFinite(value) ? value : fallback;
};

const getFirstNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const numeric = Number(value);

    if (Number.isInteger(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return undefined;
};

const getFirstFiniteNumber = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return null;
};

const getLoadCurrent = (source, courses, fallback) => {
  const numericLoad = Number(
    source.course_load ??
      source.courseLoad ??
      source.current_load ??
      source.currentLoad ??
      source.course_count ??
      source.courseCount ??
      source.assigned_courses_count ??
      source.assigned_course_count ??
      source.assignedCourseCount ??
      source.current_courses_count ??
      source.currentCourseCount ??
      source.course_count,
  );

  if (Number.isFinite(numericLoad)) {
    return numericLoad;
  }

  const loadFromText = parseLoadValue(source.course_load ?? source.courseLoad ?? source.load, 0, NaN);

  if (Number.isFinite(loadFromText)) {
    return loadFromText;
  }

  if (courses.length > 0) {
    return courses.length;
  }

  return parseLoadValue(fallback.load || fallback.courseLoad, 0, 0);
};

const hasDirectCourseLoadSource = (source) =>
  [
    source.course_load,
    source.courseLoad,
    source.current_load,
    source.currentLoad,
    source.course_count,
    source.courseCount,
    source.assigned_courses_count,
    source.assigned_course_count,
    source.assignedCourseCount,
    source.current_courses_count,
    source.currentCourseCount,
  ].some((value) => value !== undefined && value !== null && value !== "") ||
  [
    source.courses,
    source.assigned_courses,
    source.assignedCourses,
    source.current_courses,
    source.currentCourses,
    source.course_offerings,
    source.courseOfferings,
    source.assigned_course_offerings,
    source.assignedCourseOfferings,
  ].some((value) => Array.isArray(value));

const formatCourseLabel = (course) => {
  if (!course || typeof course !== "object") {
    return clean(course);
  }

  const semester = course.semester || course.semester_info || {};
  const semesterLabel = clean(
    course.semester_label ||
      course.semester_name ||
      course.semester_title ||
      semester.name ||
      semester.title,
  );

  return [
    clean(course.course_code || course.code || course.course?.course_code || course.course?.code),
    clean(course.course_title || course.title || course.name || course.course?.course_title || course.course?.title),
    semesterLabel,
  ]
    .filter(Boolean)
    .join(" - ");
};

export const isMissingEndpointError = (error) => error?.status === 404;

export function toCreateStudentPayload(formValues) {
  const computedGpa = getEffectiveGpa(formValues);

  return {
    full_name: clean(formValues.fullName),
    email: clean(formValues.email),
    password: clean(formValues.initialPassword),
    faculty_id: getFacultyIdFromValue(formValues.faculty_id || formValues.faculty) || 1,
    department_id: getDepartmentIdFromValue(formValues.department),
    level: parseLevel(formValues.level) || 1,
    cgpa: computedGpa === null ? null : Number(computedGpa.toFixed(2)),
    passed_credit_hours: getPassedCreditHours(formValues),
    phone: optionalString(formValues.phone) || DEMO_PHONE,
    advisor_instructor_id: DEMO_ADVISOR_INSTRUCTOR_ID,
  };
}

export function toUpdateStudentPayload(formValues) {
  return {
    full_name: clean(formValues.fullName),
    email: clean(formValues.email),
    faculty_id: getFacultyIdFromValue(formValues.faculty_id || formValues.faculty) || 1,
    department_id: getDepartmentIdFromValue(formValues.department),
    level: parseLevel(formValues.level) || 1,
    phone: optionalString(formValues.phone) || DEMO_PHONE,
    gender: optionalString(formValues.gender),
    national_id: optionalString(formValues.nationalId),
  };
}

export function toCreateInstructorPayload(formValues) {
  return {
    full_name: clean(formValues.fullName),
    email: clean(formValues.email),
    password: clean(formValues.initialPassword),
    faculty_id: getFacultyIdFromValue(formValues.faculty_id || formValues.faculty),
    department_id: getDepartmentIdFromValue(formValues.department),
    specialization: optionalString(formValues.specialization) || "General Computing",
    office_location: optionalString(formValues.location) || "Campus office pending",
    phone: optionalString(formValues.phone) || DEMO_PHONE,
  };
}

export function toUpdateInstructorPayload(formValues) {
  return {
    full_name: clean(formValues.fullName),
    email: clean(formValues.email),
    faculty_id: getFacultyIdFromValue(formValues.faculty_id || formValues.faculty),
    department_id: getDepartmentIdFromValue(formValues.department),
    specialization: optionalString(formValues.specialization) || "General Computing",
    office_location: optionalString(formValues.location) || "Campus office pending",
    phone: optionalString(formValues.phone) || DEMO_PHONE,
    gender: optionalString(formValues.gender),
    national_id: optionalString(formValues.nationalId),
    academic_position: optionalString(formValues.title),
    role: optionalString(formValues.role),
  };
}

export async function createStudentAccount(payload) {
  return apiClient.post("/admin/create-student-account", payload);
}

export async function updateStudentAccount(studentId, formValues) {
  const numericStudentId = getFirstNumber(studentId);

  if (!numericStudentId) {
    throw new Error("Student backend ID must be a valid integer.");
  }

  return apiClient.put(`/admin/students/${numericStudentId}`, toUpdateStudentPayload(formValues));
}

export async function deleteStudentAccount(studentId) {
  const numericStudentId = getFirstNumber(studentId);

  if (!numericStudentId) {
    throw new Error("Student backend ID must be a valid integer.");
  }

  return apiClient.delete(`/admin/students/${numericStudentId}`);
}

export async function createInstructorAccount(formValues) {
  return apiClient.post("/admin/create-instructor-account", toCreateInstructorPayload(formValues));
}

export async function updateInstructorAccount(instructorId, formValues) {
  const numericInstructorId = getFirstNumber(instructorId);

  if (!numericInstructorId) {
    throw new Error("Faculty member backend ID must be a valid integer.");
  }

  return apiClient.put(`/admin/instructors/${numericInstructorId}`, toUpdateInstructorPayload(formValues));
}

export async function deleteInstructorAccount(instructorId) {
  const numericInstructorId = getFirstNumber(instructorId);

  if (!numericInstructorId) {
    throw new Error("Faculty member backend ID must be a valid integer.");
  }

  return apiClient.delete(`/admin/instructors/${numericInstructorId}`);
}

export function mapBackendStudent(record, fallback = {}, index = 0) {
  const source = record?.student || record?.user || record?.account || record || {};
  const user = record?.user || source?.user || {};
  const hasNestedStudent = Boolean(record?.student);
  const level = getNestedValue(source, ["level", "academic_level"]) || fallback.level;
  const department = getDepartmentDisplayName({ ...fallback, ...record }, index);
  const name =
    clean(getNestedValue(source, ["full_name", "name"])) ||
    clean(fallback.fullName || fallback.name) ||
    "Unnamed Student";
  const studentId =
    clean(
      getNestedValue(source, ["university_id", "student_id", "studentId"]) ||
        fallback.studentId ||
        fallback.id ||
        getNestedValue(source, ["id"]),
    ) || "Pending";
  const backendStudentId = getFirstNumber(
    getNestedValue(record?.student, ["student_id"]),
    getNestedValue(record?.student, ["id"]),
    getNestedValue(source, ["student_id"]),
    getNestedValue(record, ["student_id"]),
    hasNestedStudent ? getNestedValue(source, ["id"]) : undefined,
  );
  const backendUserId = getFirstNumber(
    getNestedValue(user, ["user_id", "id"]),
    getNestedValue(source, ["user_id"]),
    getNestedValue(record, ["user_id"]),
    getNestedValue(record, ["id"]),
  );
  const createdAt = getNestedValue(source, ["created_at", "createdAt"]) ||
    getNestedValue(record, ["created_at", "createdAt"]);
  const createdByAdminId = getNestedValue(source, [
    "created_by_admin_id",
    "created_by_admin",
    "admin_id",
    "created_by",
  ]) || getNestedValue(record, [
    "created_by_admin_id",
    "created_by_admin",
    "admin_id",
    "created_by",
  ]);

  return decorateStudentDisplay({
    ...fallback,
    name,
    rawName: name,
    fullName: name,
    email: clean(getNestedValue(source, ["email"]) || getNestedValue(user, ["email"]) || getNestedValue(record, ["email"]) || fallback.email),
    id: studentId,
    studentId,
    student_id: backendStudentId ?? studentId,
    backendStudentId,
    userId: backendUserId,
    user_id: backendUserId,
    universityId: studentId,
    department_id: getFirstNumber(getNestedValue(source, ["department_id"]), getNestedValue(record, ["department_id"])),
    faculty_id: getFirstNumber(getNestedValue(source, ["faculty_id"]), getNestedValue(record, ["faculty_id"])),
    cgpa: getFirstFiniteNumber(
      getNestedValue(source, ["cgpa", "gpa"]),
      getNestedValue(record, ["cgpa", "gpa"]),
    ),
    gpa: getFirstFiniteNumber(
      getNestedValue(source, ["cgpa", "gpa"]),
      getNestedValue(record, ["cgpa", "gpa"]),
      fallback.gpa,
    ),
    passed_credit_hours:
      getNestedValue(source, ["passed_credit_hours", "completed_credit_hours"]) ??
      getNestedValue(record, ["passed_credit_hours", "completed_credit_hours"]) ??
      fallback.passed_credit_hours ??
      null,
    advisor_instructor_id: getFirstNumber(
      getNestedValue(source, ["advisor_instructor_id"]),
      getNestedValue(record, ["advisor_instructor_id"]),
    ),
    advisor_name: clean(
      getNestedValue(source, ["advisor_name"]) ||
      getNestedValue(record, ["advisor_name"]) ||
      fallback.advisor_name ||
      fallback.advisor,
    ),
    isSeed: getNestedValue(source, ["is_seed", "seed", "is_demo", "demo"]) ||
      getNestedValue(record, ["is_seed", "seed", "is_demo", "demo"]),
    createdByAdminId,
    source: clean(getNestedValue(source, ["source", "origin"]) || getNestedValue(record, ["source", "origin"])),
    createdAt,
    phone: clean(getNestedValue(source, ["phone"]) || fallback.phone),
    level: Number.isFinite(Number(level)) ? `Level ${Number(level)}` : level || "Level 1",
    department,
    backendRecord: record,
    sortIndex: index,
  }, index);
}

export function mapBackendInstructor(record, fallback = {}, index = 0) {
  const source = record?.instructor || record?.user || record?.account || record || {};
  const user = record?.user || source.user || {};
  const hasNestedInstructor = Boolean(record?.instructor);
  const officeLocation =
    getNestedValue(source, ["office_location", "officeLocation", "location"]) ||
    getNestedValue(record, ["office_location", "officeLocation", "location"]) ||
    fallback.location;
  const department = getDepartmentDisplayName({ ...fallback, ...record }, index);
  const faculty = getFacultyDisplayName({ ...fallback, ...record });
  const name =
    clean(getNestedValue(source, ["full_name", "name"])) ||
    clean(getNestedValue(user, ["full_name", "name"])) ||
    clean(fallback.fullName || fallback.name) ||
    "Unnamed Faculty Member";
  const instructorId =
    clean(
      getNestedValue(source, ["university_id", "instructor_id", "faculty_id"]) ||
        fallback.facultyId ||
        fallback.id ||
        getNestedValue(source, ["id"]),
    ) || "Pending";
  const backendInstructorId = getFirstNumber(
    getNestedValue(record?.instructor, ["instructor_id"]),
    getNestedValue(record?.instructor, ["id"]),
    getNestedValue(source, ["instructor_id"]),
    getNestedValue(record, ["instructor_id"]),
    hasNestedInstructor ? getNestedValue(source, ["id"]) : undefined,
  );
  const backendUserId = getFirstNumber(
    getNestedValue(user, ["user_id", "id"]),
    getNestedValue(source, ["user_id"]),
    getNestedValue(record, ["user_id"]),
    !hasNestedInstructor ? getNestedValue(record, ["id"]) : undefined,
  );
  const academicPosition = clean(
    getNestedValue(source, ["academic_position", "academicPosition", "title", "position"]) ||
    getNestedValue(record, ["academic_position", "academicPosition", "title", "position"]) ||
    fallback.academicPosition ||
    fallback.title,
  );
  const actualRole = clean(
    getNestedValue(source, ["role", "instructor_role", "faculty_role"]) ||
    getNestedValue(user, ["role", "user_role"]) ||
    getNestedValue(record, ["role", "instructor_role", "faculty_role"]) ||
    fallback.role,
  );
  const createdAt = getNestedValue(source, ["created_at", "createdAt"]) ||
    getNestedValue(record, ["created_at", "createdAt"]);
  const createdByAdminId = getNestedValue(source, [
    "created_by_admin_id",
    "created_by_admin",
    "admin_id",
    "created_by",
  ]) || getNestedValue(record, [
    "created_by_admin_id",
    "created_by_admin",
    "admin_id",
    "created_by",
  ]);
  const courses = getArrayPayload(source, [
    "courses",
    "assigned_courses",
    "assignedCourses",
    "current_courses",
    "currentCourses",
    "course_offerings",
    "courseOfferings",
    "assigned_course_offerings",
    "assignedCourseOfferings",
  ])
    .map(formatCourseLabel)
    .filter(Boolean);
  const loadCurrent = getLoadCurrent(source, courses, fallback);
  const loadTotal =
    Number(source.max_load ?? source.max_courses) ||
    parseLoadValue(fallback.load || fallback.courseLoad, 1, 3) ||
    3;
  const progress = loadTotal > 0 ? Math.min(100, Math.round((loadCurrent / loadTotal) * 100)) : 0;

  return decorateInstructorDisplay({
    ...fallback,
    name,
    rawName: name,
    fullName: name,
    email: clean(getNestedValue(source, ["email"]) || getNestedValue(user, ["email"]) || fallback.email),
    id: instructorId,
    facultyId: instructorId,
    instructorId,
    instructor_id: backendInstructorId ?? instructorId,
    backendInstructorId,
    userId: backendUserId,
    user_id: backendUserId,
    universityId: instructorId,
    isSeed: getNestedValue(source, ["is_seed", "seed", "is_demo", "demo"]) ||
      getNestedValue(record, ["is_seed", "seed", "is_demo", "demo"]),
    createdByAdminId,
    source: clean(getNestedValue(source, ["source", "origin"]) || getNestedValue(record, ["source", "origin"])),
    createdAt,
    department,
    faculty,
    faculty_id: getFirstNumber(
      getNestedValue(source, ["faculty_id"]),
      getNestedValue(record, ["faculty_id"]),
    ),
    title: academicPosition || actualRole || "Faculty Member",
    academicPosition: academicPosition || actualRole || "Faculty Member",
    academic_position: academicPosition || "",
    role: actualRole || academicPosition || "Faculty Member",
    specialization: clean(getNestedValue(source, ["specialization"]) || fallback.specialization),
    location: clean(officeLocation) || "Campus office pending",
    phone: clean(getNestedValue(source, ["phone"]) || getNestedValue(user, ["phone"]) || fallback.phone),
    load: `${loadCurrent}/${loadTotal}`,
    courseLoad: `${loadCurrent}/${loadTotal}`,
    hasDirectCourseLoadData: hasDirectCourseLoadSource(source),
    courses,
    progress,
    backendRecord: record,
    sortIndex: index,
  }, index);
}

export async function listStudents() {
  const data = await apiClient.get("/admin/users");
  const users = getArrayPayload(data, ["users", "students", "items", "data"]);
  const students = users.filter((user) => {
    const role = clean(user.role || user.user_role || user.type).toLowerCase();
    return !role || role.includes("student") || user.level || user.student;
  });

  return sortStudentsForDemo(students.map((student, index) => mapBackendStudent(student, {}, index)));
}

export async function listInstructors({ includeCourseLoads = true } = {}) {
  const data = await apiClient.get("/admin/instructors");
  const instructors = getArrayPayload(data, ["instructors", "faculty", "items", "data"]).map((instructor, index) =>
    mapBackendInstructor(instructor, {}, index),
  );

  const sortedInstructors = sortInstructorsForDemo(instructors);

  if (!includeCourseLoads) {
    return sortedInstructors;
  }

  try {
    return await enrichInstructorsWithCourseLoads(sortedInstructors);
  } catch (error) {
    console.info(
      `[LearnUp] Instructor course load enrichment skipped (${error?.status || 0}: ${error?.message || "Unknown error"}).`,
    );
    return sortedInstructors;
  }
}
