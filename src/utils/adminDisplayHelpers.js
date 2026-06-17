const FACULTY_DUMMY_NAMES = [
  "Dr. Amira Mohamed",
  "Dr. Zekry Hassan",
  "Dr. Mona Ali",
  "Dr. Karim Samir",
  "Dr. Salma Ibrahim",
  "Dr. Ahmed Nabil",
  "Dr. Rana Mostafa",
  "Dr. Mohamed Hassan",
  "Dr. Nour Khaled",
  "Dr. Tarek Mahmoud",
  "Dr. Hany Farouk",
  "Dr. Mai Samir",
  "Dr. Sherif Galal",
  "Dr. Dina Adel",
  "Dr. Khaled Mansour",
];

const FACULTY_DEPARTMENTS = [
  "Artificial Intelligence",
  "Information System",
  "Cyber Security",
  "Computer Science",
];

const cleanText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return cleanText(
      value.full_name ||
        value.fullName ||
        value.name ||
        value.department_name ||
        value.departmentName ||
        value.title ||
        value.label ||
        value.id,
    );
  }

  return value.toString().trim();
};

const getSources = (record = {}) =>
  [record, record?.instructor, record?.faculty_member, record?.user, record?.account].filter(Boolean);

const getFirstValue = (record, keys) => {
  for (const source of getSources(record)) {
    for (const key of keys) {
      const value = source?.[key];

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  return "";
};

const normalizeDepartmentText = (value) => {
  const text = cleanText(value).toLowerCase();

  if (!text || /^(department pending|undefined|null|\[object object\])$/i.test(text)) {
    return "";
  }

  const aliases = new Map([
    ["ai", "Artificial Intelligence"],
    ["artificial intelligence", "Artificial Intelligence"],
    ["information systems", "Information System"],
    ["information system", "Information System"],
    ["cybersecurity", "Cyber Security"],
    ["cyber security", "Cyber Security"],
    ["cs", "Computer Science"],
    ["computer science", "Computer Science"],
    ["computer science & it", "Computer Science"],
    ["computer science and it", "Computer Science"],
  ]);

  return aliases.get(text) || "";
};

const getDepartmentById = (departmentId) => {
  const numericId = Number(departmentId);

  return Number.isInteger(numericId) ? FACULTY_DEPARTMENTS[numericId - 1] || "" : "";
};

export const stableHash = (value) => {
  const text = cleanText(value).toLowerCase();
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export function getStableInstructorKey(instructor = {}) {
  return cleanText(
    getFirstValue(instructor, [
      "instructor_id",
      "instructorId",
      "backendInstructorId",
      "id",
      "user_id",
      "userId",
      "faculty_member_id",
      "facultyMemberId",
      "university_id",
      "universityId",
      "email",
    ]),
  );
}

export function isDummyInstructor(instructor = {}) {
  const seedFlag = getFirstValue(instructor, ["is_seed", "isSeed", "seed", "is_demo", "demo"]);
  const normalizedSeedFlag = cleanText(seedFlag).toLowerCase();

  if (["false", "0", "no"].includes(normalizedSeedFlag)) {
    return false;
  }

  if (["true", "1", "yes", "seed", "demo"].includes(normalizedSeedFlag)) {
    return true;
  }

  const email = cleanText(getFirstValue(instructor, ["email"]));
  const fullName = cleanText(
    getFirstValue(instructor, ["rawName", "full_name", "fullName", "name"]),
  );
  const universityId = cleanText(getFirstValue(instructor, ["university_id", "universityId", "id"]));

  return (
    /^user\d+@learnup\.edu$/i.test(email) ||
    /^User\s+\d+\s+Full\s+Name$/i.test(fullName) ||
    /^U\d+$/i.test(universityId)
  );
}

export function getFacultyDisplayName(instructor = {}) {
  const rawName = cleanText(getFirstValue(instructor, ["rawName", "full_name", "fullName", "name"]));

  if (!isDummyInstructor({ ...instructor, rawName })) {
    return rawName || "Unnamed Faculty Member";
  }

  const key = getStableInstructorKey(instructor) || rawName || cleanText(getFirstValue(instructor, ["email"]));
  const stableIndex = stableHash(key) % FACULTY_DUMMY_NAMES.length;

  return FACULTY_DUMMY_NAMES[stableIndex];
}

export function getFacultyDepartmentName(instructor = {}) {
  const explicitDepartment = getFirstValue(instructor, [
    "department_name",
    "departmentName",
    "department",
    "department_label",
    "departmentLabel",
  ]);
  const explicitDepartmentName = normalizeDepartmentText(explicitDepartment);

  if (explicitDepartmentName) {
    return explicitDepartmentName;
  }

  const nestedDepartmentName = normalizeDepartmentText(getFirstValue(instructor?.department, ["name", "title", "label"]));

  if (nestedDepartmentName) {
    return nestedDepartmentName;
  }

  const departmentFromId = getDepartmentById(
    getFirstValue(instructor, ["department_id", "departmentId"]) || instructor?.department?.id,
  );

  if (departmentFromId) {
    return departmentFromId;
  }

  if (isDummyInstructor(instructor)) {
    const key = getStableInstructorKey(instructor) || getFirstValue(instructor, ["email"]);
    return FACULTY_DEPARTMENTS[stableHash(key) % FACULTY_DEPARTMENTS.length];
  }

  return "Department not specified";
}

export function getFacultyInitials(instructor = {}) {
  const displayName = getFacultyDisplayName(instructor);

  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "FM"
  );
}

export function normalizeInstructorForDisplay(instructor = {}) {
  const stableInstructorKey = getStableInstructorKey(instructor);
  const displayName = getFacultyDisplayName(instructor);
  const department = getFacultyDepartmentName(instructor);

  return {
    ...instructor,
    stableInstructorKey,
    isDemoInstructor: isDummyInstructor(instructor),
    displayName,
    display_name: displayName,
    name: displayName,
    fullName: displayName,
    department,
    initials: getFacultyInitials({ ...instructor, name: displayName }),
    label: [displayName, cleanText(getFirstValue(instructor, ["email"]))].filter(Boolean).join(" - "),
  };
}
