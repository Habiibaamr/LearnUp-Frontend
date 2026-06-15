import logo from "../assets/logo.png";
import "./authHeader.css";

const logoIncludesText = false;

export default function AuthHeader() {
  return (
    <div className="auth-header">
      <div className="auth-header-left">
        <div className="auth-logo-box">
          <img src={logo} alt="LearnUp" className="auth-logo" />
        </div>
        {!logoIncludesText && <span className="auth-title">LearnUp</span>}
      </div>

      <div className="auth-header-right">
        <div className="auth-avatar" />
      </div>
    </div>
  );
}
