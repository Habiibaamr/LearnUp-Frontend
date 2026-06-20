import { ArrowLeft, Search, SlidersHorizontal, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  fetchFacultyProfile,
  fetchFacultyStudents,
  isFacultyAuthError,
} from "../../../services/facultyPortal.js";
import {
  clearCurrentSession,
  encodeRecordId,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";
import "./facultyStudents.css";

function StudentAvatar({ type }) {
  return <span className={`faculty-students-avatar faculty-students-avatar--${type}`} />;
}

const getStatusClass = (status) => status.toLowerCase().replace(/\s+/g, "-");

export default function FacultyStudents() {
  const navigate = useNavigate();
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [facultyStudents, setFacultyStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gpaFilter, setGpaFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        setLoading(true);
        setErrorMessage("");
        const [profile, students] = await Promise.all([
          fetchFacultyProfile(),
          fetchFacultyStudents(),
        ]);

        console.log("FACULTY PROFILE", profile);
        console.log("FACULTY STUDENTS", students);

        if (isMounted) {
          setFacultyProfile(profile);
          setFacultyStudents(students);
        }
      } catch (error) {
        if (isFacultyAuthError(error)) {
          clearCurrentSession();
          navigate("/login", { replace: true });
          return;
        }

        if (isMounted) {
          setErrorMessage(error?.message || "Faculty students could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const atRiskStudents = facultyStudents.filter(
    (student) => student.academic_status === "AT RISK",
  ).length;
  const studentsWithGpa = facultyStudents.filter((student) => student.cgpa !== null);
  const averageGpa = studentsWithGpa.length
    ? (
      studentsWithGpa.reduce((total, student) => total + student.cgpa, 0) /
      studentsWithGpa.length
    ).toFixed(2)
    : "—";

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return facultyStudents.filter((student) => {
      const matchesQuery =
        !normalizedQuery ||
        student.full_name.toLowerCase().includes(normalizedQuery) ||
        student.email.toLowerCase().includes(normalizedQuery) ||
        student.university_id.toLowerCase().includes(normalizedQuery);
      const matchesLevel =
        levelFilter === "all" ||
        String(student.level || "") === levelFilter;
      const matchesStatus =
        statusFilter === "all" ||
        student.academic_status === statusFilter;
      const matchesGpa =
        gpaFilter === "all" ||
        (student.cgpa !== null && gpaFilter === "high" && student.cgpa >= 3.5) ||
        (student.cgpa !== null && gpaFilter === "mid" && student.cgpa >= 2.5 && student.cgpa < 3.5) ||
        (student.cgpa !== null && gpaFilter === "follow-up" && student.cgpa >= 2 && student.cgpa < 2.5) ||
        (student.cgpa !== null && gpaFilter === "risk" && student.cgpa < 2);

      return matchesQuery && matchesLevel && matchesStatus && matchesGpa;
    });
  }, [facultyStudents, gpaFilter, levelFilter, query, statusFilter]);

  const openStudentProfile = (student) => {
    const studentId = student.university_id || student.student_id || student.user_id;
    setSelectedStudentId(studentId);
    navigate(`/faculty/student/profile/${encodeRecordId(studentId)}`, {
      state: { studentId, student },
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
            <p>
              Related students for {facultyProfile?.full_name || "the logged-in faculty member"}.
            </p>
          </div>
          <div className="faculty-students-page__icon" aria-hidden="true">
            <Users size={24} strokeWidth={2.5} />
          </div>
        </header>

        {errorMessage && (
          <p className="faculty-students-page__message" role="alert">{errorMessage}</p>
        )}

        <section className="faculty-students-summary" aria-label="Students summary">
          <article>
            <span>Total Students</span>
            <strong>{loading ? "—" : facultyStudents.length}</strong>
          </article>
          <article>
            <span>Average GPA</span>
            <strong>{loading ? "—" : averageGpa}</strong>
          </article>
          <article>
            <span>At Risk</span>
            <strong>{loading ? "—" : atRiskStudents}</strong>
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
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                <option value="all">All Statuses</option>
                <option value="GOOD STANDING">Good Standing</option>
                <option value="NEEDS FOLLOW-UP">Needs Follow-up</option>
                <option value="AT RISK">At Risk</option>
                <option value="PENDING / NO GPA DATA">Pending / No GPA Data</option>
              </select>
              <select value={gpaFilter} onChange={(event) => setGpaFilter(event.target.value)} aria-label="Filter by GPA range">
                <option value="all">All GPA</option>
                <option value="high">3.5 - 4.0</option>
                <option value="mid">2.5 - 3.49</option>
                <option value="follow-up">2.0 - 2.49</option>
                <option value="risk">Below 2.0</option>
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
                  <th>ACADEMIC STATUS</th>
                  <th>RELATIONSHIP</th>
                  <th>ACCOUNT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredStudents.length === 0 && (
                  <tr>
                    <td className="faculty-students-table-empty" colSpan="9">
                      {facultyStudents.length === 0
                        ? "No students assigned yet."
                        : "No students match the selected filters."}
                    </td>
                  </tr>
                )}
                {filteredStudents.map((student) => (
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
                    <td>{student.level_label}</td>
                    <td>{student.department_name}</td>
                    <td><b>{student.gpa_label}</b></td>
                    <td>
                      <span className={`faculty-students-status faculty-students-status--${getStatusClass(student.academic_status)}`}>
                        {student.academic_status}
                      </span>
                    </td>
                    <td>{student.relationship_label}</td>
                    <td>{student.status}</td>
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
