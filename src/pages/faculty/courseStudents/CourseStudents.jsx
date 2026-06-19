import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  fetchFacultyCourseStudents,
  isFacultyAuthError,
} from "../../../services/facultyPortal.js";
import {
  clearCurrentSession,
  encodeRecordId,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";
import "./courseStudents.css";

function CourseStudentAvatar({ type }) {
  return <span className={`faculty-course-students-avatar faculty-course-students-avatar--${type}`} />;
}

const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

export default function CourseStudents() {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCourseStudents() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await fetchFacultyCourseStudents(courseOfferingId);

        if (isMounted) {
          setCourse(response.course);
          setEnrolledStudents(response.students);
        }
      } catch (error) {
        if (isFacultyAuthError(error)) {
          clearCurrentSession();
          navigate("/login", { replace: true });
          return;
        }

        if (isMounted) {
          setErrorMessage(error?.message || "Course students could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourseStudents();
    return () => {
      isMounted = false;
    };
  }, [courseOfferingId, navigate]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return enrolledStudents;
    }

    return enrolledStudents.filter((student) => (
      student.full_name.toLowerCase().includes(normalizedQuery) ||
      student.email.toLowerCase().includes(normalizedQuery) ||
      student.university_id.toLowerCase().includes(normalizedQuery)
    ));
  }, [enrolledStudents, query]);
  const studentsWithGpa = enrolledStudents.filter((student) => student.cgpa !== null);
  const averageGpa = studentsWithGpa.length
    ? (
      studentsWithGpa.reduce((total, student) => total + student.cgpa, 0) /
      studentsWithGpa.length
    ).toFixed(2)
    : "—";

  const openStudentProfile = (student) => {
    const studentId = student.university_id || student.student_id;
    setSelectedStudentId(studentId);
    navigate(`/faculty/student/profile/${encodeRecordId(studentId)}`, {
      state: { studentId },
    });
  };

  return (
    <FacultyLayout>
      <main className="faculty-course-students-page">
        <header className="faculty-course-students-hero">
          <div>
            <Link to="/faculty/course-board" className="faculty-course-students-back">
              <ArrowLeft size={15} strokeWidth={2.6} />
              <span>Course Board</span>
            </Link>
            <h1>Students Enrolled in {course?.course_code || "Assigned Course"}</h1>
            <p>{course?.course_title || "Assigned course"} student roster and academic status.</p>
          </div>
          {course && (
            <Link
              to={`/faculty/course-offerings/${course.course_offering_id}/enroll`}
              className="faculty-course-students-enroll"
            >
              <UserPlus size={17} strokeWidth={2.5} />
              <span>Enroll New Student</span>
            </Link>
          )}
        </header>

        {errorMessage && (
          <p className="faculty-course-students-message" role="alert">{errorMessage}</p>
        )}

        <section className="faculty-course-students-summary" aria-label="Course student summary">
          <article>
            <span>Enrolled Students</span>
            <strong>{loading ? "—" : enrolledStudents.length}</strong>
          </article>
          <article>
            <span>Average GPA</span>
            <strong>{loading ? "—" : averageGpa}</strong>
          </article>
          <article>
            <span>Course Capacity</span>
            <strong>{loading ? "—" : (course?.capacity || "Not available")}</strong>
          </article>
        </section>

        <section className="faculty-course-students-table-card">
          <header>
            <div>
              <h2>{course?.course_title || "Assigned course"}</h2>
              <span>{filteredStudents.length} of {enrolledStudents.length} roster records</span>
            </div>
            <label>
              <Search size={14} strokeWidth={2.4} />
              <input
                type="search"
                placeholder="Search roster..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </header>

          <div className="faculty-course-students-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>ID</th>
                  <th>LEVEL</th>
                  <th>DEPARTMENT</th>
                  <th>GPA</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredStudents.length === 0 && (
                  <tr>
                    <td className="faculty-course-students-empty" colSpan="7">
                      {course
                        ? "No students are enrolled in this assigned course."
                        : "This course is not assigned to the logged-in faculty member."}
                    </td>
                  </tr>
                )}
                {filteredStudents.map((student) => (
                  <tr
                    key={student.university_id || student.student_id}
                    onClick={() => openStudentProfile(student)}
                  >
                    <td>
                      <CourseStudentAvatar type={student.avatar} />
                      <div>
                        <strong>{student.full_name}</strong>
                        <span>{student.email || "Email not available"}</span>
                      </div>
                    </td>
                    <td>{student.university_id || "—"}</td>
                    <td>{student.level_label}</td>
                    <td>{student.department_name}</td>
                    <td><b>{student.gpa_label}</b></td>
                    <td>
                      <span className={`faculty-course-students-status faculty-course-students-status--${getStatusClass(student.academic_status)}`}>
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
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </FacultyLayout>
  );
}
