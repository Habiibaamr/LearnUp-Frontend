import { Check, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  encodeRecordId,
  findFacultyById,
  getInitials,
  getLastCreatedFaculty,
  setSelectedFacultyId,
} from "../../../../utils/learnupRecords.js";
import "./instructorSuccess.css";

export default function InstructorSuccessPage() {
  const navigate = useNavigate();
  const { facultyId } = useParams();
  const { state } = useLocation();
  const hasRequestedFaculty = Boolean(facultyId || state?.facultyId || state?.instructorId);
  const faculty =
    state?.facultyMember ||
    findFacultyById(facultyId) ||
    findFacultyById(state?.facultyId) ||
    (!hasRequestedFaculty ? getLastCreatedFaculty() : null);

  const handleViewProfile = () => {
    if (!faculty) {
      navigate("/admin/create-instructor");
      return;
    }

    const profileId =
      faculty.backendInstructorId ||
      faculty.instructor_id ||
      faculty.instructorId ||
      faculty.universityId ||
      faculty.id;

    setSelectedFacultyId(faculty.id);
    navigate(`/admin/faculty/profile/${encodeRecordId(profileId)}`, {
      state: {
        facultyId: faculty.id,
        facultyMember: faculty,
        instructorId: faculty.backendInstructorId || faculty.instructor_id || faculty.instructorId,
      },
    });
  };

  return (
    <main className="instructor-success-page">
      <section className="instructor-success-shell">
        <div className="instructor-success-icon"><Check size={40} strokeWidth={3} /></div>
        <h1>Faculty Member Registered<br />Successfully</h1>
        <p>The new faculty member profile has been saved and access credentials have been sent via email.</p>

        <article className="instructor-success-card">
          <div className="instructor-success-details">
            <div><span>FULL NAME</span><strong>{faculty?.name || "New Faculty Member"}</strong></div>
            <div><span>FACULTY MEMBER ID</span><strong>{faculty?.id || "Pending"}</strong></div>
            <div><span>DEPARTMENT</span><strong>{faculty?.department || "Department not specified"}</strong></div>
            <div><span>EMAIL</span><strong>{faculty?.email || "Not provided"}</strong></div>
            <div><span>TITLE</span><strong>{faculty?.title || "Not provided"}</strong></div>
            <div><span>COURSE LOAD</span><strong>{faculty?.courseLoad || faculty?.load || "Not provided"}</strong></div>
          </div>
          <div className="instructor-success-avatar">{getInitials(faculty?.name)}</div>
        </article>

        <div className="instructor-success-actions">
          <button type="button" onClick={handleViewProfile}>VIEW PROFILE</button>
          <button type="button" onClick={() => navigate("/admin/create-instructor")}>REGISTER ANOTHER FACULTY MEMBER</button>
        </div>
        <button type="button" className="instructor-success-return" onClick={() => navigate("/admin/create-instructor")}>
          <ChevronLeft size={16} /> RETURN TO FACULTY MEMBER TABLE
        </button>
      </section>
    </main>
  );
}
