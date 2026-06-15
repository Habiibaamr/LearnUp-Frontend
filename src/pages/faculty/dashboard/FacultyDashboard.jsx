import { AlertTriangle, Star, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  facultySnapshotStudents,
  getFacultyStatusClass,
} from "../../../data/facultyStudents.js";
import {
  encodeRecordId,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";
import "./facultyDashboard.css";

function StudentAvatar({ type }) {
  return <span className={`faculty-student-avatar faculty-student-avatar--${type}`} />;
}

export default function FacultyDashboard() {
  const navigate = useNavigate();

  const openStudentProfile = (student) => {
    setSelectedStudentId(student.id);
    navigate(`/faculty/student/profile/${encodeRecordId(student.id)}`, {
      state: { studentId: student.id },
    });
  };

  return (
    <FacultyLayout>
      <main className="faculty-dashboard">
        <header className="faculty-dashboard__intro">
          <h1>Welcome back, Dr. Amira Ahmed (FULL TIME)</h1>
          <p>Here&apos;s an overview of your students&apos; academic status</p>
        </header>

        <section className="faculty-stat-grid" aria-label="Faculty statistics">
          <article className="faculty-stat-card faculty-stat-card--blue">
            <div>
              <span>TOTAL STUDENTS</span>
              <Users size={18} />
            </div>
            <strong>150</strong>
            <small className="is-positive">+6 this month</small>
          </article>

          <article className="faculty-stat-card faculty-stat-card--red">
            <div>
              <span>AT RISK STUDENTS</span>
              <AlertTriangle size={18} />
            </div>
            <strong>12</strong>
            <div className="faculty-risk-meter"><i /></div>
            <small>8.0%</small>
          </article>

          <article className="faculty-stat-card faculty-stat-card--blue">
            <div>
              <span>AVERAGE GPA</span>
              <Star size={17} fill="#ff9f1c" />
            </div>
            <strong>3.4</strong>
            <small>System Benchmark: 3.2</small>
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
                  <th>LEVEL</th>
                  <th>GPA</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {facultySnapshotStudents.map((student) => (
                  <tr key={student.id} onClick={() => openStudentProfile(student)}>
                    <td>
                      <StudentAvatar type={student.avatar} />
                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td>{student.id}</td>
                    <td>{student.level}</td>
                    <td><b>{student.gpa}</b></td>
                    <td><span className={`faculty-status faculty-status--${getFacultyStatusClass(student.status)}`}>{student.status}</span></td>
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
              <p>Overview of student GPA performance across academic levels</p>
            </div>
            <select defaultValue="all">
              <option value="all">All Levels</option>
            </select>
          </header>
          <div className="faculty-gpa-card__body">
            <div className="faculty-donut" aria-label="GPA Distribution donut chart">
              <div>
                <strong>145</strong>
                <span>Students</span>
                <small>All Levels Selected</small>
              </div>
            </div>
            <ul className="faculty-gpa-legend">
              <li><i className="legend-excellent" />Excellent</li>
              <li><i className="legend-very-good" />Very Good</li>
              <li><i className="legend-good" />Good</li>
              <li><i className="legend-risk" />At Risk</li>
            </ul>
            <div className="faculty-gpa-summary">
              <article>
                <span>EXCELLENT</span>
                <strong>3.5 - 4 GPA</strong>
              </article>
              <article>
                <span>VERY GOOD</span>
                <strong>2.5 - 3.5 GPA</strong>
              </article>
              <article>
                <span>AT RISK STUDENTS</span>
                <strong>less than 2.5GPA</strong>
              </article>
            </div>
          </div>
        </section>
      </main>
    </FacultyLayout>
  );
}
