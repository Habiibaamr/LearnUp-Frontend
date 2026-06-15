# LearnUp API Integration Audit

Backend base URL: `https://learn-up-project-vnmh.vercel.app`

Environment variable: `VITE_API_BASE_URL`

Probe date: 2026-06-14

## Backend Discovery

| Endpoint | Method | Probe result | Notes |
|---|---:|---|---|
| `/` | GET | 200 | Public health message: backend is running. |
| `/docs` | GET | 200 | FastAPI Swagger UI exists. |
| `/openapi.json` | GET | 200 | OpenAPI schema exists. |
| `/health` | GET | 200 | Reports `database_configured: false`; backend data flows are not usable yet. |
| `/auth/login` | POST | Exists, currently 503 | OpenAPI confirms login; live response says `Database is not configured. Set DATABASE_URL in environment variables.` |
| `/auth/me` | GET | Exists, 401 without token | Depends on successful backend auth. |
| `/student/me/card` | GET | Exists, 401 without token | Student identity/profile candidate. |
| `/student/v2/me/card` | GET | Exists, 401 without token | Preferred student identity-card endpoint per OpenAPI. |
| `/student/me/courses` | GET | Exists, 401 without token | Student registered courses candidate. |
| `/student/me/course-board` | GET | Exists, 401 without token | Student course board candidate. |
| `/student/me/add-course/{course_offering_id}` | POST | Exists | Course enrollment candidate. |
| `/student/me/drop-course/{course_offering_id}` | POST | Exists | Course drop candidate. |
| `/admin/users` | GET | Exists, 401 without token | Admin user list candidate. |
| `/admin/instructors` | GET | Exists, 401 without token | Admin instructor list candidate. |
| `/admin/course-offerings` | GET | Exists, 401 without token | Admin/faculty course offering candidate. |
| `/admin/create-student-account` | POST | Exists | Student creation candidate. |
| `/admin/create-instructor-account` | POST | Exists | Instructor creation candidate. |
| `/admin/assign-instructor-to-offering` | POST | Exists | Instructor assignment candidate. |
| `/admin/final-grades-window` | GET | Exists | Result publishing window candidate, not semester results. |
| `/instructor/my-offerings` | GET | Exists, 401 without token | Faculty course board candidate. |
| `/instructor/my-offerings/{course_offering_id}/registrations` | GET | Exists | Faculty course students candidate. |
| `/instructor/students/{university_id}` | GET | Exists | Faculty view of a student candidate. |
| `/chat/start` | POST | Exists | Advisor bot session start candidate. |
| `/chat/my-sessions` | GET | Exists, 401 without token | Advisor bot history candidate. |
| `/chat/{session_id}/message` | POST | Exists | Advisor bot send-message candidate. |
| `/login`, `/api/login`, `/api/auth/login` | POST | 404 | Missing; do not use. |
| `/students`, `/api/students` | GET | 404 | Missing generic student-list endpoints. |
| `/faculty`, `/faculties`, `/api/faculty`, `/api/faculties` | GET | 404 | Missing generic faculty endpoints. |
| `/courses`, `/api/courses` | GET | 404 | Missing generic course endpoints. Use confirmed course-board/offering endpoints later. |
| `/results`, `/semester-results`, `/api/results`, `/api/semester-results` | GET | 404 | Missing direct semester-result endpoints. |

## Frontend Feature Audit

| Page/component | Feature/action | Current data source | Required backend endpoint | Method | Request body | Expected response shape | Endpoint exists or missing | Integrate now? |
|---|---|---|---|---:|---|---|---|---|
| `LoginPage` | Sign in and route by role | Demo email-domain auth + localStorage session | `/auth/login` | POST | `{ email, password }` | `{ access_token, token_type, role }` | Exists, but currently 503 because DB is not configured | Yes, safe try with demo fallback |
| `RequireRole` in `App.jsx` | Protect routes | `learnup:session` localStorage | `/auth/me` | GET | none | `{ id, university_id, full_name, email, role }` | Exists, 401 without token | Stay mock until login works |
| `RegisterPage` | Create student account | localStorage + `saveStudentRecord` | `/admin/create-student-account` or student self-register endpoint | POST | `{ full_name, email, password, faculty_id?, department_id?, level?, cgpa?, passed_credit_hours?, phone? }` | Created user/student object | Admin endpoint exists; self-register endpoint missing | Stay mock temporarily |
| `StudentDashboard` | Profile/progress summary | Inline mock + `learnupRecords` session data | `/student/v2/me/card` | GET | none | Student identity/progress card object | Exists, 401 without token | Stay mock temporarily |
| `StudentDashboard` | Course-board preview and status tabs | Inline mock `rows` | `/student/me/course-board` | GET | none | Array/grouped courses with status, credits, eligibility | Exists, 401 without token | Stay mock temporarily |
| `CourseBoard` | List/filter course cards | Inline mock course templates | `/student/me/course-board` | GET | none | Course board grouped by available/enrolled/locked/passed | Exists, 401 without token | Stay mock temporarily |
| `CourseBoard` | Enroll/drop course | Button-only mock UI | `/student/me/add-course/{course_offering_id}` and `/student/me/drop-course/{course_offering_id}` | POST | path id | Updated registration/course board state | Exists | Stay mock until IDs map to UI data |
| `AcademicMap` | Degree roadmap | Inline mock `levels` | Not confirmed | GET | none | Levels with courses, prerequisites, status | Missing direct endpoint | Stay mock |
| `SemesterResult` | Filter semester results | `data/studentSemesterResults.js` | Not confirmed | GET | likely `{ academicYear, term }` or query params | Courses with grades, status, GPA, credits | Missing direct endpoint | Stay mock |
| `AcademicAdvisorBot` | Chat history | Inline mock `history` | `/chat/my-sessions` and `/chat/{session_id}/messages` | GET | none/path id | Session list and message list | Exists, 401 without token | Stay mock temporarily |
| `AcademicAdvisorBot` | Send message | Local component state | `/chat/start`, `/chat/{session_id}/message` | POST | `{ message }` | `{ session_id, user_message, assistant_response, kb?, sources? }` | Exists | Stay mock until auth works |
| `StudentProfile` | Student details/card | `resolveStudentForSession`, localStorage records | `/student/v2/me/card`; admin/faculty student endpoint for cross-role view | GET | none or `university_id` path | Student profile/card object | Student self endpoint exists; cross-role endpoint partially exists under instructor | Stay mock temporarily |
| `Admin Dashboard` | Stats, analytics | Inline mock `stats` and chart values | `/admin/users`, `/admin/instructors`, `/admin/course-offerings` or future summary endpoint | GET | none | Counts and analytics aggregates | List endpoints exist; summary endpoint missing | Stay mock temporarily |
| `CreateStudent` | List/search/filter students | `getStudents()` localStorage merge | `/admin/users` filtered by role or future student list endpoint | GET | none/query | Student array | `/admin/users` exists; generic student list missing | Stay mock temporarily |
| `CreateStudent` | Create student | `saveStudentRecord` localStorage | `/admin/create-student-account` | POST | `{ full_name, email, password, faculty_id?, department_id?, level?, cgpa?, passed_credit_hours?, phone? }` | Created student/account | Exists | Stay mock until auth works |
| `StudentCreated` | Created student confirmation | last-created localStorage id | `/admin/create-student-account` response | POST result | same as create student | Created student/account payload | Exists | Stay mock temporarily |
| `StudentsEnrolled` | Enrolled student roster and edits | `getStudents()` / `saveStudentRecord` | `/admin/users` or future student roster/update endpoint | GET/PATCH | update fields | Student list / updated student | Generic roster/update endpoint missing | Stay mock |
| `CreateInstructor` | List/search/filter instructors | `getFacultyMembers()` localStorage merge | `/admin/instructors` | GET | none | Instructor array | Exists, 401 without token | Stay mock temporarily |
| `CreateInstructor` | Create instructor | `saveFacultyRecord` localStorage | `/admin/create-instructor-account` | POST | `{ full_name, email, password, faculty_id?, department_id?, specialization?, office_location?, phone? }` | Created instructor/account | Exists | Stay mock until auth works |
| `AssignInstructor` | Instructor/course assignment | Inline mock `rows` and `courses` | `/admin/course-offerings`, `/admin/instructors`, `/admin/assign-instructor-to-offering` | GET/POST | `{ course_offering_id, instructor_id }` | Course offerings, instructors, assignment result | Exists | Stay mock until IDs map to UI data |
| `AdminProfile` | Admin profile details | local/mock session records | `/auth/me` or admin profile endpoint | GET | none | User profile object | `/auth/me` exists; admin profile endpoint missing | Stay mock temporarily |
| `FacultyDashboard` | Faculty stats/snapshot/GPA chart | `data/facultyStudents.js` and inline aggregates | `/instructor/my-offerings`, `/instructor/my-offerings/{id}/registrations` | GET | path id | Offerings and registration/student arrays | Exists, 401 without token | Stay mock temporarily |
| `FacultyCourseBoard` | Faculty course cards | `data/facultyCourses.js` | `/instructor/my-offerings` | GET | none | Course offering array | Exists, 401 without token | Stay mock temporarily |
| `FacultyStudents` | Student roster/search/filter | `data/facultyStudents.js` | Could derive from `/instructor/my-offerings/{id}/registrations`; no all-students-for-instructor endpoint confirmed | GET | offering id | Registration/student array | Partial exists | Stay mock |
| `CourseStudents` | Students for one course | `getFacultyCourseStudents()` mock mapping | `/instructor/my-offerings/{course_offering_id}/registrations` | GET | path id | Registration/student array | Exists | Stay mock until offering IDs map |
| `EnrollStudent` | Candidate list/select/enroll | `getAvailableStudentsForCourse()` mock mapping | `/instructor/students/{university_id}/add-course...` or student add-course endpoints | POST | path ids | Updated registration result | Exists, but UI ID mapping missing | Stay mock |
| `EnrollmentSuccess` | Enrollment confirmation | route state/mock course lookup | enrollment response from backend | POST result | same as enroll action | Enrolled students/course payload | Depends on enroll endpoint | Stay mock |
| `FacultyProfile` | Faculty details/courses | `resolveFacultyForSession`, `facultyCourseLevels` | `/auth/me`, `/instructor/my-offerings` | GET | none | User profile and offerings | Exists, 401 without token | Stay mock temporarily |

## Recommended Next Integration Steps

1. Fix backend `DATABASE_URL` so `/auth/login` returns a real token.
2. After login works, wire `/auth/me` into session hydration.
3. Integrate read-only Student profile/course-board endpoints before write actions.
4. Map frontend mock IDs to backend integer IDs before enabling create/enroll/assign actions.
5. Keep localStorage fallback until each endpoint returns stable response shapes in the deployed backend.
