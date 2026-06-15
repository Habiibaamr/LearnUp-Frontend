import { CheckCircle, UserPlus, Users } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  decodeCourseCode,
  getFacultyCourseByCode,
} from "../../../data/facultyCourses.js";
import "./enrollStudent.css";

const fallbackStudents = [
  {
    name: "Alex Morgan",
    email: "alex.morgan@edu.com",
    status: "Email Sent",
  },
  {
    name: "Jamie Lee",
    email: "j.lee@university.edu",
    status: "Email Sent",
  },
];

export default function EnrollmentSuccess() {
  const { courseCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = getFacultyCourseByCode(courseCode);
  const decodedCode = state?.courseCode || course?.code || decodeCourseCode(courseCode);
  const courseTitle = state?.courseTitle || course?.title || "Intro to Computing";
  const enrolledStudents = state?.enrolledStudents?.length ? state.enrolledStudents : fallbackStudents;
  const currentSeats = state?.currentSeats || 28;
  const capacity = state?.capacity || 40;
  const totalEnrolled = currentSeats + enrolledStudents.length;
  const remainingSeats = capacity - totalEnrolled;
  const capacityPercent = Math.round((totalEnrolled / capacity) * 100);

  return (
    <FacultyLayout>
      <main className="faculty-enroll-page faculty-enroll-page--success">
        <section className="faculty-enrollment-success">
          <div className="faculty-enrollment-success__icon">
            <CheckCircle size={48} strokeWidth={2.7} />
          </div>
          <h1>Students Enrolled Successfully!</h1>
          <p>{enrolledStudents.length} students have been added to {courseTitle} ({decodedCode}) and notified via email.</p>

          <section className="faculty-enrollment-success__summary" aria-label="Enrollment success summary">
            <article>
              <span>Total Enrolled</span>
              <strong>{totalEnrolled} / {capacity}</strong>
            </article>
            <article>
              <span>Remaining Seats</span>
              <strong>{remainingSeats}</strong>
            </article>
          </section>

          <div className="faculty-enrollment-capacity">
            <div>
              <span>{capacityPercent}% capacity reached</span>
              <strong>Registration window closes in 4 days.</strong>
            </div>
            <i>
              <b style={{ width: `${capacityPercent}%` }} />
            </i>
          </div>

          <section className="faculty-enrollment-recent">
            <h2>Recently Enrolled Students</h2>
            <ul>
              {enrolledStudents.map((student) => (
                <li key={student.email || student.id || student.name}>
                  <span>
                    <strong>{student.name}</strong>
                    <a href={`mailto:${student.email || ""}`}>{student.email || "Email pending"}</a>
                  </span>
                  <em>Email Sent</em>
                </li>
              ))}
            </ul>
          </section>

          <div className="faculty-enrollment-success__actions">
            <button type="button" onClick={() => navigate(`/faculty/courses/${encodeURIComponent(decodedCode)}/students`)}>
              <Users size={15} strokeWidth={2.6} />
              Return to Student List
            </button>
            <Link to={`/faculty/courses/${encodeURIComponent(decodedCode)}/enroll`}>
              <UserPlus size={15} strokeWidth={2.6} />
              Enroll More Students
            </Link>
          </div>
        </section>
      </main>
    </FacultyLayout>
  );
}
