import { BookOpenCheck, ChevronRight, Download, Grid2X2, Monitor, Sigma, Trophy, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import StudentTopbar from "../../../components/student/StudentTopbar.jsx";
import { fetchStudentSemesterResults } from "../../../services/semesterResults.js";
import {
  fetchCurrentStudentProfile,
  readStoredStudentProfile,
} from "../../../services/studentProfile.js";
import {
  calculateSemesterGpa,
  filterResultsByPeriod,
  getAvailableAcademicYears,
  getAvailableTerms,
  getCurrentAcademicYear,
  isFailedResult,
  isPassedResult,
} from "../../../utils/semesterResultLogic.js";
import { getStudentNumericLevel } from "../../../utils/studentLevel.js";
import "./semesterResult.css";

const tabs = ["All", "Passed", "Failed"];

const iconMap = {
  book: BookOpenCheck,
  monitor: Monitor,
  sigma: Sigma,
  trophy: Trophy,
};

export default function SemesterResult() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("Fall");
  const [activeTab, setActiveTab] = useState("All");
  const [studentLevel, setStudentLevel] = useState(null);
  const currentAcademicYear = useMemo(() => getCurrentAcademicYear(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadResults() {
      setLoading(true);

      try {
        const storedStudent = readStoredStudentProfile();
        const profile = await fetchCurrentStudentProfile(storedStudent || {}).catch(
          () => storedStudent || null,
        );
        const activeStudent = profile || storedStudent || null;
        const level =
          getStudentNumericLevel(activeStudent) ??
          getStudentNumericLevel({ level: activeStudent?.student_level }) ??
          1;
        const studentResults = await fetchStudentSemesterResults(activeStudent);

        if (isMounted) {
          setStudentLevel(level);
          setResults(studentResults);

          const years = getAvailableAcademicYears(studentResults, level, currentAcademicYear);

          setAcademicYear((current) => current || years[0] || "");
          setSemester((current) => {
            const terms = getAvailableTerms(studentResults, years[0]);
            return terms.includes(current) ? current : terms[0] || "Fall";
          });
        }
      } catch (error) {
        console.log("semester results load failed", error?.status || error?.message);

        if (isMounted) {
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      isMounted = false;
    };
  }, []);

  const academicYears = useMemo(
    () => getAvailableAcademicYears(results, studentLevel || 1, currentAcademicYear),
    [results, studentLevel, currentAcademicYear],
  );
  const resultTerms = useMemo(
    () => getAvailableTerms(results, academicYear || academicYears[0]),
    [results, academicYear, academicYears],
  );

  useEffect(() => {
    if (!academicYear && academicYears[0]) {
      setAcademicYear(academicYears[0]);
    }
  }, [academicYear, academicYears]);

  useEffect(() => {
    if (!resultTerms.includes(semester) && resultTerms[0]) {
      setSemester(resultTerms[0]);
    }
  }, [resultTerms, semester]);

  const periodRows = useMemo(
    () =>
      filterResultsByPeriod(
        results,
        academicYear,
        semester,
        studentLevel || 1,
        currentAcademicYear,
      ),
    [results, academicYear, semester, studentLevel, currentAcademicYear],
  );

  const filteredRows = useMemo(() => {
    if (activeTab === "All") {
      return periodRows;
    }

    if (activeTab === "Passed") {
      return periodRows.filter((row) => isPassedResult(row));
    }

    return periodRows.filter((row) => isFailedResult(row));
  }, [activeTab, periodRows]);

  const passedRows = periodRows.filter((row) => isPassedResult(row));
  const failedRows = periodRows.filter((row) => isFailedResult(row));
  const passedCredits = passedRows.reduce((total, row) => total + row.credit_hours, 0);
  const registeredCredits = periodRows.reduce((total, row) => total + row.credit_hours, 0);
  const completionRate = registeredCredits
    ? Math.round((passedCredits / registeredCredits) * 100)
    : 0;
  const hasAnyResults = results.length > 0;

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
              <select
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
                disabled={loading || !hasAnyResults}
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Term</span>
              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                disabled={loading || !hasAnyResults}
              >
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
              <strong>{calculateSemesterGpa(periodRows)}</strong>
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
              <p>From {registeredCredits} registered credits</p>
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
            {loading ? (
              <div className="semester-result-empty" role="status">
                <BookOpenCheck size={36} strokeWidth={2.4} />
                <h2>Loading semester results...</h2>
              </div>
            ) : !hasAnyResults ? (
              <div className="semester-result-empty" role="status">
                <XCircle size={36} strokeWidth={2.4} />
                <h2>No semester results available yet.</h2>
                <p>Your graded courses will appear here once results are published.</p>
              </div>
            ) : filteredRows.length ? (
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
                      const statusClass = row.status.replace(/\s+/g, "-");

                      return (
                        <tr key={row.id}>
                          <td>
                            <span className={`semester-result-course-icon is-${statusClass}`}>
                              <Icon size={17} />
                            </span>
                            <strong>{row.course_title}</strong>
                          </td>
                          <td>{row.course_code}</td>
                          <td>{row.credit_hours}</td>
                          <td>
                            <strong className={`semester-result-grade is-${statusClass}`}>
                              {row.grade}
                            </strong>
                          </td>
                          <td>
                            <span className={`semester-result-status is-${statusClass}`}>
                              {row.statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="semester-result-empty" role="status">
                <XCircle size={36} strokeWidth={2.4} />
                <h2>
                  {activeTab === "Failed"
                    ? "No failed courses found for this term."
                    : activeTab === "Passed"
                      ? "No passed courses found for this term."
                      : "No courses found for this filter."}
                </h2>
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
