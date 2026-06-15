import { ArrowLeft, Search, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  decodeCourseCode,
  getFacultyCourseByCode,
  getFacultyCourseStudents,
} from "../../../data/facultyCourses.js";
import { getFacultyStatusClass } from "../../../data/facultyStudents.js";
import {
  encodeRecordId,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";
import "./courseStudents.css";

function CourseStudentAvatar({ type }) {
  return <span className={`faculty-course-students-avatar faculty-course-students-avatar--${type}`} />;
}

export default function CourseStudents() {
  const { courseCode } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const course = getFacultyCourseByCode(courseCode);
  const decodedCode = course?.code || decodeCourseCode(courseCode);
  const enrolledStudents = useMemo(() => getFacultyCourseStudents(decodedCode), [decodedCode]);
  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return enrolledStudents;
    }

    return enrolledStudents.filter((student) => (
      student.name.toLowerCase().includes(normalizedQuery) ||
      student.email.toLowerCase().includes(normalizedQuery) ||
      student.id.toLowerCase().includes(normalizedQuery)
    ));
  }, [enrolledStudents, query]);
  const averageGpa = enrolledStudents.length
    ? (
      enrolledStudents.reduce((total, student) => total + Number(student.gpa), 0) /
      enrolledStudents.length
    ).toFixed(2)
    : "0.00";

  const openStudentProfile = (student) => {
    setSelectedStudentId(student.id);
    navigate(`/faculty/student/profile/${encodeRecordId(student.id)}`, {
      state: { studentId: student.id },
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
            <h1>Students Enrolled in {decodedCode}</h1>
            <p>{course?.title || "Selected course"} student roster and academic status.</p>
          </div>
          <Link to={`/faculty/courses/${encodeURIComponent(decodedCode)}/enroll`} className="faculty-course-students-enroll">
            <UserPlus size={17} strokeWidth={2.5} />
            <span>Enroll New Student</span>
          </Link>
        </header>

        <section className="faculty-course-students-summary" aria-label="Course student summary">
          <article>
            <span>Enrolled Students</span>
            <strong>{enrolledStudents.length}</strong>
          </article>
          <article>
            <span>Average GPA</span>
            <strong>{averageGpa}</strong>
          </article>
          <article>
            <span>Course Capacity</span>
            <strong>{course?.students || enrolledStudents.length}</strong>
          </article>
        </section>

        <section className="faculty-course-students-table-card">
          <header>
            <div>
              <h2>{course?.title || decodedCode}</h2>
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
                  <th>GPA</th>
                  <th>ATTENDANCE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} onClick={() => openStudentProfile(student)}>
                    <td>
                      <CourseStudentAvatar type={student.avatar} />
                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td>{student.id}</td>
                    <td>{student.level}</td>
                    <td><b>{student.gpa}</b></td>
                    <td>{student.attendance}</td>
                    <td>
                      <span className={`faculty-course-students-status faculty-course-students-status--${getFacultyStatusClass(student.status)}`}>
                        {student.status}
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
