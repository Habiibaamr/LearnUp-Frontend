import { BookOpen, Gauge, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  fetchFacultyCourses,
  fetchFacultyProfile,
  fetchFacultyStudents,
  isFacultyAuthError,
} from "../../../services/facultyPortal.js";
import {
  clearCurrentSession,
  encodeRecordId,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";
import "./facultyDashboard.css";

function StudentAvatar({ type }) {
  return <span className={`faculty-student-avatar faculty-student-avatar--${type}`} />;
}

const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [facultyStudents, setFacultyStudents] = useState([]);
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");
        const [profile, students, courses] = await Promise.all([
          fetchFacultyProfile(),
          fetchFacultyStudents(),
          fetchFacultyCourses(),
        ]);

        console.log("FACULTY PROFILE", profile);
        console.log("FACULTY STUDENTS", students);
        console.log("FACULTY ASSIGNED COURSES", courses);
        courses.forEach((course) => {
          console.log(
            "FACULTY COURSE LEVEL",
            course.course_code,
            course.level,
            course.semester_id,
          );
        });

        if (isMounted) {
          setFacultyProfile(profile);
          setFacultyStudents(students);
          setFacultyCourses(courses);
        }
      } catch (error) {
        if (isFacultyAuthError(error)) {
          clearCurrentSession();
          navigate("/login", { replace: true });
          return;
        }

        if (isMounted) {
          setErrorMessage(error?.message || "Faculty dashboard data could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const snapshotStudents = facultyStudents.slice(0, 3);
  const courseLoadMaximum = 3;
  const courseLoadPercent = Math.min(
    100,
    Math.round((facultyCourses.length / courseLoadMaximum) * 100),
  );
  const gpaSummary = useMemo(() => {
    const studentsWithGpa = facultyStudents.filter((student) => student.cgpa !== null);
    const counts = studentsWithGpa.reduce(
      (summary, student) => {
        if (student.cgpa >= 3.5) {
          summary.excellent += 1;
        } else if (student.cgpa >= 3) {
          summary.veryGood += 1;
        } else if (student.cgpa >= 2.5) {
          summary.good += 1;
        } else {
          summary.atRisk += 1;
        }
        return summary;
      },
      { excellent: 0, veryGood: 0, good: 0, atRisk: 0 },
    );
    const total = studentsWithGpa.length;
    const excellentEnd = total ? (counts.excellent / total) * 100 : 0;
    const veryGoodEnd = total ? excellentEnd + (counts.veryGood / total) * 100 : 0;
    const goodEnd = total ? veryGoodEnd + (counts.good / total) * 100 : 0;

    return {
      ...counts,
      total,
      donutBackground: total
        ? `conic-gradient(#0b5ad1 0 ${excellentEnd}%, #9fbbff ${excellentEnd}% ${veryGoodEnd}%, #4f46e5 ${veryGoodEnd}% ${goodEnd}%, #ef4444 ${goodEnd}% 100%)`
        : "#e5e7eb",
    };
  }, [facultyStudents]);

  const openStudentProfile = (student) => {
    const studentId = student.university_id || student.student_id;
    setSelectedStudentId(studentId);
    navigate(`/faculty/student/profile/${encodeRecordId(studentId)}`, {
      state: { studentId },
    });
  };

  return (
    <FacultyLayout>
      <main className="faculty-dashboard">
        <header className="faculty-dashboard__intro">
          <h1>
            Welcome back, {facultyProfile?.full_name || "Faculty Member"}
          </h1>
          <p>
            {facultyProfile?.department_name
              ? `${facultyProfile.department_name} Department`
              : "Here is an overview of your assigned courses and students."}
          </p>
        </header>

        {errorMessage && (
          <p className="faculty-dashboard__message" role="alert">{errorMessage}</p>
        )}

        <section className="faculty-stat-grid" aria-label="Faculty statistics">
          <article className="faculty-stat-card faculty-stat-card--blue">
            <div>
              <span>ASSIGNED COURSES</span>
              <BookOpen size={18} />
            </div>
            <strong>{loading ? "—" : facultyCourses.length}</strong>
            <small>Assigned by Admin</small>
          </article>

          <article className="faculty-stat-card faculty-stat-card--blue">
            <div>
              <span>STUDENTS MANAGED</span>
              <Users size={18} />
            </div>
            <strong>{loading ? "—" : facultyStudents.length}</strong>
            <small>Advisees and course students</small>
          </article>

          <article className="faculty-stat-card faculty-stat-card--blue">
            <div>
              <span>COURSE LOAD</span>
              <Gauge size={18} />
            </div>
            <strong>{loading ? "—" : `${facultyCourses.length}/${courseLoadMaximum}`}</strong>
            <div className="faculty-course-load-meter">
              <i style={{ width: `${courseLoadPercent}%` }} />
            </div>
          </article>
        </section>

        <section className="faculty-snapshot">
          <header>
            <h2>Students Snapshot</h2>
            <Link to="/faculty/students">View All Students &rarr;</Link>
          </header>
          <div className="faculty-snapshot__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>ID</th>
                  <th>DEPARTMENT</th>
                  <th>LEVEL</th>
                  <th>GPA</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {!loading && snapshotStudents.length === 0 && (
                  <tr>
                    <td className="faculty-table-empty" colSpan="7">No students assigned yet.</td>
                  </tr>
                )}
                {snapshotStudents.map((student) => (
                  <tr
                    key={student.university_id || student.student_id}
                    onClick={() => openStudentProfile(student)}
                  >
                    <td>
                      <StudentAvatar type={student.avatar} />
                      <div>
                        <strong>{student.full_name}</strong>
                        <span>{student.email || "Email not available"}</span>
                      </div>
                    </td>
                    <td>{student.university_id || "—"}</td>
                    <td>{student.department_name}</td>
                    <td>{student.level_label}</td>
                    <td><b>{student.gpa_label}</b></td>
                    <td>
                      <span className={`faculty-status faculty-status--${getStatusClass(student.academic_status)}`}>
                        {student.academic_status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openStudentProfile(student);
                        }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="faculty-gpa-card">
          <header>
            <div>
              <h2>GPA Distribution</h2>
              <p>Overview of related students with available GPA data</p>
            </div>
            <select defaultValue="all">
              <option value="all">All Levels</option>
            </select>
          </header>
          <div className="faculty-gpa-card__body">
            <div
              className="faculty-donut"
              style={{ background: gpaSummary.donutBackground }}
              aria-label="GPA Distribution donut chart"
            >
              <div>
                <strong>{gpaSummary.total}</strong>
                <span>Students</span>
                <small>With GPA data</small>
              </div>
            </div>
            <ul className="faculty-gpa-legend">
              <li><i className="legend-excellent" />Excellent ({gpaSummary.excellent})</li>
              <li><i className="legend-very-good" />Very Good ({gpaSummary.veryGood})</li>
              <li><i className="legend-good" />Good ({gpaSummary.good})</li>
              <li><i className="legend-risk" />At Risk ({gpaSummary.atRisk})</li>
            </ul>
            <div className="faculty-gpa-summary">
              <article>
                <span>EXCELLENT</span>
                <strong>3.5 - 4 GPA</strong>
              </article>
              <article>
                <span>VERY GOOD / GOOD</span>
                <strong>2.5 - 3.49 GPA</strong>
              </article>
              <article>
                <span>AT RISK STUDENTS</span>
                <strong>Less than 2.5 GPA</strong>
              </article>
            </div>
          </div>
        </section>
      </main>
    </FacultyLayout>
  );
}
