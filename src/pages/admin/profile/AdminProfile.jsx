import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser, getCurrentUserSnapshot } from "../../../services/currentUser.js";
import { getInitials } from "../../../utils/learnupRecords.js";
import "../../student/profile/studentProfile.css";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => getCurrentUserSnapshot());

  useEffect(() => {
    let isMounted = true;

    fetchCurrentUser()
      .then((currentUser) => {
        if (isMounted && currentUser) {
          setAdmin(currentUser);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const name = admin?.full_name || admin?.fullName || admin?.name || "Administrator";
  const email = admin?.email || "Email not provided";
  const role = String(admin?.role || "Admin").replace(/_/g, " ");
  const position = admin?.position || admin?.title || "Platform Administrator";

  return (
    <main className="student-profile-page">
      <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={28} />
      </button>
      <section className="student-profile-card">
        <header className="student-profile-header">
          <span className="student-profile-avatar">{getInitials(name)}</span>
          <h1>{name}</h1>
          <p>{role}</p>
        </header>
        <section className="student-profile-info" aria-label="Admin profile details">
          <div><span>Role</span><strong>{position}</strong></div>
          <div><span>Email</span><strong>{email}</strong></div>
          <div><span>User ID</span><strong>{admin?.id || admin?.user_id || "Not provided"}</strong></div>
          <div><span>Access Level</span><strong>{role}</strong></div>
        </section>
      </section>
    </main>
  );
}
