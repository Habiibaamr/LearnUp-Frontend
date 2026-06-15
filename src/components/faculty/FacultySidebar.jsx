import { LayoutDashboard, LogOut, ScrollText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import learnupLogo from "../../assets/learnup-logo.png";
import { clearCurrentSession } from "../../utils/learnupRecords.js";
import "./facultyShell.css";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/faculty/dashboard" },
  { label: "Course Board", icon: ScrollText, to: "/faculty/course-board" },
];

export default function FacultySidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="faculty-sidebar">
      <Link to="/faculty/dashboard" className="faculty-sidebar__logo" aria-label="LearnUp faculty dashboard">
        <img src={learnupLogo} alt="LearnUp" />
      </Link>

      <nav className="faculty-sidebar__nav" aria-label="Faculty navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.to ||
            (item.to === "/faculty/course-board" && location.pathname.startsWith("/faculty/courses"));

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`faculty-sidebar__link ${active ? "faculty-sidebar__link--active" : ""}`}
            >
              <Icon size={24} strokeWidth={2.6} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="faculty-sidebar__bottom">
        <button
          type="button"
          className="faculty-sidebar__logout"
          onClick={() => {
            clearCurrentSession();
            navigate("/login");
          }}
        >
          <LogOut size={14} strokeWidth={2.6} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
