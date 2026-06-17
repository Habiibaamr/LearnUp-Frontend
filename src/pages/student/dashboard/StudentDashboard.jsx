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
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
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

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("All Courses");

  const filteredRows = useMemo(() => {
    if (activeTab === "All Courses") {
      return rows;
    }

    return rows.filter((row) => row.tone === activeTab.toLowerCase());
  }, [activeTab]);

  return (
    <div className="student-app-shell student-dashboard-page">
      <StudentSidebar />

      <div className="student-page-area">
        <StudentTopbar dashboardTabs />

        <main className="student-dashboard-main">
          <section className="student-dashboard-hero">
            <div>
              <h1>Welcome back, Alex Rivera</h1>
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
              <h2>Alex Rivera</h2>
              <p>CS - AI</p>
              <p>level 200</p>

              <div className="student-profile-card-v2__line" />
              <dl>
                <div>
                  <span><UserRoundSearch size={17} /></span>
                  <div>
                    <dt>Academic Advisor</dt>
                    <dd>Dr. Amira Ahmed</dd>
                  </div>
                </div>
                <div>
                  <span><AtSign size={17} /></span>
                  <div>
                    <dt>Student ID</dt>
                    <dd>#CS-225140</dd>
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
                  <strong>75%</strong>
                  <small>OF DEGREE COMPLETED</small>
                </div>
              </div>

              <div className="student-progress-card-v2__bar"><span /></div>

              <div className="student-progress-card-v2__stats">
                <div>
                  <span>Credits Earned</span>
                  <strong>90/120</strong>
                </div>
                <div>
                  <span>Current GPA</span>
                  <strong>3.82</strong>
                </div>
                <div className="is-highlighted">
                  <span>Remaining</span>
                  <strong>30 Credits hours</strong>
                </div>
              </div>

              <div className="student-progress-card-v2__foot">
                <p>Estimated Graduation: <strong>June 2026</strong></p>
                <button type="button">
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
