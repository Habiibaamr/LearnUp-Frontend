export const DEPARTMENT_NOT_SPECIFIED = "Department not specified";

export const DEPARTMENT_OPTIONS = [
  { id: 1, label: "AI", name: "Artificial Intelligence", code: "AI" },
  { id: 2, label: "Information System", name: "Information System", code: "IS" },
  { id: 3, label: "Cyber Security", name: "Cyber Security", code: "CY" },
  { id: 4, label: "CS", name: "Computer Science", code: "CS" },
];

export const DEPARTMENT_FILTER_OPTIONS = [
  "All Departments",
  ...DEPARTMENT_OPTIONS.map((department) => department.label),
];

const DEPARTMENT_BY_ID = new Map(DEPARTMENT_OPTIONS.map((department) => [department.id, department]));
const DEPARTMENT_BY_ALIAS = new Map(
  DEPARTMENT_OPTIONS.flatMap((department) => [
    [department.label.toLowerCase(), department],
    [department.name.toLowerCase(), department],
    [department.code.toLowerCase(), department],
  ]),
);

[
  ["artificial intelligence department", 1],
  ["information systems", 2],
  ["information system department", 2],
  ["cybersecurity", 3],
  ["cyber security department", 3],
  ["computer science & it", 4],
  ["computer science and it", 4],
  ["computer science it", 4],
  ["computer science department", 4],
  ["computer science", 4],
].forEach(([alias, id]) => {
  DEPARTMENT_BY_ALIAS.set(alias, DEPARTMENT_BY_ID.get(id));
});

const cleanValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return cleanValue(
      value.department_name ||
        value.departmentName ||
        value.name ||
        value.title ||
        value.label ||
        value.code ||
        value.id,
    );
  }

  return value.toString().trim();
};

const getNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getFirstNumber = (...values) => {
  for (const value of values) {
    const numeric = getNumber(value);

    if (numeric !== null) {
      return numeric;
    }
  }

  return null;
};

const getNestedRecordSources = (record = {}) =>
  [record, record?.student, record?.instructor, record?.user, record?.account, record?.faculty_member].filter(Boolean);

const getSeedIdentity = (record = {}) => {
  const sources = getNestedRecordSources(record);

  return {
    email: sources.map((source) => cleanValue(source.email)).find(Boolean) || "",
    name: sources
      .map((source) => cleanValue(source.rawName || source.full_name || source.fullName || source.name))
      .find(Boolean) || "",
    universityId: sources
      .map((source) => cleanValue(source.university_id || source.universityId || source.id))
      .find(Boolean) || "",
  };
};

const isDemoRecord = (record) => {
  const { email, name, universityId } = getSeedIdentity(record);

  return (
    /^user\d+@learnup\.edu$/i.test(email) ||
    /^User\s+\d+\s+Full\s+Name$/i.test(name) ||
    /^U\d+$/i.test(universityId)
  );
};

const getStableDepartmentLabel = (record, fallbackIndex = 0) => {
  const sources = getNestedRecordSources(record);
  const numericId =
    getFirstNumber(
      ...sources.flatMap((source) => [
        source.department_id,
        source.departmentId,
        source.instructor_id,
        source.student_id,
        source.user_id,
        source.id,
      ]),
    ) ?? fallbackIndex;
  const index = Math.abs(numericId) % DEPARTMENT_OPTIONS.length;

  return DEPARTMENT_OPTIONS[index].label;
};

export const getDepartmentLabelById = (departmentId) => {
  const department = DEPARTMENT_BY_ID.get(Number(departmentId));
  return department?.label || "";
};

export const getDepartmentNameById = (departmentId) => {
  const department = DEPARTMENT_BY_ID.get(Number(departmentId));
  return department?.name || "";
};

export const getDepartmentIdFromValue = (value, fallbackId = 1) => {
  const numeric = getNumber(value);

  if (DEPARTMENT_BY_ID.has(numeric)) {
    return numeric;
  }

  if (typeof value === "object" && value !== null) {
    const nestedId = getDepartmentIdFromValue(
      value.department_id ?? value.departmentId ?? value.id ?? value.code ?? value.name ?? value.label,
      null,
    );

    return nestedId ?? fallbackId;
  }

  const text = cleanValue(value).toLowerCase();
  const department = DEPARTMENT_BY_ALIAS.get(text);

  return department?.id ?? fallbackId;
};

export const normalizeDepartmentLabel = (value) => {
  const numeric = getNumber(value);

  if (DEPARTMENT_BY_ID.has(numeric)) {
    return getDepartmentLabelById(numeric);
  }

  const text = cleanValue(value).toLowerCase();
  const department = DEPARTMENT_BY_ALIAS.get(text);

  return department?.label || "";
};

export const getDepartmentDisplayName = (record, fallbackIndex = 0) => {
  const sources = getNestedRecordSources(record);

  for (const source of sources) {
    const explicitLabel = normalizeDepartmentLabel(
      source.department_name ??
        source.departmentName ??
        source.department ??
        source.department_label ??
        source.departmentLabel,
    );

    if (explicitLabel) {
      return explicitLabel;
    }
  }

  for (const source of sources) {
    const labelFromId = getDepartmentLabelById(
      source.department_id ?? source.departmentId ?? source.department?.id,
    );

    if (labelFromId) {
      return labelFromId;
    }
  }

  return isDemoRecord(record) ? getStableDepartmentLabel(record, fallbackIndex) : DEPARTMENT_NOT_SPECIFIED;
};
