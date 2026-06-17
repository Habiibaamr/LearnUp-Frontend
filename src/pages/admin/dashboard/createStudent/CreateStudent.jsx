import { Eye, Info, Search, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../../../components/admin/AdminTopbar.jsx";
import {
  createStudentAccount,
  listStudents,
  mapBackendStudent,
  toCreateStudentPayload,
} from "../../../../services/adminAccounts.js";
import {
  encodeRecordId,
  generateStudentId,
  getInitials,
  getStudents,
  setSelectedStudentId,
} from "../../../../utils/learnupRecords.js";
import { DEPARTMENT_FILTER_OPTIONS, DEPARTMENT_OPTIONS } from "../../../../utils/departments.js";
import "./createStudent.css";

const levels = ["All Levels", "Level 1", "Level 2", "Level 3", "Level 4"];
const departments = DEPARTMENT_FILTER_OPTIONS;
const genderOptions = ["Male", "Female"];
const PAGE_SIZE = 10;

const getInitialStudentForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  gender: "Male",
  nationalId: "",
  initialPassword: "",
  studentId: generateStudentId(),
  level: "Level 1",
  department: "AI",
});

function StudentModal({ errorMessage, isSubmitting, onClose, onCreate }) {
  const [form, setForm] = useState(getInitialStudentForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onCreate(form);
  };

  return (
    <div className="admin-modal-overlay">
      <form className="student-create-modal" onSubmit={handleSubmit}>
        <button type="button" className="student-create-modal__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <h2>Create New Student</h2>
        <p>Enroll a new member to the academic portal</p>

        <section>
          <h3><span>P</span> PERSONAL INFORMATION</h3>
          <div className="student-modal-grid">
            <label className="span-2">
              Full Name
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Ahmed Ayman"
                required
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@eru.edu.eg"
                required
              />
            </label>
            <label>
              Phone Number
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+20 100 000 0000"
              />
            </label>
            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                {genderOptions.map((gender) => <option key={gender}>{gender}</option>)}
              </select>
            </label>
            <label>
              National ID
              <input
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                placeholder="National ID"
              />
            </label>
            <label className="span-2">
              Initial Password
              <div>
                <input
                  name="initialPassword"
                  value={form.initialPassword}
                  onChange={handleChange}
                  placeholder="Temporary password"
                  type="password"
                  required
                />
                <Eye size={15} />
              </div>
            </label>
          </div>
        </section>

        <section>
          <h3 className="is-academic"><span>A</span> ACADEMIC INFO</h3>
          <div className="student-modal-grid">
            <label>
              Student ID
              <input
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="#STU-225140"
                required
              />
            </label>
            <label>
              Level
              <select name="level" value={form.level} onChange={handleChange}>
                {levels.filter((level) => level !== "All Levels").map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
            <label className="span-2">
              Department
              <select name="department" value={form.department} onChange={handleChange}>
                {DEPARTMENT_OPTIONS.map((department) => (
                  <option key={department.id} value={department.label}>{department.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="student-modal-note">
            <Info size={16} />
            <span>An invitation email with setup instructions will be automatically sent to the student upon creation.</span>
          </div>
          {errorMessage && (
            <p className="student-modal-status student-modal-status--error" role="alert">
              {errorMessage}
            </p>
          )}
        </section>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>CANCEL</button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "CREATING..." : "CREATE STUDENT"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function CreateStudent() {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState(() => getStudents());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const refreshStudentsFromBackend = async () => {
    try {
      setLoadError("");
      const backendStudents = await listStudents();

      setStudents(backendStudents);
      return true;
    } catch (error) {
      if (error?.status === 401) {
        setLoadError("Your session expired. Please login again.");
      }

      console.info(
        `[LearnUp] Student list backend refresh skipped (${error?.status || 0}: ${error?.message || "Unknown error"}).`,
      );
    }

    return false;
  };

  useEffect(() => {
    refreshStudentsFromBackend();
  }, []);

  const filteredStudents = students.filter((student) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query);
    const levelMatches = selectedLevel === "All Levels" || student.level === selectedLevel;
    const departmentMatches = selectedDepartment === "All Departments" || student.department === selectedDepartment;
    return matchesQuery && levelMatches && departmentMatches;
  });
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const currentPageIndex = Math.min(currentPage, totalPages) - 1;
  const pageStart = currentPageIndex * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const paginatedStudents = filteredStudents.slice(pageStart, pageEnd);
  const showingStart = filteredStudents.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageEnd, filteredStudents.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedDepartment]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const openStudentProfile = (student) => {
    setSelectedStudentId(student.id);
    navigate(`/admin/student/profile/${encodeRecordId(student.id)}`, {
      state: { studentId: student.id },
    });
  };

  const handleCreateStudent = async (formValues) => {
    setSubmitError("");
    setIsSubmitting(true);
    const payload = toCreateStudentPayload(formValues);

    console.log("CREATE STUDENT SUBMIT CLICKED");
    console.log("CREATE STUDENT PAYLOAD", payload);

    try {
      const backendStudent = await createStudentAccount(payload);
      const student = mapBackendStudent(backendStudent, formValues);
      const didRefresh = await refreshStudentsFromBackend();

      if (!didRefresh) {
        setStudents((currentStudents) => [student, ...currentStudents]);
      }

      setOpen(false);
      navigate(`/admin/student-created/${encodeRecordId(student.id)}`, {
        state: { createdStudent: student, studentId: student.id },
      });
    } catch (error) {
      setSubmitError(error?.message || "Student could not be created. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-app-shell create-student-page-v2">
      <AdminSidebar />
      <div className="admin-page-area">
        <AdminTopbar />
        <main className="create-student-main">
          <p className="admin-breadcrumb">LMS <span>&gt;</span> Students <span>&gt;</span> <strong>New Registration</strong></p>
          <h1>Create New Student</h1>

          <section className="student-filters">
            <div>
              <span>FIND STUDENTS</span>
              <label>
                <Search size={16} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by student name or ID"
                />
              </label>
            </div>
            <label className="student-filter-select">
              <span>LEVEL</span>
              <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)}>
                {levels.map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
            <label className="student-filter-select">
              <span>DEPARTMENT</span>
              <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
                {departments.map((department) => <option key={department}>{department}</option>)}
              </select>
            </label>
          </section>

          {loadError && (
            <p className="student-page-status student-page-status--error" role="alert">
              {loadError}
            </p>
          )}

          <section className="student-table-card">
            <table>
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>STUDENT ID</th>
                  <th>LEVEL</th>
                  <th>DEPARTMENT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.id} onClick={() => openStudentProfile(student)} className="student-table-row">
                    <td>
                      <span className="student-table-avatar">{getInitials(student.name)}</span>
                      <div><strong>{student.name}</strong><small>{student.email}</small></div>
                    </td>
                    <td>{student.id}</td>
                    <td><span className="student-level-pill">{student.level}</span></td>
                    <td>{student.department}</td>
                    <td>
                      <button
                        type="button"
                        className="student-view-profile"
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
            <footer>
              <span>Showing {showingStart}-{showingEnd} of {filteredStudents.length} students</span>
              <div>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  &lt;
                </button>
                <button type="button" className="active">{currentPageIndex + 1}</button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  &gt;
                </button>
              </div>
            </footer>
          </section>

          <button
            type="button"
            className="create-student-cta"
            onClick={() => {
              setSubmitError("");
              setOpen(true);
            }}
          >
            <UserPlus size={18} /> CREATE NEW STUDENT
          </button>
        </main>
      </div>
      {open && (
        <StudentModal
          errorMessage={submitError}
          isSubmitting={isSubmitting}
          onClose={() => setOpen(false)}
          onCreate={handleCreateStudent}
        />
      )}
    </div>
  );
}
