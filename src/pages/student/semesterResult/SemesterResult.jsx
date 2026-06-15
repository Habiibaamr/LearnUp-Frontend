import { BookOpenCheck, ChevronRight, Download, Grid2X2, Monitor, Sigma, Trophy, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { academicYears, resultTerms, semesterResults } from "../../../data/studentSemesterResults.js";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import "./semesterResult.css";

const tabs = ["All", "Passed", "Failed"];

const iconMap = {
  book: BookOpenCheck,
  monitor: Monitor,
  sigma: Sigma,
  trophy: Trophy,
};

const gradePoints = {
  "A": 4,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3,
  "C+": 2.3,
  "C": 2,
  "D": 1,
  "F": 0,
};

function getCoursesForPeriod(academicYear, term) {
  return (
    semesterResults.find(
      (entry) => entry.academicYear === academicYear && entry.term === term,
    )?.courses || []
  );
}

function getSemesterGpa(courses) {
  const totalCredits = courses.reduce((total, course) => total + course.credits, 0);

  if (!totalCredits) {
    return "0.00";
  }

  const totalPoints = courses.reduce(
    (total, course) => total + (gradePoints[course.grade] ?? 0) * course.credits,
    0,
  );

  return (totalPoints / totalCredits).toFixed(2);
}

export default function SemesterResult() {
  const [academicYear, setAcademicYear] = useState(academicYears[0]);
  const [semester, setSemester] = useState("Fall");
  const [activeTab, setActiveTab] = useState("All");

  const periodRows = useMemo(
    () => getCoursesForPeriod(academicYear, semester),
    [academicYear, semester],
  );
  const filteredRows = useMemo(() => {
    if (activeTab === "All") {
      return periodRows;
    }

    return periodRows.filter((row) => row.status === activeTab);
  }, [activeTab, periodRows]);
  const passedRows = periodRows.filter((row) => row.status === "Passed");
  const failedRows = periodRows.filter((row) => row.status === "Failed");
  const passedCredits = passedRows.reduce((total, row) => total + row.credits, 0);
  const totalCredits = periodRows.reduce((total, row) => total + row.credits, 0);
  const completionRate = totalCredits ? Math.round((passedCredits / totalCredits) * 100) : 0;

  return (
    <div className="student-app-shell semester-result-page">
      <StudentSidebar />
      <div className="student-page-area">
        <StudentTopbar />
        <main className="semester-result-main">
          <section className="semester-result-heading">
            <h1>Semester Results</h1>
            <p>Review your academic performance for each term and academic year.</p>
          </section>

          <section className="semester-result-filters" aria-label="Result filters">
            <label>
              <span>Academic Year</span>
              <select value={academicYear} onChange={(event) => setAcademicYear(event.target.value)}>
                {academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Term</span>
              <select value={semester} onChange={(event) => setSemester(event.target.value)}>
                {resultTerms.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </label>
            <button type="button">
              <Download size={16} />
              Export PDF
            </button>
          </section>

          <section className="semester-result-stats" aria-label="Semester statistics">
            <article>
              <Grid2X2 size={18} />
              <span>Semester GPA</span>
              <strong>{getSemesterGpa(periodRows)}</strong>
              <i style={{ width: `${completionRate}%` }} />
            </article>
            <article>
              <Trophy size={18} />
              <span>Passed Courses</span>
              <strong>{passedRows.length}</strong>
              <small>{completionRate}% completion</small>
            </article>
            <article>
              <BookOpenCheck size={18} />
              <span>Passed Credits</span>
              <strong>{passedCredits}</strong>
              <p>From {totalCredits} registered credits</p>
            </article>
            <article className={failedRows.length ? "has-failed" : ""}>
              <XCircle size={18} />
              <span>Failed Courses</span>
              <strong>{failedRows.length}</strong>
              <p>{failedRows.length ? "Needs advisor follow-up" : "No failed courses"}</p>
            </article>
          </section>

          <div className="semester-result-tabs" role="tablist" aria-label="Result status tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={activeTab === tab ? "is-active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="semester-result-table-card" aria-label="Semester course grades">
            {filteredRows.length ? (
              <div className="semester-result-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Code</th>
                      <th>Credit Hours</th>
                      <th>Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const Icon = iconMap[row.icon] || BookOpenCheck;
                      const statusClass = row.status.toLowerCase();

                      return (
                        <tr key={`${row.code}-${row.status}`}>
                          <td>
                            <span className={`semester-result-course-icon is-${statusClass}`}><Icon size={17} /></span>
                            <strong>{row.course}</strong>
                          </td>
                          <td>{row.code}</td>
                          <td>{row.credits}</td>
                          <td><strong className={`semester-result-grade is-${statusClass}`}>{row.grade}</strong></td>
                          <td><span className={`semester-result-status is-${statusClass}`}>{row.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="semester-result-empty" role="status">
                <XCircle size={36} strokeWidth={2.4} />
                <h2>{activeTab === "Failed" ? "No failed courses found for this term." : "No courses found for this filter."}</h2>
                <p>Try another term, academic year, or result status.</p>
              </div>
            )}

            <button type="button" className="semester-result-audit">
              <span>View Detailed Audit</span>
              <ChevronRight size={25} />
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
