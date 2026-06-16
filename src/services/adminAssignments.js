import { apiClient } from "./apiClient.js";

const clean = (value) => value?.toString().trim() || "";

const getArrayPayload = (data, keys) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    if (data?.[key] && typeof data[key] === "object") {
      const nestedArray = getArrayPayload(data[key], keys);

      if (nestedArray.length > 0) {
        return nestedArray;
      }
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

const toNumberId = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getInstructorId = (source) =>
  toNumberId(
    getNestedValue(source, ["instructor_id", "id", "user_id"]) ||
      getNestedValue(source?.instructor, ["id", "instructor_id"]) ||
      getNestedValue(source?.user, ["id", "instructor_id"]),
  );

const getCourseOfferingId = (source) =>
  toNumberId(
    getNestedValue(source, ["course_offering_id", "offering_id", "id"]) ||
      getNestedValue(source?.course_offering, ["id", "course_offering_id"]),
  );

export function mapInstructor(record) {
  const source = record?.instructor || record?.user || record || {};
  const user = record?.user || source.user || {};
  const department = source.department || record?.department || user.department || {};
  const instructorId = getInstructorId(record);
  const currentCourses = getArrayPayload(source, ["courses", "assigned_courses", "course_offerings"])
    .map((course) => clean(course.course_code || course.code || course.title || course.name || course))
    .filter(Boolean);
  const loadCurrent =
    Number(source.current_load ?? source.assigned_courses_count ?? currentCourses.length) || currentCourses.length;
  const loadTotal = Number(source.max_load ?? source.max_courses ?? 3) || 3;
  const progress = loadTotal > 0 ? Math.min(100, Math.round((loadCurrent / loadTotal) * 100)) : 0;
  const name =
    clean(source.full_name || source.name || user.full_name || user.name) ||
    "Unnamed Faculty Member";
  const email = clean(source.email || user.email);

  return {
    instructorId,
    name,
    email,
    label: [name, email].filter(Boolean).join(" - "),
    department:
      clean(department.name || source.department_name || department.department_name || department) ||
      "Department pending",
    load: `${loadCurrent}/${loadTotal}`,
    progress,
    courses: currentCourses,
  };
}

export function mapCourseOffering(record) {
  const source = record?.course_offering || record || {};
  const course = source.course || record?.course || {};
  const semesterSource = source.semester || record?.semester || {};
  const courseOfferingId = getCourseOfferingId(record);
  const courseCode = clean(source.course_code || course.course_code || course.code || source.code) || "Course";
  const courseTitle = clean(source.course_title || course.course_title || course.title || source.title || source.name);
  const semester = clean(
    source.semester_id ||
      semesterSource.semester_id ||
      semesterSource.id ||
      semesterSource.name ||
      source.term ||
      source.academic_term,
  );
  const status = clean(source.status || source.registration_status || source.state);

  return {
    courseOfferingId,
    courseCode,
    courseTitle,
    semester,
    status,
    label: [courseCode, courseTitle, semester ? `Semester ${semester}` : "", status]
      .filter(Boolean)
      .join(" - "),
  };
}

export async function listAdminInstructors() {
  const data = await apiClient.get("/admin/instructors");
  return getArrayPayload(data, ["instructors", "faculty", "items", "data"])
    .map(mapInstructor)
    .filter((instructor) => instructor.instructorId !== null);
}

export async function listCourseOfferings() {
  const data = await apiClient.get("/admin/course-offerings");
  return getArrayPayload(data, ["course_offerings", "offerings", "items", "data"])
    .map(mapCourseOffering)
    .filter((offering) => offering.courseOfferingId !== null);
}

export async function assignInstructorToOffering(payload) {
  console.log("CALLING BACKEND ASSIGN INSTRUCTOR", payload);
  return apiClient.post("/admin/assign-instructor-to-offering", payload);
}

export async function listCourseOfferingInstructors(courseOfferingId) {
  return apiClient.get(`/admin/course-offering-instructors/${courseOfferingId}`);
}
