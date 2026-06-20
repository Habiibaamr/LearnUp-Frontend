import { ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import learnupLogo from "../../assets/learnup-logo.png";
import {
  getCurrentSession,
  getDashboardPathForRole,
} from "../../utils/learnupRecords.js";
import "./introPage.css";

export default function IntroPage() {
  const navigate = useNavigate();
  const session = getCurrentSession();

  if (session?.role) {
    return <Navigate to={getDashboardPathForRole(session.role)} replace />;
  }

  return (
    <main className="learnup-intro">
      <div className="learnup-intro__glow learnup-intro__glow--one" />
      <div className="learnup-intro__glow learnup-intro__glow--two" />
      <section className="learnup-intro__content" aria-labelledby="learnup-intro-title">
        <div className="learnup-intro__logo-wrap">
          <span className="learnup-intro__orbit" aria-hidden="true" />
          <img src={learnupLogo} alt="LearnUp" className="learnup-intro__logo" />
        </div>
        <h1 id="learnup-intro-title">Learn, progress, and grow with confidence.</h1>
        <p>Your academic journey, course planning, results, and support—all in one place.</p>
        <button type="button" onClick={() => navigate("/login")}>
          Get Started
          <ArrowRight size={18} strokeWidth={2.4} />
        </button>
      </section>
    </main>
  );
}
