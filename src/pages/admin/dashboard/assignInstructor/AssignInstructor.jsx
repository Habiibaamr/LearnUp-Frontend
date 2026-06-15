import { CheckCircle, ChevronDown, Info, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../../../components/admin/AdminTopbar.jsx";
import "./assignInstructor.css";

// Mock instructor assignment rows stay in place until admin assignment endpoints are wired.
const rows = [
  { name: "Dr. Sarah Jenkins", email: "s.jenkins@eduadmin.com", department: "Computer Science", load: "1/3", progress: 33, courses: ["CS101"] },
  { name: "Prof. Michael Chen", email: "m.chen@eduadmin.com", department: "Computer Science", load: "2/3", progress: 66, courses: ["CS202", "CS404"] },
  { name: "Dr. Elena Rodriguez", email: "e.rodriguez@eduadmin.com", department: "Computer Science", load: "3/3", progress: 100, courses: ["CS105", "CS210", "CS302"] },
  { name: "Prof. David Wilson", email: "d.wilson@eduadmin.com", department: "Computer Science", load: "1/3", progress: 33, courses: ["CS201"] },
  { name: "Prof. Sarah Mitchell", email: "s.mitchell@eduadmin.com", department: "Computer Science", load: "1/3", progress: 33, courses: ["CS101"] },
  { name: "Dr. Arjun Kapoor", email: "a.kapoor@eduadmin.com", department: "Computer Science", load: "3/3", progress: 100, courses: ["CS105", "CS210", "CS302"] },
  { name: "Prof. Elena Rodriguez", email: "e.rodriguez@eduadmin.com", department: "Computer Science", load: "2/3", progress: 66, courses: ["CS202", "CS404"] },
  { name: "James Wilson", email: "j.wilson@eduadmin.com", department: "Computer Science", load: "0/3", progress: 0, courses: [] },
];

const courses = [
  "Advanced neural network",
  "Advanced Algorithms",
  "Data Structures",
  "Human Computer Interaction",
  "Database Systems",
];

export function AssignInstructorModal({ instructor, onClose }) {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [error, setError] = useState("");

  const currentInstructor = instructor ?? rows[0];

  const handleConfirm = () => {
    if (!selectedCourse) {
      setError("Please select a course before confirming.");
      return;
    }

    navigate("/admin/assignment-success");
  };

  return (
    <div className="assign-modal-overlay">
      <section className="assign-modal">
        <button type="button" className="assign-modal__close" onClick={onClose ?? (() => navigate("/admin/assign-instructor"))} aria-label="Close"><X size={18} /></button>
        <h1>Assign Faculty Member to Course</h1>
        <article className="assign-modal-profile">
          <span className="assign-modal-avatar">{currentInstructor.name.split(" ").slice(-2).map((part) => part[0]).join("")}</span>
          <div>
            <h2>{currentInstructor.name}</h2>
            <p>{currentInstructor.department}</p>
            <div className="assign-modal-load">
              <span>COURSES LOAD</span><strong>{currentInstructor.load}</strong>
              <i><b style={{ width: `${currentInstructor.progress}%` }} /></i>
            </div>
          </div>
        </article>
        <label className="assign-modal-select">
          <span>Select course to assign</span>
          <div>
            <select
              value={selectedCourse}
              onChange={(event) => {
                setSelectedCourse(event.target.value);
                setError("");
              }}
            >
              <option value="">Choose course</option>
              {courses.map((course) => <option key={course} value={course}>{course}</option>)}
            </select>
            <ChevronDown size={18} />
          </div>
        </label>
        {selectedCourse && <p className="assign-modal-selected">Selected course: <strong>{selectedCourse}</strong></p>}
        {error && <p className="assign-modal-error">{error}</p>}
        <div className="assign-modal-current">
          <h3>Current Courses</h3>
          {currentInstructor.courses.length > 0 ? (
            currentInstructor.courses.map((course) => <span key={course}><Info size={12} /> {course}</span>)
          ) : (
            <span><Info size={12} /> No current courses</span>
          )}
        </div>
        <footer>
          <button type="button" onClick={onClose ?? (() => navigate("/admin/assign-instructor"))}>Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={!selectedCourse}>Confirm Assignment</button>
        </footer>
      </section>
    </div>
  );
}

export default function AssignInstructor() {
  const [open, setOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  return (
    <div className="admin-app-shell assign-instructor-page-v2">
      <AdminSidebar />
      <div className="admin-page-area">
        <AdminTopbar />
        <main className="assign-instructor-main">
          <p className="assign-breadcrumb"><span>Faculty Members</span> &gt; <strong>Assign Faculty Member</strong></p>
          <h1>Select Faculty Member for CS303</h1>
          <p>Available computer science faculty for the Advanced Algorithms course.</p>

          <section className="assign-table-card">
            <table>
              <thead>
                <tr>
                  <th>Faculty Member Name</th>
                  <th>Department</th>
                  <th>Courses Load</th>
                  <th>Assigned Courses</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((instructor, index) => {
                  const full = instructor.progress === 100;
                  const selected = selectedInstructor === instructor;
                  return (
                    <tr
                      key={`${instructor.name}-${index}`}
                      className={`${full ? "is-muted" : ""} ${selected ? "is-selected" : ""}`}
                      onClick={() => setSelectedInstructor(instructor)}
                    >
                      <td>
                        <span className="admin-person-avatar">{instructor.name.split(" ").slice(-2).map((p) => p[0]).join("")}</span>
                        <div><strong>{instructor.name}</strong><small>{instructor.email}</small></div>
                      </td>
                      <td>{instructor.department}</td>
                      <td>
                        <div className="assign-load-cell">
                          <i><b className={full ? "is-full" : ""} style={{ width: `${instructor.progress}%` }} /></i>
                          <strong>{instructor.load}</strong>
                          {full && <span>FULL CAPACITY</span>}
                        </div>
                      </td>
                      <td>
                        <div className="assign-course-pills">
                          {instructor.courses.map((course) => <span key={course}>{course}</span>)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <div className="assign-bottom-actions">
            <button type="button">Cancel</button>
            <button type="button" onClick={() => setOpen(true)} disabled={!selectedInstructor}>Assign Faculty Member <CheckCircle size={14} /></button>
          </div>
        </main>
      </div>
      {open && <AssignInstructorModal instructor={selectedInstructor} onClose={() => setOpen(false)} />}
    </div>
  );
}
