import { Eye, Info, MoreVertical, Search, UserPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../../../components/admin/AdminTopbar.jsx";
import {
  createInstructorAccount,
  isMissingEndpointError,
  listInstructors,
  mapBackendInstructor,
} from "../../../../services/adminAccounts.js";
import {
  encodeRecordId,
  generateFacultyId,
  getFacultyMembers,
  getInitials,
  saveFacultyRecord,
  setSelectedFacultyId,
} from "../../../../utils/learnupRecords.js";
import { DEPARTMENT_OPTIONS } from "../../../../utils/departments.js";
import "./createInstructor.css";

const departments = DEPARTMENT_OPTIONS;
const faculties = ["Engineering & Technology"];
const genderOptions = ["Male", "Female"];
const titleOptions = ["Teaching Assistant", "Assistant Lecturer", "Lecturer", "Senior Lecturer", "Professor"];
const roleOptions = ["Faculty Member", "Course Instructor", "Academic Advisor", "Department Coordinator"];
const statusOptions = ["AVAILABLE", "ACTIVE", "FULL"];
const PAGE_SIZE = 10;

const getInitialInstructorForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  gender: "Male",
  nationalId: "",
  initialPassword: "",
  facultyId: generateFacultyId(),
  department: "AI",
  faculty: "Engineering & Technology",
  title: "Lecturer",
  role: "Faculty Member",
  specialization: "",
  location: "",
  assignedCourses: "",
  status: "AVAILABLE",
});

function InstructorModal({ errorMessage, isSubmitting, onClose, onCreate }) {
  const [form, setForm] = useState(getInitialInstructorForm);

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
    <div className="instructor-modal-overlay">
      <form className="instructor-create-modal" onSubmit={handleSubmit}>
        <button type="button" className="instructor-create-modal__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <h2>Create New Faculty Member</h2>
        <p>Enroll a new member to the academic portal</p>

        <section>
          <h3><span>P</span> PERSONAL INFORMATION</h3>
          <div className="instructor-modal-grid">
            <label className="span-2">
              Full Name
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Dr. Mona Nabil"
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
                placeholder="faculty@eru.ed.eg"
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
          <div className="instructor-modal-grid">
            <label>
              Faculty Member ID
              <input
                name="facultyId"
                value={form.facultyId}
                onChange={handleChange}
                placeholder="#FAC-225140"
                required
              />
            </label>
            <label>
              Department
              <select name="department" value={form.department} onChange={handleChange}>
                {departments.map((department) => (
                  <option key={department.id} value={department.label}>{department.label}</option>
                ))}
              </select>
            </label>
            <label>
              Faculty / College
              <select name="faculty" value={form.faculty} onChange={handleChange}>
                {faculties.map((faculty) => <option key={faculty}>{faculty}</option>)}
              </select>
            </label>
            <label>
              Academic Position
              <select name="title" value={form.title} onChange={handleChange}>
                {titleOptions.map((title) => <option key={title}>{title}</option>)}
              </select>
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                {roleOptions.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <label>
              Specialization
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Data Science & AI"
              />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                {statusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label>
              Office / Location
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Building B, Office 214"
              />
            </label>
            <label>
              Assigned Courses
              <input
                name="assignedCourses"
                value={form.assignedCourses}
                onChange={handleChange}
                placeholder="CS-101, AI-305"
              />
            </label>
          </div>
          <div className="instructor-modal-note">
            <Info size={16} />
            An invitation email with setup instructions will be automatically sent to the faculty member upon creation.
          </div>
          {errorMessage && (
            <p className="instructor-modal-status instructor-modal-status--error" role="alert">
              {errorMessage}
            </p>
          )}
        </section>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>CANCEL</button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "CREATING..." : "CREATE FACULTY MEMBER"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function CreateInstructor({ initialModalOpen = false }) {
  const [open, setOpen] = useState(initialModalOpen);
  const [searchTerm, setSearchTerm] = useState("");
  const [instructors, setInstructors] = useState(() => getFacultyMembers());
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const refreshInstructorsFromBackend = useCallback(async () => {
    try {
      setLoadError("");
      const backendInstructors = await listInstructors({ includeCourseLoads: false });

      setInstructors(backendInstructors);
      return true;
    } catch (error) {
      if (error?.status === 401) {
        setLoadError("Your session expired. Please login again.");
      }

      console.info(
        `[LearnUp] Instructor list backend refresh skipped (${error?.status || 0}: ${error?.message || "Unknown error"}).`,
      );
    }

    return false;
  }, []);

  useEffect(() => {
    refreshInstructorsFromBackend();
  }, [refreshInstructorsFromBackend]);

  const filteredInstructors = instructors.filter((instructor) => {
    const query = searchTerm.trim().toLowerCase();

    return (
      !query ||
      instructor.name.toLowerCase().includes(query) ||
      instructor.email.toLowerCase().includes(query) ||
      instructor.id.toLowerCase().includes(query) ||
      instructor.department.toLowerCase().includes(query)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredInstructors.length / PAGE_SIZE));
  const currentPageIndex = Math.min(currentPage, totalPages) - 1;
  const pageStart = currentPageIndex * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const paginatedInstructors = filteredInstructors.slice(pageStart, pageEnd);
  const showingStart = filteredInstructors.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageEnd, filteredInstructors.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const openInstructorProfile = (instructor) => {
    const profileId =
      instructor.backendInstructorId ||
      instructor.instructor_id ||
      instructor.instructorId ||
      instructor.universityId ||
      instructor.id;

    setSelectedFacultyId(instructor.id);
    navigate(`/admin/faculty/profile/${encodeRecordId(profileId)}`, {
      state: {
        facultyId: instructor.id,
        facultyMember: instructor,
        instructorId: instructor.backendInstructorId || instructor.instructor_id || instructor.instructorId,
      },
    });
  };

  const handleCreateInstructor = async (formValues) => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const backendInstructor = await createInstructorAccount(formValues);
      const mappedInstructor = mapBackendInstructor(backendInstructor, formValues);
      const instructor = saveFacultyRecord(mappedInstructor);
      const didRefresh = await refreshInstructorsFromBackend();

      if (!didRefresh) {
        setInstructors(getFacultyMembers());
      }

      setOpen(false);
      navigate(`/admin/instructor-created/${encodeRecordId(mappedInstructor.backendInstructorId || instructor.id)}`, {
        state: {
          facultyId: instructor.id,
          facultyMember: mappedInstructor,
          instructorId: mappedInstructor.backendInstructorId || mappedInstructor.instructor_id || mappedInstructor.instructorId,
        },
      });
    } catch (error) {
      if (isMissingEndpointError(error)) {
        // Mock fallback is intentionally kept only for a missing backend endpoint.
        const instructor = saveFacultyRecord(formValues);

        setInstructors(getFacultyMembers());
        setOpen(false);
        navigate(`/admin/instructor-created/${encodeRecordId(instructor.id)}`, {
          state: { facultyId: instructor.id },
        });
        return;
      }

      setSubmitError(error?.message || "Faculty member could not be created. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-app-shell create-instructor-page-v2">
      <AdminSidebar />
      <div className="admin-page-area">
        <AdminTopbar />
        <main className="create-instructor-main">
          <section className="instructor-page-header">
            <h1>Faculty Member</h1>
            <p>Oversee academic staff and departmental assignments.</p>
          </section>

          {loadError && (
            <p className="instructor-page-status instructor-page-status--error" role="alert">
              {loadError}
            </p>
          )}

          <section className="instructor-table-card">
            <label className="instructor-search">
              <Search size={16} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or ID"
              />
            </label>
            <table>
              <thead>
                <tr>
                  <th>FACULTY MEMBER NAME</th>
                  <th>FACULTY MEMBER ID</th>
                  <th>TITLE / ROLE</th>
                  <th>DEPARTMENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInstructors.map((instructor) => (
                    <tr
                      key={instructor.id}
                      onClick={() => openInstructorProfile(instructor)}
                      className="instructor-table-row"
                    >
                      <td>
                        <span className="admin-person-avatar">{getInitials(instructor.name)}</span>
                        <div><strong>{instructor.name}</strong><small>{instructor.email || "No email provided"}</small></div>
                      </td>
                      <td>{instructor.id}</td>
                      <td>
                        <strong>{instructor.title}</strong>
                        <small>{instructor.role}</small>
                      </td>
                      <td><span className="instructor-dept-pill">{instructor.department}</span></td>
                      <td>
                        <button
                          type="button"
                          className="instructor-view-profile"
                          onClick={(event) => {
                            event.stopPropagation();
                            openInstructorProfile(instructor);
                          }}
                        >
                          View Profile <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            <footer>
              <div>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  &lt;
                </button>
                <span>Showing {showingStart}-{showingEnd} of<br />{filteredInstructors.length} faculty members</span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  &gt;
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitError("");
                  setOpen(true);
                }}
              >
                <UserPlus size={16} /> Create New Faculty Member
              </button>
            </footer>
          </section>
        </main>
      </div>
      {open && (
        <InstructorModal
          errorMessage={submitError}
          isSubmitting={isSubmitting}
          onClose={() => setOpen(false)}
          onCreate={handleCreateInstructor}
        />
      )}
    </div>
  );
}
