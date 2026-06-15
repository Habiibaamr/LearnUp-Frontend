import { CircleHelp, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  encodeRecordId,
  getCurrentSession,
  resolveFacultyForSession,
  setSelectedFacultyId,
} from "../../utils/learnupRecords.js";
import "./facultyShell.css";

export default function FacultyTopbar() {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    const session = getCurrentSession();
    const faculty = resolveFacultyForSession(session?.email);

    if (!faculty) {
      navigate("/faculty/profile");
      return;
    }

    setSelectedFacultyId(faculty.id);
    navigate(`/faculty/profile/${encodeRecordId(faculty.id)}`, {
      state: { facultyId: faculty.id },
    });
  };

  return (
    <header className="faculty-topbar">
      <label className="faculty-topbar__search">
        <Search size={14} strokeWidth={2.4} />
        <input type="search" placeholder="Search students, courses..." />
      </label>

      <nav className="faculty-topbar__tabs" aria-label="Faculty views">
        <button type="button" className="is-active">Overview</button>
      </nav>

      <div className="faculty-topbar__actions">
        <button type="button" aria-label="Help"><CircleHelp size={18} /></button>
        <button type="button" aria-label="Settings"><Settings size={18} /></button>
        <button type="button" className="faculty-avatar-button" onClick={handleViewProfile} aria-label="View faculty profile">
          <span className="faculty-avatar" aria-label="Dr. Amira Ahmed" role="img" />
        </button>
      </div>
    </header>
  );
}
