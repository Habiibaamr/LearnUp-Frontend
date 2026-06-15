import { Bell, CircleHelp, MessageSquare, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./studentShell.css";

export default function StudentTopbar({ dashboardTabs = false }) {
  const navigate = useNavigate();

  return (
    <header className={`student-topbar-v2 ${dashboardTabs ? "student-topbar-v2--dashboard" : ""}`}>
      <label className="student-topbar-v2__search">
        <Search size={16} strokeWidth={2.25} />
        <input
          type="search"
          placeholder={
            dashboardTabs
              ? "Search courses, terms..."
              : "Search for courses, professors, or departments..."
          }
        />
      </label>

      {dashboardTabs && (
        <nav className="student-topbar-v2__tabs" aria-label="Dashboard sections">
          <button type="button" className="is-active">Term Overview</button>
          <button type="button">Degree Audit</button>
          <button type="button">Course Catalog</button>
          <button type="button" className="student-topbar-v2__chat-tab">
            <MessageSquare size={14} strokeWidth={2.4} />
            <span>Chatbot Support</span>
          </button>
        </nav>
      )}

      <div className="student-topbar-v2__actions">
        <button type="button" aria-label="Notifications">
          <Bell size={19} strokeWidth={2} />
        </button>
        {dashboardTabs ? (
          <button type="button" aria-label="Settings">
            <Settings size={19} strokeWidth={2} />
          </button>
        ) : (
          <button type="button" aria-label="Help">
            <CircleHelp size={19} strokeWidth={2} />
          </button>
        )}
        <button type="button" className="student-topbar-v2__user" onClick={() => navigate("/student/profile")}>
          <div>
            <strong>Alex Rivera</strong>
            <span>LEVEL 200</span>
          </div>
          <span className="student-topbar-v2__avatar" aria-label="Alex Rivera" role="img" />
        </button>
      </div>
    </header>
  );
}
