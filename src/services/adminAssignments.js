import { apiClient } from "./apiClient.js";
import {
  cleanText as clean,
  decorateInstructorDisplay,
  getDepartmentDisplayName,
  getFacultyDisplayName,
  getNestedValue,
  sortInstructorsForDemo,
} from "../utils/instructorDisplay.js";

const MAX_ASSIGNABLE_SEMESTER_NUMBER = 12;
const DEFAULT_MAX_COURSE_LOAD = 3;
const COURSE_LOAD_CACHE_TTL_MS = 10000;
const FACULTY_ASSIGNMENT_CHANGE_EVENT = "learnup:facultyAssignmentsChanged";
let courseLoadCache = {
  key: "",
  expiresAt: 0,
  promise: null,
};

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

const getFirstRecordValue = (records, keys) => {
  for (const record of records) {
    const value = getNestedValue(record, keys);

    if (value !== "") {
      return value;
    }
  }

  return "";
};

const toNumberId = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const normalizeInstructorKey = (value) => clean(value).toLowerCase();

const uniqueInstructorKeys = (values) =>
  values
    .map(normalizeInstructorKey)
    .filter(Boolean)
    .filter((value, index, keys) => keys.indexOf(value) === index);

const getFirstNumberId = (...values) => {
  for (const value of values) {
    const numericId = toNumberId(value);

    if (numericId !== null) {
      return numericId;
    }
  }

  return null;
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

const isValidSemesterNumber = (semesterNumber) =>
  Number.isInteger(semesterNumber) &&
  semesterNumber >= 1 &&
  semesterNumber <= MAX_ASSIGNABLE_SEMESTER_NUMBER;

const getInstructorId = (source) =>
  getFirstNumberId(
    getNestedValue(source, ["instructor_id"]),
    getNestedValue(source, ["instructorId"]),
    getNestedValue(source, ["faculty_id"]),
    getNestedValue(source, ["facultyId"]),
    getNestedValue(source?.instructor, ["instructor_id"]),
    getNestedValue(source?.instructor, ["id"]),
    getNestedValue(source?.user, ["instructor_id"]),
    getNestedValue(source?.user, ["instructorId"]),
    getNestedValue(source, ["user_id"]),
    getNestedValue(source?.user, ["id"]),
    getNestedValue(source, ["id"]),
  );

const getCourseOfferingId = (source) =>
  getFirstNumberId(
    getNestedValue(source, ["course_offering_id"]),
    getNestedValue(source, ["offering_id"]),
    getNestedValue(source?.course_offering, ["course_offering_id"]),
    getNestedValue(source?.course_offering, ["id"]),
    getNestedValue(source, ["id"]),
  );

const getAssignmentCourseOfferingId = (source, fallbackCourseOfferingId) =>
  getFirstNumberId(
    getNestedValue(source, ["course_offering_id"]),
    getNestedValue(source, ["offering_id"]),
    getNestedValue(source?.course_offering, ["course_offering_id"]),
    getNestedValue(source?.course_offering, ["id"]),
    fallbackCourseOfferingId,
  );

const getInstructorLoadId = (instructor) =>
  getFirstNumberId(instructor.backendInstructorId, instructor.instructorId, instructor.instructor_id, instructor.id);

export function getInstructorKey(instructorOrAssignment) {
  return getInstructorKeys(instructorOrAssignment)[0] || "";
}

const parseLoadValue = (load, index, fallback = 0) => {
  const parts = clean(load).split("/");
  const value = Number(parts[index]);

  return Number.isFinite(value) ? value : fallback;
};

const getDirectCourseCount = (source, currentCourses) => {
  const numericLoad = Number(
    source.course_load ??
      source.courseLoad ??
      source.course_count ??
      source.courseCount ??
      source.assigned_courses_count ??
      source.assigned_course_count ??
      source.assignedCourseCount ??
      source.current_courses_count ??
      source.currentCourseCount,
  );

  if (Number.isFinite(numericLoad)) {
    return numericLoad;
  }

  const loadFromText = parseLoadValue(source.course_load ?? source.courseLoad ?? source.load, 0, NaN);

  if (Number.isFinite(loadFromText)) {
    return loadFromText;
  }

  return currentCourses.length;
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

const getLoadCurrent = (source, currentCourses) => {
  const numericLoad = Number(source.current_load ?? source.currentLoad);

  return Number.isFinite(numericLoad) ? numericLoad : getDirectCourseCount(source, currentCourses);
};

const applyCourseLoad = (instructor, assignedCount, assignedCourses = []) => {
  const directLoadCurrent = parseLoadValue(instructor.load || instructor.courseLoad, 0, 0);
  const loadTotal = DEFAULT_MAX_COURSE_LOAD;
  const nextLoadCurrent = Math.min(loadTotal, Math.max(directLoadCurrent, assignedCount ?? 0));
  const courses = Array.from(new Set([...(instructor.courses || []), ...assignedCourses].filter(Boolean)));
  const progress = loadTotal > 0 ? Math.min(100, Math.round((nextLoadCurrent / loadTotal) * 100)) : 0;

  return {
    ...instructor,
    assignedCourseCount: nextLoadCurrent,
    load: `${nextLoadCurrent}/${loadTotal}`,
    courseLoad: `${nextLoadCurrent}/${loadTotal}`,
    progress,
    courses,
  };
};

const getInstructorLoadIds = (instructor) =>
  [
    instructor.backendInstructorId,
    instructor.instructorId,
    instructor.instructor_id,
    instructor.userId,
    instructor.user_id,
    instructor.id,
  ]
    .map(toNumberId)
    .filter((id, index, ids) => id !== null && ids.indexOf(id) === index);

export function getInstructorKeys(instructorOrAssignment) {
  const source = instructorOrAssignment?.course_instructor || instructorOrAssignment || {};
  const isAssignmentRecord = Boolean(
    source.course_offering_id ||
      source.courseOfferingId ||
      source.offering_id ||
      source.offeringId ||
      source.course_offering ||
      instructorOrAssignment?.course_instructor,
  );
  const instructor =
    source.instructor ||
    instructorOrAssignment?.instructor ||
    source.faculty_member ||
    instructorOrAssignment?.faculty_member ||
    source.user ||
    instructorOrAssignment?.user ||
    {};

  return uniqueInstructorKeys([
    source.backendInstructorId,
    source.instructor_id,
    source.instructorId,
    source.faculty_member_id,
    source.facultyMemberId,
    source.faculty_id,
    source.facultyId,
    source.user_id,
    source.userId,
    source.university_id,
    source.universityId,
    isAssignmentRecord ? "" : source.id,
    instructor.backendInstructorId,
    instructor.instructor_id,
    instructor.instructorId,
    instructor.faculty_member_id,
    instructor.facultyMemberId,
    instructor.faculty_id,
    instructor.facultyId,
    instructor.user_id,
    instructor.userId,
    instructor.university_id,
    instructor.universityId,
    instructor.id,
  ]);
}

export function mapInstructor(record, index = 0) {
  const source = record?.instructor || record?.user || record || {};
  const user = record?.user || source.user || {};
  const metadataSources = [record, source, user, record?.instructor, record?.account, source.user];
  const instructorId = getInstructorId(record);
  const currentCourses = getArrayPayload(source, [
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
  const loadCurrent = getLoadCurrent(source, currentCourses);
  const loadTotal = Number(source.max_load ?? source.max_courses ?? 3) || 3;
  const progress = loadTotal > 0 ? Math.min(100, Math.round((loadCurrent / loadTotal) * 100)) : 0;
  const name =
    clean(source.full_name || source.name || user.full_name || user.name) ||
    "Unnamed Faculty Member";
  const email = clean(source.email || user.email);
  const universityId = clean(
    getFirstRecordValue(metadataSources, ["university_id", "universityId", "faculty_id", "facultyId"]),
  );
  const facultyName = getFacultyDisplayName(record);
  const specialization = clean(source.specialization || record?.specialization);
  const departmentName = getDepartmentDisplayName(record, index);

  return decorateInstructorDisplay({
    instructorId,
    instructor_id: instructorId,
    backendInstructorId: instructorId,
    userId: getFirstNumberId(record?.user_id, source.user_id, user.id),
    name,
    rawName: name,
    email,
    label: [name, email].filter(Boolean).join(" - "),
    universityId,
    isSeed: getFirstRecordValue(metadataSources, ["is_seed", "seed", "is_demo", "demo"]),
    createdByAdminId: getFirstRecordValue(metadataSources, [
      "created_by_admin_id",
      "created_by_admin",
      "admin_id",
      "created_by",
    ]),
    source: clean(getFirstRecordValue(metadataSources, ["source", "origin"])),
    createdAt: getFirstRecordValue(metadataSources, ["created_at", "createdAt"]),
    department: departmentName,
    faculty: facultyName,
    specialization,
    load: `${loadCurrent}/${loadTotal}`,
    hasDirectCourseLoadData: hasDirectCourseLoadSource(source),
    progress,
    courses: currentCourses,
    sortIndex: index,
  }, index);
}

export function mapCourseOffering(record) {
  const source = record?.course_offering || record || {};
  const course = source.course || record?.course || {};
  const semesterSource = source.semester || record?.semester || {};
  const courseOfferingId = getCourseOfferingId(record);
  const courseCode = clean(source.course_code || course.course_code || course.code || source.code) || "Course";
  const courseTitle = clean(source.course_title || course.course_title || course.title || source.title || source.name);
  const semesterNumber = parseSemesterNumber(
    source.semester_number,
    source.semesterNumber,
    source.semester_no,
    semesterSource.semester_number,
    semesterSource.semesterNumber,
    semesterSource.number,
    semesterSource.name,
    semesterSource.title,
    source.semester,
    source.term,
    source.academic_term,
    source.semester_id,
    semesterSource.semester_id,
    semesterSource.id,
  );
  const status = clean(source.status || source.registration_status || source.state);
  const semester = semesterNumber ? `Semester ${semesterNumber}` : "";

  return {
    courseOfferingId,
    courseCode,
    courseTitle,
    semester,
    semesterNumber,
    status,
    label: [courseCode, courseTitle, semester, status]
      .filter(Boolean)
      .join(" - "),
  };
}

export async function listAdminInstructors({ includeCourseLoads = true, courseOfferings } = {}) {
  const data = await apiClient.get("/admin/instructors");
  const instructors = getArrayPayload(data, ["instructors", "faculty", "items", "data"])
    .map(mapInstructor)
    .filter((instructor) => instructor.instructorId !== null);

  const sortedInstructors = sortInstructorsForDemo(instructors);

  if (!includeCourseLoads) {
    return sortedInstructors;
  }

  return enrichInstructorsWithCourseLoads(sortedInstructors, courseOfferings);
}

const isDummyCourseOffering = (offering) =>
  /^Introduction to Topic\s+\d+$/i.test(offering.courseTitle) ||
  /^CSE\d{4}$/i.test(offering.courseCode);

export async function listCourseOfferings() {
  const data = await apiClient.get("/admin/course-offerings");
  const validOfferings = getArrayPayload(data, ["course_offerings", "offerings", "items", "data"])
    .map(mapCourseOffering)
    .filter(
      (offering) =>
        offering.courseOfferingId !== null && isValidSemesterNumber(offering.semesterNumber),
    );

  const realisticOfferings = validOfferings.filter((offering) => !isDummyCourseOffering(offering));

  return realisticOfferings.length > 0 ? realisticOfferings : validOfferings;
}

export async function assignInstructorToOffering(payload) {
  console.log("CALLING BACKEND ASSIGN INSTRUCTOR", payload);
  const result = await apiClient.post("/admin/assign-instructor-to-offering", payload);

  clearInstructorCourseLoadCache();
  return result;
}

export function mapCourseOfferingInstructor(record, fallbackCourseOfferingId) {
  const source = record?.course_instructor || record || {};
  const instructorId = getFirstNumberId(getNestedValue(source, ["instructor_id"]));
  const instructorKey = normalizeInstructorKey(instructorId);

  return {
    id: toNumberId(source.id),
    courseOfferingId: getAssignmentCourseOfferingId(source, fallbackCourseOfferingId),
    instructorId,
    instructorKey,
    instructorKeys: instructorKey ? [instructorKey] : [],
  };
}

const hasInstructorReference = (record) =>
  Boolean(
    getNestedValue(record, ["instructor_id", "instructorId", "faculty_id", "facultyId"]) ||
      record?.instructor ||
      record?.faculty_member ||
      record?.user,
  );

const getCourseOfferingInstructorPayload = (data) => {
  const payload = getArrayPayload(data, [
    "course_offering_instructors",
    "courseOfferingInstructors",
    "course_instructors",
    "courseInstructors",
    "offering_instructors",
    "offeringInstructors",
    "instructor_assignments",
    "instructorAssignments",
    "assignments",
    "instructors",
    "items",
    "results",
    "data",
  ]);

  if (payload.length > 0) {
    return payload;
  }

  return data && typeof data === "object" && hasInstructorReference(data) ? [data] : [];
};

export async function listCourseOfferingInstructors(courseOfferingId) {
  const data = await apiClient.get(`/admin/course-offering-instructors/${courseOfferingId}`);
  console.log("course offering instructors response", courseOfferingId, data);

  return getCourseOfferingInstructorPayload(data)
    .map((assignment) => {
      const mappedAssignment = mapCourseOfferingInstructor(assignment, courseOfferingId);

      console.log("normalized assignment instructor key", mappedAssignment.instructorKey || mappedAssignment.instructorId);
      return mappedAssignment;
    })
    .filter(
      (assignment) =>
        assignment.courseOfferingId !== null && assignment.instructorId !== null,
    );
}

const getCourseLoadCacheKey = (courseOfferings) =>
  courseOfferings
    .map((offering) => offering.courseOfferingId)
    .filter((id) => id !== null && id !== undefined)
    .sort((first, second) => Number(first) - Number(second))
    .join(",");

async function getCourseLoadData(courseOfferings) {
  const cacheKey = getCourseLoadCacheKey(courseOfferings);
  const now = Date.now();

  if (courseLoadCache.promise && courseLoadCache.key === cacheKey && courseLoadCache.expiresAt > now) {
    return courseLoadCache.promise;
  }

  const offeringsById = new Map(courseOfferings.map((offering) => [offering.courseOfferingId, offering]));
  const promise = Promise.allSettled(
    courseOfferings.map((offering) => listCourseOfferingInstructors(offering.courseOfferingId)),
  ).then((results) => {
    const seenAssignments = new Set();
    const loadByInstructorKey = new Map();
    const loadByInstructorId = new Map();
    const coursesByInstructorKey = new Map();
    const coursesByInstructorId = new Map();

    results.forEach((result) => {
      if (result.status !== "fulfilled") {
        return;
      }

      result.value.forEach((assignment) => {
        const instructorKey = normalizeInstructorKey(assignment.instructorId);
        const key = `${assignment.courseOfferingId}-${instructorKey}`;

        if (!instructorKey || seenAssignments.has(key)) {
          return;
        }

        seenAssignments.add(key);

        if (assignment.instructorId !== null && assignment.instructorId !== undefined) {
          loadByInstructorId.set(
            assignment.instructorId,
            (loadByInstructorId.get(assignment.instructorId) || 0) + 1,
          );
        }

        loadByInstructorKey.set(instructorKey, (loadByInstructorKey.get(instructorKey) || 0) + 1);

        const offering = offeringsById.get(assignment.courseOfferingId);
        const courseLabel =
          offering?.label ||
          [offering?.courseCode, offering?.courseTitle].filter(Boolean).join(" - ");

        if (courseLabel) {
          if (assignment.instructorId !== null && assignment.instructorId !== undefined) {
            const currentCourses = coursesByInstructorId.get(assignment.instructorId) || [];
            currentCourses.push(courseLabel);
            coursesByInstructorId.set(assignment.instructorId, currentCourses);
          }

          const currentCourses = coursesByInstructorKey.get(instructorKey) || [];
          currentCourses.push(courseLabel);
          coursesByInstructorKey.set(instructorKey, currentCourses);
        }
      });
    });

    return {
      coursesByInstructorKey,
      coursesByInstructorId,
      loadByInstructorKey,
      loadByInstructorId,
      courseLoadMap: {
        ...Object.fromEntries(loadByInstructorId),
        ...Object.fromEntries(loadByInstructorKey),
      },
    };
  });

  courseLoadCache = {
    key: cacheKey,
    expiresAt: now + COURSE_LOAD_CACHE_TTL_MS,
    promise,
  };

  return promise;
}

export function clearInstructorCourseLoadCache() {
  courseLoadCache = {
    key: "",
    expiresAt: 0,
    promise: null,
  };
}

export async function enrichInstructorsWithCourseLoads(instructors, courseOfferings) {
  const offerings = courseOfferings || (await listCourseOfferings());

  if (offerings.length === 0) {
    return instructors.map((instructor) => applyCourseLoad(instructor, null));
  }

  const { courseLoadMap, coursesByInstructorKey, coursesByInstructorId, loadByInstructorKey, loadByInstructorId } = await getCourseLoadData(offerings);

  console.log("Loaded course load map", courseLoadMap);
  console.log("courseLoadMap", courseLoadMap);

  return instructors.map((instructor) => {
    const instructorIds = getInstructorLoadIds(instructor);
    const instructorId = instructorIds[0] ?? getInstructorLoadId(instructor);
    const instructorKeys = getInstructorKeys(instructor);
    const assignedCount =
      instructorIds.length === 0 && instructorKeys.length === 0
        ? null
        : Math.max(
            0,
            ...instructorIds.map((id) => loadByInstructorId.get(id) || 0),
            ...instructorKeys.map((key) => loadByInstructorKey.get(key) || 0),
          );
    const assignedCourses = Array.from(
      new Set([
        ...instructorIds.flatMap((id) => coursesByInstructorId.get(id) || []),
        ...instructorKeys.flatMap((key) => coursesByInstructorKey.get(key) || []),
      ]),
    );
    const rowKey = instructorKeys[0] || normalizeInstructorKey(instructorId);

    console.log("Instructor row load", instructorId, courseLoadMap[instructorId] ?? assignedCount ?? 0);
    console.log("row instructor key", rowKey, "load", courseLoadMap[rowKey] ?? assignedCount ?? 0);

    return applyCourseLoad(instructor, assignedCount, assignedCourses);
  });
}

export function notifyFacultyAssignmentsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FACULTY_ASSIGNMENT_CHANGE_EVENT));
  }
}

export { FACULTY_ASSIGNMENT_CHANGE_EVENT };
