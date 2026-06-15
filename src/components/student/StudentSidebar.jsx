import {
  Bot,
  Grid2X2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ScrollText,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import learnupLogo from "../../assets/learnup-logo.png";
import { clearCurrentSession } from "../../utils/learnupRecords.js";
import "./studentShell.css";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
  { label: "Course board", icon: ScrollText, to: "/student/course-board" },
  { label: "Academic map", icon: GraduationCap, to: "/student/academic-map" },
  { label: "Semester result", icon: Grid2X2, to: "/student/semester-result" },
];

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="student-sidebar-v2">
      <Link to="/student/dashboard" className="student-sidebar-v2__logo" aria-label="LearnUp dashboard">
        <img src={learnupLogo} alt="LearnUp" className="learnup-logo" />
      </Link>

      <nav className="student-sidebar-v2__nav" aria-label="Student navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`student-sidebar-v2__link ${isActive ? "student-sidebar-v2__link--active" : ""}`}
            >
              <Icon size={25} strokeWidth={2.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="student-sidebar-v2__bottom">
        <Link
          to="/student/academic-advisor-bot"
          className="student-sidebar-v2__bot"
        >
          <Bot size={23} strokeWidth={2.5} />
          <span>Academic Advisor Bot</span>
        </Link>
        <button
          type="button"
          className="student-sidebar-v2__logout"
          onClick={() => {
            clearCurrentSession();
            navigate("/login");
          }}
        >
          <LogOut size={15} strokeWidth={2.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
