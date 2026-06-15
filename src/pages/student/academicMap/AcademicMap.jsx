import { CheckCircle2, Lock, MoreHorizontal } from "lucide-react";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import "./academicMap.css";

// Mock roadmap levels stay in place until an academic-map/degree-audit endpoint is confirmed.
const levels = [
  {
    level: "100",
    tone: "passed",
    courses: [
      { status: "passed", code: "CS101", title: "Programming 1", meta: "3 Credits • Intro Logic" },
      { status: "passed", code: "MA105", title: "Discrete Math", meta: "4 Credits • Math Foundation" },
      { status: "passed", code: "CS102", title: "Programming 2", meta: "3 Credits • Data Flow" },
      { status: "passed", code: "CS102", title: "OOD 1", meta: "3 Credits • Data Flow" },
      { status: "passed", code: "CS102", title: "Human Rights", meta: "2 Credits • Data Flow" },
    ],
  },
  {
    level: "200",
    tone: "enrolled",
    courses: [
      { status: "enrolled", code: "CS201", title: "Data Structures", meta: "3 Credits • Linked Lists & Trees" },
      { status: "passed", code: "CS202", title: "Architecture", meta: "3 Credits • Von Neumann" },
      { status: "enrolled", code: "MA201", title: "Linear Algebra", meta: "4 Credits • Vector Spaces" },
      { status: "enrolled", code: "MA201", title: "OOD 2", meta: "4 Credits • Vector Spaces" },
      { status: "enrolled", code: "MA201", title: "Scientific thinking", meta: "4 Credits • Vector Spaces" },
    ],
  },
  {
    level: "300",
    tone: "current",
    courses: [
      { status: "locked", code: "CS301", title: "Algorithms", meta: "3 Credits • Big-O Notation" },
      { status: "enrolled", code: "CS302", title: "Databases", meta: "3 Credits • SQL & NoSQL" },
      { status: "locked", code: "CS303", title: "Networks", meta: "4 Credits • TCP/IP" },
      { status: "locked", code: "CS303", title: "OOD 3", meta: "4 Credits • TCP/IP" },
    ],
  },
  {
    level: "400",
    tone: "locked",
    courses: [
      { status: "locked", code: "CS401", title: "AI", meta: "3 Credits • Neural Nets" },
      { status: "locked", code: "CS402", title: "Software Proj.", meta: "4 Credits • Agile Dev" },
      { status: "locked", code: "CS499", title: "Capstone", meta: "6 Credits • Senior Status" },
      { status: "locked", code: "CS499", title: "Capstone", meta: "6 Credits • Senior Status" },
    ],
  },
];

function StatusIcon({ status }) {
  if (status === "passed") return <CheckCircle2 size={17} />;
  if (status === "enrolled") return <MoreHorizontal size={17} />;
  return <Lock size={16} />;
}

function RoadmapCard({ course, showArrow }) {
  return (
    <article className={`academic-map-card is-${course.status} ${showArrow ? "has-arrow" : ""}`}>
      <div className="academic-map-card__top">
        <span>{course.status.toUpperCase()}</span>
        <i><StatusIcon status={course.status} /></i>
      </div>
      <h3>{course.code}: {course.title}</h3>
      <p>{course.meta}</p>
    </article>
  );
}

export default function AcademicMap() {
  return (
    <div className="student-app-shell academic-map-page">
      <StudentSidebar />
      <div className="student-page-area">
        <StudentTopbar />
        <main className="academic-map-main">
          <section className="academic-map-heading">
            <div>
              <p className="academic-map-breadcrumb"><span>Academic Portal</span> / <strong>Degree Roadmap</strong></p>
              <h1>Academic Map</h1>
              <p>Your personalized academic journey. Track prerequisites, current enrollments, and future milestones.</p>
            </div>
            <div className="academic-map-legend">
              <span><i className="is-passed" />Passed</span>
              <span><i className="is-enrolled" />Enrolled</span>
              <span><i className="is-locked" />Locked</span>
            </div>
          </section>

          <section className="academic-roadmap" aria-label="Academic roadmap">
            {levels.map((level, levelIndex) => (
              <div className="academic-roadmap-column" key={level.level}>
                <header>
                  <span className={`academic-roadmap-column__dot is-${level.tone}`}>{levelIndex + 1}</span>
                  <h2>Level <br />{level.level}</h2>
                </header>
                <div className="academic-roadmap-column__cards">
                  {level.courses.map((course, index) => (
                    <RoadmapCard
                      key={`${level.level}-${course.code}-${course.title}-${index}`}
                      course={course}
                      showArrow={levelIndex < levels.length - 1 && index < levels[levelIndex + 1].courses.length}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
