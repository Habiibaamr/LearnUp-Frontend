export const HOME = "/login";
export const LOGIN = "/login";
export const REGISTER = "/register";
export const ROLE_SELECTION = "/login";
export const STUDENT_DASHBOARD = "/student/dashboard";

const roleHomePaths = {
  student: "/student/dashboard",
  faculty: "/faculty/dashboard",
  instructor: "/faculty/dashboard",
  admin: "/admin/dashboard",
};

export const routePaths = {
  home: HOME,
  login: LOGIN,
  register: REGISTER,
  roleSelection: LOGIN,
  roleHome: LOGIN,
  comingSoon: LOGIN,
  studentDashboard: STUDENT_DASHBOARD,
};

export const studentNavigation = [
  {
    label: "Dashboard",
    shortLabel: "Home",
    to: "/student/dashboard",
    matchPrefix: "/student/dashboard",
  },
  {
    label: "Course board",
    shortLabel: "Courses",
    to: "/student/course-board",
    matchPrefix: "/student/course-board",
  },
  {
    label: "Academic map",
    shortLabel: "Map",
    to: "/student/academic-map",
    matchPrefix: "/student/academic-map",
  },
  {
    label: "Semester result",
    shortLabel: "Results",
    to: "/student/semester-result",
    matchPrefix: "/student/semester-result",
  },
];

export function getRoleHomePath(role) {
  return roleHomePaths[role] || LOGIN;
}

export function buildAuthRoute() {
  return LOGIN;
}
