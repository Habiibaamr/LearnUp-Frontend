import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  GraduationCap,
  MoreHorizontal,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { facultyStudents } from "../../../data/facultyStudents.js";
import { mapBackendStudent } from "../../../services/adminAccounts.js";
import { apiClient } from "../../../services/apiClient.js";
import {
  findStudentById,
  getCurrentSession,
  getInitials,
  getSelectedStudent,
  resolveStudentForSession,
  setSelectedStudentId,
} from "../../../utils/learnupRecords.js";
import { getDepartmentDisplayName } from "../../../utils/departments.js";
import "./studentProfile.css";

const enrollmentRows = [
  {
    course: "Advanced Algorithms",
    code: "CS-401",
    instructor: "Dr. Alan Turing",
    grade: "A",
    attendance: 96,
  },
  {
    course: "Database Systems",
    code: "DB-240",
    instructor: "Prof. Elena Rodriguez",
    grade: "A-",
    attendance: 91,
  },
  {
    course: "Machine Learning",
    code: "CS-390",
    instructor: "Dr. Arjun Kapoor",
    grade: "B+",
    attendance: 88,
  },
];

const normalizeKey = (value) => value?.toString().trim().toLowerCase() || "";
const clean = (value) => value?.toString().trim() || "";

const getArrayPayload = (data, keys) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

const getStudentSources = (record) =>
  [record, record?.student, record?.user, record?.account].filter(Boolean);

const getNumericValue = (record, keys) => {
  for (const source of getStudentSources(record)) {
    for (const key of keys) {
      const numeric = Number(source?.[key]);

      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
  }

  return null;
};

const getUniversityId = (record) => {
  for (const source of getStudentSources(record)) {
    const universityId = clean(source.university_id || source.universityId || source.studentId);

    if (universityId) {
      return universityId;
    }
  }

  return "";
};

const matchesStudentProfileId = (record, profileId) => {
  const normalizedProfileId = normalizeKey(profileId);
  const numericProfileId = Number(profileId);

  if (!normalizedProfileId) {
    return false;
  }

  if (normalizeKey(getUniversityId(record)) === normalizedProfileId) {
    return true;
  }

  if (!Number.isFinite(numericProfileId)) {
    return false;
  }

  return ["student_id", "id", "user_id"].some(
    (key) => getNumericValue(record, [key]) === numericProfileId,
  );
};

const getStateStudent = (state) =>
  state?.student || state?.createdStudent || state?.profileStudent || null;

function findFacultyStudentById(id) {
  const key = normalizeKey(id);
  return facultyStudents.find((student) => normalizeKey(student.id) === key) || null;
}

function findProfileStudent(id) {
  const savedStudent = findStudentById(id);
  const facultyStudent = findFacultyStudentById(id);

  if (savedStudent && facultyStudent) {
    return {
      ...savedStudent,
      ...facultyStudent,
      academicStatus: savedStudent.academicStatus || facultyStudent.status,
      enrollmentStatus: savedStudent.enrollmentStatus || "Enrolled",
      totalHoursPassed: savedStudent.totalHoursPassed,
      gradYear: savedStudent.gradYear,
    };
  }

  return facultyStudent || savedStudent;
}

function parseNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value?.toString().replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCredits(student) {
  const savedHours = parseNumber(student?.totalHoursPassed, 0);

  if (savedHours > 0) {
    return Math.min(120, Math.round(savedHours));
  }

  if (student?.level?.includes("4")) return 102;
  if (student?.level?.includes("3")) return 78;
  if (student?.level?.includes("2")) return 48;
  return 24;
}

function getAttendance(student) {
  const attendance = parseNumber(student?.attendance, 0);
  const gpa = parseNumber(student?.gpa, 3);

  if (attendance > 0) {
    return Math.round(attendance);
  }

  if (gpa >= 3.5) return 96;
  if (gpa >= 2.5) return 88;
  return 68;
}

function getRisk(student) {
  const gpa = parseNumber(student?.gpa, 0);

  if (gpa < 2.5) {
    return { label: "High Risk", className: "high" };
  }

  if (gpa < 3) {
    return { label: "Medium Risk", className: "medium" };
  }

  return { label: "Low Risk", className: "low" };
}

function getLearnerStatus(student) {
  const status = normalizeKey(student?.status || student?.academicStatus);

  if (status.includes("risk")) {
    return "Needs Support";
  }

  if (status.includes("excellent")) {
    return "Excellent Learner";
  }

  return "Active Learner";
}

function buildTrend(gpa) {
  const current = parseNumber(gpa, 3.2);
  return [
    Math.max(1.5, current - 0.45),
    Math.max(1.5, current - 0.25),
    Math.max(1.5, current - 0.12),
    current,
  ].map((value) => Math.min(4, value));
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { state } = useLocation();
  const session = getCurrentSession();
  const stateStudent = getStateStudent(state);
  const profileUrlId = decodeURIComponent(clean(studentId || state?.studentId || stateStudent?.backendStudentId || stateStudent?.student_id || stateStudent?.universityId || stateStudent?.id));
  const localStudent = useMemo(
    () =>
      findProfileStudent(profileUrlId) ||
      findProfileStudent(state?.studentId) ||
      getSelectedStudent() ||
      resolveStudentForSession(session?.email),
    [profileUrlId, session?.email, state?.studentId],
  );
  const [backendStudent, setBackendStudent] = useState(null);
  const [backendLoaded, setBackendLoaded] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const student = backendStudent || stateStudent || localStudent;
  const selectedStudentId = student?.id;

  useEffect(() => {
    let isMounted = true;

    async function loadStudentProfile() {
      if (!profileUrlId) {
        setBackendLoaded(true);
        return;
      }

      try {
        setBackendLoaded(false);
        setBackendError("");

        const response = await apiClient.get("/admin/users");
        const users = getArrayPayload(response, ["users", "students", "items", "results", "data"]);
        const studentUsers = users.filter((user) => {
          const role = clean(user.role || user.user_role || user.type).toLowerCase();
          return role.includes("student") || user.student_id || user.student || user.level;
        });
        const matchedRawStudent = studentUsers.find((candidate) =>
          matchesStudentProfileId(candidate, profileUrlId),
        );

        console.log("STUDENT PROFILE URL PARAM", profileUrlId);
        console.log("ALL STUDENT USERS", studentUsers);
        console.log("MATCHED STUDENT", matchedRawStudent);

        if (isMounted) {
          setBackendStudent(matchedRawStudent ? mapBackendStudent(matchedRawStudent, stateStudent || localStudent || {}) : null);
          setBackendLoaded(true);
        }
      } catch (error) {
        console.info(
          `[LearnUp] Student profile backend lookup skipped (${error?.status || 0}: ${
            error?.message || "Unknown error"
          }).`,
        );

        if (isMounted) {
          setBackendError(error?.message || "Student profile could not be loaded.");
          setBackendLoaded(true);
        }
      }
    }

    loadStudentProfile();

    return () => {
      isMounted = false;
    };
  }, [profileUrlId, stateStudent, localStudent]);

  useEffect(() => {
    if (selectedStudentId) {
      setSelectedStudentId(selectedStudentId);
    }
  }, [selectedStudentId]);

  if (!student && !backendLoaded) {
    return (
      <main className="student-profile-page">
        <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={28} />
        </button>
        <section className="student-profile-card">
          <header className="student-profile-header">
            <span className="student-profile-avatar">ST</span>
            <h1>Loading Student</h1>
            <p>Loading profile details</p>
          </header>
        </section>
      </main>
    );
  }

  const profile = student || {
    name: "Student Profile",
    id: "Pending",
    email: "Not provided",
    department: "Department not specified",
    level: "Pending",
    gpa: "0.00",
    status: backendError || "ACTIVE",
  };
  const gpa = parseNumber(profile.gpa, 0);
  const attendance = getAttendance(profile);
  const credits = getCredits(profile);
  const risk = getRisk(profile);
  const trend = buildTrend(profile.gpa);
  const statusText = profile.status || profile.academicStatus || "ACTIVE";
  const levelText = profile.level || "Pending";
  const departmentText = getDepartmentDisplayName(profile);
  const firstName = profile.name?.split(" ")[0] || "Student";

  return (
    <main className="student-profile-page">
      <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={28} />
      </button>

      <div className="student-profile-dashboard">
        <section className="student-profile-hero">
          <div className="student-profile-identity">
            <span className={`student-profile-photo student-profile-photo--${profile.avatar || "default"}`}>
              {getInitials(profile.name)}
              <i>{statusText}</i>
            </span>
            <div>
              <h1>{profile.name || "Student Profile"}</h1>
              <p>{departmentText} - {levelText}</p>
              <a href={`mailto:${profile.email || ""}`}>{profile.email || "No email provided"}</a>
            </div>
          </div>
          <div className="student-profile-actions-wrap">
            <button
              type="button"
              className="student-profile-menu"
              aria-label="More profile actions"
              onClick={() => setActionsOpen((current) => !current)}
            >
              <MoreHorizontal size={20} />
            </button>
            {actionsOpen && (
              <div className="student-profile-action-menu">
                <button
                  type="button"
                  onClick={() => navigate("/admin/create-student", { state: { editStudent: profile } })}
                >
                  Edit Student
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/create-student", { state: { deleteStudent: profile } })}
                >
                  Delete Student
                </button>
              </div>
            )}
          </div>

          <div className="student-profile-meta" aria-label="Student summary">
            <div>
              <span>Student ID</span>
              <strong>{profile.id || "Pending"}</strong>
            </div>
            <div>
              <span>Academic Level</span>
              <strong>{levelText}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{departmentText}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className={`student-profile-state student-profile-state--${risk.className}`}>
                {getLearnerStatus(profile)}
              </strong>
            </div>
          </div>
        </section>

        <section className="student-profile-metrics" aria-label="Academic metrics">
          <article>
            <div>
              <span>Current GPA</span>
              <Star size={15} />
            </div>
            <strong>{gpa.toFixed(2)}</strong>
            <small>+0.2 up</small>
          </article>
          <article>
            <div>
              <span>Attendance</span>
              <CalendarCheck size={15} />
            </div>
            <strong>{attendance}%</strong>
            <i className="student-profile-progress"><b style={{ width: `${attendance}%` }} /></i>
          </article>
          <article>
            <div>
              <span>Credits Earned</span>
              <GraduationCap size={15} />
            </div>
            <strong>{credits}<em> / 120 Total</em></strong>
          </article>
          <article className={`student-profile-risk student-profile-risk--${risk.className}`}>
            <div>
              <span>Risk Level</span>
              <ShieldCheck size={15} />
            </div>
            <strong>{risk.label}</strong>
          </article>
        </section>

        <section className="student-profile-chart-card">
          <header>
            <div>
              <h2>Academic Performance Trend</h2>
              <p>GPA evolution over the last 4 semesters</p>
            </div>
            <ul>
              <li><i /> {firstName}</li>
              <li><i /> Average</li>
            </ul>
          </header>
          <div className="student-profile-chart" aria-label="Academic performance trend chart">
            {trend.map((value, index) => (
              <div className="student-profile-bar" key={`sem-${index + 1}`}>
                <span style={{ height: `${(value / 4) * 100}%` }} />
                <em style={{ height: `${(3.3 / 4) * 100}%` }} />
                <small>SEM {index + 1}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="student-profile-enrollment">
          <header>
            <h2>Active Enrollment</h2>
          </header>
          <div className="student-profile-enrollment-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Instructor</th>
                  <th>Grade</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {enrollmentRows.map((row) => (
                  <tr key={row.code}>
                    <td>{row.course}</td>
                    <td>{row.code}</td>
                    <td>{row.instructor}</td>
                    <td><b>{row.grade}</b></td>
                    <td>
                      <span className="student-profile-attendance-line">
                        <i style={{ width: `${row.attendance}%` }} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
