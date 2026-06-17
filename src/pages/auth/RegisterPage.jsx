import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Lock, Mail, User } from "lucide-react";
import AuthHeader from "../../components/AuthHeader";
import { generateStudentId, saveStudentRecord } from "../../utils/learnupRecords.js";
import "./registerPage.css";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const passwordPlaceholder = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  const navigate = useNavigate();

  const handleSignup = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = formData.get("fullName")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const isEruEmail = /^[^\s@]+@eru\.edu\.eg$/i.test(email);

    console.log("signup submitted", {
      fullName,
      email,
      rememberMe,
    });

    if (!isEruEmail) {
      setEmailError("Email must be a valid ERU email ending with @eru.edu.eg");
      return;
    }

    setEmailError("");
    localStorage.setItem(
      "user",
      JSON.stringify({
        fullName,
        email,
      })
    );
    localStorage.setItem("learnup:studentEmail", email);
    saveStudentRecord(
      {
        fullName,
        email,
        initialPassword: password,
        studentId: generateStudentId(),
        department: "CS",
        level: "Level 1",
        enrollmentStatus: "Enrolled",
      },
      { markCreated: false },
    );
    navigate("/login");
  };

  return (
    <div className="register-page">
      <AuthHeader />

      <main className="register-page__main">
        <section className="register-card">
          <div className="register-card__intro">
            <h1>Welcome !</h1>
            <p>Please enter your details to create account</p>
          </div>

          <div className="register-tabs" role="tablist" aria-label="Auth tabs">
            <button
              type="button"
              className="register-tabs__tab"
              role="tab"
              aria-selected={false}
              onClick={() => navigate("/login")}
            >
              login
            </button>
            <button
              type="button"
              className="register-tabs__tab register-tabs__tab--active"
              role="tab"
              aria-selected={true}
            >
              create account
            </button>
          </div>

          <form
            className="register-form"
            onSubmit={handleSignup}
          >
            <label className="register-field">
              <span className="register-field__label">full name</span>
              <span className="register-field__control">
                <User size={16} strokeWidth={2.1} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="eg.john dain"
                  autoComplete="name"
                />
              </span>
            </label>

            <label className="register-field">
              <span className="register-field__label">Email Address</span>
              <span className="register-field__control">
                <Mail size={16} strokeWidth={2.1} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  aria-invalid={emailError ? "true" : "false"}
                  onChange={() => {
                    if (emailError) {
                      setEmailError("");
                    }
                  }}
                />
              </span>
              {emailError && (
                <span className="register-form__error" role="alert">
                  {emailError}
                </span>
              )}
            </label>

            <label className="register-field">
              <span className="register-field__label">Password</span>
              <span className="register-field__control">
                <Lock size={16} strokeWidth={2.1} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={passwordPlaceholder}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="register-field__toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <Eye size={16} strokeWidth={2.1} />
                </button>
              </span>
            </label>

            <label className="register-field">
              <span className="register-field__label">confirm password</span>
              <span className="register-field__control">
                <Lock size={16} strokeWidth={2.1} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder={passwordPlaceholder}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="register-field__toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  <Eye size={16} strokeWidth={2.1} />
                </button>
              </span>
            </label>

            <label className="register-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>

            <button type="submit" className="register-submit">
              create account
            </button>

            <div className="register-divider">
              <span />
              <p>OR CONTINUE WITH</p>
              <span />
            </div>

            <div className="register-socials">
              <button type="button" className="register-social">
                <span
                  className="register-social__icon register-social__icon--google"
                  aria-hidden="true"
                >
                  G
                </span>
                <span>Google</span>
              </button>

              <button type="button" className="register-social">
                <span
                  className="register-social__icon register-social__icon--facebook"
                  aria-hidden="true"
                >
                  f
                </span>
                <span>Facebook</span>
              </button>
            </div>
          </form>

          <div className="register-card__footer">
            <p>
              Do have an account?{" "}
              <button
                type="button"
                className="register-card__footer-link"
                onClick={() => navigate("/login")}
              >
                login
              </button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RegisterPage;
