import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser, getCurrentUserSnapshot } from "../../services/currentUser.js";
import "./adminShell.css";

export default function AdminTopbar() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => getCurrentUserSnapshot());

  useEffect(() => {
    let isMounted = true;
    fetchCurrentUser().then((user) => {
      if (isMounted && user) setAdmin(user);
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const name = admin?.full_name || admin?.fullName || admin?.name || "Administrator";
  const role = String(admin?.role || "Admin").replace(/_/g, " ").toUpperCase();

  return (
    <header className="admin-topbar-v2">
      <label className="admin-topbar-v2__search">
        <input type="search" placeholder="Search resources, students or courses..." />
      </label>
      <div className="admin-topbar-v2__right">
        <button type="button" className="admin-topbar-v2__profile" onClick={() => navigate("/admin/profile")}>
          <span className="admin-topbar-v2__user">
            <strong>{name}</strong>
            <span>{role}</span>
          </span>
          <span className="admin-topbar-v2__avatar" aria-label={name} role="img" />
        </button>
      </div>
    </header>
  );
}
