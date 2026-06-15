import "./studentsEnrolled.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  clearCurrentSession,
  encodeRecordId,
  getInitials,
  getStudents,
  saveStudentRecord,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";

const Icon = ({ children, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Icons = {
  cap: (
    <Icon size={30}>
      <path d="m22 10-10-5-10 5 10 5 10-5Z" />
      <path d="M6 12v5c3.6 2.2 8.4 2.2 12 0v-5" />
      <path d="M22 10v6" />
    </Icon>
  ),
  dashboard: (
    <Icon size={19}>
      <rect width="7" height="9" x="3" y="3" rx="1.5" />
      <rect width="7" height="5" x="14" y="3" rx="1.5" />
      <rect width="7" height="9" x="14" y="12" rx="1.5" />
      <rect width="7" height="5" x="3" y="16" rx="1.5" />
    </Icon>
  ),
  student: (
    <Icon size={19}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </Icon>
  ),
  instructor: (
    <Icon size={19}>
      <path d="M18 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </Icon>
  ),
  assign: (
    <Icon size={19}>
      <path d="M16 3h5v5" />
      <path d="m21 3-7 7" />
      <path d="M8 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M2 21a6 6 0 0 1 12 0" />
    </Icon>
  ),
  bot: (
    <Icon size={18}>
      <rect width="16" height="12" x="4" y="8" rx="3" />
      <path d="M12 4v4" />
      <path d="M8 4h8" />
      <path d="M9 14h.01" />
      <path d="M15 14h.01" />
      <path d="M10 18h4" />
    </Icon>
  ),
  logout: (
    <Icon size={18}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  ),
  search: (
    <Icon size={18}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  ),
  bell: (
    <Icon size={21}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Icon>
  ),
  filter: (
    <Icon size={18}>
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </Icon>
  ),
  chevronLeft: (
    <Icon size={16}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  ),
  chevronRight: (
    <Icon size={16}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  ),
};

const navItems = [
  { label: "Dashboard", icon: Icons.dashboard, to: "/admin/dashboard" },
  { label: "create student", icon: Icons.student, to: "/admin/create-student" },
  { label: "create faculty member", icon: Icons.instructor, to: "/admin/create-instructor" },
  { label: "assign faculty member", icon: Icons.assign, to: "/admin/assign-instructor" },
];

const courseDetails = {
  breadcrumb: ["COURSES", "CS-101", "STUDENTS"],
  title: "Human computer interaction (CS-101)",
  alternateTitle: "Advanced Algorithm Design (CS-101)",
  count: 124,
  instructor: "Dr. Sarah Mitchell",
};

const avatarSvg = (name, colorA, colorB) =>
  `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${colorA}"/>
          <stop offset="1" stop-color="${colorB}"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="28" fill="url(#g)"/>
      <circle cx="28" cy="22" r="8" fill="white" opacity=".9"/>
      <path d="M13 47c2.6-9.2 10-14 15-14s12.4 4.8 15 14" fill="white" opacity=".9"/>
      <text x="28" y="53" text-anchor="middle" font-size="8" font-family="Arial" font-weight="700" fill="#ffffff">${name}</text>
    </svg>
  `)}`;

const students = [
  {
    name: "Elena Rodriguez",
    email: "elena.rodriguez@learnup.edu",
    id: "STU-2024-001",
    level: "Level 2",
    department: "Artificial Intelligence",
    date: "Aug 28, 2026",
    term: "Fall Semester 2026",
    status: "ACTIVE",
    avatar: avatarSvg("ER", "#2563eb", "#14b8a6"),
  },
  {
    name: "Julian Vance",
    email: "julian.vance@learnup.edu",
    id: "STU-2024-014",
    level: "Level 3",
    department: "Information Systems",
    date: "Aug 29, 2026",
    term: "Fall Semester 2026",
    status: "ACTIVE",
    avatar: avatarSvg("JV", "#4f46e5", "#a855f7"),
  },
  {
    name: "Sarah Jenkins",
    email: "sarah.jenkins@learnup.edu",
    id: "STU-2024-037",
    level: "Level 1",
    department: "Cyber Security",
    date: "Sep 02, 2026",
    term: "Fall Semester 2026",
    status: "DROPPED",
    avatar: avatarSvg("SJ", "#64748b", "#94a3b8"),
  },
  {
    name: "Marcus Chen",
    email: "marcus.chen@learnup.edu",
    id: "STU-2024-058",
    level: "Level 4",
    department: "Computer Science",
    date: "Sep 04, 2026",
    term: "Fall Semester 2026",
    status: "ACTIVE",
    avatar: avatarSvg("MC", "#0f766e", "#22c55e"),
  },
];

const levels = ["All Levels", "Level 1", "Level 2", "Level 3", "Level 4"];
const departments = ["All Departments", "Computer Science", "Artificial Intelligence", "Information Systems", "Cyber Security"];

function StudentProfileModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="students-profile-overlay">
      <section className="students-profile-modal" aria-label={`${student.name} profile`}>
        <button type="button" onClick={onClose} aria-label="Close">×</button>
        <img src={student.avatar} alt={`${student.name} avatar`} />
        <h2>{student.name}</h2>
        <p>{student.email}</p>
        <dl>
          <div><dt>Student ID</dt><dd>{student.id}</dd></div>
          <div><dt>Level</dt><dd>{student.level}</dd></div>
          <div><dt>Department</dt><dd>{student.department}</dd></div>
        </dl>
      </section>
    </div>
  );
}

function StudentsEnrolled() {
  const navigate = useNavigate();
  const [storedStudents] = useState(() =>
    getStudents().map((student) => ({
      ...student,
      avatar: student.avatar || avatarSvg(getInitials(student.name), "#2563eb", "#14b8a6"),
      status: student.status || "ACTIVE",
      date: student.date || "Sep 01, 2026",
      term: student.term || "Fall Semester 2026",
    })),
  );
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const studentRows = [
    ...storedStudents,
    ...students.filter((student) => !storedStudents.some((storedStudent) => storedStudent.id === student.id)),
  ];

  const openStudentProfile = (student) => {
    saveStudentRecord(student, { markCreated: false });
    setSelectedStudentId(student.id);
    navigate(`/admin/student/profile/${encodeRecordId(student.id)}`, {
      state: { studentId: student.id },
    });
  };

  const filteredStudents = studentRows.filter((student) => {
    const statusMatches = selectedStatus === "ALL" || student.status === selectedStatus;
    const levelMatches = selectedLevel === "All Levels" || student.level === selectedLevel;
    const departmentMatches = selectedDepartment === "All Departments" || student.department === selectedDepartment;
    return statusMatches && levelMatches && departmentMatches;
  });

  return (
    <div className="students-enrolled-page">
      <aside className="students-sidebar">
        <div className="students-sidebar-logo">
          <div className="students-sidebar-logo__icon">{Icons.cap}</div>
          <span>LearnUp</span>
        </div>

        <nav className="students-sidebar-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `students-sidebar-nav__item${isActive ? " students-sidebar-nav__item--active" : ""}`
              }
              key={item.label}
              to={item.to}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="students-sidebar-footer">
          <button
            className="students-logout-button"
            onClick={() => {
              clearCurrentSession();
              navigate("/login");
            }}
            type="button"
          >
            {Icons.logout}
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="students-main">
        <header className="students-topbar">
          <label className="students-top-search">
            <input
              aria-label="Search resources"
              placeholder="Search resources, students or courses..."
              type="search"
            />
          </label>

          <div className="students-top-profile">
            <button
              className="students-notification-button"
              type="button"
              aria-label="Notifications"
            >
              {Icons.bell}
            </button>
            <button type="button" className="students-top-profile-button" onClick={() => navigate("/admin/profile")}>
              <span className="students-admin-user">
                <span>Executive Admin</span>
                <strong>SUPERUSER</strong>
              </span>
              <img
                className="students-admin-avatar"
                src={avatarSvg("EA", "#172554", "#00a6a6")}
                alt="Executive Admin avatar"
              />
            </button>
          </div>
        </header>

        <section className="students-page-header">
          <div className="students-breadcrumb" aria-label="Breadcrumb">
            {courseDetails.breadcrumb.map((item, index) => (
              <span key={item}>
                {item}
                {index < courseDetails.breadcrumb.length - 1 ? " > " : ""}
              </span>
            ))}
          </div>

          <h1>
            Students Enrolled in:
            <span>{courseDetails.title}</span>
          </h1>
          <p>
            Managing {courseDetails.count} active students in the current semester.
            <br />
            Faculty Member: {courseDetails.instructor}
          </p>
        </section>

        <section className="students-filter-card" aria-label="Student filters">
          <label className="students-filter-search">
            {Icons.search}
            <input placeholder="Search by name, ID or email..." type="search" />
          </label>

          <label className="students-select-field">
            <span>STATUS:</span>
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} aria-label="Status filter">
              <option>ALL</option>
              <option>ACTIVE</option>
              <option>DROPPED</option>
            </select>
          </label>

          <label className="students-select-field">
            <span>LEVEL:</span>
            <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} aria-label="Level filter">
              {levels.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>

          <label className="students-select-field">
            <span>DEPARTMENT:</span>
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} aria-label="Department filter">
              {departments.map((department) => <option key={department}>{department}</option>)}
            </select>
          </label>

          <button className="students-filter-button" type="button" aria-label="Apply filters">
            {Icons.filter}
          </button>
        </section>

        <section className="students-table-card">
          <div className="students-table-wrap">
            <table className="students-table">
              <thead>
                <tr>
                  <th>STUDENT INFORMATION</th>
                  <th>STUDENT ID</th>
                  <th>ENROLLMENT DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} onClick={() => openStudentProfile(student)}>
                    <td>
                      <div className="students-info-cell">
                        <img src={student.avatar} alt={`${student.name} avatar`} />
                        <div>
                          <strong>{student.name}</strong>
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="students-id-cell">{student.id}</td>
                    <td>
                      <div className="students-date-cell">
                        <strong>{student.date}</strong>
                        <span>{student.term}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`students-status students-status--${student.status.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="students-view-profile"
                        onClick={(event) => {
                          event.stopPropagation();
                          openStudentProfile(student);
                        }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="students-pagination-footer">
            <span>SHOWING {filteredStudents.length} OF {studentRows.length} STUDENTS</span>
            <div className="students-pagination" aria-label="Pagination">
              <button type="button" aria-label="Previous page">
                {Icons.chevronLeft}
              </button>
              <button className="students-pagination__page students-pagination__page--active" type="button">
                1
              </button>
              <button className="students-pagination__page" type="button">
                2
              </button>
              <button className="students-pagination__page" type="button">
                3
              </button>
              <button type="button" aria-label="Next page">
                {Icons.chevronRight}
              </button>
            </div>
            <label className="students-rows-field">
              <span>Rows per page:</span>
              <select defaultValue="12" aria-label="Rows per page">
                <option>12</option>
                <option>24</option>
                <option>48</option>
              </select>
            </label>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default StudentsEnrolled;
