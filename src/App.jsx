import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPassword from "./pages/auth/forgotPassword/ForgotPassword.jsx";
import AssignInstructorPage from "./pages/admin/dashboard/assignInstructor/AssignInstructor.jsx";
import AssignmentSuccessPage from "./pages/admin/dashboard/assignInstructor/AssignmentSuccess.jsx";
import CreateInstructor from "./pages/admin/dashboard/createInstructor/CreateInstructor.jsx";
import InstructorSuccessPage from "./pages/admin/dashboard/createInstructor/InstructorSuccessPage.jsx";
import CreateStudent from "./pages/admin/dashboard/createStudent/CreateStudent.jsx";
import StudentCreated from "./pages/admin/dashboard/createStudent/StudentCreated.jsx";
import StudentsEnrolled from "./pages/admin/studentsEnrolled/StudentsEnrolled.jsx";
import Dashboard from "./pages/admin/dashboard/Dashboard.jsx";
import StudentDashboard from "./pages/student/dashboard/StudentDashboard.jsx";
import CourseBoard from "./pages/student/courseBoard/CourseBoard.jsx";
import AcademicMap from "./pages/student/academicMap/AcademicMap.jsx";
import SemesterResult from "./pages/student/semesterResult/SemesterResult.jsx";
import AcademicAdvisorBot from "./pages/student/academicAdvisorBot/AcademicAdvisorBot.jsx";
import StudentProfile from "./pages/student/profile/StudentProfile.jsx";
import FacultyProfile from "./pages/faculty/profile/FacultyProfile.jsx";
import AdminProfile from "./pages/admin/profile/AdminProfile.jsx";
import FacultyDashboard from "./pages/faculty/dashboard/FacultyDashboard.jsx";
import FacultyStudents from "./pages/faculty/students/FacultyStudents.jsx";
import FacultyCourseBoard from "./pages/faculty/courseBoard/FacultyCourseBoard.jsx";
import CourseStudents from "./pages/faculty/courseStudents/CourseStudents.jsx";
import EnrollStudent from "./pages/faculty/enrollStudent/EnrollStudent.jsx";
import EnrollmentSuccess from "./pages/faculty/enrollStudent/EnrollmentSuccess.jsx";
import { getCurrentSession, getDashboardPathForRole } from "./utils/learnupRecords.js";

function RequireRole({ role, children }) {
  const session = getCurrentSession();

  if (!session?.role) {
    return <Navigate to="/login" replace />;
  }

  if (session.role !== role) {
    return <Navigate to={getDashboardPathForRole(session.role)} replace />;
  }

  return children;
}

function LegacyAdminRedirect({ to, paramName }) {
  const params = useParams();
  const suffix = paramName && params[paramName] ? `/${params[paramName]}` : "";

  return <Navigate to={`${to}${suffix}`} replace />;
}

const requireRole = (role, element) => (
  <RequireRole role={role}>
    {element}
  </RequireRole>
);

export function LearnUpRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/who-are-you" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/faculty/login" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-account" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/assign-instructor" element={<Navigate to="/admin/assign-instructor" replace />} />
        <Route path="/assignment-success" element={<Navigate to="/admin/assignment-success" replace />} />
        <Route path="/create-instructor" element={<Navigate to="/admin/create-instructor" replace />} />
        <Route path="/create-student" element={<Navigate to="/admin/create-student" replace />} />
        <Route path="/student-created" element={<Navigate to="/admin/student-created" replace />} />
        <Route
          path="/student-created/:studentId"
          element={<LegacyAdminRedirect to="/admin/student-created" paramName="studentId" />}
        />
        <Route path="/instructor-created" element={<Navigate to="/admin/instructor-created" replace />} />
        <Route
          path="/instructor-created/:facultyId"
          element={<LegacyAdminRedirect to="/admin/instructor-created" paramName="facultyId" />}
        />
        <Route path="/instructor-profile" element={<Navigate to="/admin/faculty/profile" replace />} />

        <Route path="/admin/dashboard" element={requireRole("admin", <Dashboard />)} />
        <Route path="/admin/profile" element={requireRole("admin", <AdminProfile />)} />
        <Route path="/admin/create-student" element={requireRole("admin", <CreateStudent />)} />
        <Route path="/admin/create-instructor" element={requireRole("admin", <CreateInstructor />)} />
        <Route
          path="/admin/create-instructor-profile"
          element={requireRole("admin", <CreateInstructor initialModalOpen />)}
        />
        <Route path="/admin/assign-instructor" element={requireRole("admin", <AssignInstructorPage />)} />
        <Route path="/admin/assignment-success" element={requireRole("admin", <AssignmentSuccessPage />)} />
        <Route path="/admin/students-enrolled" element={requireRole("admin", <StudentsEnrolled />)} />
        <Route path="/admin/student-created" element={requireRole("admin", <StudentCreated />)} />
        <Route path="/admin/student-created/:studentId" element={requireRole("admin", <StudentCreated />)} />
        <Route path="/admin/instructor-created" element={requireRole("admin", <InstructorSuccessPage />)} />
        <Route path="/admin/instructor-created/:facultyId" element={requireRole("admin", <InstructorSuccessPage />)} />
        <Route path="/admin/student/profile" element={requireRole("admin", <StudentProfile />)} />
        <Route path="/admin/student/profile/:studentId" element={requireRole("admin", <StudentProfile />)} />
        <Route path="/admin/faculty/profile" element={requireRole("admin", <FacultyProfile />)} />
        <Route path="/admin/faculty/profile/:facultyId" element={requireRole("admin", <FacultyProfile />)} />
        <Route
          path="/admin/academic-advisor-bot"
          element={requireRole("admin", <Navigate to="/admin/dashboard" replace />)}
        />

        <Route path="/student/dashboard" element={requireRole("student", <StudentDashboard />)} />
        <Route path="/student/course-board" element={requireRole("student", <CourseBoard />)} />
        <Route path="/student/academic-map" element={requireRole("student", <AcademicMap />)} />
        <Route path="/student/semester-result" element={requireRole("student", <SemesterResult />)} />
        <Route path="/student/academic-advisor-bot" element={requireRole("student", <AcademicAdvisorBot />)} />
        <Route path="/student/profile" element={requireRole("student", <StudentProfile />)} />
        <Route path="/student/profile/:studentId" element={requireRole("student", <StudentProfile />)} />

        <Route path="/faculty/dashboard" element={requireRole("faculty", <FacultyDashboard />)} />
        <Route path="/faculty/students" element={requireRole("faculty", <FacultyStudents />)} />
        <Route path="/faculty/course-board" element={requireRole("faculty", <FacultyCourseBoard />)} />
        <Route path="/faculty/courses/:courseCode/students" element={requireRole("faculty", <CourseStudents />)} />
        <Route path="/faculty/courses/:courseCode/enroll" element={requireRole("faculty", <EnrollStudent />)} />
        <Route
          path="/faculty/courses/:courseCode/enroll/success"
          element={requireRole("faculty", <EnrollmentSuccess />)}
        />
        <Route
          path="/faculty/courses/:courseCode/enrollment-success"
          element={requireRole("faculty", <EnrollmentSuccess />)}
        />
        <Route path="/faculty/profile" element={requireRole("faculty", <FacultyProfile />)} />
        <Route path="/faculty/profile/:facultyId" element={requireRole("faculty", <FacultyProfile />)} />
        <Route path="/faculty/student/profile" element={requireRole("faculty", <StudentProfile />)} />
        <Route path="/faculty/student/profile/:studentId" element={requireRole("faculty", <StudentProfile />)} />

        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LearnUpRoutes />
    </BrowserRouter>
  );
}

export default App;
