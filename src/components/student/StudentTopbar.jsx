import { Bell, CircleHelp, MessageSquare, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN_STORAGE_KEY } from "../../services/apiClient.js";
import {
  fetchCurrentStudentProfile,
  getStudentDisplayName,
  getStudentTopbarLevelLabel,
  persistStudentProfile,
  readStoredStudentProfile,
} from "../../services/studentProfile.js";
import { getCurrentSession } from "../../utils/learnupRecords.js";
import "./studentShell.css";

const getStorageItem = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write issues.
  }
};

export default function StudentTopbar({ dashboardTabs = false }) {
  const navigate = useNavigate();
  const [currentStudent, setCurrentStudent] = useState(() => readStoredStudentProfile());

  useEffect(() => {
    const token = getStorageItem(ACCESS_TOKEN_STORAGE_KEY);
    const session = getCurrentSession();

    if (!token && !session?.isDemoSession) {
      navigate("/login", { replace: true });
      return;
    }

    if (session?.isDemoSession) {
      setCurrentStudent(readStoredStudentProfile());
      return;
    }

    let isMounted = true;

    async function loadCurrentStudent() {
      try {
        const profile = await fetchCurrentStudentProfile(readStoredStudentProfile() || {});
        if (isMounted) {
          setCurrentStudent(profile);
          persistStudentProfile(profile);
        }
      } catch (error) {
        if (error?.status === 401) {
          setStorageItem(ACCESS_TOKEN_STORAGE_KEY, "");
          persistStudentProfile(null);
          if (isMounted) {
            navigate("/login", { replace: true });
          }
          return;
        }

        const storedStudent = readStoredStudentProfile();
        if (isMounted && storedStudent) {
          setCurrentStudent(storedStudent);
        }
      }
    }

    loadCurrentStudent();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const displayName = getStudentDisplayName(currentStudent);
  const levelLabel = getStudentTopbarLevelLabel(currentStudent);

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
          <button type="button" onClick={() => navigate("/student/degree-audit")}>Degree Audit</button>
          <button type="button" onClick={() => navigate("/student/course-board")}>Course Catalog</button>
          <button
            type="button"
            className="student-topbar-v2__chat-tab"
            onClick={() => navigate("/student/academic-advisor-bot")}
          >
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
            <strong>{displayName}</strong>
            <span>{levelLabel}</span>
          </div>
          <span className="student-topbar-v2__avatar" aria-label={displayName} role="img" />
        </button>
      </div>
    </header>
  );
}
