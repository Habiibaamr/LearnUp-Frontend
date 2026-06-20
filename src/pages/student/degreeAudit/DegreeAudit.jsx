import {
  BookCheck,
  BookOpen,
  CircleDashed,
  GraduationCap,
  LockKeyhole,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import {
  fetchCourseBoardData,
  mergeCourseBoardCatalog,
} from "../../../services/courseBoard.js";
import {
  fetchCurrentStudentProfile,
  getStudentLevelLabel,
  readStoredStudentProfile,
} from "../../../services/studentProfile.js";
import { buildCourseBoardCourses } from "../../../utils/courseBoardLogic.js";
import {
  getEffectiveGpa,
  getPassedCreditHours,
  getRiskStatus,
} from "../../../utils/studentAcademic.js";
import { getStudentNumericLevel } from "../../../utils/studentLevel.js";
import "./degreeAudit.css";

export default function DegreeAudit() {
  const [student, setStudent] = useState(() => readStoredStudentProfile());
  const [courses, setCourses] = useState(() => mergeCourseBoardCatalog([]));
  const [enrolledCourseCodes, setEnrolledCourseCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAudit() {
      const storedStudent = readStoredStudentProfile();
      const profile = await fetchCurrentStudentProfile(storedStudent || {}).catch(
        () => storedStudent || null,
      );
      const activeStudent = profile || storedStudent || null;
      const boardData = await fetchCourseBoardData(activeStudent).catch(() => ({
        courses: mergeCourseBoardCatalog([]),
        enrolledCourseCodes: [],
      }));

      if (isMounted) {
        setStudent(activeStudent);
        setCourses(boardData.courses);
        setEnrolledCourseCodes(boardData.enrolledCourseCodes || []);
        setLoading(false);
      }
    }

    loadAudit();
    return () => {
      isMounted = false;
    };
  }, []);

  const level = getStudentNumericLevel(student) || 1;
  const auditCourses = useMemo(
    () => buildCourseBoardCourses({ courses, studentLevel: level, enrolledCourseCodes }),
    [courses, enrolledCourseCodes, level],
  );
  const groupedCourses = useMemo(
    () => ({
      passed: auditCourses.filter((course) => course.calculatedStatus === "passed"),
      enrolled: auditCourses.filter((course) => course.calculatedStatus === "enrolled"),
      available: auditCourses.filter((course) => course.calculatedStatus === "available"),
      locked: auditCourses.filter((course) => course.calculatedStatus === "locked"),
    }),
    [auditCourses],
  );
  const completedCredits = getPassedCreditHours(student || {});
  const remainingCredits = Math.max(0, 120 - completedCredits);
  const completion = Math.min(100, Math.round((completedCredits / 120) * 100));
  const gpa = getEffectiveGpa(student || {});
  const risk = getRiskStatus(gpa);

  return (
    <div className="student-app-shell degree-audit-page">
      <StudentSidebar />
      <div className="student-page-area">
        <StudentTopbar />
        <main className="degree-audit-main">
          <header className="degree-audit-heading">
            <div>
              <span>ACADEMIC PROGRESS</span>
              <h1>Degree Audit</h1>
              <p>A detailed view of completed credits, course eligibility, and remaining degree requirements.</p>
            </div>
            <strong>{getStudentLevelLabel(student)}</strong>
          </header>

          <section className="degree-audit-summary" aria-label="Degree audit summary">
            <article>
              <GraduationCap size={20} />
              <span>Completed Credits</span>
              <strong>{completedCredits} / 120</strong>
            </article>
            <article>
              <CircleDashed size={20} />
              <span>Remaining Credits</span>
              <strong>{remainingCredits}</strong>
            </article>
            <article>
              <BookCheck size={20} />
              <span>Current GPA</span>
              <strong>{gpa === null ? "-" : gpa.toFixed(2)}</strong>
            </article>
            <article>
              <BookOpen size={20} />
              <span>Academic Status</span>
              <strong>{risk.label}</strong>
            </article>
          </section>

          <section className="degree-audit-progress">
            <header>
              <h2>Degree Completion</h2>
              <strong>{completion}%</strong>
            </header>
            <div><span style={{ width: `${completion}%` }} /></div>
          </section>

          {loading ? (
            <p className="degree-audit-loading">Loading academic audit...</p>
          ) : (
            <section className="degree-audit-course-groups">
              {[
                ["passed", "Passed Courses", BookCheck],
                ["enrolled", "Enrolled Courses", BookOpen],
                ["available", "Available Courses", GraduationCap],
                ["locked", "Locked Courses", LockKeyhole],
              ].map(([status, label, Icon]) => (
                <article key={status} className={`degree-audit-group is-${status}`}>
                  <header>
                    <span><Icon size={18} /></span>
                    <div>
                      <h2>{label}</h2>
                      <p>{groupedCourses[status].length} courses</p>
                    </div>
                  </header>
                  <ul>
                    {groupedCourses[status].slice(0, 8).map((course) => (
                      <li key={`${status}-${course.course_code}`}>
                        <strong>{course.course_code}</strong>
                        <span>{course.course_title}</span>
                        <small>{course.creditLabel}</small>
                      </li>
                    ))}
                    {!groupedCourses[status].length && <li>No courses in this category.</li>}
                  </ul>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
