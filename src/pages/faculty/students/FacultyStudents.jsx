import { ArrowLeft, Search, SlidersHorizontal, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  facultyStudents,
  getFacultyStatusClass,
} from "../../../data/facultyStudents.js";
import {
  encodeRecordId,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";
import "./facultyStudents.css";

function StudentAvatar({ type }) {
  return <span className={`faculty-students-avatar faculty-students-avatar--${type}`} />;
}

export default function FacultyStudents() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gpaFilter, setGpaFilter] = useState("all");
  const atRiskStudents = facultyStudents.filter((student) => student.status === "AT RISK").length;
  const averageGpa = (
    facultyStudents.reduce((total, student) => total + Number(student.gpa), 0) /
    facultyStudents.length
  ).toFixed(2);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return facultyStudents.filter((student) => {
      const gpa = Number(student.gpa);
      const matchesQuery =
        !normalizedQuery ||
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.email.toLowerCase().includes(normalizedQuery) ||
        student.id.toLowerCase().includes(normalizedQuery);
      const matchesLevel = levelFilter === "all" || student.level === levelFilter;
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      const matchesGpa =
        gpaFilter === "all" ||
        (gpaFilter === "high" && gpa >= 3.5) ||
        (gpaFilter === "mid" && gpa >= 2.5 && gpa < 3.5) ||
        (gpaFilter === "risk" && gpa < 2.5);

      return matchesQuery && matchesLevel && matchesStatus && matchesGpa;
    });
  }, [gpaFilter, levelFilter, query, statusFilter]);

  const openStudentProfile = (student) => {
    setSelectedStudentId(student.id);
    navigate(`/faculty/student/profile/${encodeRecordId(student.id)}`, {
      state: { studentId: student.id },
    });
  };

  return (
    <FacultyLayout>
      <main className="faculty-students-page">
        <header className="faculty-students-page__intro">
          <div>
            <Link to="/faculty/dashboard" className="faculty-students-page__back">
              <ArrowLeft size={15} strokeWidth={2.6} />
              <span>Dashboard</span>
            </Link>
            <h1>All Students</h1>
            <p>Complete academic roster for Dr. Amira Ahmed&apos;s assigned students.</p>
          </div>
          <div className="faculty-students-page__icon" aria-hidden="true">
            <Users size={24} strokeWidth={2.5} />
          </div>
        </header>

        <section className="faculty-students-summary" aria-label="Students summary">
          <article>
            <span>Total Students</span>
            <strong>{facultyStudents.length}</strong>
          </article>
          <article>
            <span>Average GPA</span>
            <strong>{averageGpa}</strong>
          </article>
          <article>
            <span>At Risk</span>
            <strong>{atRiskStudents}</strong>
          </article>
        </section>

        <section className="faculty-students-table-card">
          <header>
            <div>
              <h2>Student Roster</h2>
              <span>{filteredStudents.length} of {facultyStudents.length} records</span>
            </div>
          </header>
          <div className="faculty-students-controls">
            <label className="faculty-students-search">
              <Search size={14} strokeWidth={2.4} />
              <input
                type="search"
                placeholder="Search students..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="faculty-students-filters" aria-label="Student filters">
              <span>
                <SlidersHorizontal size={14} strokeWidth={2.4} />
                Filters
              </span>
              <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Filter by level">
                <option value="all">All Levels</option>
                <option value="LVL 1.00">Level 1</option>
                <option value="LVL 2.00">Level 2</option>
                <option value="LVL 3.00">Level 3</option>
                <option value="LVL 4.00">Level 4</option>
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                <option value="all">All Statuses</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="NORMAL">Normal</option>
                <option value="AT RISK">At Risk</option>
              </select>
              <select value={gpaFilter} onChange={(event) => setGpaFilter(event.target.value)} aria-label="Filter by GPA range">
                <option value="all">All GPA</option>
                <option value="high">3.5 - 4.0</option>
                <option value="mid">2.5 - 3.49</option>
                <option value="risk">Below 2.5</option>
              </select>
            </div>
          </div>
          <div className="faculty-students-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>ID</th>
                  <th>LEVEL</th>
                  <th>DEPARTMENT</th>
                  <th>GPA</th>
                  <th>STATUS</th>
                  <th>COURSES</th>
                  <th>ATTENDANCE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
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
                    <td>{student.department}</td>
                    <td>
                      <b>{student.gpa}</b>
                    </td>
                    <td>
                      <span className={`faculty-students-status faculty-students-status--${getFacultyStatusClass(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>{student.courseLoad}</td>
                    <td>{student.attendance}</td>
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
