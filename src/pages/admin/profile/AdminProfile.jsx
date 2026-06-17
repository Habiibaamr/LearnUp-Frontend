import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../student/profile/studentProfile.css";

export default function AdminProfile() {
  const navigate = useNavigate();

  return (
    <main className="student-profile-page">
      <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={28} />
      </button>
      <section className="student-profile-card">
        <header className="student-profile-header">
          <span className="student-profile-avatar">EA</span>
          <h1>Executive Admin</h1>
          <p>superuser</p>
        </header>
        <section className="student-profile-info" aria-label="Admin profile details">
          <div><span>Role</span><strong>Platform Administrator</strong></div>
          <div><span>Email</span><strong>admin@eru.ad.eg</strong></div>
          <div><span>Department</span><strong>CS</strong></div>
          <div><span>Access Level</span><strong>Superuser</strong></div>
        </section>
      </section>
    </main>
  );
}
