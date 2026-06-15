import { useState } from "react";
import { Clock3, Link2, Sparkles, SquareTerminal } from "lucide-react";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import "./courseBoard.css";

// Mock course board filters and cards stay in place until student course-board endpoints are wired.
const tabs = [
  { id: "all", label: "All Courses" },
  { id: "available", label: "available" },
  { id: "enrolled", label: "Enrolled" },
  { id: "locked", label: "locked" },
  { id: "passed", label: "passed" },
];

const copy = {
  available: {
    icon: Sparkles,
    status: "AVAILABLE FOR YOU",
    message: "You are eligible for this course based on your completed credit hours and level.",
    button: "Enroll Now  →",
  },
  enrolled: {
    icon: Link2,
    status: "SUCCESSFULLY ENROLLED",
    message: "you have enrolled this course successfully based on your completed courses credit hours",
    button: "Enrolled",
  },
  locked: {
    icon: SquareTerminal,
    status: "LOCKED COURSE",
    message: "you cant enroll this course due to not passing intelligent Algorithm 1 based on your credit hour",
    button: "Locked",
  },
  passed: {
    icon: SquareTerminal,
    status: "PASSED COURSE",
    message: "you have successfully passed this course and now computer graphics 2 is available to enroll",
    button: "Passed",
  },
};

const templates = {
  availableAi: { type: "available", level: "LEVEL 200", title: "Advanced Artificial Intelligence", code: "CS-3021", credits: "4 Credit Hours" },
  availableMath: { type: "available", level: "LEVEL 200", title: "mathematics 2", code: "CS-3021", credits: "4 Credit Hours" },
  enrolledHci: { type: "enrolled", level: "LEVEL 200", title: "Human-Computer Interaction", code: "UXD-202", credits: "3 Credit Hours" },
  enrolledLinear: { type: "enrolled", level: "LEVEL 200", title: "Linear Algebra", code: "UXD-202", credits: "3 Credit Hours" },
  lockedAlgorithm: { type: "locked", level: "LEVEL 200", title: "Advanced Algorithm 2", code: "UXD-202", credits: "3 Credit Hours" },
  passedGraphics: { type: "passed", level: "LEVEL 100", title: "computer graphics", code: "UXD-202", credits: "3 Credit Hours" },
};

const repeat = (course, count) => Array.from({ length: count }, (_, index) => ({ ...course, id: `${course.title}-${index}` }));

const coursesByTab = {
  all: [
    templates.availableAi,
    templates.enrolledHci,
    templates.lockedAlgorithm,
    templates.passedGraphics,
    templates.passedGraphics,
    templates.availableMath,
    templates.enrolledLinear,
    templates.lockedAlgorithm,
  ].map((course, index) => ({ ...course, id: `all-${index}` })),
  available: [...repeat(templates.availableAi, 4), ...repeat(templates.availableMath, 4)],
  enrolled: [...repeat(templates.enrolledHci, 4), ...repeat(templates.enrolledLinear, 4)],
  locked: repeat(templates.lockedAlgorithm, 8),
  passed: repeat(templates.passedGraphics, 8),
};

function CourseCard({ course }) {
  const detail = copy[course.type];
  const Icon = detail.icon;

  return (
    <article className={`student-course-board-card is-${course.type}`}>
      <div className="student-course-board-card__cover">
        <div>
          <span>{course.level}</span>
          <Icon size={16} strokeWidth={2.35} />
        </div>
        <h2>{course.title}</h2>
      </div>
      <div className="student-course-board-card__meta">
        <span>{course.code}</span>
        <span><Clock3 size={11} /> {course.credits}</span>
      </div>
      <div className="student-course-board-card__body">
        <div className={`student-course-board-card__status is-${course.type}`}>
          <strong>{detail.status}</strong>
          <p>{detail.message}</p>
        </div>
        <button type="button" className={`student-course-board-card__button is-${course.type}`}>
          {detail.button}
        </button>
      </div>
    </article>
  );
}

export default function CourseBoard() {
  const [activeTab, setActiveTab] = useState("all");
  const title =
    activeTab === "locked"
      ? "Locked Courses Based on Your Academic Progress"
      : "Available Courses Based on Your Academic Progress";

  return (
    <div className="student-app-shell course-board-page">
      <StudentSidebar />
      <div className="student-page-area">
        <StudentTopbar />
        <main className="course-board-main">
          <section className="course-board-intro">
            <h1>{title}</h1>
            <p>These courses are automatically shown based on your completed credits, academic level, and prerequisites.</p>
          </section>

          <div className="course-board-tabs" role="tablist" aria-label="Course filters">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? "is-active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="course-board-grid" aria-label={`${activeTab} courses`}>
            {coursesByTab[activeTab].map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
