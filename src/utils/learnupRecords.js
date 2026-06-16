import { getItem, removeItem, setItem } from "./storage.js";

const STUDENT_STORAGE_KEY = "learnup:students";
const FACULTY_STORAGE_KEY = "learnup:facultyMembers";
const ADMIN_STORAGE_KEY = "learnup:admins";
const SESSION_STORAGE_KEY = "learnup:session";
const CURRENT_USER_STORAGE_KEY = "learnup:currentUser";
const ACCESS_TOKEN_STORAGE_KEY = "learnup_access_token";
const LAST_CREATED_STUDENT_KEY = "learnup:lastCreatedStudentId";
const LAST_CREATED_FACULTY_KEY = "learnup:lastCreatedFacultyId";
const LAST_SELECTED_STUDENT_KEY = "learnup:lastSelectedStudentId";
const LAST_SELECTED_FACULTY_KEY = "learnup:lastSelectedFacultyId";

const DEFAULT_UNIVERSITY = "Egyptian Russian University";

export const ROLE_DASHBOARD_PATHS = {
  student: "/student/dashboard",
  faculty: "/faculty/dashboard",
  admin: "/admin/dashboard",
};

export const INSTITUTIONAL_EMAIL_DOMAINS = {
  student: "@eru.edu.eg",
  faculty: "@eru.ed.eg",
  admin: "@eru.ad.eg",
};

// Mock/localStorage records stay as the frontend fallback until matching backend data flows are connected.
const baseStudents = [
  {
    name: "Alex Rivera",
    email: "alex.rivera@eru.edu.eg",
    id: "#CS-225140",
    level: "Level 2",
    department: "Computer Science",
    phone: "+20 100 555 0140",
    gender: "Male",
    nationalId: "30201011234567",
    gpa: "3.82",
    academicStatus: "On track",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "90 hours",
    gradYear: "2026",
    advisor: "Dr. Amira Ahmed",
    status: "ACTIVE",
    date: "Sep 01, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Ahmed Ayman",
    email: "ahmed@uni.edu",
    id: "#STU-225140",
    level: "Level 1",
    department: "Computer Science",
    phone: "+20 100 000 2251",
    gender: "Male",
    nationalId: "505903044134",
    gpa: "3.2",
    academicStatus: "Active",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "18 hours",
    gradYear: "2029",
    status: "ACTIVE",
    date: "Aug 28, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Jordan Henderson",
    email: "j.henderson@uni.edu",
    id: "#STU-225120",
    level: "Level 4",
    department: "Artificial Intelligence",
    gpa: "3.48",
    academicStatus: "To be graduated",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "102 hours",
    gradYear: "2026",
    status: "ACTIVE",
    date: "Aug 29, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Elena Rodriguez",
    email: "e.rodriguez@uni.edu",
    id: "#STU-225122",
    level: "Level 2",
    department: "Information Systems",
    gpa: "3.12",
    academicStatus: "Active",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "48 hours",
    gradYear: "2028",
    status: "ACTIVE",
    date: "Aug 30, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Marcus Aurelius",
    email: "m.aurelius@uni.edu",
    id: "#STU-225144",
    level: "Level 4",
    department: "Cyber Security",
    gpa: "3.64",
    academicStatus: "Active",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "96 hours",
    gradYear: "2026",
    status: "ACTIVE",
    date: "Sep 01, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Sarah Jenkins",
    email: "s.jenkins@uni.edu",
    id: "#STU-225130",
    level: "Level 1",
    department: "Computer Science",
    gpa: "2.74",
    academicStatus: "Active",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "20 hours",
    gradYear: "2029",
    status: "ACTIVE",
    date: "Sep 02, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Omar Khalid",
    email: "o.khalid@uni.edu",
    id: "#STU-225123",
    level: "Level 4",
    department: "Artificial Intelligence",
    gpa: "3.7",
    academicStatus: "To be graduated",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "104 hours",
    gradYear: "2026",
    status: "ACTIVE",
    date: "Sep 03, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Layla Mansour",
    email: "l.mansour@uni.edu",
    id: "#STU-225013",
    level: "Level 3",
    department: "Information Systems",
    gpa: "3.34",
    academicStatus: "Active",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "72 hours",
    gradYear: "2027",
    status: "ACTIVE",
    date: "Sep 04, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Zaid Ahmed",
    email: "z.ahmed@uni.edu",
    id: "#STU-225234",
    level: "Level 2",
    department: "Cyber Security",
    gpa: "2.95",
    academicStatus: "Active",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "42 hours",
    gradYear: "2028",
    status: "ACTIVE",
    date: "Sep 05, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Sarah Miller",
    email: "sarah.m@learnup.edu",
    id: "#UP-9021",
    level: "Level 4",
    department: "Computer Science",
    gpa: "3.85",
    academicStatus: "Excellent",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "108 hours",
    gradYear: "2026",
    status: "EXCELLENT",
    date: "Sep 06, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "Alex Smith",
    email: "alex.s@learnup.edu",
    id: "#UP-1209",
    level: "Level 3",
    department: "Computer Science",
    gpa: "1.80",
    academicStatus: "At risk",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "66 hours",
    gradYear: "2027",
    status: "AT RISK",
    date: "Sep 07, 2026",
    term: "Fall Semester 2026",
  },
  {
    name: "James Lee",
    email: "james.l@learnup.edu",
    id: "#UP-4432",
    level: "Level 2",
    department: "Computer Science",
    gpa: "3.12",
    academicStatus: "Normal",
    enrollmentStatus: "Enrolled",
    totalHoursPassed: "45 hours",
    gradYear: "2028",
    status: "NORMAL",
    date: "Sep 08, 2026",
    term: "Fall Semester 2026",
  },
];

const baseFacultyMembers = [
  {
    name: "Dr. Amira Ahmed",
    email: "amira.ahmed@eru.ed.eg",
    id: "#FAC-225140",
    department: "Computer Science & IT",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 0140",
    gender: "Female",
    nationalId: "29804151234567",
    title: "Senior Lecturer",
    role: "Faculty Member",
    specialization: "Data Science & AI",
    location: "Building B, Office 214",
    status: "ACTIVE",
    load: "2/3",
    progress: 66,
  },
  {
    name: "Dr. Sarah Jenkins",
    email: "s.jenkins@eduadmin.com",
    id: "#FAC-4421",
    department: "COMPUTER SCIENCE",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 4421",
    title: "Lecturer",
    role: "Faculty Member",
    specialization: "Human-Computer Interaction",
    location: "Building C, Office 101",
    status: "AVAILABLE",
    load: "1/3",
    progress: 33,
  },
  {
    name: "Prof. Michael Chen",
    email: "m.chen@eduadmin.com",
    id: "#FAC-8829",
    department: "COMPUTER SCIENCE",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 8829",
    title: "Professor",
    role: "Faculty Member",
    specialization: "Distributed Systems",
    location: "Building C, Office 204",
    status: "ACTIVE",
    load: "2/3",
    progress: 66,
  },
  {
    name: "Dr. Elena Rodriguez",
    email: "e.rod@eduadmin.com",
    id: "#FAC-1104",
    department: "COMPUTER SCIENCE",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 1104",
    title: "Senior Lecturer",
    role: "Faculty Member",
    specialization: "Cyber Security",
    location: "Building C, Office 305",
    status: "FULL",
    load: "3/3",
    progress: 100,
  },
  {
    name: "Prof. David Wilson",
    email: "d.wilson@eduadmin.com",
    id: "#FAC-9923",
    department: "COMPUTER SCIENCE",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 9923",
    title: "Professor",
    role: "Faculty Member",
    specialization: "Software Engineering",
    location: "Building A, Office 118",
    status: "AVAILABLE",
    load: "1/3",
    progress: 33,
  },
  {
    name: "Prof. Sarah Mitchell",
    email: "s.mitchell@eduadmin.com",
    id: "#FAC-2022",
    department: "COMPUTER SCIENCE",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 2022",
    title: "Professor",
    role: "Faculty Member",
    specialization: "Algorithms",
    location: "Building A, Office 219",
    status: "AVAILABLE",
    load: "1/3",
    progress: 33,
  },
  {
    name: "Dr. Arjun Kapoor",
    email: "a.kapoor@eduadmin.com",
    id: "#FAC-1105",
    department: "COMPUTER SCIENCE",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 1105",
    title: "Senior Lecturer",
    role: "Faculty Member",
    specialization: "Artificial Intelligence",
    location: "Building B, Office 307",
    status: "FULL",
    load: "3/3",
    progress: 100,
  },
  {
    name: "Prof. Elena Rodriguez",
    email: "e.rodriguez@eduadmin.com",
    id: "#FAC-8830",
    department: "COMPUTER SCIENCE",
    faculty: "Engineering & Technology",
    phone: "+20 100 222 8830",
    title: "Professor",
    role: "Faculty Member",
    specialization: "Database Systems",
    location: "Building B, Office 303",
    status: "ACTIVE",
    load: "2/3",
    progress: 66,
  },
];

const baseAdmins = [
  {
    name: "Executive Admin",
    email: "admin@eru.ad.eg",
    id: "#ADM-0001",
    role: "Admin",
    title: "Platform Administrator",
  },
];

const clean = (value) => value?.toString().trim() ?? "";

const normalizeKey = (value) => clean(value).toLowerCase();

export const encodeRecordId = (id) => encodeURIComponent(clean(id));

export const getInitials = (name = "") =>
  clean(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "LU";

const normalizeStudent = (student) => {
  const fullName = clean(student.fullName || student.name) || "Unnamed Student";
  const id = clean(student.studentId || student.id) || generateStudentId();

  return {
    university: clean(student.university) || DEFAULT_UNIVERSITY,
    name: fullName,
    fullName,
    email: clean(student.email),
    id,
    studentId: id,
    phone: clean(student.phone),
    gender: clean(student.gender),
    nationalId: clean(student.nationalId),
    initialPassword: clean(student.initialPassword || student.password),
    level: clean(student.level) || "Level 1",
    department: clean(student.department) || "Computer Science",
    gpa: clean(student.gpa) || "0.0",
    academicStatus: clean(student.academicStatus) || "Newly enrolled",
    enrollmentStatus: clean(student.enrollmentStatus) || "Enrolled",
    totalHoursPassed: clean(student.totalHoursPassed) || "0 hours",
    gradYear: clean(student.gradYear) || "2029",
    advisor: clean(student.advisor) || "Pending assignment",
    status: clean(student.status) || "ACTIVE",
    date: clean(student.date) || new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    term: clean(student.term) || "Fall Semester 2026",
    avatar: student.avatar || "",
  };
};

const normalizeFaculty = (faculty) => {
  const fullName = clean(faculty.fullName || faculty.name) || "Unnamed Faculty Member";
  const id = clean(faculty.facultyId || faculty.instructorId || faculty.id) || generateFacultyId();
  const courseLoad = clean(faculty.courseLoad || faculty.load) || "1/3";
  const [currentLoad, totalLoad] = courseLoad.split("/").map(Number);
  const computedProgress =
    Number.isFinite(currentLoad) && Number.isFinite(totalLoad) && totalLoad > 0
      ? Math.min(100, Math.round((currentLoad / totalLoad) * 100))
      : 33;
  const assignedCourses = Array.isArray(faculty.assignedCourses)
    ? faculty.assignedCourses.map(clean).filter(Boolean)
    : clean(faculty.assignedCourses)
      .split(",")
      .map(clean)
      .filter(Boolean);

  return {
    name: fullName,
    fullName,
    email: clean(faculty.email),
    id,
    facultyId: id,
    instructorId: id,
    phone: clean(faculty.phone),
    gender: clean(faculty.gender),
    nationalId: clean(faculty.nationalId),
    initialPassword: clean(faculty.initialPassword || faculty.password),
    department: clean(faculty.department) || "Computer Science & IT",
    faculty: clean(faculty.faculty) || "Engineering & Technology",
    title: clean(faculty.title || faculty.academicPosition || faculty.position) || "Faculty Member",
    academicPosition: clean(faculty.academicPosition || faculty.title || faculty.position) || "Faculty Member",
    role: clean(faculty.role) || "Faculty Member",
    specialization: clean(faculty.specialization) || "General Computing",
    location: clean(faculty.location) || "Campus office pending",
    load: courseLoad,
    courseLoad,
    assignedCourses,
    progress: Number.isFinite(Number(faculty.progress)) ? Number(faculty.progress) : computedProgress,
    status: clean(faculty.status) || "ACTIVE",
  };
};

const normalizeAdmin = (admin) => {
  const fullName = clean(admin.fullName || admin.name) || "Executive Admin";
  const id = clean(admin.adminId || admin.id) || "#ADM-0001";

  return {
    name: fullName,
    fullName,
    email: clean(admin.email),
    id,
    adminId: id,
    role: clean(admin.role) || "Admin",
    title: clean(admin.title) || "Platform Administrator",
    initialPassword: clean(admin.initialPassword || admin.password),
  };
};

const mergeRecords = (baseRecords, storedRecords, normalize) => {
  const records = new Map();

  (Array.isArray(storedRecords) ? storedRecords : []).map(normalize).forEach((record) => {
    records.set(normalizeKey(record.id), record);
  });

  baseRecords.map(normalize).forEach((record) => {
    if (!records.has(normalizeKey(record.id))) {
      records.set(normalizeKey(record.id), record);
    }
  });

  return Array.from(records.values());
};

export function getStudents() {
  return mergeRecords(baseStudents, getItem(STUDENT_STORAGE_KEY), normalizeStudent);
}

export function getFacultyMembers() {
  return mergeRecords(baseFacultyMembers, getItem(FACULTY_STORAGE_KEY), normalizeFaculty);
}

export function getAdmins() {
  return mergeRecords(baseAdmins, getItem(ADMIN_STORAGE_KEY), normalizeAdmin);
}

export function findStudentById(id) {
  const key = normalizeKey(id);
  return getStudents().find((student) => normalizeKey(student.id) === key) || null;
}

export function findStudentByEmail(email) {
  const key = normalizeKey(email);
  return (
    getStudents().find((student) => normalizeKey(student.email) === key) ||
    baseStudents.map(normalizeStudent).find((student) => normalizeKey(student.email) === key) ||
    null
  );
}

export function findFacultyById(id) {
  const key = normalizeKey(id);
  return getFacultyMembers().find((faculty) => normalizeKey(faculty.id) === key) || null;
}

export function findFacultyByEmail(email) {
  const key = normalizeKey(email);
  return (
    getFacultyMembers().find((faculty) => normalizeKey(faculty.email) === key) ||
    baseFacultyMembers.map(normalizeFaculty).find((faculty) => normalizeKey(faculty.email) === key) ||
    null
  );
}

export function findAdminByEmail(email) {
  const key = normalizeKey(email);
  return (
    getAdmins().find((admin) => normalizeKey(admin.email) === key) ||
    baseAdmins.map(normalizeAdmin).find((admin) => normalizeKey(admin.email) === key) ||
    null
  );
}

export function detectRoleFromEmail(email) {
  const emailKey = normalizeKey(email);

  if (emailKey.endsWith(INSTITUTIONAL_EMAIL_DOMAINS.student)) {
    return "student";
  }

  if (emailKey.endsWith(INSTITUTIONAL_EMAIL_DOMAINS.faculty)) {
    return "faculty";
  }

  if (emailKey.endsWith(INSTITUTIONAL_EMAIL_DOMAINS.admin)) {
    return "admin";
  }

  return null;
}

export function getDashboardPathForRole(role) {
  return ROLE_DASHBOARD_PATHS[role] || "/login";
}

export function findAccountByRoleAndEmail(role, email) {
  if (role === "student") {
    const student = findStudentByEmail(email);

    if (student) {
      return student;
    }

    const registeredUser = getItem("user");

    if (normalizeKey(registeredUser?.email) === normalizeKey(email) && clean(registeredUser?.fullName)) {
      return saveStudentRecord(
        {
          fullName: registeredUser.fullName,
          email: registeredUser.email,
          studentId: generateStudentId(),
          department: "Computer Science",
          level: "Level 1",
          enrollmentStatus: "Enrolled",
        },
        { markCreated: false },
      );
    }

    return null;
  }

  if (role === "faculty") {
    return findFacultyByEmail(email);
  }

  if (role === "admin") {
    return findAdminByEmail(email);
  }

  return null;
}

const getNameFromEmail = (email, fallback) => {
  const localPart = clean(email).split("@")[0];
  const name = localPart
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

  return name || fallback;
};

export function getOrCreateDemoAccountForLogin(role, email) {
  const existingAccount = findAccountByRoleAndEmail(role, email);

  if (existingAccount) {
    return existingAccount;
  }

  // Temporary demo authentication: create local mock users from valid institutional emails.
  // Replace this with a backend API login once real authentication is implemented.
  if (role === "student") {
    return saveStudentRecord(
      {
        fullName: getNameFromEmail(email, "Demo Student"),
        email,
        studentId: generateStudentId(),
        department: "Computer Science",
        level: "Level 1",
        enrollmentStatus: "Enrolled",
      },
      { markCreated: false },
    );
  }

  if (role === "faculty") {
    return saveFacultyRecord(
      {
        fullName: getNameFromEmail(email, "Demo Faculty Member"),
        email,
        facultyId: generateFacultyId(),
        department: "Computer Science & IT",
        faculty: "Engineering & Technology",
        title: "Faculty Member",
        role: "Faculty Member",
        status: "ACTIVE",
      },
      { markCreated: false },
    );
  }

  if (role === "admin") {
    return saveAdminRecord({
      fullName: getNameFromEmail(email, "Demo Admin"),
      email,
      adminId: generateAdminId(),
      role: "Admin",
      title: "Platform Administrator",
    });
  }

  return null;
}

export function saveStudentRecord(studentPayload, { markCreated = true } = {}) {
  const student = normalizeStudent(studentPayload);
  const storedStudents = Array.isArray(getItem(STUDENT_STORAGE_KEY))
    ? getItem(STUDENT_STORAGE_KEY)
    : [];
  const existingIndex = storedStudents.findIndex(
    (storedStudent) => normalizeKey(storedStudent.id || storedStudent.studentId) === normalizeKey(student.id),
  );
  const nextStudents = [...storedStudents];

  if (existingIndex >= 0) {
    nextStudents[existingIndex] = student;
  } else {
    nextStudents.unshift(student);
  }

  setItem(STUDENT_STORAGE_KEY, nextStudents);

  if (markCreated) {
    setItem(LAST_CREATED_STUDENT_KEY, student.id);
  }

  setItem(LAST_SELECTED_STUDENT_KEY, student.id);

  return student;
}

export function saveFacultyRecord(facultyPayload, { markCreated = true } = {}) {
  const faculty = normalizeFaculty(facultyPayload);
  const storedFaculty = Array.isArray(getItem(FACULTY_STORAGE_KEY))
    ? getItem(FACULTY_STORAGE_KEY)
    : [];
  const existingIndex = storedFaculty.findIndex(
    (storedMember) => normalizeKey(storedMember.id || storedMember.facultyId) === normalizeKey(faculty.id),
  );
  const nextFaculty = [...storedFaculty];

  if (existingIndex >= 0) {
    nextFaculty[existingIndex] = faculty;
  } else {
    nextFaculty.unshift(faculty);
  }

  setItem(FACULTY_STORAGE_KEY, nextFaculty);

  if (markCreated) {
    setItem(LAST_CREATED_FACULTY_KEY, faculty.id);
  }

  setItem(LAST_SELECTED_FACULTY_KEY, faculty.id);

  return faculty;
}

export function saveAdminRecord(adminPayload) {
  const admin = normalizeAdmin(adminPayload);
  const storedAdmins = Array.isArray(getItem(ADMIN_STORAGE_KEY))
    ? getItem(ADMIN_STORAGE_KEY)
    : [];
  const existingIndex = storedAdmins.findIndex(
    (storedAdmin) => normalizeKey(storedAdmin.id || storedAdmin.adminId) === normalizeKey(admin.id),
  );
  const nextAdmins = [...storedAdmins];

  if (existingIndex >= 0) {
    nextAdmins[existingIndex] = admin;
  } else {
    nextAdmins.unshift(admin);
  }

  setItem(ADMIN_STORAGE_KEY, nextAdmins);
  return admin;
}

export function getLastCreatedStudent() {
  return findStudentById(getItem(LAST_CREATED_STUDENT_KEY));
}

export function getLastCreatedFaculty() {
  return findFacultyById(getItem(LAST_CREATED_FACULTY_KEY));
}

export function getSelectedStudent() {
  return findStudentById(getItem(LAST_SELECTED_STUDENT_KEY));
}

export function setSelectedStudentId(id) {
  if (id) {
    setItem(LAST_SELECTED_STUDENT_KEY, id);
  }
}

export function getSelectedFaculty() {
  return findFacultyById(getItem(LAST_SELECTED_FACULTY_KEY));
}

export function setSelectedFacultyId(id) {
  if (id) {
    setItem(LAST_SELECTED_FACULTY_KEY, id);
  }
}

export function generateStudentId() {
  return `#STU-${Date.now().toString().slice(-6)}`;
}

export function generateFacultyId() {
  return `#FAC-${Date.now().toString().slice(-6)}`;
}

export function generateAdminId() {
  return `#ADM-${Date.now().toString().slice(-6)}`;
}

export function getCurrentSession() {
  return getItem(SESSION_STORAGE_KEY);
}

export function getCurrentRole() {
  return getCurrentSession()?.role || null;
}

export function setCurrentSession(role, payload = {}) {
  const normalizedRole = role === "instructor" ? "faculty" : role;
  const session = {
    role: normalizedRole,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  setItem(SESSION_STORAGE_KEY, session);
  setItem(CURRENT_USER_STORAGE_KEY, session);
  return session;
}

export function clearCurrentSession() {
  removeItem(SESSION_STORAGE_KEY);
  removeItem(CURRENT_USER_STORAGE_KEY);
  removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function resolveStudentForSession(email) {
  const emailKey = normalizeKey(email);

  if (emailKey) {
    const matchingStudent = findStudentByEmail(email);

    if (matchingStudent) {
      return matchingStudent;
    }

    const registeredUser = getItem("user");

    if (normalizeKey(registeredUser?.email) === emailKey && clean(registeredUser?.fullName)) {
      return saveStudentRecord(
        {
          fullName: registeredUser.fullName,
          email: registeredUser.email,
          studentId: generateStudentId(),
          department: "Computer Science",
          level: "Level 1",
          enrollmentStatus: "Enrolled",
        },
        { markCreated: false },
      );
    }

    return getStudents()[0] || null;
  }

  return getSelectedStudent() || getStudents()[0] || null;
}

export function resolveFacultyForSession(email) {
  if (normalizeKey(email)) {
    return findFacultyByEmail(email) || getFacultyMembers()[0] || null;
  }

  return getSelectedFaculty() || getFacultyMembers()[0] || null;
}
