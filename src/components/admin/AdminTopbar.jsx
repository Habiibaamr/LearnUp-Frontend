import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./adminShell.css";

export default function AdminTopbar() {
  const navigate = useNavigate();

  return (
    <header className="admin-topbar-v2">
      <label className="admin-topbar-v2__search">
        <input type="search" placeholder="Search resources, students or courses..." />
      </label>
      <div className="admin-topbar-v2__right">
        <button type="button" aria-label="Notifications" className="admin-topbar-v2__bell">
          <Bell size={16} strokeWidth={2.1} />
        </button>
        <button type="button" className="admin-topbar-v2__profile" onClick={() => navigate("/admin/profile")}>
          <span className="admin-topbar-v2__user">
            <strong>Executive Admin</strong>
            <span>SUPERUSER</span>
          </span>
          <span className="admin-topbar-v2__avatar" aria-label="Executive Admin" role="img" />
        </button>
      </div>
    </header>
  );
}
