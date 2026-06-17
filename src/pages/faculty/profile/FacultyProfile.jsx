import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  MoreHorizontal,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { mapBackendInstructor } from "../../../services/adminAccounts.js";
import { apiClient } from "../../../services/apiClient.js";
import {
  findFacultyById,
  getCurrentSession,
  getInitials,
  getSelectedFaculty,
  resolveFacultyForSession,
  setSelectedFacultyId,
} from "../../../utils/learnupRecords.js";
import { getDepartmentDisplayName, getFacultyDisplayName } from "../../../utils/instructorDisplay.js";
import "../../student/profile/studentProfile.css";

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return clean(
      value.name ||
        value.full_name ||
        value.title ||
        value.department_name ||
        value.faculty_name ||
        value.course_title ||
        value.course_code ||
        value.semester_name ||
        value.status ||
        value.id,
    );
  }

  return value.toString().trim();
};

const normalizeId = (value) => clean(value).toLowerCase();

const getNestedValue = (record, keys) => {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key];
    }
  }

  return "";
};

const getInstructorSources = (record) =>
  [record, record?.instructor, record?.user, record?.account, record?.faculty_member].filter(Boolean);

const getProfileInstructorId = (profileInstructor) =>
  clean(profileInstructor?.instructor_id ?? profileInstructor?.id);

const getAssignmentInstructorId = (assignment) =>
  clean((assignment?.course_instructor || assignment || {}).instructor_id);

const toNumberId = (value) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
};

const getInstructorUniversityId = (record) => {
  for (const source of getInstructorSources(record)) {
    const universityId = clean(source.university_id ?? source.universityId ?? source.faculty_member_id);

    if (universityId) {
      return universityId;
    }
  }

  return "";
};

const getInstructorNumericValue = (record, keys) => {
  for (const source of getInstructorSources(record)) {
    for (const key of keys) {
      const numericValue = toNumberId(source?.[key]);

      if (numericValue !== null) {
        return numericValue;
      }
    }
  }

  return null;
};

const getResolvedInstructorId = (instructor) =>
  getInstructorNumericValue(instructor, ["instructor_id", "id"]);

const matchesInstructorProfileId = (instructor, profileId) => {
  const normalizedProfileId = normalizeId(profileId);
  const numericProfileId = toNumberId(profileId);

  if (!normalizedProfileId) {
    return false;
  }

  if (normalizeId(getInstructorUniversityId(instructor)) === normalizedProfileId) {
    return true;
  }

  if (numericProfileId === null) {
    return false;
  }

  return ["instructor_id", "id", "user_id"].some(
    (key) => getInstructorNumericValue(instructor, [key]) === numericProfileId,
  );
};

const getStateFaculty = (state) =>
  state?.facultyMember || state?.instructor || state?.faculty || state?.member || null;

const getProfileLookupId = (facultyId, stateFaculty, state) =>
  decodeURIComponent(
    clean(
      facultyId ||
        state?.instructorId ||
        state?.facultyMemberId ||
        state?.facultyId ||
        stateFaculty?.backendInstructorId ||
        stateFaculty?.instructor_id ||
        stateFaculty?.instructorId ||
        stateFaculty?.universityId ||
        stateFaculty?.id,
    ),
  );

const getProfileIdForLookup = (profileUrlId, stateFaculty, localFaculty) =>
  clean(
    profileUrlId ||
      stateFaculty?.university_id ||
      stateFaculty?.universityId ||
      stateFaculty?.instructor_id ||
      stateFaculty?.id ||
      localFaculty?.university_id ||
      localFaculty?.universityId ||
      localFaculty?.instructor_id ||
      localFaculty?.id,
  );

const getCourseLabelParts = (course) => {
  if (!course || typeof course !== "object") {
    const text = clean(course);
    const [code, title, level] = text.split(/\s+-\s+/);

    return {
      code: clean(code) || `Course`,
      title: clean(title) || text || "Assigned Course",
      level: clean(level) || "Assigned Course",
      students: "-",
    };
  }

  const semester = course.semester || course.semester_info || {};
  const semesterLabel =
    typeof semester === "object"
      ? clean(semester.name || semester.title || semester.semester_name || semester.semester_number)
      : clean(semester);

  return {
    code: clean(course.course_code || course.code || course.course?.course_code || course.course?.code) || "Course",
    title:
      clean(course.course_title || course.title || course.name || course.course?.course_title || course.course?.title) ||
      "Assigned Course",
    level:
      clean(
        course.semester_label ||
          course.semester_name ||
          course.semester_title ||
          semesterLabel ||
          course.semesterNumber ||
          course.semester_number ||
          course.level,
      ) || "Assigned Course",
    students: Number.isFinite(Number(course.students)) ? Number(course.students) : "-",
    status: clean(course.status || course.state || course.registration_status) || "open",
  };
};

function parseCourseLoad(load = "0/3") {
  const [current, total] = clean(load || "0/3").split("/").map((value) => Number.parseInt(value, 10));
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 3;

  return {
    current: safeCurrent,
    total: safeTotal,
    percent: Math.min(100, Math.round((safeCurrent / safeTotal) * 100)),
  };
}

function getFacultyStatusTone(status = "") {
  const normalizedStatus = clean(status).toLowerCase();

  if (normalizedStatus.includes("full")) {
    return { label: "Full Load", className: "high" };
  }

  if (normalizedStatus.includes("active")) {
    return { label: "Active Faculty", className: "medium" };
  }

  return { label: "Available", className: "low" };
}

function getFacultyCourses(faculty) {
  const courses = [
    ...(Array.isArray(faculty?.courses) ? faculty.courses : []),
    ...(Array.isArray(faculty?.assignedCourses) ? faculty.assignedCourses : []),
    ...(Array.isArray(faculty?.currentCourses) ? faculty.currentCourses : []),
    ...(Array.isArray(faculty?.assigned_courses) ? faculty.assigned_courses : []),
    ...(Array.isArray(faculty?.assigned_course_offerings) ? faculty.assigned_course_offerings : []),
  ];

  return courses.map(getCourseLabelParts);
}

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

const hasInstructorReference = (record) =>
  Boolean(
    record?.instructor ||
      record?.faculty_member ||
      record?.user ||
      getNestedValue(record, [
        "instructor_id",
        "instructorId",
        "faculty_member_id",
        "facultyMemberId",
        "faculty_id",
        "facultyId",
        "user_id",
        "userId",
        "university_id",
        "universityId",
        "id",
      ]),
  );

const getAssignmentPayload = (data) => {
  const payload = getArrayPayload(data, [
    "course_offering_instructors",
    "courseOfferingInstructors",
    "course_instructors",
    "courseInstructors",
    "offering_instructors",
    "offeringInstructors",
    "instructor_assignments",
    "instructorAssignments",
    "assignments",
    "instructors",
    "items",
    "results",
    "data",
  ]);

  if (payload.length > 0) {
    return payload;
  }

  return data && typeof data === "object" && hasInstructorReference(data) ? [data] : [];
};

const parseSemesterNumber = (...values) => {
  for (const value of values) {
    const text = clean(value);

    if (!text) {
      continue;
    }

    const directNumber = Number(text);

    if (Number.isFinite(directNumber)) {
      return directNumber;
    }

    const semesterMatch = text.match(/\bsem(?:ester)?\.?\s*#?\s*(\d{1,3})\b/i);

    if (semesterMatch) {
      return Number(semesterMatch[1]);
    }
  }

  return null;
};

const isValidSemesterNumber = (semesterNumber) =>
  Number.isInteger(semesterNumber) && semesterNumber >= 1 && semesterNumber <= 12;

const normalizeCourseOfferingForProfile = (record) => {
  const source = record?.course_offering || record || {};
  const course = source.course || record?.course || {};
  const semester = source.semester || record?.semester || {};
  const semesterNumber = parseSemesterNumber(
    source.semester_number,
    source.semesterNumber,
    semester.semester_number,
    semester.semesterNumber,
    semester.name,
    semester.title,
    source.semester_id,
    semester.semester_id,
    semester.id,
    source.semester,
  );

  return {
    course_offering_id: toNumberId(source.course_offering_id ?? source.courseOfferingId ?? source.id),
    course_code: clean(source.course_code || course.course_code || course.code || source.code) || "Course",
    course_title:
      clean(source.course_title || course.course_title || course.title || source.title || source.course_name || source.name) ||
      "Assigned Course",
    semester_id: clean(source.semester_id || semester.semester_id || semester.id || semesterNumber),
    semester: semesterNumber ? `Semester ${semesterNumber}` : clean(semester.name || semester.title || source.semester) || "Semester pending",
    semesterNumber,
    status: clean(source.status || source.registration_status || source.state) || "open",
  };
};

const isDummyCourseOffering = (offering) =>
  /^Introduction to Topic\s+\d+$/i.test(offering.course_title) ||
  /^CSE\d{4}$/i.test(offering.course_code);

const loadCourseOfferingsForProfile = async () => {
  const response = await apiClient.get("/admin/course-offerings");
  const offerings = getArrayPayload(response, ["course_offerings", "offerings", "items", "results", "data"])
    .map(normalizeCourseOfferingForProfile)
    .filter(
      (offering) =>
        offering.course_offering_id !== null &&
        (!offering.semesterNumber || isValidSemesterNumber(offering.semesterNumber)),
    );
  const realisticOfferings = offerings.filter((offering) => !isDummyCourseOffering(offering));

  return realisticOfferings.length > 0 ? realisticOfferings : offerings;
};

const mapOfferingToProfileCourse = (offering) => ({
  course_offering_id: offering.course_offering_id,
  course_code: offering.course_code,
  course_title: offering.course_title,
  semester_id: offering.semester_id,
  semester: offering.semester || (offering.semester_id ? `Semester ${offering.semester_id}` : "Semester pending"),
  status: offering.status || "open",
  students: "-",
});

const isActiveCourse = (course) => {
  const status = clean(course.status).toLowerCase();

  return !status || status.includes("open") || status.includes("active");
};

const loadAssignedCoursesForProfile = async (profileInstructor) => {
  const profileInstructorKey = String(getProfileInstructorId(profileInstructor));

  console.log("PROFILE INSTRUCTOR", profileInstructor);
  console.log("PROFILE INSTRUCTOR KEY", profileInstructorKey);
  console.log("profile instructor id", profileInstructor?.instructor_id, profileInstructor?.id);

  if (!profileInstructorKey) {
    console.log("ASSIGNED COURSES FOR PROFILE", []);
    return [];
  }

  const courseOfferings = await loadCourseOfferingsForProfile();
  const assignmentResults = await Promise.allSettled(
    courseOfferings.map(async (offering) => {
      const offeringId = offering.course_offering_id;
      const response = await apiClient.get(`/admin/course-offering-instructors/${offeringId}`);

      console.log("OFFERING", offering.course_offering_id, offering.course_code);

      const assignmentsArray = Array.isArray(response)
        ? response
        : response?.instructors || response?.data || response?.course_instructors || [];
      const assignedToCurrentInstructor = assignmentsArray.some((assignment) => {
        const assignmentInstructorId = String(getAssignmentInstructorId(assignment));

        console.log("assignment instructor id", assignment?.instructor_id);
        return assignmentInstructorId === profileInstructorKey;
      });

      console.log("ASSIGNMENT RESPONSE", offeringId, response);
      console.log("ASSIGNMENTS FOR OFFERING", assignmentsArray);
      console.log("PROFILE KEY", profileInstructorKey);
      console.log("MATCH RESULT", assignedToCurrentInstructor);
      console.log("is assigned", assignedToCurrentInstructor);

      return assignedToCurrentInstructor ? mapOfferingToProfileCourse(offering) : null;
    }),
  );
  const assignedCourses = assignmentResults
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);

  console.log("ASSIGNED COURSES FOR PROFILE", assignedCourses);
  console.log("assignedCourses", assignedCourses);

  return assignedCourses;
};

const applyProfileAssignments = (profileInstructor, assignedCourses) => {
  const assignedCount = assignedCourses.length;
  const loadTotal = 3;

  return {
    ...profileInstructor,
    assignedCourses,
    currentCourses: assignedCourses,
    courses: assignedCourses,
    assignedCourseCount: assignedCount,
    courseLoad: `${assignedCount}/${loadTotal}`,
    load: `${assignedCount}/${loadTotal}`,
    progress: loadTotal > 0 ? Math.min(100, Math.round((assignedCount / loadTotal) * 100)) : 0,
  };
};

export default function FacultyProfile() {
  const navigate = useNavigate();
  const { facultyId } = useParams();
  const { state } = useLocation();
  const session = getCurrentSession();
  const stateFaculty = getStateFaculty(state);
  const profileUrlId = getProfileLookupId(facultyId, stateFaculty, state);
  const localFaculty = useMemo(() => {
    if (profileUrlId) {
      return (
        findFacultyById(profileUrlId) ||
        findFacultyById(state?.facultyId) ||
        null
      );
    }

    return findFacultyById(state?.facultyId) || getSelectedFaculty() || resolveFacultyForSession(session?.email);
  }, [profileUrlId, session?.email, state?.facultyId]);
  const [backendFaculty, setBackendFaculty] = useState(null);
  const [backendLoaded, setBackendLoaded] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [profileNotFound, setProfileNotFound] = useState(false);
  const faculty = profileNotFound ? null : backendFaculty || stateFaculty || localFaculty;
  const selectedFacultyId = faculty?.id;

  useEffect(() => {
    let isMounted = true;

    async function loadFacultyProfile() {
      console.log("Profile URL id", profileUrlId);

      try {
        setBackendLoaded(false);
        setBackendError("");
        setProfileNotFound(false);

        const profileId = getProfileIdForLookup(profileUrlId, stateFaculty, localFaculty);
        const response = await apiClient.get("/admin/instructors");
        const instructors = getArrayPayload(response, ["instructors", "faculty", "items", "results", "data"]);
        const matchedRawInstructor = instructors.find((instructor) =>
          matchesInstructorProfileId(instructor, profileId),
        );
        const matchedInstructor = matchedRawInstructor
          ? mapBackendInstructor(matchedRawInstructor, stateFaculty || localFaculty || {})
          : null;

        console.log("PROFILE URL PARAM", profileId);
        console.log("ALL INSTRUCTORS", instructors);
        console.log("MATCHED INSTRUCTOR", matchedInstructor);

        if (!matchedInstructor) {
          console.error("No instructor matched profile id", profileId, instructors);

          if (isMounted) {
            setBackendFaculty(null);
            setProfileNotFound(true);
            setBackendLoaded(true);
          }

          return;
        }

        const realInstructorId = matchedInstructor.instructor_id ?? matchedInstructor.id;
        const profileInstructorKey = String(realInstructorId);

        console.log("REAL INSTRUCTOR ID USED FOR COURSE LOAD", profileInstructorKey);

        let assignedCourses = [];

        try {
          assignedCourses = await loadAssignedCoursesForProfile(matchedInstructor);
        } catch (error) {
          console.info(
            `[LearnUp] Faculty profile assignment lookup skipped (${error?.status || 0}: ${
              error?.message || "Unknown error"
            }).`,
          );
        }

        if (isMounted) {
          setBackendFaculty(applyProfileAssignments(matchedInstructor, assignedCourses));
          setBackendLoaded(true);
        }
      } catch (error) {
        console.info(
          `[LearnUp] Faculty profile backend lookup skipped (${error?.status || 0}: ${
            error?.message || "Unknown error"
          }).`,
        );

        if (isMounted) {
          setBackendError(error?.message || "Faculty profile could not be loaded.");
          setBackendLoaded(true);
        }
      }
    }

    if (profileUrlId || stateFaculty || localFaculty) {
      loadFacultyProfile();
      return () => {
        isMounted = false;
      };
    }

    setBackendLoaded(true);
    return () => {
      isMounted = false;
    };
  }, [profileUrlId, stateFaculty, localFaculty]);

  useEffect(() => {
    if (selectedFacultyId) {
      setSelectedFacultyId(selectedFacultyId);
    }
  }, [selectedFacultyId]);

  if (!faculty && !backendLoaded) {
    return (
      <main className="student-profile-page">
        <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={28} />
        </button>
        <section className="student-profile-card">
          <header className="student-profile-header">
            <span className="student-profile-avatar">FM</span>
            <h1>Loading Faculty Member</h1>
            <p>Loading profile details</p>
          </header>
        </section>
      </main>
    );
  }

  if (!faculty && backendError) {
    return (
      <main className="student-profile-page">
        <button type="button" className="student-profile-back" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={28} />
        </button>
        <section className="student-profile-card">
          <header className="student-profile-header">
            <span className="student-profile-avatar">?</span>
            <h1>Faculty Profile Unavailable</h1>
            <p>{backendError}</p>
          </header>
        </section>
      </main>
    );
  }

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
  const activeCourses = courses.filter(isActiveCourse);
  const displayedCourses = activeCourses.length > 0 ? activeCourses : courses;
  const assignedCount = Number.isFinite(Number(faculty.assignedCourseCount))
    ? Number(faculty.assignedCourseCount)
    : courses.length || courseLoad.current;
  const displayedCourseLoad = {
    current: assignedCount,
    total: courseLoad.total,
    percent: courseLoad.total > 0 ? Math.min(100, Math.round((assignedCount / courseLoad.total) * 100)) : 0,
  };
  const facultyName = clean(faculty.name || faculty.fullName || faculty.full_name) || "Faculty Profile";
  const facultyIdentifier =
    clean(faculty.universityId || faculty.university_id || faculty.id || faculty.facultyId || faculty.instructorId) ||
    "Pending";
  const academicPosition = clean(faculty.title || faculty.academicPosition || faculty.position || faculty.role) || "Faculty Member";
  const department = getDepartmentDisplayName(faculty);
  const facultyNameValue = getFacultyDisplayName(faculty);
  const specialization = clean(faculty.specialization) || "Specialization pending";
  const phone = clean(faculty.phone) || "No phone provided";
  const officeLocation = clean(faculty.location || faculty.office_location || faculty.officeLocation) || "Office pending";
  const firstName = facultyName.replace(/^Dr\.|^Prof\./, "").trim().split(" ")[0] || "Faculty";
  const trend = [
    Math.max(0, displayedCourseLoad.current - 1),
    displayedCourseLoad.current,
    Math.min(displayedCourseLoad.total, displayedCourseLoad.current + 1),
    displayedCourseLoad.current,
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
              {getInitials(facultyName)}
              <i>{faculty.status || "ACTIVE"}</i>
            </span>
            <div>
              <h1>{facultyName}</h1>
              <p>{academicPosition} - {department}</p>
              <a href={`mailto:${faculty.email || ""}`}>{faculty.email || "No email provided"}</a>
            </div>
          </div>
          <button type="button" className="student-profile-menu" aria-label="More profile actions">
            <MoreHorizontal size={20} />
          </button>

          <div className="student-profile-meta" aria-label="Faculty summary">
            <div>
              <span>Faculty Member ID</span>
              <strong>{facultyIdentifier}</strong>
            </div>
            <div>
              <span>Academic Position</span>
              <strong>{academicPosition}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong>{department}</strong>
            </div>
            <div>
              <span>Faculty</span>
              <strong>{facultyNameValue}</strong>
            </div>
            <div>
              <span>Specialization</span>
              <strong>{specialization}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{phone}</strong>
            </div>
            <div>
              <span>Office Location</span>
              <strong>{officeLocation}</strong>
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
            <strong>{displayedCourseLoad.current}<em> / {displayedCourseLoad.total} Courses</em></strong>
            <i className="student-profile-progress"><b style={{ width: `${displayedCourseLoad.percent}%` }} /></i>
          </article>
          <article>
            <div>
              <span>Assigned Courses</span>
              <GraduationCap size={15} />
            </div>
            <strong>{assignedCount}</strong>
            <small>{activeCourses.length || displayedCourses.length} active this term</small>
          </article>
          <article>
            <div>
              <span>Students Managed</span>
              <Users size={15} />
            </div>
            <strong>{courses.reduce((total, course) => total + (Number(course.students) || 0), 0)}</strong>
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
                <span style={{ height: `${(value / displayedCourseLoad.total) * 100}%` }} />
                <em style={{ height: `${(2 / displayedCourseLoad.total) * 100}%` }} />
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
                {displayedCourses.length > 0 ? displayedCourses.map((course, index) => (
                  <tr key={`${course.code}-${index}`}>
                    <td>{course.title}</td>
                    <td>{course.code}</td>
                    <td>{course.level}</td>
                    <td><b>{course.students}</b></td>
                    <td>{course.status || faculty.status || "ACTIVE"}</td>
                  </tr>
                )) : (
                  <tr>
                    <td>No active courses assigned yet.</td>
                    <td>-</td>
                    <td>-</td>
                    <td><b>0</b></td>
                    <td>{faculty.status || "ACTIVE"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
