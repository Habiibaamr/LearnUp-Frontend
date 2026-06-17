import { useLocation, useNavigate } from "react-router-dom";
import "./instructorProfile.css";

const Icon = ({ children, size = 24 }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const Icons = {
  arrowLeft: (
    <Icon size={38}>
      <path d="m15 18-6-6 6-6" />
      <path d="M21 12H9" />
    </Icon>
  ),
  pencil: (
    <Icon size={15}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  ),
  deactivate: (
    <Icon size={15}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6" />
    </Icon>
  ),
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function InstructorProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const instructor = {
    fullName: "Dr. Julian Casablancas",
    instructorId: "INST-2024-089",
    department: "Computer Science",
    faculty: "Engineering & Technology",
    specialization: "Data Science & AI",
    email: "j.casablancas@university.edu",
    phone: "+20 100 000 0000",
    location: "Data Science & AI",
    avatar: "",
    ...(state || {}),
  };

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/admin/dashboard");
  };

  return (
    <main className="instructor-profile-page">
      <button className="ip-back-button" onClick={handleBack} type="button" aria-label="Go back">
        {Icons.arrowLeft}
      </button>

      <section className="ip-shell" aria-labelledby="instructor-profile-name">
        <article className="ip-card">
          <div className="ip-cover" />

          <div className="ip-avatar" aria-label="Faculty member avatar">
            {instructor.avatar ? (
              <img alt="" src={instructor.avatar} />
            ) : (
              <span>{getInitials(instructor.fullName)}</span>
            )}
          </div>

          <div className="ip-body">
            <h1 id="instructor-profile-name">{instructor.fullName}</h1>
            <p className="ip-subtitle">
              Senior Faculty Member <span>{"\u2022"}</span> {instructor.instructorId}
            </p>

            <div className="ip-actions" aria-label="Faculty member profile actions">
              <button className="ip-action-button ip-action-button--edit" type="button">
                {Icons.pencil}
                <span>Edit Profile</span>
              </button>
              <button className="ip-action-button ip-action-button--deactivate" type="button">
                {Icons.deactivate}
                <span>Deactivate</span>
              </button>
            </div>

            <div className="ip-details">
              <section className="ip-detail-column" aria-labelledby="faculty-details-title">
                <h2 id="faculty-details-title">
                  <span />
                  FACULTY DETAILS
                </h2>
                <dl>
                  <div>
                    <dt>Faculty</dt>
                    <dd>{instructor.faculty}</dd>
                  </div>
                  <div>
                    <dt>Department</dt>
                    <dd>{instructor.department}</dd>
                  </div>
                  <div>
                    <dt>Specialization</dt>
                    <dd>{instructor.specialization}</dd>
                  </div>
                </dl>
              </section>

              <section className="ip-detail-column" aria-labelledby="contact-info-title">
                <h2 id="contact-info-title">
                  <span />
                  CONTACT INFORMATION
                </h2>
                <dl>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${instructor.email}`}>{instructor.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{instructor.phone}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{instructor.location}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </article>

        <footer className="ip-metadata" aria-label="Profile metadata">
          <span>PROFILE ID: PR-992-XX-L0</span>
          <div>
            <span>LAST SYNC: 2024-05-24</span>
            <span>SECURITY CLEARANCE: L2</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
