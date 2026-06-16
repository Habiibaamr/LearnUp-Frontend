import { CheckCircle, ChevronDown, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../../../components/admin/AdminTopbar.jsx";
import {
  assignInstructorToOffering,
  listAdminInstructors,
  listCourseOfferingInstructors,
  listCourseOfferings,
} from "../../../../services/adminAssignments.js";
import "./assignInstructor.css";

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "FM";

export function AssignInstructorModal({
  assignmentError,
  courseOfferings,
  instructor,
  isSubmitting,
  onAssign,
  onClose,
}) {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [error, setError] = useState("");

  const currentInstructor = instructor;
  const selectedOffering = courseOfferings.find(
    (offering) => String(offering.courseOfferingId) === selectedCourse,
  );

  const handleConfirm = async () => {
    setError("");

    if (!currentInstructor) {
      setError("Please select a faculty member before confirming.");
      return;
    }

    if (!selectedOffering) {
      setError("Please select a course before confirming.");
      return;
    }

    const payload = {
      course_offering_id: selectedOffering.courseOfferingId,
      instructor_id: currentInstructor.instructorId,
    };

    console.log("ASSIGN FACULTY SUBMIT CLICKED");

    await onAssign(payload, selectedOffering);
  };

  return (
    <div className="assign-modal-overlay">
      <section className="assign-modal">
        <button type="button" className="assign-modal__close" onClick={onClose ?? (() => navigate("/admin/assign-instructor"))} aria-label="Close"><X size={18} /></button>
        <h1>Assign Faculty Member to Course</h1>
        <article className="assign-modal-profile">
          <span className="assign-modal-avatar">{getInitials(currentInstructor?.name)}</span>
          <div>
            <h2>{currentInstructor?.name || "Faculty Member"}</h2>
            <p>{currentInstructor?.department || "Department pending"}</p>
            <div className="assign-modal-load">
              <span>COURSES LOAD</span><strong>{currentInstructor?.load || "0/3"}</strong>
              <i><b style={{ width: `${currentInstructor?.progress || 0}%` }} /></i>
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
              {courseOfferings.map((course) => (
                <option key={course.courseOfferingId} value={course.courseOfferingId}>
                  {course.label}
                </option>
              ))}
            </select>
            <ChevronDown size={18} />
          </div>
        </label>
        {selectedOffering && <p className="assign-modal-selected">Selected course: <strong>{selectedOffering.label}</strong></p>}
        {(error || assignmentError) && <p className="assign-modal-error">{error || assignmentError}</p>}
        <div className="assign-modal-current">
          <h3>Current Courses</h3>
          {currentInstructor?.courses?.length > 0 ? (
            currentInstructor.courses.map((course) => <span key={course}><Info size={12} /> {course}</span>)
          ) : (
            <span><Info size={12} /> No current courses</span>
          )}
        </div>
        <footer>
          <button type="button" onClick={onClose ?? (() => navigate("/admin/assign-instructor"))} disabled={isSubmitting}>Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={!currentInstructor || !selectedCourse || isSubmitting}>
            {isSubmitting ? "Assigning..." : "Confirm Assignment"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function AssignInstructor() {
  const [open, setOpen] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignmentOptions() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [backendInstructors, backendCourseOfferings] = await Promise.all([
          listAdminInstructors(),
          listCourseOfferings(),
        ]);

        if (!isMounted) {
          return;
        }

        setInstructors(backendInstructors);
        setCourseOfferings(backendCourseOfferings);
        setSelectedInstructor(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(error?.message || "Assignment options could not be loaded.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAssignmentOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAssign = async (payload) => {
    setAssignmentError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await assignInstructorToOffering(payload);

      try {
        await listCourseOfferingInstructors(payload.course_offering_id);
      } catch (error) {
        console.info(
          `[LearnUp] Assignment verification skipped (${error?.status || 0}: ${error?.message || "Unknown error"}).`,
        );
      }

      setOpen(false);
      setSuccessMessage("Faculty member assigned successfully.");
      setSelectedInstructor(null);
    } catch (error) {
      setAssignmentError(error?.message || "Faculty member could not be assigned. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-app-shell assign-instructor-page-v2">
      <AdminSidebar />
      <div className="admin-page-area">
        <AdminTopbar />
        <main className="assign-instructor-main">
          <p className="assign-breadcrumb"><span>Faculty Members</span> &gt; <strong>Assign Faculty Member</strong></p>
          <h1>Select Faculty Member for CS303</h1>
          <p>Available computer science faculty for the Advanced Algorithms course.</p>
          {successMessage && <p className="assign-page-status assign-page-status--success" role="status">{successMessage}</p>}
          {loadError && <p className="assign-page-status assign-page-status--error" role="alert">{loadError}</p>}

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
                {instructors.map((instructor) => {
                  const full = instructor.progress === 100;
                  const selected = selectedInstructor === instructor;
                  return (
                    <tr
                      key={instructor.instructorId}
                      className={`${full ? "is-muted" : ""} ${selected ? "is-selected" : ""}`}
                      onClick={() => {
                        setSelectedInstructor(instructor);
                        setSuccessMessage("");
                      }}
                    >
                      <td>
                        <span className="admin-person-avatar">{getInitials(instructor.name)}</span>
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
                          {instructor.courses.length > 0 ? (
                            instructor.courses.map((course) => <span key={course}>{course}</span>)
                          ) : (
                            <span>No courses</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!isLoading && instructors.length === 0 && (
              <p className="assign-empty-state">No faculty members are available.</p>
            )}
          </section>

          <div className="assign-bottom-actions">
            <button type="button">Cancel</button>
            <button
              type="button"
              onClick={() => {
                setAssignmentError("");
                setSuccessMessage("");
                setOpen(true);
              }}
              disabled={!selectedInstructor || courseOfferings.length === 0}
            >
              Assign Faculty Member <CheckCircle size={14} />
            </button>
          </div>
        </main>
      </div>
      {open && (
        <AssignInstructorModal
          assignmentError={assignmentError}
          courseOfferings={courseOfferings}
          instructor={selectedInstructor}
          isSubmitting={isSubmitting}
          onAssign={handleAssign}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
