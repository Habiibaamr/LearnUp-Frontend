import { Eye, Info, MoreVertical, Search, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../../../components/admin/AdminTopbar.jsx";
import {
  encodeRecordId,
  generateFacultyId,
  getFacultyMembers,
  getInitials,
  saveFacultyRecord,
  setSelectedFacultyId,
} from "../../../../utils/learnupRecords.js";
import "./createInstructor.css";

const departments = ["Computer Science & IT", "COMPUTER SCIENCE", "Artificial Intelligence", "Information Systems", "Cyber Security"];
const faculties = ["Engineering & Technology", "Computer Science", "Artificial Intelligence"];
const genderOptions = ["Male", "Female"];
const titleOptions = ["Teaching Assistant", "Assistant Lecturer", "Lecturer", "Senior Lecturer", "Professor"];
const roleOptions = ["Faculty Member", "Course Instructor", "Academic Advisor", "Department Coordinator"];
const statusOptions = ["AVAILABLE", "ACTIVE", "FULL"];
const courseLoadOptions = ["0/3", "1/3", "2/3", "3/3"];

const getInitialInstructorForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  gender: "Male",
  nationalId: "",
  initialPassword: "",
  facultyId: generateFacultyId(),
  department: "Computer Science & IT",
  faculty: "Engineering & Technology",
  title: "Lecturer",
  role: "Faculty Member",
  specialization: "",
  location: "",
  courseLoad: "1/3",
  assignedCourses: "",
  status: "AVAILABLE",
});

const getLoadProgress = (courseLoad) => {
  const [current, total] = courseLoad.split("/").map(Number);

  if (!Number.isFinite(current) || !Number.isFinite(total) || total === 0) {
    return 0;
  }

  return Math.min(100, Math.round((current / total) * 100));
};

function InstructorModal({ onClose, onCreate }) {
  const [form, setForm] = useState(getInitialInstructorForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreate({
      ...form,
      load: form.courseLoad,
      progress: getLoadProgress(form.courseLoad),
    });
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
                {departments.map((department) => <option key={department}>{department}</option>)}
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
              Course Load
              <select name="courseLoad" value={form.courseLoad} onChange={handleChange}>
                {courseLoadOptions.map((courseLoad) => <option key={courseLoad}>{courseLoad}</option>)}
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
        </section>

        <footer>
          <button type="button" onClick={onClose}>CANCEL</button>
          <button type="submit">CREATE FACULTY MEMBER</button>
        </footer>
      </form>
    </div>
  );
}

export default function CreateInstructor({ initialModalOpen = false }) {
  const [open, setOpen] = useState(initialModalOpen);
  const [searchTerm, setSearchTerm] = useState("");
  const [instructors, setInstructors] = useState(() => getFacultyMembers());
  const navigate = useNavigate();

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

  const openInstructorProfile = (instructor) => {
    setSelectedFacultyId(instructor.id);
    navigate(`/admin/faculty/profile/${encodeRecordId(instructor.id)}`, {
      state: { facultyId: instructor.id },
    });
  };

  const handleCreateInstructor = (formValues) => {
    const instructor = saveFacultyRecord(formValues);
    setInstructors(getFacultyMembers());
    setOpen(false);
    navigate(`/admin/instructor-created/${encodeRecordId(instructor.id)}`, {
      state: { facultyId: instructor.id },
    });
  };

  return (
    <div className="admin-app-shell create-instructor-page-v2">
      <AdminSidebar />
      <div className="admin-page-area">
        <AdminTopbar />
        <main className="create-instructor-main">
          <section className="instructor-page-header">
            <h1>Faculty Member</h1>
            <p>Oversee academic staff, course loads, and departmental assignments.</p>
          </section>

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
                  <th>COURSES LOAD</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.map((instructor) => {
                  const full = instructor.progress === 100;
                  return (
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
                        <div className="instructor-load">
                          <span>{instructor.courseLoad || instructor.load}</span>
                          {full && <b>FULL</b>}
                          <i><em className={full ? "is-full" : ""} style={{ width: `${instructor.progress}%` }} /></i>
                        </div>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
            <footer>
              <div><button type="button">&lt;</button><span>Showing {filteredInstructors.length} of<br />{instructors.length}</span><button type="button">&gt;</button></div>
              <button type="button" onClick={() => setOpen(true)}><UserPlus size={16} /> Create New Faculty Member</button>
            </footer>
          </section>
        </main>
      </div>
      {open && <InstructorModal onClose={() => setOpen(false)} onCreate={handleCreateInstructor} />}
    </div>
  );
}
