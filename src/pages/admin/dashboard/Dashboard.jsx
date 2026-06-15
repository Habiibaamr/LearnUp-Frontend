import { BookOpen, Download, GraduationCap, UsersRound, UserPlus, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../../components/admin/AdminTopbar.jsx";
import "./dashboard.css";

// Mock admin dashboard stats stay in place until admin summary endpoints are wired.
const stats = [
  { label: "Total Students", value: "1,284", icon: UsersRound },
  { label: "Faculty member", value: "86", icon: GraduationCap },
  { label: "departments", value: "4", icon: BookOpen },
];

const actions = [
  { label: "CREATE STUDENT", icon: UserPlus, to: "/admin/create-student" },
  { label: "CREATE FACULTY MEMBER", icon: GraduationCap, to: "/admin/create-instructor" },
  { label: "ASSIGN FACULTY MEMBER", icon: BookOpen, to: "/admin/assign-instructor" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-app-shell admin-dashboard-page">
      <AdminSidebar />
      <div className="admin-page-area">
        <AdminTopbar />
        <main className="admin-dashboard-main">
          <section className="admin-dashboard-heading">
            <h1>Welcome back, Admin</h1>
            <p>Manage users and course assignments</p>
          </section>

          <section className="admin-stats-grid" aria-label="Dashboard statistics">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article key={stat.label} className="admin-stat-card">
                  <span><Icon size={23} strokeWidth={2.4} /></span>
                  <div>
                    <p>{stat.label}</p>
                    <strong>{stat.value}</strong>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="admin-quick-actions">
            <h2><Zap size={16} /> Quick Actions</h2>
            <div>
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} type="button" onClick={() => navigate(action.to)}>
                    <span><Icon size={17} /></span>
                    <strong>{action.label}</strong>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="faculty-analytics">
            <header>
              <div>
                <h2>Faculty Analytics</h2>
                <p>Visualizing staff distribution and workload metrics for faculty members</p>
              </div>
              <button type="button"><Download size={13} /> Export PDF</button>
            </header>

            <div className="faculty-analytics__body">
              <div className="faculty-distribution">
                <h3>Faculty Distribution</h3>
                <div className="donut-chart">
                  <div>
                    <strong>45</strong>
                    <span>TOTAL STAFF</span>
                  </div>
                </div>
                <div className="faculty-legend">
                  <span><i />Full-Time (65%)</span>
                  <span><i />Part-Time (35%)</span>
                </div>
              </div>

              <div className="course-load-chart">
                <h3>Course Load Distribution</h3>
                {[
                  ["3 COURSES", "20", 70, 15],
                  ["2 COURSES", "10", 55, 30],
                  ["1 COURSE", "6", 30, 45],
                  ["0 COURSES", "9", 40, 18],
                ].map(([label, value, dark, light]) => (
                  <div className="bar-row" key={label}>
                    <span>{label}</span>
                    <div className="bar-track">
                      <i style={{ width: `${dark}%` }} />
                      <b style={{ width: `${light}%` }} />
                    </div>
                    <strong>{value}</strong>
                  </div>
                ))}
                <div className="course-load-legend">
                  <span><i />FULL-TIME</span>
                  <span><i />PART-TIME</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
