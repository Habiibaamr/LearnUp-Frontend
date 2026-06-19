import { apiClient } from "./apiClient.js";

const ENDPOINT_NOT_AVAILABLE = new Set([404, 405]);

const getArrayPayload = (payload, keys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
};

const cleanText = (value) => (
  value === undefined || value === null ? "" : String(value).trim()
);

const toNumberOrNull = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getStoredCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("learnup_current_user") || "null");
  } catch {
    return null;
  }
};

async function requestFirstAvailable(paths) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await apiClient.get(path);
    } catch (error) {
      lastError = error;
      if (!ENDPOINT_NOT_AVAILABLE.has(error?.status)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export function getFacultyCourseLevel(course) {
  const backendLevel = toNumberOrNull(
    course?.level ?? course?.course_level ?? course?.course?.level,
  );

  if (backendLevel >= 1 && backendLevel <= 4) {
    return backendLevel;
  }

  const semesterValue =
    course?.semester_id ??
    course?.semester_number ??
    course?.semesterNumber ??
    course?.semester_name ??
    course?.semester;
  const semesterMatch = cleanText(semesterValue).match(/\d+/);
  const semesterId = semesterMatch ? Number(semesterMatch[0]) : toNumberOrNull(semesterValue);

  if (semesterId >= 1 && semesterId <= 8) {
    return Math.ceil(semesterId / 2);
  }

  return null;
}

export const formatFacultyCourseLevel = (course) => {
  const level = getFacultyCourseLevel(course);
  return level ? `Level ${level}` : "Level not available";
};

const getAcademicStatus = (cgpa, accountStatus) => {
  const numericCgpa = toNumberOrNull(cgpa);

  if (numericCgpa !== null) {
    if (numericCgpa < 2.5) {
      return "AT RISK";
    }
    if (numericCgpa >= 3.5) {
      return "EXCELLENT";
    }
    return "NORMAL";
  }

  return cleanText(accountStatus).toUpperCase() || "ACTIVE";
};

export const normalizeFacultyProfile = (profile = {}) => ({
  instructor_id: toNumberOrNull(profile.instructor_id ?? profile.instructorId ?? profile.id),
  user_id: toNumberOrNull(profile.user_id ?? profile.userId),
  university_id: cleanText(profile.university_id ?? profile.universityId),
  full_name: cleanText(profile.full_name ?? profile.fullName ?? profile.name),
  email: cleanText(profile.email),
  faculty_id: toNumberOrNull(profile.faculty_id ?? profile.facultyId),
  faculty_name: cleanText(profile.faculty_name ?? profile.facultyName ?? profile.faculty),
  department_id: toNumberOrNull(profile.department_id ?? profile.departmentId),
  department_name: cleanText(
    profile.department_name ?? profile.departmentName ?? profile.department,
  ),
  academic_position: cleanText(
    profile.academic_position ?? profile.academicPosition ?? profile.position ?? profile.title,
  ) || "Faculty Member",
  specialization: cleanText(profile.specialization),
  office_location: cleanText(profile.office_location ?? profile.officeLocation),
  phone: cleanText(profile.phone),
});

export const normalizeFacultyStudent = (student = {}, index = 0) => {
  const cgpa = toNumberOrNull(student.cgpa ?? student.gpa);
  const level = toNumberOrNull(student.level);
  const universityId = cleanText(
    student.university_id ??
    student.student_university_id ??
    student.universityId ??
    student.student_id ??
    student.id,
  );

  return {
    student_id: toNumberOrNull(student.student_id ?? student.id),
    user_id: toNumberOrNull(student.user_id ?? student.userId),
    university_id: universityId,
    full_name: cleanText(
      student.full_name ?? student.student_full_name ?? student.fullName ?? student.name,
    ) || "Student",
    email: cleanText(student.email),
    department_id: toNumberOrNull(student.department_id ?? student.departmentId),
    department_name: cleanText(
      student.department_name ?? student.departmentName ?? student.department,
    ) || "Not specified",
    level,
    level_label: level ? `Level ${level}` : "Not specified",
    cgpa,
    gpa_label: cgpa === null ? "—" : cgpa.toFixed(2),
    status: cleanText(student.status) || "active",
    academic_status: getAcademicStatus(cgpa, student.status),
    relationship_type: cleanText(student.relationship_type) || "course_student",
    relationship_label:
      cleanText(student.relationship_type) === "advisor"
        ? "Academic advisee"
        : "Course student",
    avatar: ["sarah", "alex", "james"][index % 3],
  };
};

const getCourseTerm = (course, semesterId) => {
  const backendTerm = cleanText(course.term ?? course.semester_term);
  if (backendTerm) {
    return backendTerm;
  }
  if (semesterId >= 1) {
    return semesterId % 2 === 1 ? "Fall" : "Spring";
  }
  return "";
};

export const normalizeFacultyCourse = (course = {}, index = 0) => {
  const semesterId = toNumberOrNull(
    course.semester_id ?? course.semester_number ?? course.semesterNumber,
  );
  const level = getFacultyCourseLevel(course);
  const status = cleanText(course.status ?? course.offering_status) || "open";

  return {
    course_instructor_id: toNumberOrNull(course.course_instructor_id),
    course_offering_id: toNumberOrNull(
      course.course_offering_id ?? course.offering_id ?? course.id,
    ),
    course_id: toNumberOrNull(course.course_id ?? course.course?.id),
    course_code: cleanText(
      course.course_code ?? course.code ?? course.course?.course_code,
    ) || `COURSE-${index + 1}`,
    course_title: cleanText(
      course.course_title ?? course.title ?? course.name ?? course.course?.title,
    ) || "Course",
    credit_hours: toNumberOrNull(course.credit_hours ?? course.credits),
    semester_id: semesterId,
    semester_name: cleanText(course.semester_name) || (
      semesterId ? `Semester ${semesterId}` : "Semester not available"
    ),
    academic_year: cleanText(course.academic_year ?? course.academicYear),
    term: getCourseTerm(course, semesterId),
    level,
    level_label: level ? `Level ${level}` : "Level not available",
    department_id: toNumberOrNull(course.department_id ?? course.departmentId),
    department_name: cleanText(
      course.department_name ?? course.departmentName ?? course.department,
    ),
    status,
    capacity: toNumberOrNull(course.capacity),
    enrolled_students_count: toNumberOrNull(
      course.enrolled_students_count ?? course.students_count ?? course.students,
    ) ?? 0,
  };
};

const compareFacultyCourses = (firstCourse, secondCourse) => {
  const firstSemester = firstCourse.semester_id ?? Number.MAX_SAFE_INTEGER;
  const secondSemester = secondCourse.semester_id ?? Number.MAX_SAFE_INTEGER;

  if (firstSemester !== secondSemester) {
    return firstSemester - secondSemester;
  }

  return firstCourse.course_code.localeCompare(secondCourse.course_code);
};

const normalizeEnrollmentStudent = (student = {}, index = 0) => {
  const normalized = normalizeFacultyStudent(student, index);
  const status = cleanText(student.status).toLowerCase() || "not_eligible";

  return {
    ...normalized,
    status,
    status_label: status
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    is_enrolled: Boolean(student.is_enrolled),
    is_selectable: Boolean(student.is_selectable),
    reason: cleanText(student.reason),
    is_fallback: Boolean(student.is_fallback),
  };
};

const FALLBACK_ENROLLMENT_STUDENTS = [
  {
    student_id: -1,
    university_id: "DEMO-STU-001",
    full_name: "Demo Student One",
    email: "demo.student1@learnup.local",
    department_name: "Computer Science",
    level: 2,
    cgpa: 3.35,
    status: "eligible",
    is_enrolled: false,
    is_selectable: false,
    reason: "Local fallback preview; backend returned no students",
    is_fallback: true,
  },
  {
    student_id: -2,
    university_id: "DEMO-STU-002",
    full_name: "Demo Student Two",
    email: "demo.student2@learnup.local",
    department_name: "Artificial Intelligence",
    level: 1,
    cgpa: 2.8,
    status: "not_eligible",
    is_enrolled: false,
    is_selectable: false,
    reason: "Local fallback preview; backend returned no students",
    is_fallback: true,
  },
];

export async function fetchFacultyProfile() {
  try {
    const response = await requestFirstAvailable([
      "/faculty/me",
      "/instructor/me",
      "/auth/me",
    ]);
    return normalizeFacultyProfile(response);
  } catch (error) {
    const storedUser = getStoredCurrentUser();
    if (storedUser && ENDPOINT_NOT_AVAILABLE.has(error?.status)) {
      return normalizeFacultyProfile(storedUser);
    }
    throw error;
  }
}

export async function fetchFacultyCourses() {
  let response;

  try {
    response = await apiClient.get("/faculty/my-courses");
  } catch (error) {
    if (!ENDPOINT_NOT_AVAILABLE.has(error?.status)) {
      throw error;
    }
    response = await apiClient.get("/instructor/my-offerings");
  }

  return getArrayPayload(response, ["courses", "offerings", "items", "data"])
    .map(normalizeFacultyCourse)
    .sort(compareFacultyCourses);
}

async function fetchStudentsFromAssignedOfferings() {
  const courses = await fetchFacultyCourses();
  const registrationResponses = await Promise.all(
    courses
      .filter((course) => course.course_offering_id)
      .map(async (course) => {
        try {
          return await apiClient.get(
            `/instructor/my-offerings/${course.course_offering_id}/registrations`,
          );
        } catch (error) {
          if (ENDPOINT_NOT_AVAILABLE.has(error?.status)) {
            return [];
          }
          throw error;
        }
      }),
  );
  const studentsByUniversityId = new Map();

  registrationResponses.flatMap((response) => (
    getArrayPayload(response, ["registrations", "students", "items", "data"])
  )).forEach((student) => {
    const normalized = normalizeFacultyStudent(student, studentsByUniversityId.size);
    if (normalized.university_id) {
      studentsByUniversityId.set(normalized.university_id, normalized);
    }
  });

  return [...studentsByUniversityId.values()];
}

export async function fetchFacultyStudents() {
  try {
    const response = await apiClient.get("/faculty/my-students");
    return getArrayPayload(response, ["students", "items", "data"])
      .map(normalizeFacultyStudent);
  } catch (error) {
    if (!ENDPOINT_NOT_AVAILABLE.has(error?.status)) {
      throw error;
    }
    return fetchStudentsFromAssignedOfferings();
  }
}

export async function fetchFacultyCourseStudents(courseOfferingId) {
  const normalizedOfferingId = toNumberOrNull(courseOfferingId);
  if (!normalizedOfferingId || normalizedOfferingId < 1) {
    throw new Error("A valid assigned course offering is required.");
  }
  const response = await apiClient.get(
    `/faculty/course-offerings/${normalizedOfferingId}/registrations`,
  );

  return {
    course: normalizeFacultyCourse(response?.course || {}),
    students: getArrayPayload(response, ["students", "registrations", "items", "data"])
      .map(normalizeFacultyStudent),
  };
}

export async function fetchFacultyCourseEnrollment(courseOfferingId) {
  const response = await apiClient.get(
    `/faculty/course-offerings/${courseOfferingId}/students`,
  );
  const course = normalizeFacultyCourse(response?.course || {});
  const backendStudents = getArrayPayload(response, ["students", "items", "data"]);
  const usingFallback = backendStudents.length === 0;
  const sourceStudents = usingFallback
    ? FALLBACK_ENROLLMENT_STUDENTS
    : backendStudents;

  return {
    course: {
      ...course,
      current_enrolled_count: toNumberOrNull(
        response?.course?.current_enrolled_count,
      ) ?? course.enrolled_students_count,
      remaining_seats: toNumberOrNull(response?.course?.remaining_seats) ?? (
        course.capacity === null
          ? 0
          : Math.max(0, course.capacity - course.enrolled_students_count)
      ),
    },
    students: sourceStudents.map(normalizeEnrollmentStudent),
    usingFallback,
  };
}

export async function enrollFacultyStudents(courseOfferingId, studentIds) {
  return apiClient.post(
    `/faculty/course-offerings/${courseOfferingId}/enroll-students`,
    { student_ids: studentIds },
  );
}

export const isFacultyAuthError = (error) => [401, 403].includes(error?.status);
