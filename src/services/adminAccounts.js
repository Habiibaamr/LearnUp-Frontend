import { apiClient } from "./apiClient.js";

const clean = (value) => value?.toString().trim() || "";

const optionalString = (value) => {
  const text = clean(value);
  return text || undefined;
};

const parseLevel = (value) => {
  const match = clean(value).match(/\d+/);
  return match ? Number(match[0]) : undefined;
};

// Temporary backend IDs until faculty/department/advisor dropdowns are loaded from real endpoints.
const DEMO_FACULTY_ID = 1;
const DEMO_DEPARTMENT_ID = 1;
const DEMO_ADVISOR_INSTRUCTOR_ID = 1;
const DEMO_PHONE = "01000000000";

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

const getNestedValue = (record, keys) => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key];
    }
  }

  return "";
};

export const isMissingEndpointError = (error) => error?.status === 404;

export function toCreateStudentPayload(formValues) {
  return {
    full_name: clean(formValues.fullName),
    email: clean(formValues.email),
    password: clean(formValues.initialPassword),
    // TODO: Replace these demo IDs with values from real faculty, department,
    // and advisor dropdowns once those backend-backed options are available.
    faculty_id: DEMO_FACULTY_ID,
    department_id: DEMO_DEPARTMENT_ID,
    level: parseLevel(formValues.level) || 1,
    cgpa: 0,
    passed_credit_hours: 0,
    phone: optionalString(formValues.phone) || DEMO_PHONE,
    advisor_instructor_id: DEMO_ADVISOR_INSTRUCTOR_ID,
  };
}

export function toCreateInstructorPayload(formValues) {
  return {
    full_name: clean(formValues.fullName),
    email: clean(formValues.email),
    password: clean(formValues.initialPassword),
    // TODO: Replace these demo IDs with values from real faculty and department
    // dropdowns once those backend-backed options are available.
    faculty_id: DEMO_FACULTY_ID,
    department_id: DEMO_DEPARTMENT_ID,
    specialization: optionalString(formValues.specialization) || "General Computing",
    office_location: optionalString(formValues.location) || "Campus office pending",
    phone: optionalString(formValues.phone) || DEMO_PHONE,
  };
}

export async function createStudentAccount(payload) {
  return apiClient.post("/admin/create-student-account", payload);
}

export async function createInstructorAccount(formValues) {
  return apiClient.post("/admin/create-instructor-account", toCreateInstructorPayload(formValues));
}

export function mapBackendStudent(record, fallback = {}) {
  const source = record?.student || record?.user || record?.account || record || {};
  const level = getNestedValue(source, ["level", "academic_level"]) || fallback.level;
  const department =
    source.department?.name ||
    source.department_name ||
    getNestedValue(source, ["department"]) ||
    fallback.department;
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

  return {
    ...fallback,
    name,
    fullName: name,
    email: clean(getNestedValue(source, ["email"]) || fallback.email),
    id: studentId,
    studentId,
    phone: clean(getNestedValue(source, ["phone"]) || fallback.phone),
    level: Number.isFinite(Number(level)) ? `Level ${Number(level)}` : level || "Level 1",
    department: clean(department) || "Computer Science",
  };
}

export function mapBackendInstructor(record, fallback = {}) {
  const source = record?.instructor || record?.user || record?.account || record || {};
  const officeLocation =
    getNestedValue(source, ["office_location", "location"]) || fallback.location;
  const department =
    source.department?.name ||
    source.department_name ||
    getNestedValue(source, ["department"]) ||
    fallback.department;
  const name =
    clean(getNestedValue(source, ["full_name", "name"])) ||
    clean(fallback.fullName || fallback.name) ||
    "Unnamed Faculty Member";
  const instructorId =
    clean(
      getNestedValue(source, ["university_id", "instructor_id", "faculty_id"]) ||
        fallback.facultyId ||
        fallback.id ||
        getNestedValue(source, ["id"]),
    ) || "Pending";

  return {
    ...fallback,
    name,
    fullName: name,
    email: clean(getNestedValue(source, ["email"]) || fallback.email),
    id: instructorId,
    facultyId: instructorId,
    instructorId,
    department: clean(department) || "Computer Science & IT",
    title: clean(getNestedValue(source, ["title", "position"]) || fallback.title) || "Faculty Member",
    role: clean(getNestedValue(source, ["role"]) || fallback.role) || "Faculty Member",
    specialization: clean(getNestedValue(source, ["specialization"]) || fallback.specialization),
    location: clean(officeLocation) || "Campus office pending",
    phone: clean(getNestedValue(source, ["phone"]) || fallback.phone),
    load: clean(fallback.load || fallback.courseLoad) || "0/3",
    courseLoad: clean(fallback.courseLoad || fallback.load) || "0/3",
    progress: Number.isFinite(Number(fallback.progress)) ? Number(fallback.progress) : 0,
  };
}

export async function listStudents() {
  const data = await apiClient.get("/admin/users");
  const users = getArrayPayload(data, ["users", "students", "items", "data"]);
  const students = users.filter((user) => {
    const role = clean(user.role || user.user_role || user.type).toLowerCase();
    return !role || role.includes("student") || user.level || user.student;
  });

  return students.map((student) => mapBackendStudent(student));
}

export async function listInstructors() {
  const data = await apiClient.get("/admin/instructors");
  return getArrayPayload(data, ["instructors", "faculty", "items", "data"]).map((instructor) =>
    mapBackendInstructor(instructor),
  );
}
