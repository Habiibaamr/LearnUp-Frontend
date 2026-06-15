import { useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  MoreHorizontal,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { facultyCourseLevels } from "../../../data/facultyCourses.js";
import {
  findFacultyById,
  getCurrentSession,
  getInitials,
  getSelectedFaculty,
  resolveFacultyForSession,
  setSelectedFacultyId,
} from "../../../utils/learnupRecords.js";
import "../../student/profile/studentProfile.css";

const defaultFacultyCourses = facultyCourseLevels
  .flatMap((group) => group.courses.map((course) => ({ ...course, level: group.level })))
  .slice(0, 3);

function parseCourseLoad(load = "1/3") {
  const [current, total] = load.split("/").map((value) => Number.parseInt(value, 10));
  const safeCurrent = Number.isFinite(current) ? current : 1;
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 3;

  return {
    current: safeCurrent,
    total: safeTotal,
    percent: Math.min(100, Math.round((safeCurrent / safeTotal) * 100)),
  };
}

function getFacultyStatusTone(status = "") {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("full")) {
    return { label: "Full Load", className: "high" };
  }

  if (normalizedStatus.includes("active")) {
    return { label: "Active Faculty", className: "medium" };
  }

  return { label: "Available", className: "low" };
}

function getFacultyCourses(faculty) {
  if (faculty?.assignedCourses?.length) {
    return faculty.assignedCourses.map((courseCode, index) => {
      const course = defaultFacultyCourses.find((item) => item.code === courseCode);

      return {
        code: courseCode,
        title: course?.title || `Assigned Course ${index + 1}`,
        level: course?.level || "Faculty Course",
        students: course?.students || 42,
      };
    });
  }

  return defaultFacultyCourses;
}

export default function FacultyProfile() {
  const navigate = useNavigate();
  const { facultyId } = useParams();
  const { state } = useLocation();
  const session = getCurrentSession();
  const routeFaculty = findFacultyById(facultyId);
  const stateFaculty = findFacultyById(state?.facultyId);
  const routeIdMissing = Boolean(facultyId && !routeFaculty);
  const faculty =
    routeFaculty ||
    (!routeIdMissing
      ? stateFaculty || getSelectedFaculty() || resolveFacultyForSession(session?.email)
      : null);
  const selectedFacultyId = faculty?.id;

  useEffect(() => {
    if (selectedFacultyId) {
      setSelectedFacultyId(selectedFacultyId);
    }
  }, [selectedFacultyId]);

  if (!faculty) {
    return (
      <main className="student-profile-page">
        <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={28} />
        </button>
        <section className="student-profile-card">
          <header className="student-profile-header">
            <span className="student-profile-avatar">?</span>
            <h1>Faculty Member Not Found</h1>
            <p>profile unavailable</p>
          </header>
          <section className="student-profile-info" aria-label="Faculty profile not found">
            <div>
              <span>Faculty Member ID</span>
              <strong>{facultyId || "Missing"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>No saved faculty member matches this profile URL.</strong>
            </div>
          </section>
        </section>
      </main>
    );
  }

  const courseLoad = parseCourseLoad(faculty.courseLoad || faculty.load);
  const statusTone = getFacultyStatusTone(faculty.status);
  const courses = getFacultyCourses(faculty);
  const assignedCount = faculty.assignedCourses?.length || courses.length;
  const firstName = faculty.name?.replace(/^Dr\.|^Prof\./, "").trim().split(" ")[0] || "Faculty";
  const trend = [
    Math.max(1, courseLoad.current - 1),
    courseLoad.current,
    Math.min(courseLoad.total, courseLoad.current + 1),
    courseLoad.current,
  ];

  return (
    <main className="student-profile-page">
      <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft size={28} />
      </button>

      <div className="student-profile-dashboard">
        <section className="student-profile-hero">
          <div className="student-profile-identity">
            <span className="student-profile-photo student-profile-photo--faculty">
              {getInitials(faculty.name)}
              <i>{faculty.status || "ACTIVE"}</i>
            </span>
            <div>
              <h1>{faculty.name || "Faculty Profile"}</h1>
              <p>{faculty.title || faculty.academicPosition || "Faculty Member"} - {faculty.department}</p>
              <a href={`mailto:${faculty.email || ""}`}>{faculty.email || "No email provided"}</a>
            </div>
          </div>
          <button type="button" className="student-profile-menu" aria-label="More profile actions">
            <MoreHorizontal size={20} />
          </button>

          <div className="student-profile-meta" aria-label="Faculty summary">
            <div>
              <span>Faculty Member ID</span>
              <strong>{faculty.id}</strong>
            </div>
            <div>
              <span>Academic Position</span>
              <strong>{faculty.title || faculty.academicPosition || "Faculty Member"}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{faculty.department}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className={`student-profile-state student-profile-state--${statusTone.className}`}>
                {statusTone.label}
              </strong>
            </div>
          </div>
        </section>

        <section className="student-profile-metrics" aria-label="Faculty metrics">
          <article>
            <div>
              <span>Course Load</span>
              <BookOpen size={15} />
            </div>
            <strong>{courseLoad.current}<em> / {courseLoad.total} Courses</em></strong>
            <i className="student-profile-progress"><b style={{ width: `${courseLoad.percent}%` }} /></i>
          </article>
          <article>
            <div>
              <span>Assigned Courses</span>
              <GraduationCap size={15} />
            </div>
            <strong>{assignedCount}</strong>
            <small>{courses.length} active this term</small>
          </article>
          <article>
            <div>
              <span>Students Managed</span>
              <Users size={15} />
            </div>
            <strong>{courses.reduce((total, course) => total + course.students, 0)}</strong>
            <small>Across current courses</small>
          </article>
          <article className={`student-profile-risk student-profile-risk--${statusTone.className}`}>
            <div>
              <span>Availability</span>
              <ShieldCheck size={15} />
            </div>
            <strong>{statusTone.label}</strong>
          </article>
        </section>

        <section className="student-profile-chart-card">
          <header>
            <div>
              <h2>Faculty Activity Trend</h2>
              <p>Course load overview across the last 4 semesters</p>
            </div>
            <ul>
              <li><i /> {firstName}</li>
              <li><i /> Average</li>
            </ul>
          </header>
          <div className="student-profile-chart" aria-label="Faculty activity trend chart">
            {trend.map((value, index) => (
              <div className="student-profile-bar" key={`faculty-sem-${index + 1}`}>
                <span style={{ height: `${(value / courseLoad.total) * 100}%` }} />
                <em style={{ height: `${(2 / courseLoad.total) * 100}%` }} />
                <small>SEM {index + 1}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="student-profile-enrollment">
          <header>
            <h2>Active Courses</h2>
          </header>
          <div className="student-profile-enrollment-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Level</th>
                  <th>Students</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.code}>
                    <td>{course.title}</td>
                    <td>{course.code}</td>
                    <td>{course.level}</td>
                    <td><b>{course.students}</b></td>
                    <td>{faculty.status || "ACTIVE"}</td>
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
