const DEMO_INSTRUCTOR_NAMES = [
  "Dr. Amira Ahmed",
  "Dr. Mohamed Hassan",
  "Dr. Mona Ali",
  "Dr. Karim Samir",
  "Dr. Salma Ibrahim",
  "Dr. Ahmed Nabil",
  "Dr. Rana Mostafa",
  "Dr. Youssef Adel",
  "Dr. Nour Khaled",
  "Dr. Tarek Mahmoud",
  "Dr. Hany Farouk",
  "Dr. Mai Samir",
  "Dr. Sherif Galal",
  "Dr. Dina Adel",
  "Dr. Khaled Mansour",
];

const DEMO_EMAIL_PATTERN = /^user\d+@learnup\.edu$/i;
const DEMO_NAME_PATTERN = /^User\s+\d+\s+Full\s+Name$/i;
const DEMO_UNIVERSITY_ID_PATTERN = /^U\d+$/i;
const DEFAULT_FACULTY_NAME = "Engineering & Technology";

export const cleanText = (value) => {
  if (value === undefined || value === null || typeof value === "object") {
    return "";
  }

  return value.toString().trim();
};

export const getNestedValue = (record, keys) => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key];
    }
  }

  return "";
};

const cleanDisplayValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return cleanDisplayValue(
      value.name ||
        value.title ||
        value.department_name ||
        value.departmentName ||
        value.faculty_name ||
        value.facultyName,
    );
  }

  const text = cleanText(value);

  return /^\d+$/.test(text) || /^(department|faculty)\s+pending$/i.test(text) || /^(undefined|null|\[object object\])$/i.test(text)
    ? ""
    : text;
};

export function getDepartmentDisplayName(item, fallbackIndex = 0) {
  return resolveDepartmentDisplayName(item, fallbackIndex) || DEPARTMENT_NOT_SPECIFIED;
}

export function getFacultyDisplayName(item) {
  const source = item?.instructor || item?.user || item?.account || item || {};
  const user = item?.user || source.user || {};
  const faculty =
    source.faculty ||
    item?.faculty ||
    user.faculty ||
    source.faculty_name ||
    source.facultyName ||
    item?.faculty_name ||
    item?.facultyName ||
    user.faculty_name ||
    user.facultyName;

  return cleanDisplayValue(faculty) || DEFAULT_FACULTY_NAME;
}

const toBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1 ? true : value === 0 ? false : null;
  }

  const normalized = cleanText(value).toLowerCase();

  if (["true", "1", "yes", "seed", "demo"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }

  return null;
};

const getInstructorNumericId = (record) => {
  const rawId =
    record?.backendInstructorId ??
    record?.instructorId ??
    record?.instructor_id ??
    record?.user_id ??
    record?.universityId ??
    record?.university_id ??
    record?.id;
  const numericId = Number(rawId);

  if (Number.isFinite(numericId)) {
    return numericId;
  }

  const numericMatch = cleanText(rawId).match(/\d+/);

  return numericMatch ? Number(numericMatch[0]) : null;
};

const getInstructorIdentity = (record) => {
  const source = record?.instructor || record?.user || record?.account || record || {};
  const user = record?.user || source.user || {};

  return {
    email: cleanText(record?.email || source.email || user.email),
    name: cleanText(
      record?.rawName ||
        record?.full_name ||
        record?.fullName ||
        record?.name ||
        source.full_name ||
        source.name ||
        user.full_name ||
        user.name,
    ),
    universityId: cleanText(
      record?.universityId ||
        record?.university_id ||
        source.university_id ||
        source.universityId ||
        user.university_id ||
        user.universityId ||
        (DEMO_UNIVERSITY_ID_PATTERN.test(cleanText(record?.id)) ? record.id : ""),
    ),
  };
};

export function isDemoInstructorRecord(record) {
  const seedFlag = toBoolean(record?.isSeed ?? record?.is_seed ?? record?.seed ?? record?.is_demo ?? record?.demo);
  const createdByAdminId = cleanText(record?.createdByAdminId || record?.created_by_admin_id);

  if (seedFlag === false || (createdByAdminId && createdByAdminId !== "0")) {
    return false;
  }

  if (seedFlag === true) {
    return true;
  }

  const source = cleanText(record?.source || record?.origin).toLowerCase();

  if (source && /(seed|demo|mock|sample|fixture)/.test(source)) {
    return true;
  }

  const { email, name, universityId } = getInstructorIdentity(record);
  const hasSeedEmail = DEMO_EMAIL_PATTERN.test(email);
  const hasSeedName = DEMO_NAME_PATTERN.test(name);
  const hasDemoUniversityId = DEMO_UNIVERSITY_ID_PATTERN.test(universityId);
  const hasRealLookingIdentity =
    name &&
    !hasSeedName &&
    (!email || !hasSeedEmail);

  if (hasRealLookingIdentity) {
    return false;
  }

  return hasSeedEmail || hasSeedName || hasDemoUniversityId;
}

export function getDemoInstructorDisplayName(record, fallbackIndex = 0) {
  const numericId = getInstructorNumericId(record);
  const stableIndex = numericId === null ? fallbackIndex : numericId - 1;

  return DEMO_INSTRUCTOR_NAMES[Math.abs(stableIndex) % DEMO_INSTRUCTOR_NAMES.length];
}

export function decorateInstructorDisplay(record, fallbackIndex = 0) {
  const rawName = cleanText(record.rawName || record.full_name || record.fullName || record.name);
  const isDemoInstructor = isDemoInstructorRecord({ ...record, rawName });
  const displayName = isDemoInstructor
    ? getDemoInstructorDisplayName(record, fallbackIndex)
    : rawName || "Unnamed Faculty Member";

  return {
    ...record,
    rawName,
    displayName,
    display_name: displayName,
    name: displayName,
    fullName: displayName,
    label: [displayName, cleanText(record.email)].filter(Boolean).join(" - "),
    isDemoInstructor,
    sortIndex: Number.isFinite(Number(record.sortIndex)) ? Number(record.sortIndex) : fallbackIndex,
  };
}

const getCreatedAtTime = (instructor) => {
  const createdAt = cleanText(instructor.createdAt || instructor.created_at);
  const timestamp = Date.parse(createdAt);

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getSortableInstructorId = (instructor) => {
  const numericId = Number(instructor.backendInstructorId ?? instructor.instructorId ?? instructor.instructor_id ?? instructor.id);

  return Number.isFinite(numericId) ? numericId : 0;
};

export function sortInstructorsForDemo(instructors) {
  return [...instructors].sort((first, second) => {
    if (first.isDemoInstructor !== second.isDemoInstructor) {
      return first.isDemoInstructor ? 1 : -1;
    }

    if (!first.isDemoInstructor && !second.isDemoInstructor) {
      const firstCreatedAt = getCreatedAtTime(first);
      const secondCreatedAt = getCreatedAtTime(second);

      if (firstCreatedAt || secondCreatedAt) {
        return secondCreatedAt - firstCreatedAt;
      }

      const firstId = getSortableInstructorId(first);
      const secondId = getSortableInstructorId(second);

      if (firstId || secondId) {
        return secondId - firstId;
      }
    }

    return (first.sortIndex || 0) - (second.sortIndex || 0);
  });
}
import {
  DEPARTMENT_NOT_SPECIFIED,
  getDepartmentDisplayName as resolveDepartmentDisplayName,
} from "./departments.js";
export {
  DEPARTMENT_FILTER_OPTIONS,
  DEPARTMENT_NOT_SPECIFIED,
  DEPARTMENT_OPTIONS,
  getDepartmentIdFromValue,
} from "./departments.js";
