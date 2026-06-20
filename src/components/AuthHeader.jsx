import { Link } from "react-router-dom";
import logo from "../assets/learnup-logo.png";
import "./authHeader.css";

export default function AuthHeader() {
  return (
    <div className="auth-header">
      <Link to="/" className="auth-header-left" aria-label="LearnUp home">
        <div className="auth-logo-box">
          <img src={logo} alt="LearnUp" className="auth-logo" />
        </div>
      </Link>
    </div>
  );
}
