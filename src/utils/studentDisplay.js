import { cleanText, getNestedValue } from "./instructorDisplay.js";

const DEMO_STUDENT_NAMES = [
  "Ahmed Hassan",
  "Omar Khaled",
  "Youssef Mohamed",
  "Mahmoud Ali",
  "Mariam Ahmed",
  "Salma Mostafa",
  "Nourhan Adel",
  "Jana Tarek",
  "Abdelrahman Samir",
  "Farida Yasser",
  "Karim Nabil",
  "Nada Ibrahim",
  "Hana Mahmoud",
  "Zeyad Amr",
  "Malak Hany",
  "Mostafa Gamal",
  "Ali Sherif",
  "Laila Ashraf",
  "Habiba Sameh",
  "Seif Adel",
];

const DEMO_EMAIL_PATTERN = /^user\d+@learnup\.edu$/i;
const DEMO_NAME_PATTERN = /^User\s+\d+\s+Full\s+Name$/i;
const DEMO_UNIVERSITY_ID_PATTERN = /^U\d+$/i;

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

const getStudentNumericId = (student) => {
  const rawId =
    student?.backendStudentId ??
    student?.student_id ??
    student?.studentId ??
    student?.user_id ??
    student?.universityId ??
    student?.university_id ??
    student?.id;
  const numericId = Number(rawId);

  if (Number.isFinite(numericId)) {
    return numericId;
  }

  const numericMatch = cleanText(rawId).match(/\d+/);

  return numericMatch ? Number(numericMatch[0]) : null;
};

export function isDemoStudentRecord(record) {
  const seedFlag = toBoolean(record?.isSeed ?? record?.is_seed ?? record?.seed ?? record?.is_demo ?? record?.demo);
  const createdByAdminId = cleanText(record?.createdByAdminId || record?.created_by_admin_id);

  if (seedFlag === false || (createdByAdminId && createdByAdminId !== "0")) {
    return false;
  }

  if (seedFlag === true) {
    return true;
  }

  const source = record?.student || record?.user || record?.account || record || {};
  const email = cleanText(record?.email || source.email);
  const name = cleanText(
    record?.rawName ||
      record?.full_name ||
      record?.fullName ||
      record?.name ||
      source.full_name ||
      source.name,
  );
  const universityId = cleanText(
    record?.universityId ||
      record?.university_id ||
      source.university_id ||
      source.universityId ||
      (DEMO_UNIVERSITY_ID_PATTERN.test(cleanText(record?.id)) ? record.id : ""),
  );
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

export function getDemoStudentDisplayName(record, fallbackIndex = 0) {
  const numericId = getStudentNumericId(record);
  const stableIndex = numericId === null ? fallbackIndex : numericId - 1;

  return DEMO_STUDENT_NAMES[Math.abs(stableIndex) % DEMO_STUDENT_NAMES.length];
}

export function decorateStudentDisplay(record, fallbackIndex = 0) {
  const rawName = cleanText(record.rawName || record.full_name || record.fullName || record.name);
  const isDemoStudent = isDemoStudentRecord({ ...record, rawName });
  const displayName = isDemoStudent
    ? getDemoStudentDisplayName(record, fallbackIndex)
    : rawName || "Unnamed Student";

  return {
    ...record,
    rawName,
    displayName,
    display_name: displayName,
    name: displayName,
    fullName: displayName,
    isDemoStudent,
    sortIndex: Number.isFinite(Number(record.sortIndex)) ? Number(record.sortIndex) : fallbackIndex,
  };
}

const getCreatedAtTime = (record) => {
  const timestamp = Date.parse(cleanText(record.createdAt || record.created_at));

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getSortableStudentId = (record) => getStudentNumericId(record) || 0;

export function sortStudentsForDemo(students) {
  return [...students].sort((first, second) => {
    if (first.isDemoStudent !== second.isDemoStudent) {
      return first.isDemoStudent ? 1 : -1;
    }

    if (!first.isDemoStudent && !second.isDemoStudent) {
      const firstCreatedAt = getCreatedAtTime(first);
      const secondCreatedAt = getCreatedAtTime(second);

      if (firstCreatedAt || secondCreatedAt) {
        return secondCreatedAt - firstCreatedAt;
      }

      const firstId = getSortableStudentId(first);
      const secondId = getSortableStudentId(second);

      if (firstId || secondId) {
        return secondId - firstId;
      }
    }

    return (first.sortIndex || 0) - (second.sortIndex || 0);
  });
}

export { getNestedValue };
