import {
  ArrowLeft,
  BookOpen,
  Download,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FacultyLayout from "../../../components/faculty/FacultyLayout.jsx";
import {
  enrollFacultyStudents,
  fetchFacultyCourseEnrollment,
  fetchFacultyProfile,
  isFacultyAuthError,
} from "../../../services/facultyPortal.js";
import { clearCurrentSession } from "../../../utils/learnupRecords.js";
import "./enrollStudent.css";

function getStatusClass(status) {
  return status.toLowerCase().replace(/_/g, "-");
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function EnrollStudent() {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();
  const [facultyProfile, setFacultyProfile] = useState(null);
  const resolvedOfferingId = Number(courseOfferingId) || null;
  const [courseOffering, setCourseOffering] = useState(null);
  const [students, setStudents] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const loadEnrollmentPage = useCallback(async ({ keepSuccess = false } = {}) => {
    try {
      setLoading(true);
      setErrorMessage("");
      if (!keepSuccess) {
        setSuccessMessage("");
      }

      if (!resolvedOfferingId) {
        throw new Error("A valid assigned course offering is required.");
      }
      const [profile, enrollmentData] = await Promise.all([
        fetchFacultyProfile(),
        fetchFacultyCourseEnrollment(resolvedOfferingId),
      ]);

      console.log("LOGGED FACULTY", profile);
      console.log("SELECTED COURSE OFFERING", enrollmentData.course);
      console.log("ENROLLMENT PAGE STUDENTS", enrollmentData.students);

      setFacultyProfile(profile);
      setCourseOffering(enrollmentData.course);
      setStudents(enrollmentData.students);
      setUsingFallback(enrollmentData.usingFallback);
      setSelectedStudentIds([]);
    } catch (error) {
      if (isFacultyAuthError(error)) {
        clearCurrentSession();
        navigate("/login", { replace: true });
        return;
      }
      setErrorMessage(error?.message || "Enrollment data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [navigate, resolvedOfferingId]);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        loadEnrollmentPage();
      }
    });
    return () => {
      isActive = false;
    };
  }, [loadEnrollmentPage]);

  useEffect(() => {
    console.log("SELECTED STUDENTS", selectedStudentIds);
  }, [selectedStudentIds]);

  const departments = useMemo(
    () => Array.from(
      new Set(students.map((student) => student.department_name).filter(Boolean)),
    ).sort(),
    [students],
  );
  const levels = useMemo(
    () => Array.from(
      new Set(students.map((student) => student.level).filter(Boolean)),
    ).sort((first, second) => first - second),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return students.filter((student) => {
      const matchesQuery =
        !normalizedQuery ||
        student.full_name.toLowerCase().includes(normalizedQuery) ||
        student.university_id.toLowerCase().includes(normalizedQuery);
      const matchesDepartment =
        departmentFilter === "all" ||
        student.department_name === departmentFilter;
      const matchesLevel =
        levelFilter === "all" ||
        String(student.level || "") === levelFilter;

      return matchesQuery && matchesDepartment && matchesLevel;
    });
  }, [departmentFilter, levelFilter, query, students]);

  const selectedStudents = students.filter((student) => (
    selectedStudentIds.includes(student.student_id)
  ));
  const currentSeats = courseOffering?.current_enrolled_count || 0;
  const courseCapacity = courseOffering?.capacity || 0;
  const remainingSeats = courseOffering?.remaining_seats || 0;
  const afterEnrollmentSeats = currentSeats + selectedStudents.length;
  const selectionExceedsCapacity = selectedStudents.length > remainingSeats;
  const submitDisabled =
    submitting ||
    usingFallback ||
    selectedStudents.length === 0 ||
    selectionExceedsCapacity;
  const courseCodeValue = courseOffering?.course_code || "";

  const toggleStudent = (student) => {
    if (!student.is_selectable || student.is_fallback) {
      return;
    }

    setSelectedStudentIds((currentIds) => (
      currentIds.includes(student.student_id)
        ? currentIds.filter((id) => id !== student.student_id)
        : [...currentIds, student.student_id]
    ));
  };

  const submitEnrollment = async () => {
    if (submitDisabled || !resolvedOfferingId) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await enrollFacultyStudents(
        resolvedOfferingId,
        selectedStudentIds,
      );

      console.log("ENROLLMENT RESPONSE", response);
      setSuccessMessage(response?.message || "Students enrolled successfully.");
      await loadEnrollmentPage({ keepSuccess: true });
    } catch (error) {
      if (isFacultyAuthError(error)) {
        clearCurrentSession();
        navigate("/login", { replace: true });
        return;
      }
      setErrorMessage(error?.message || "Students could not be enrolled.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FacultyLayout>
      <main className="faculty-enroll-page">
        <header className="faculty-enroll-header">
          <div>
            <Link
              to={`/faculty/course-offerings/${resolvedOfferingId}/students`}
              className="faculty-enroll-back"
            >
              <ArrowLeft size={15} strokeWidth={2.6} />
              <span>Back to Students</span>
            </Link>
            <h1>Enroll New Student</h1>
            <p>
              Add students to {courseOffering?.course_title || "Assigned Course"} ({courseCodeValue || "—"})
              {" "}&bull; Academic Year {courseOffering?.academic_year || "Not available"}
            </p>
            {facultyProfile?.full_name && (
              <small className="faculty-enroll-faculty-name">
                Logged in as {facultyProfile.full_name}
              </small>
            )}
          </div>
          <button type="button" onClick={submitEnrollment} disabled={submitDisabled}>
            <UserCheck size={16} strokeWidth={2.6} />
            <span>{submitting ? "Enrolling..." : "Enroll Selected Students"}</span>
          </button>
        </header>

        {errorMessage && (
          <p className="faculty-enroll-message faculty-enroll-message--error" role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="faculty-enroll-message faculty-enroll-message--success" role="status">
            {successMessage}
          </p>
        )}
        {usingFallback && (
          <p className="faculty-enroll-message">
            No backend students were returned. Showing a local fallback preview.
          </p>
        )}

        <section className="faculty-enroll-summary" aria-label="Enrollment summary">
          <article>
            <span>Current Enrolled</span>
            <strong>{loading ? "—" : `${currentSeats} Students`}</strong>
            <Users size={18} />
          </article>
          <article>
            <span>Remaining Seats</span>
            <strong>{loading ? "—" : `${remainingSeats} Available`}</strong>
            <UserCheck size={18} />
          </article>
          <article>
            <span>Course Capacity</span>
            <strong>{loading ? "—" : `${currentSeats} / ${courseCapacity}`}</strong>
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
                  <option key={level} value={level}>Level {level}</option>
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
                    {!loading && filteredStudents.length === 0 && (
                      <tr>
                        <td className="faculty-enroll-table-empty" colSpan="6">
                          No students match the selected filters.
                        </td>
                      </tr>
                    )}
                    {filteredStudents.map((student) => {
                      const selected = selectedStudentIds.includes(student.student_id);
                      const selectable = student.is_selectable && !student.is_fallback;

                      return (
                        <tr
                          key={student.student_id}
                          className={`${selected ? "is-selected" : ""} ${!selectable ? "is-disabled" : ""}`}
                          onClick={() => toggleStudent(student)}
                          title={student.reason}
                        >
                          <td>
                            <span className="faculty-enroll-student-avatar">
                              {getInitials(student.full_name)}
                            </span>
                            <strong>{student.full_name}</strong>
                          </td>
                          <td>{student.university_id}</td>
                          <td>{student.department_name}</td>
                          <td><b>{student.gpa_label}</b></td>
                          <td>
                            <span className={`faculty-enroll-status faculty-enroll-status--${getStatusClass(student.status)}`}>
                              {student.status_label}
                            </span>
                            <small className="faculty-enroll-status-reason">{student.reason}</small>
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={!selectable}
                              onChange={() => toggleStudent(student)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Select ${student.full_name}`}
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
                    <li key={student.student_id}>
                      <span>{student.full_name}</span>
                      <small>{student.university_id}</small>
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

            {selectionExceedsCapacity && (
              <p className="faculty-enroll-capacity-warning">
                Selected students exceed the remaining seats.
              </p>
            )}
            <button type="button" onClick={submitEnrollment} disabled={submitDisabled}>
              {submitting ? "Enrolling..." : "Confirm Enrollment"}
            </button>
          </aside>
        </section>
      </main>
    </FacultyLayout>
  );
}
