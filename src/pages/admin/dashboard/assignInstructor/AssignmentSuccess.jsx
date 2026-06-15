import { ArrowRight, CalendarDays, CheckCircle, Printer, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./assignmentSuccess.css";

export default function AssignmentSuccess() {
  const navigate = useNavigate();

  return (
    <main className="assignment-success-page-v2">
      <section className="assignment-success-shell-v2">
        <header>
          <div><CheckCircle size={34} fill="#2024c7" color="#ffffff" /></div>
          <h1>Faculty Member Assigned Successfully</h1>
          <p>The curricular assignment has been finalized and notified to all parties.</p>
        </header>

        <section className="assignment-relation">
          <article>
            <span className="assignment-icon">▣</span>
            <small>COURSE MODULE</small>
            <h2>Advanced Neural<br />Architectures</h2>
            <p>AD2001</p>
          </article>
          <span className="assignment-arrow"><ArrowRight size={23} /></span>
          <article className="is-instructor">
            <span className="assignment-avatar" />
            <small>FACULTY MEMBER</small>
            <h2>Dr. Sara jenkis</h2>
          </article>
        </section>

        <section className="assignment-meta">
          <article><span><CalendarDays size={20} /></span><div><small>ASSIGNMENT DATE</small><strong>October 24, 2023</strong></div></article>
          <article><span>⇲</span><div><small>EXPECTED START</small><strong>November 12, 2023</strong></div></article>
        </section>

        <footer>
          <button type="button" onClick={() => navigate("/admin/dashboard")}>Go to Dashboard</button>
          <button type="button" onClick={() => navigate("/admin/assign-instructor")}><UserPlus size={13} />Assign Another</button>
          <button type="button" onClick={() => window.print()}><Printer size={13} />Print Confirmation</button>
        </footer>
      </section>
    </main>
  );
}
