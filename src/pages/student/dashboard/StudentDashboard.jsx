import {
  AtSign,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import { ACCESS_TOKEN_STORAGE_KEY } from "../../../services/apiClient.js";
import {
  fetchCurrentStudentProfile,
  getStudentDepartmentLabel,
  getStudentDisplayName,
  getStudentLevelLabel,
  persistStudentProfile,
  readStoredStudentProfile,
} from "../../../services/studentProfile.js";
import { getCurrentSession } from "../../../utils/learnupRecords.js";
import {
  getEffectiveGpa,
  getPassedCreditHours,
  getRiskStatus,
} from "../../../utils/studentAcademic.js";
import "./studentDashboard.css";

// Mock course-board preview rows stay in place until student course-board data is wired.
const rows = [
  {
    icon: Sparkles,
    name: "Advanced Artificial Intelligence",
    code: "CS-3021",
    credits: "4 Credits",
    status: "AVAILABLE",
    tone: "available",
    description: "You are eligible for this course based on",
    action: "Enroll Now",
  },
  {
    icon: Check,
    name: "Human-Computer Interaction",
    code: "UXD-202",
    credits: "3 Credits",
    status: "ENROLLED",
    tone: "enrolled",
    description: "You have successfully enrolled",
    action: "Enrolled",
  },
  {
    icon: Lock,
    name: "Advanced Algorithm 2",
    code: "UXD-202",
    credits: "3 Credits",
    status: "LOCKED",
    tone: "locked",
    description: "You can't enroll in this course due to...",
    action: "Locked",
  },
  {
    icon: ShieldCheck,
    name: "Computer Graphics",
    code: "UXD-202",
    credits: "3 Credits",
    status: "PASSED",
    tone: "passed",
    description: "You have successfully passed...",
    action: "Passed",
  },
];

const tabs = ["All Courses", "Available", "Enrolled", "Locked", "Passed"];

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

const getNestedValue = (record, path) => {
  if (!record || !path) {
    return "";
  }

  return path.split(".").reduce((current, segment) => {
    if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
      return current[segment];
    }

    return "";
  }, record);
};

const getStudentValue = (record, keys) => {
  const sources = [record, record?.student, record?.user, record?.account].filter(Boolean);

  for (const source of sources) {
    for (const key of keys) {
      const value = key.includes(".") ? getNestedValue(source, key) : source?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  return "";
};

const getStudentEmail = (record) => getStudentValue(record, ["email", "user.email"]) || "";
const getStudentId = (record) => getStudentValue(record, ["university_id", "student_id", "id", "user.university_id", "user.student_id"]) || "";
const getStudentAdvisor = (record) => {
  const value = getStudentValue(record, [
    "advisor_name",
    "advisor.full_name",
    "advisorName",
    "advisor",
  ]);
  const advisorId = getStudentValue(record, ["advisor_instructor_id", "advisorInstructorId"]);
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (value && !/(pending|not assigned|unassigned|none)/.test(normalizedValue)) {
    return typeof value === "object"
      ? value.full_name || value.name || "Academic advisor assigned"
      : value;
  }

  return advisorId
    ? `Academic advisor assigned (ID ${advisorId})`
    : "Academic advisor not assigned";
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Courses");
  const [currentStudent, setCurrentStudent] = useState(() => readStoredStudentProfile());
  const [loadingStudent, setLoadingStudent] = useState(!readStoredStudentProfile());

  const filteredRows = useMemo(() => {
    if (activeTab === "All Courses") {
      return rows;
    }

    return rows.filter((row) => row.tone === activeTab.toLowerCase());
  }, [activeTab]);

  const studentName = getStudentDisplayName(currentStudent);
  const studentEmail = getStudentEmail(currentStudent);
  const studentId = getStudentId(currentStudent);
  const studentDepartment = getStudentDepartmentLabel(currentStudent);
  const studentLevel = getStudentLevelLabel(currentStudent);
  const studentAdvisor = getStudentAdvisor(currentStudent);
  const creditsEarned = getPassedCreditHours(currentStudent || {});
  const currentGpa = getEffectiveGpa(currentStudent || {});
  const riskStatus = getRiskStatus(currentStudent || {});
  const completionPercent = Math.min(100, Math.round((creditsEarned / 120) * 100));
  const remainingCredits = Math.max(0, 120 - creditsEarned);

  useEffect(() => {
    const token = getStorageItem(ACCESS_TOKEN_STORAGE_KEY);
    const session = getCurrentSession();

    if (!token && !session?.isDemoSession) {
      persistStudentProfile(null);
      navigate("/login", { replace: true });
      return;
    }

    if (session?.isDemoSession) {
      setCurrentStudent(readStoredStudentProfile());
      setLoadingStudent(false);
      return;
    }

    let isMounted = true;

    async function loadStudentProfile() {
      setLoadingStudent(true);

      try {
        const profile = await fetchCurrentStudentProfile(readStoredStudentProfile() || {});

        if (isMounted) {
          setCurrentStudent(profile);
          persistStudentProfile(profile);
        }
      } catch (error) {
        if (error?.status === 401) {
          persistStudentProfile(null);
          setStorageItem(ACCESS_TOKEN_STORAGE_KEY, "");
          if (isMounted) {
            navigate("/login", { replace: true });
          }
          return;
        }

        const storedStudent = readStoredStudentProfile();
        if (isMounted && storedStudent) {
          setCurrentStudent(storedStudent);
        }
      } finally {
        if (isMounted) {
          setLoadingStudent(false);
        }
      }
    }

    loadStudentProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="student-app-shell student-dashboard-page">
      <StudentSidebar />

      <div className="student-page-area">
        <StudentTopbar dashboardTabs />

        <main className="student-dashboard-main">
          <section className="student-dashboard-hero">
            <div>
              <h1>{loadingStudent ? "Welcome back" : `Welcome back, ${studentName}`}</h1>
              <p>Your academic journey is on track. Here&apos;s your current status.</p>
            </div>
            <span className="student-dashboard-hero__term">ACTIVE TERM</span>
          </section>

          <section className="student-dashboard-overview">
            <article className="student-profile-card-v2">
              <div className="student-profile-card-v2__avatar-wrap">
                <span className="student-profile-card-v2__avatar" />
                <button type="button" aria-label="Change profile image">
                  <Camera size={14} />
                </button>
              </div>
              <h2>{studentName}</h2>
              <p>{studentDepartment}</p>
              <p>{studentLevel}</p>

              <div className="student-profile-card-v2__line" />
              <dl>
                <div>
                  <span><UserRoundSearch size={17} /></span>
                  <div>
                    <dt>Academic Advisor</dt>
                    <dd>{studentAdvisor}</dd>
                  </div>
                </div>
                <div>
                  <span><AtSign size={17} /></span>
                  <div>
                    <dt>Student ID</dt>
                    <dd>{studentId || "Student ID not provided"}</dd>
                  </div>
                </div>
                <div>
                  <span><AtSign size={17} /></span>
                  <div>
                    <dt>Email</dt>
                    <dd>{studentEmail || "Email not provided"}</dd>
                  </div>
                </div>
              </dl>
            </article>

            <article className="student-progress-card-v2">
              <div className="student-progress-card-v2__head">
                <div>
                  <span>DEGREE MILESTONE</span>
                  <h2>Academic Progress</h2>
                </div>
                <div className="student-progress-card-v2__percent">
                  <strong>{completionPercent}%</strong>
                  <small>OF DEGREE COMPLETED</small>
                </div>
              </div>

              <div className="student-progress-card-v2__bar">
                <span style={{ width: `${completionPercent}%` }} />
              </div>

              <div className="student-progress-card-v2__stats">
                <div>
                  <span>Credits Earned</span>
                  <strong>{creditsEarned}/120</strong>
                </div>
                <div>
                  <span>Current GPA</span>
                  <strong>{currentGpa === null ? "-" : currentGpa.toFixed(2)}</strong>
                </div>
                <div className="is-highlighted">
                  <span>Remaining</span>
                  <strong>{remainingCredits} Credit hours</strong>
                </div>
              </div>

              <div className="student-progress-card-v2__foot">
                <p>Academic Status: <strong>{riskStatus.label}</strong></p>
                <button type="button" onClick={() => navigate("/student/degree-audit")}>
                  View Detailed Audit <ChevronRight size={16} />
                </button>
              </div>
            </article>
          </section>

          <section className="student-dashboard-board">
            <div className="student-dashboard-board__title">
              <h2>course board</h2>
              <Link to="/student/course-board">see All</Link>
            </div>

            <div className="student-dashboard-board__toolbar">
              <div className="student-dashboard-board__tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    aria-selected={activeTab === tab}
                    className={activeTab === tab ? "is-active" : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <label className="student-dashboard-board__filter">
                <Filter size={16} />
                <input type="search" placeholder="Filter by code or name..." />
              </label>
            </div>

            <div className="student-dashboard-table-card">
              <table>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Course Code</th>
                    <th>Credit Hours</th>
                    <th>Course Status</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <tr key={row.name}>
                        <td>
                          <span className={`student-dashboard-table-card__course-icon is-${row.tone}`}>
                            <Icon size={15} />
                          </span>
                          <strong>{row.name}</strong>
                        </td>
                        <td>{row.code}</td>
                        <td><Clock3 size={13} /> {row.credits}</td>
                        <td>
                          <span className={`student-dashboard-status is-${row.tone}`}>{row.status}</span>
                        </td>
                        <td>{row.description}</td>
                        <td>
                          <button type="button" className={`student-dashboard-action is-${row.tone}`}>
                            {row.action}
                            {row.tone === "available" && <ChevronRight size={15} />}
                            {row.tone === "enrolled" && <Check size={14} />}
                            {row.tone === "locked" && <Lock size={13} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="student-dashboard-table-card__footer">
                <span>Showing {filteredRows.length} courses available for your level</span>
                <div>
                  <button type="button">‹</button>
                  <button type="button" className="is-active">1</button>
                  <button type="button">›</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
