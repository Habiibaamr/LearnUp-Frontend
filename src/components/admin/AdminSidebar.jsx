import {
  Grid2X2,
  LogOut,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import learnupLogo from "../../assets/learnup-logo.png";
import { clearCurrentSession } from "../../utils/learnupRecords.js";
import "./adminShell.css";

const navItems = [
  { label: "Dashboard", icon: Grid2X2, to: "/admin/dashboard" },
  { label: "create student", icon: UserPlus, to: "/admin/create-student" },
  { label: "create faculty member", icon: ShieldCheck, to: "/admin/create-instructor" },
  { label: "assign faculty member", icon: UsersRound, to: "/admin/assign-instructor" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar-v2">
      <Link to="/admin/dashboard" className="admin-sidebar-v2__logo" aria-label="LearnUp admin dashboard">
        <img src={learnupLogo} alt="LearnUp" className="learnup-logo" />
      </Link>

      <nav className="admin-sidebar-v2__nav" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-sidebar-v2__link ${isActive ? "admin-sidebar-v2__link--active" : ""}`}
            >
              <Icon size={24} strokeWidth={2.45} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-v2__bottom">
        <button
          type="button"
          className="admin-sidebar-v2__logout"
          onClick={() => {
            clearCurrentSession();
            navigate("/login");
          }}
        >
          <LogOut size={14} strokeWidth={2.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
