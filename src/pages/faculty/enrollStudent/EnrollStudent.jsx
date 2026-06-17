import {
  ArrowLeft,
  BookOpen,
  Download,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  decodeCourseCode,
  getFacultyCourseByCode,
} from "../../../data/facultyCourses.js";
import "./enrollStudent.css";

const enrollmentCandidates = [
  {
    name: "Marcus Thorne",
    id: "STD-2023-142",
    department: "Computer Science",
    level: "Level 4",
    gpa: "3.92",
    status: "Eligible",
  },
  {
    name: "Leila Chen",
    id: "STD-2023-055",
    department: "Artificial Intelligence",
    level: "Level 3",
    gpa: "3.95",
    status: "Already Enrolled",
  },
  {
    name: "Alex Smith",
    id: "STD-2023-089",
    department: "Information System",
    level: "Level 2",
    gpa: "2.15",
    status: "At Risk",
  },
  {
    name: "Elena Rodriguez",
    id: "STD-2023-211",
    department: "Cyber Security",
    level: "Level 4",
    gpa: "3.45",
    status: "Eligible",
  },
];

const currentSeats = 28;
const courseCapacity = 40;

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function isSelectable(student) {
  return student.status === "Eligible";
}

export default function EnrollStudent() {
  const { courseCode } = useParams();
  const navigate = useNavigate();
  const course = getFacultyCourseByCode(courseCode);
  const decodedCode = course?.code || decodeCourseCode(courseCode);
  const courseTitle = course?.title || "Intro to Computing";
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const departments = useMemo(
    () => Array.from(new Set(enrollmentCandidates.map((student) => student.department))),
    [],
  );
  const levels = useMemo(
    () => Array.from(new Set(enrollmentCandidates.map((student) => student.level))),
    [],
  );

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return enrollmentCandidates.filter((student) => {
      const matchesQuery =
        !normalizedQuery ||
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.id.toLowerCase().includes(normalizedQuery);
      const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter;
      const matchesLevel = levelFilter === "all" || student.level === levelFilter;

      return matchesQuery && matchesDepartment && matchesLevel;
    });
  }, [departmentFilter, levelFilter, query]);

  const selectedStudents = enrollmentCandidates.filter((student) => selectedIds.includes(student.id));
  const afterEnrollmentSeats = currentSeats + selectedStudents.length;

  const toggleStudent = (student) => {
    if (!isSelectable(student)) {
      return;
    }

    setSelectedIds((currentIds) => (
      currentIds.includes(student.id)
        ? currentIds.filter((id) => id !== student.id)
        : [...currentIds, student.id]
    ));
  };

  const submitEnrollment = () => {
    if (selectedStudents.length === 0) {
      return;
    }

    navigate(`/faculty/courses/${encodeURIComponent(decodedCode)}/enroll/success`, {
      state: {
        courseCode: decodedCode,
        courseTitle,
        enrolledStudents: selectedStudents,
        currentSeats,
        capacity: courseCapacity,
      },
    });
  };

  return (
    <FacultyLayout>
      <main className="faculty-enroll-page">
        <header className="faculty-enroll-header">
          <div>
            <Link to={`/faculty/courses/${encodeURIComponent(decodedCode)}/students`} className="faculty-enroll-back">
              <ArrowLeft size={15} strokeWidth={2.6} />
              <span>Back to Students</span>
            </Link>
            <h1>Enroll New Student</h1>
            <p>Add students to {courseTitle} ({decodedCode}) &bull; Academic Year 2023/24</p>
          </div>
          <button type="button" onClick={submitEnrollment} disabled={selectedStudents.length === 0}>
            <UserCheck size={16} strokeWidth={2.6} />
            <span>Enroll Selected Students</span>
          </button>
        </header>

        <section className="faculty-enroll-summary" aria-label="Enrollment summary">
          <article>
            <span>Current Enrolled</span>
            <strong>28 Students</strong>
            <Users size={18} />
          </article>
          <article>
            <span>Remaining Seats</span>
            <strong>12 Available</strong>
            <UserCheck size={18} />
          </article>
          <article>
            <span>Course Capacity</span>
            <strong>28 / 40</strong>
            <BookOpen size={18} />
          </article>
          <article>
            <span>Class Progress</span>
            <strong>Week 12</strong>
            <BookOpen size={18} />
          </article>
        </section>

        <section className="faculty-enroll-workspace">
          <div className="faculty-enroll-main">
            <section className="faculty-enroll-filters" aria-label="Search and filters">
              <label>
                <Search size={15} strokeWidth={2.5} />
                <input
                  type="search"
                  placeholder="Search by student name or ID"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} aria-label="Department filter">
                <option value="all">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
              <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} aria-label="Level filter">
                <option value="all">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <button type="button" className="faculty-enroll-export">
                <Download size={15} strokeWidth={2.5} />
                <span>Export</span>
              </button>
            </section>

            <section className="faculty-enroll-table-card">
              <header>
                <h2>Available Students</h2>
                <span>{filteredStudents.length} records</span>
              </header>
              <div className="faculty-enroll-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Department</th>
                      <th>GPA</th>
                      <th>Status</th>
                      <th>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const selected = selectedIds.includes(student.id);
                      const selectable = isSelectable(student);

                      return (
                        <tr
                          key={student.id}
                          className={`${selected ? "is-selected" : ""} ${!selectable ? "is-disabled" : ""}`}
                          onClick={() => toggleStudent(student)}
                        >
                          <td>
                            <span className="faculty-enroll-student-avatar">
                              {student.name.split(" ").map((part) => part[0]).join("")}
                            </span>
                            <strong>{student.name}</strong>
                          </td>
                          <td>{student.id}</td>
                          <td>{student.department}</td>
                          <td><b>{student.gpa}</b></td>
                          <td>
                            <span className={`faculty-enroll-status faculty-enroll-status--${getStatusClass(student.status)}`}>
                              {student.status}
                            </span>
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={!selectable}
                              onChange={() => toggleStudent(student)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Select ${student.name}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="faculty-enroll-selection" aria-label="Selection Summary">
            <header>
              <h2>Selection Summary</h2>
              <strong>{selectedStudents.length}</strong>
              <span>Selected students</span>
            </header>

            <section>
              <h3>Enrolling Preview</h3>
              {selectedStudents.length > 0 ? (
                <ul>
                  {selectedStudents.map((student) => (
                    <li key={student.id}>
                      <span>{student.name}</span>
                      <small>{student.id}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No students selected yet.</p>
              )}
            </section>

            <dl>
              <div>
                <dt>Current Seats</dt>
                <dd>{currentSeats} / {courseCapacity}</dd>
              </div>
              <div>
                <dt>After Enrollment</dt>
                <dd>{afterEnrollmentSeats} / {courseCapacity}</dd>
              </div>
            </dl>

            <button type="button" onClick={submitEnrollment} disabled={selectedStudents.length === 0}>
              Confirm Enrollment
            </button>
          </aside>
        </section>
      </main>
    </FacultyLayout>
  );
}
