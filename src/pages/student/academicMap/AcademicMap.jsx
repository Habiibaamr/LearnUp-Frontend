import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock, MoreHorizontal } from "lucide-react";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import { fetchCourseBoardData, mergeCourseBoardCatalog } from "../../../services/courseBoard.js";
import {
  fetchCurrentStudentProfile,
  getStudentNumericLevel,
  readStoredStudentProfile,
} from "../../../services/studentProfile.js";
import { buildAcademicMapLevels, getCanonicalCourseCatalog } from "../../../utils/courseBoardLogic.js";
import "./academicMap.css";

function StatusIcon({ status }) {
  if (status === "passed") return <CheckCircle2 size={17} />;
  if (status === "enrolled" || status === "available") return <MoreHorizontal size={17} />;
  return <Lock size={16} />;
}

function RoadmapCard({ course }) {
  return (
    <article className={`academic-map-card is-${course.status} ${course.showArrow ? "has-arrow" : ""}`}>
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
  const [currentStudent, setCurrentStudent] = useState(() => readStoredStudentProfile());
  const [courses, setCourses] = useState(() => getCanonicalCourseCatalog());
  const [enrolledCourseCodes, setEnrolledCourseCodes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const roadmapLevels = useMemo(() => {
    if (!studentLevel) {
      return buildAcademicMapLevels({
        courses,
        studentLevel: 1,
        enrolledCourseCodes,
      });
    }

    return buildAcademicMapLevels({
      courses,
      studentLevel,
      enrolledCourseCodes,
    });
  }, [courses, studentLevel, enrolledCourseCodes]);

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
            {loading && roadmapLevels.every((level) => level.courses.length === 0) ? (
              <p>Loading academic roadmap...</p>
            ) : (
              roadmapLevels.map((level) => (
                <div className="academic-roadmap-column" key={level.level}>
                  <header>
                    <span className={`academic-roadmap-column__dot is-${level.tone}`}>
                      {Number(level.level) / 100}
                    </span>
                    <h2>Level <br />{level.level}</h2>
                  </header>
                  <div className="academic-roadmap-column__cards">
                    {level.courses.map((course, index) => (
                      <RoadmapCard
                        key={`${level.level}-${course.code}-${index}`}
                        course={course}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
