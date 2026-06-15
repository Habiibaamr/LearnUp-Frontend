import FacultySidebar from "./FacultySidebar.jsx";
import FacultyTopbar from "./FacultyTopbar.jsx";

export default function FacultyLayout({ children }) {
  return (
    <div className="faculty-app-shell">
      <FacultySidebar />
      <div className="faculty-page-area">
        <FacultyTopbar />
        {children}
      </div>
    </div>
  );
}
