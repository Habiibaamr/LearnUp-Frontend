import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  fetchFacultyCourses,
  isFacultyAuthError,
} from "../../../services/facultyPortal.js";
import { clearCurrentSession } from "../../../utils/learnupRecords.js";
import "./facultyCourseBoard.css";

function CourseCard({ course, onViewStudents }) {
  return (
    <article className="faculty-course-card">
      <div className={course.level === 4 ? "is-navy" : ""}>{course.course_code}</div>
      <section>
        <h3>{course.course_title}</h3>
        <dl className="faculty-course-card__meta">
          <div><dt>Level</dt><dd>{course.level_label}</dd></div>
          <div><dt>Semester</dt><dd>{course.semester_name}</dd></div>
          <div><dt>Term</dt><dd>{course.term || "—"}</dd></div>
          <div><dt>Academic Year</dt><dd>{course.academic_year || "—"}</dd></div>
          <div><dt>Credit Hours</dt><dd>{course.credit_hours ?? "—"}</dd></div>
          <div><dt>Enrolled</dt><dd>{course.enrolled_students_count}</dd></div>
          <div><dt>Status</dt><dd className="is-status">{course.status}</dd></div>
        </dl>
        <button type="button" onClick={onViewStudents}>View Students</button>
      </section>
    </article>
  );
}

export default function FacultyCourseBoard() {
  const navigate = useNavigate();
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setErrorMessage("");
        const courses = await fetchFacultyCourses();

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
          setFacultyCourses(courses);
        }
      } catch (error) {
        if (isFacultyAuthError(error)) {
          clearCurrentSession();
          navigate("/login", { replace: true });
          return;
        }

        if (isMounted) {
          setErrorMessage(error?.message || "Assigned courses could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const courseLevels = useMemo(() => {
    const grouped = new Map();

    facultyCourses.forEach((course) => {
      const key = course.level || 0;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(course);
    });

    return [...grouped.entries()]
      .sort(([firstLevel], [secondLevel]) => firstLevel - secondLevel)
      .map(([level, courses]) => ({
        level,
        label: level ? `Level ${level}` : "Level not available",
        courses,
      }));
  }, [facultyCourses]);

  return (
    <FacultyLayout>
      <main className="faculty-course-board">
        <header className="faculty-course-board__intro">
          <h1>Faculty Member Course Board</h1>
          <p>Courses assigned to you by Admin.</p>
        </header>

        {errorMessage && (
          <p className="faculty-course-board__message" role="alert">{errorMessage}</p>
        )}

        {loading && (
          <p className="faculty-course-board__message">Loading assigned courses...</p>
        )}

        {!loading && !errorMessage && courseLevels.length === 0 && (
          <p className="faculty-course-board__empty">No courses assigned yet.</p>
        )}

        {courseLevels.map((group) => (
          <section className="faculty-course-level" key={group.level}>
            <header>
              <h2>{group.label}</h2>
              <span>{group.courses.length} assigned</span>
            </header>
            <div className="faculty-course-grid">
              {group.courses.map((course) => (
                <CourseCard
                  key={course.course_instructor_id || course.course_offering_id || course.course_code}
                  course={course}
                  onViewStudents={() => navigate(
                    `/faculty/course-offerings/${course.course_offering_id}/students`,
                  )}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </FacultyLayout>
  );
}
