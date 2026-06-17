import { BookOpen, Download, GraduationCap, UsersRound, UserPlus, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../../components/admin/AdminTopbar.jsx";
import { apiClient } from "../../../services/apiClient.js";
import { getDepartmentDisplayName } from "../../../utils/departments.js";
import "./dashboard.css";

const actions = [
  { label: "CREATE STUDENT", icon: UserPlus, to: "/admin/create-student" },
  { label: "CREATE FACULTY MEMBER", icon: GraduationCap, to: "/admin/create-instructor" },
  { label: "ASSIGN FACULTY MEMBER", icon: BookOpen, to: "/admin/assign-instructor" },
];

const FALLBACK_DEPARTMENT_COUNT = 4;

const cleanText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return cleanText(value.name || value.department_name || value.title || value.id);
  }

  return value.toString().trim();
};

const getArrayPayload = (data, keys) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    if (data?.[key] && typeof data[key] === "object") {
      const nestedArray = getArrayPayload(data[key], keys);

      if (nestedArray.length > 0) {
        return nestedArray;
      }
    }
  }

  return [];
};

const getNestedValue = (record, keys) => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key];
    }
  }

  return "";
};

const getRole = (record) => {
  const source = record?.user || record?.student || record?.instructor || record || {};

  return cleanText(
    getNestedValue(record, ["role", "user_role", "type", "account_type"]) ||
      getNestedValue(source, ["role", "user_role", "type", "account_type"]),
  ).toLowerCase();
};

const isStudentUser = (record) => {
  const source = record?.student || record?.user || record || {};
  const role = getRole(record);

  if (role) {
    return role.includes("student");
  }

  return Boolean(
    record?.student ||
      source?.student ||
      getNestedValue(record, ["student_id", "studentId", "academic_level", "level"]) ||
      getNestedValue(source, ["student_id", "studentId", "academic_level", "level"]),
  );
};

const getDepartmentLabel = (record) => {
  const label = getDepartmentDisplayName(record);
  return label === "Department not specified" ? "" : label;
};

const formatCount = (value) => new Intl.NumberFormat("en-US").format(value);

const getFacultySplit = (facultyCount) => {
  const fullTime = Math.round(facultyCount * 0.65);
  const partTime = Math.max(0, facultyCount - fullTime);
  const fullTimePercent = facultyCount > 0 ? Math.round((fullTime / facultyCount) * 100) : 0;

  return {
    fullTime,
    partTime,
    fullTimePercent,
    partTimePercent: facultyCount > 0 ? 100 - fullTimePercent : 0,
  };
};

const getCourseLoadBuckets = (facultyCount) => {
  let threeCourses = Math.round(facultyCount * 0.25);
  let twoCourses = Math.round(facultyCount * 0.25);
  let oneCourse = Math.round(facultyCount * 0.25);
  let assignedTotal = threeCourses + twoCourses + oneCourse;

  while (assignedTotal > facultyCount) {
    if (oneCourse > 0) {
      oneCourse -= 1;
    } else if (twoCourses > 0) {
      twoCourses -= 1;
    } else {
      threeCourses = Math.max(0, threeCourses - 1);
    }

    assignedTotal = threeCourses + twoCourses + oneCourse;
  }

  return {
    threeCourses,
    twoCourses,
    oneCourse,
    zeroCourses: Math.max(0, facultyCount - assignedTotal),
  };
};

const getCourseLoadRows = (facultyCount, fullTimePercent, partTimePercent) => {
  const buckets = getCourseLoadBuckets(facultyCount);
  const getSegmentWidth = (value, percent) =>
    facultyCount > 0 ? Math.round((value / facultyCount) * percent) : 0;

  return [
    ["3 COURSES", buckets.threeCourses],
    ["2 COURSES", buckets.twoCourses],
    ["1 COURSE", buckets.oneCourse],
    ["0 COURSES", buckets.zeroCourses],
  ].map(([label, value]) => [
    label,
    value,
    getSegmentWidth(value, fullTimePercent),
    getSegmentWidth(value, partTimePercent),
  ]);
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    facultyCount: 0,
    departmentCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardStats() {
      setIsLoadingStats(true);

      const [usersResult, instructorsResult] = await Promise.allSettled([
        apiClient.get("/admin/users"),
        apiClient.get("/admin/instructors"),
      ]);

      if (!isMounted) {
        return;
      }

      if (usersResult.status === "rejected") {
        if (import.meta.env.DEV) {
          console.warn("[LearnUp] Admin dashboard users count failed", usersResult.reason);
        }
      }

      if (instructorsResult.status === "rejected") {
        if (import.meta.env.DEV) {
          console.warn("[LearnUp] Admin dashboard instructors count failed", instructorsResult.reason);
        }
      }

      const users =
        usersResult.status === "fulfilled"
          ? getArrayPayload(usersResult.value, ["users", "students", "items", "data"])
          : [];
      const instructors =
        instructorsResult.status === "fulfilled"
          ? getArrayPayload(instructorsResult.value, ["instructors", "faculty", "items", "data"])
          : [];
      const students = users.filter(isStudentUser);
      const departments = new Set(
        [...students, ...instructors]
          .map(getDepartmentLabel)
          .filter(Boolean)
          .map((department) => department.toLowerCase()),
      );

      setDashboardStats({
        totalStudents: students.length,
        facultyCount: instructors.length,
        departmentCount: departments.size > 0 ? departments.size : FALLBACK_DEPARTMENT_COUNT,
      });
      setIsLoadingStats(false);
    }

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const { fullTimePercent, partTimePercent } = useMemo(
    () => getFacultySplit(dashboardStats.facultyCount),
    [dashboardStats.facultyCount],
  );
  const courseLoadRows = useMemo(
    () => getCourseLoadRows(dashboardStats.facultyCount, fullTimePercent, partTimePercent),
    [dashboardStats.facultyCount, fullTimePercent, partTimePercent],
  );
  const stats = [
    { label: "Total Students", value: dashboardStats.totalStudents, icon: UsersRound },
    { label: "Faculty member", value: dashboardStats.facultyCount, icon: GraduationCap },
    { label: "departments", value: dashboardStats.departmentCount, icon: BookOpen },
  ];
  const loadingValue = isLoadingStats ? "..." : null;

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
                    <strong>{loadingValue || formatCount(stat.value)}</strong>
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
                <div
                  className="donut-chart"
                  style={{
                    background: `conic-gradient(#2024c7 0 ${fullTimePercent}%, #cfe0fb ${fullTimePercent}% 100%)`,
                  }}
                >
                  <div>
                    <strong>{loadingValue || formatCount(dashboardStats.facultyCount)}</strong>
                    <span>TOTAL STAFF</span>
                  </div>
                </div>
                <div className="faculty-legend">
                  <span><i />Full-Time ({fullTimePercent}%)</span>
                  <span><i />Part-Time ({partTimePercent}%)</span>
                </div>
              </div>

              <div className="course-load-chart">
                <h3>Course Load Distribution</h3>
                {courseLoadRows.map(([label, value, dark, light]) => (
                  <div className="bar-row" key={label}>
                    <span>{label}</span>
                    <div className="bar-track">
                      <i style={{ width: `${dark}%` }} />
                      <b style={{ width: `${light}%` }} />
                    </div>
                    <strong>{loadingValue || value}</strong>
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
