import { useNavigate } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import { facultyCourseLevels } from "../../../data/facultyCourses.js";
import "./facultyCourseBoard.css";

function CourseCard({ code, title, students, onViewStudents }) {
  return (
    <article className="faculty-course-card">
      <div className={code === "THS-401" ? "is-navy" : ""}>{code}</div>
      <section>
        <h3>{title}</h3>
        <p>{students} Students<br />Enrolled</p>
        <button type="button" onClick={onViewStudents}>View Students</button>
      </section>
    </article>
  );
}

export default function FacultyCourseBoard() {
  const navigate = useNavigate();

  return (
    <FacultyLayout>
      <main className="faculty-course-board">
        <header className="faculty-course-board__intro">
          <h1>Faculty Member Course Board</h1>
          <p>Manage and monitor academic progress across different curriculum levels.</p>
        </header>

        {facultyCourseLevels.map((group) => (
          <section className="faculty-course-level" key={group.level}>
            <header>
              <h2>{group.level}</h2>
              <span>{group.label}</span>
            </header>
            <div className="faculty-course-grid">
              {group.courses.map((course) => (
                <CourseCard
                  key={course.code}
                  code={course.code}
                  title={course.title}
                  students={course.students}
                  onViewStudents={() => navigate(`/faculty/courses/${encodeURIComponent(course.code)}/students`)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </FacultyLayout>
  );
}
