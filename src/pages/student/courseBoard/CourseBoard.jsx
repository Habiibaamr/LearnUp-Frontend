import { useEffect, useMemo, useState } from "react";
import { Clock3, Link2, Sparkles, SquareTerminal } from "lucide-react";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import { fetchCourseBoardData, mergeCourseBoardCatalog } from "../../../services/courseBoard.js";
import {
  enrollInCourse,
  saveLocalEnrolledCourseCodes,
} from "../../../services/courseEnrollment.js";
import {
  fetchCurrentStudentProfile,
  getStudentNumericLevel,
  readStoredStudentProfile,
} from "../../../services/studentProfile.js";
import {
  buildCourseBoardCourses,
  getCanonicalCourseCatalog,
  getCourseBoardMessage,
} from "../../../utils/courseBoardLogic.js";
import "./courseBoard.css";

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
    button: "Enroll Now  →",
  },
  enrolled: {
    icon: Link2,
    status: "SUCCESSFULLY ENROLLED",
    button: "Enrolled",
  },
  locked: {
    icon: SquareTerminal,
    status: "LOCKED COURSE",
    button: "Locked",
  },
  passed: {
    icon: SquareTerminal,
    status: "PASSED COURSE",
    button: "Passed",
  },
};

function CourseCard({ course, enrollingCode, onEnroll }) {
  const detail = copy[course.type] || copy.locked;
  const Icon = detail.icon;
  const message = getCourseBoardMessage(course);
  const isEnrolling = enrollingCode === course.course_code;
  const canEnroll = course.calculatedStatus === "available" && !isEnrolling;

  return (
    <article className={`student-course-board-card is-${course.type}`}>
      <div className="student-course-board-card__cover">
        <div>
          <span>{course.levelLabel}</span>
          <Icon size={16} strokeWidth={2.35} />
        </div>
        <h2>{course.course_title}</h2>
      </div>
      <div className="student-course-board-card__meta">
        <span>{course.course_code}</span>
        <span><Clock3 size={11} /> {course.creditLabel}</span>
      </div>
      {course.prerequisites?.length > 0 && (
        <p className="student-course-board-card__prereq">
          Prerequisites: {course.prerequisites.join(", ")}
        </p>
      )}
      <div className="student-course-board-card__body">
        <div className={`student-course-board-card__status is-${course.type}`}>
          <strong>{detail.status}</strong>
          <p>{message}</p>
        </div>
        <button
          type="button"
          className={`student-course-board-card__button is-${course.type}`}
          disabled={!canEnroll && course.calculatedStatus !== "available"}
          onClick={() => {
            if (canEnroll) {
              onEnroll(course);
            }
          }}
        >
          {isEnrolling ? "Enrolling..." : detail.button}
        </button>
      </div>
    </article>
  );
}

export default function CourseBoard() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentStudent, setCurrentStudent] = useState(() => readStoredStudentProfile());
  const [courses, setCourses] = useState(() => getCanonicalCourseCatalog());
  const [enrolledCourseCodes, setEnrolledCourseCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCode, setEnrollingCode] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);

      try {
        const storedStudent = readStoredStudentProfile();

        if (storedStudent && isMounted) {
          setCurrentStudent(storedStudent);
        }

        const profile = await fetchCurrentStudentProfile(storedStudent || {}).catch(
          () => storedStudent || null,
        );

        const activeStudent = profile || storedStudent || null;

        if (isMounted && activeStudent) {
          setCurrentStudent(activeStudent);
        }

        const boardData = await fetchCourseBoardData(activeStudent).catch(() => ({
          courses: mergeCourseBoardCatalog([]),
          enrolledCourseCodes: [],
        }));

        if (isMounted) {
          setCourses(boardData.courses.length > 0 ? boardData.courses : mergeCourseBoardCatalog([]));
          setEnrolledCourseCodes(boardData.enrolledCourseCodes || []);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const studentLevel = useMemo(
    () =>
      getStudentNumericLevel(currentStudent) ??
      getStudentNumericLevel({ level: currentStudent?.student_level }),
    [currentStudent],
  );

  const allCourses = useMemo(() => {
    if (!studentLevel) {
      return [];
    }

    return buildCourseBoardCourses({
      courses,
      studentLevel,
      enrolledCourseCodes,
    });
  }, [courses, studentLevel, enrolledCourseCodes]);

  useEffect(() => {
    console.log("current student level", currentStudent?.level);
    console.log("courses loaded", courses);
    console.log(
      "course statuses",
      allCourses.map((course) => [course.course_code, course.calculatedStatus]),
    );
  }, [currentStudent, courses, allCourses]);

  const handleEnroll = async (course) => {
    if (course.calculatedStatus !== "available") {
      return;
    }

    setEnrollingCode(course.course_code);

    try {
      await enrollInCourse(course);
    } catch (error) {
      console.log("backend enrollment failed, using local fallback", error?.status || error?.message);
    }

    const updatedCodes = [...new Set([...enrolledCourseCodes, course.course_code])];
    setEnrolledCourseCodes(updatedCodes);
    saveLocalEnrolledCourseCodes(currentStudent, updatedCodes);
    setEnrollingCode("");
  };

  const visibleCourses = useMemo(() => {
    if (activeTab === "available") {
      return allCourses.filter((course) => course.calculatedStatus === "available");
    }
    if (activeTab === "enrolled") {
      return allCourses.filter((course) => course.calculatedStatus === "enrolled");
    }
    if (activeTab === "locked") {
      return allCourses.filter((course) => course.calculatedStatus === "locked");
    }
    if (activeTab === "passed") {
      return allCourses.filter((course) => course.calculatedStatus === "passed");
    }

    return allCourses;
  }, [activeTab, allCourses]);

  const title =
    activeTab === "locked"
      ? "Locked Courses Based on Your Academic Progress"
      : activeTab === "passed"
        ? "Passed Courses Based on Your Academic Progress"
        : activeTab === "enrolled"
          ? "Enrolled Courses Based on Your Academic Progress"
          : "Available Courses Based on Your Academic Progress";

  const emptyMessage =
    !studentLevel && !loading
      ? "Student level is not available yet. Please reload after your profile loads."
      : "No courses in this category yet.";

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
            {loading ? (
              <p>Loading course catalog...</p>
            ) : visibleCourses.length === 0 ? (
              <p>{emptyMessage}</p>
            ) : (
              visibleCourses.map((course) => (
                <CourseCard
                  key={`${course.course_code}-${course.semester_id}`}
                  course={course}
                  enrollingCode={enrollingCode}
                  onEnroll={handleEnroll}
                />
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
