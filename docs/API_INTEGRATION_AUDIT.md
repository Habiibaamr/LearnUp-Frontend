# LearnUp API Integration Audit

Backend base URL: `https://learn-up-project-vnmh.vercel.app`

Environment variable: `VITE_API_BASE_URL`

Probe date: 2026-06-16

## Backend Discovery

Live checks:

| Source | Result |
|---|---|
| `/docs` | 200, FastAPI Swagger UI HTML |
| `/openapi.json` | 200, OpenAPI 3.1 schema |

Confirmed endpoints needed for the first integration pass:

| Action | Endpoint | Method | Request body | Expected response |
|---|---|---:|---|---|
| Login | `/auth/login` | POST | `{ email, password }` | `{ access_token, token_type, role }` |
| Current user/profile | `/auth/me` | GET | none | `{ id, university_id, full_name, email, role }` |
| List users/students | `/admin/users` | GET | none | OpenAPI response schema is currently unspecified |
| Create student | `/admin/create-student-account` | POST | `{ full_name, email, password, faculty_id?, department_id?, level?, cgpa?, passed_credit_hours?, phone?, advisor_instructor_id? }` | OpenAPI response schema is currently unspecified |
| List instructors | `/admin/instructors` | GET | none | OpenAPI response schema is currently unspecified |
| Create instructor/faculty member | `/admin/create-instructor-account` | POST | `{ full_name, email, password, faculty_id?, department_id?, specialization?, office_location?, phone? }` | OpenAPI response schema is currently unspecified |
| List registered courses | `/student/me/courses` | GET | none | OpenAPI response schema not audited for this pass |
| Course board | `/student/me/course-board` | GET | none | OpenAPI response schema not audited for this pass |
| Enroll/register course | `/student/me/add-course/{course_offering_id}` | POST | path id | OpenAPI response schema not audited for this pass |
| Drop course | `/student/me/drop-course/{course_offering_id}` | POST | path id | OpenAPI response schema not audited for this pass |

Notes:

- Student and instructor create endpoints require bearer auth.
- The admin create forms do not currently have real numeric `faculty_id` or `department_id` values, so the first wiring sends only safe fields from the schema.
- Frontend display IDs such as `#STU-...` and `#FAC-...` are still local UI IDs unless the backend returns `university_id`.

## Frontend Integration Table

| Page/component | Action | Current mock/localStorage function | Backend endpoint needed | Method | Request body | Expected response | Ready |
|---|---|---|---|---:|---|---|---|
| `LoginPage` | Login | Demo fallback via `getOrCreateDemoAccountForLogin` and `setCurrentSession` | `/auth/login` | POST | `{ email, password }` | `{ access_token, token_type, role }` | Connected with demo fallback |
| `CreateStudent` | Create student | Was `saveStudentRecord(formValues)` | `/admin/create-student-account` | POST | `{ full_name, email, password, level?, phone? }` | Created user/student object, unspecified schema | Connected now |
| `CreateStudent` | List/search students | `getStudents()` from `learnupRecords.js` | `/admin/users` | GET | none | User/student array, unspecified schema | Connected as refresh with mock fallback |
| `StudentCreated` | Confirmation | `findStudentById`, `getLastCreatedStudent` | Create response from `/admin/create-student-account` | POST result | same as create | Created student details | Keep local display cache |
| `StudentsEnrolled` | Roster/edit | `getStudents()`, `saveStudentRecord`, hardcoded `students` | `/admin/users` plus future update endpoint | GET/PATCH | unknown update body | Student list / updated student | Keep mock |
| `CreateInstructor` | Create faculty member | Was `saveFacultyRecord(formValues)` | `/admin/create-instructor-account` | POST | `{ full_name, email, password, specialization?, office_location?, phone? }` | Created instructor object, unspecified schema | Connected now |
| `CreateInstructor` | List/search instructors | `getFacultyMembers()` from `learnupRecords.js` | `/admin/instructors` | GET | none | Instructor array, unspecified schema | Connected as refresh with mock fallback |
| `InstructorSuccessPage` | Confirmation | `findFacultyById`, `getLastCreatedFaculty` | Create response from `/admin/create-instructor-account` | POST result | same as create | Created faculty details | Keep local display cache |
| `AssignInstructor` | Assign course offering | Hardcoded `rows` and `courses` | `/admin/course-offerings`, `/admin/instructors`, `/admin/assign-instructor-to-offering` | GET/POST | `{ course_offering_id, instructor_id }` | Assignment result | Keep mock |
| `Dashboard` | Admin stats/actions | Hardcoded `stats` and `actions` | likely `/admin/users`, `/admin/instructors`, `/admin/course-offerings` or summary endpoint | GET | none | Counts/aggregates | Keep mock |
| `AdminProfile` | Admin profile | local session/mock profile | `/auth/me` | GET | none | User profile | Keep mock |
| `RegisterPage` | Student self-register | `saveStudentRecord`, direct `localStorage.setItem` | No self-register endpoint confirmed | POST | unknown | Account/session | Keep mock |
| `StudentDashboard` | Summary/course preview | hardcoded `rows`, local session records | `/student/v2/me/card`, `/student/me/course-board` | GET | none | Student card/course board | Keep mock |
| `CourseBoard` | List/enroll/drop courses | Hardcoded course arrays and button-only state | `/student/me/course-board`, `/student/me/add-course/{course_offering_id}`, `/student/me/drop-course/{course_offering_id}` | GET/POST | path id for add/drop | Board/update result | Keep mock |
| `AcademicMap` | Roadmap | Hardcoded `levels` | No direct endpoint confirmed | GET | unknown | Roadmap levels/courses | Keep mock |
| `SemesterResult` | Results | `data/studentSemesterResults.js` | No direct semester-result endpoint confirmed | GET | unknown | Grades/GPA/credits | Keep mock |
| `AcademicAdvisorBot` | Chat history/messages | Hardcoded `history`, `chips`, `initialMessages` | `/chat/start`, `/chat/my-sessions`, `/chat/{session_id}/message` | GET/POST | `{ message }` | Chat sessions/messages | Keep mock |
| `StudentProfile` | Student details | `resolveStudentForSession`, `facultyStudents`, `learnupRecords.js` | `/student/v2/me/card`; faculty lookup may use `/instructor/students/{university_id}` | GET | path id for faculty lookup | Student profile/card | Keep mock |
| `FacultyDashboard` | Faculty stats | `data/facultyStudents.js`, `learnupRecords.js` | `/instructor/my-offerings`, registrations endpoints | GET | offering id for registrations | Offerings/registration arrays | Keep mock |
| `FacultyCourseBoard` | Faculty course cards | `data/facultyCourses.js` | `/instructor/my-offerings` | GET | none | Course offerings | Keep mock |
| `FacultyStudents` | Faculty roster | `data/facultyStudents.js`, `learnupRecords.js` | `/instructor/my-offerings/{course_offering_id}/registrations` | GET | path id | Registration/student array | Keep mock |
| `CourseStudents` | Students in course | `getFacultyCourseStudents()` | `/instructor/my-offerings/{course_offering_id}/registrations` | GET | path id | Registration/student array | Keep mock |
| `EnrollStudent` | Faculty enroll student | Hardcoded `enrollmentCandidates`, course mock helpers | Enrollment endpoint not safely mapped to UI IDs yet | POST | unknown/path ids | Enrollment result | Keep mock |
| `EnrollmentSuccess` | Enrollment confirmation | Route state plus fallback arrays | Enrollment response | POST result | same as enroll | Enrollment details | Keep mock |
| `FacultyProfile` | Faculty profile/courses | `resolveFacultyForSession`, `facultyCourseLevels` | `/auth/me`, `/instructor/my-offerings` | GET | none | User profile/offerings | Keep mock |

## Current Implementation

- `src/services/apiClient.js` reads `VITE_API_BASE_URL`, attaches `Authorization: Bearer <token>` from `learnup:session` or `learnup:currentUser`, sends JSON headers, and throws `ApiError` with clear backend messages.
- `src/services/adminAccounts.js` centralizes create/list endpoints and frontend/backend field mapping.
- `CreateStudent` now POSTs to `/admin/create-student-account`; it refreshes `/admin/users` after success when the list response can be mapped.
- `CreateInstructor` now POSTs to `/admin/create-instructor-account`; it refreshes `/admin/instructors` after success when the list response can be mapped.
- Mock/localStorage fallback is only used for these create flows if the backend endpoint returns 404.

## Deferred On Purpose

Course Board, Academic Map, Semester Result, Faculty pages, assignment, enrollment, and profile hydration remain mocked until admin create/list is stable and backend IDs can be mapped safely.
