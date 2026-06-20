import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, Lock, Mail } from "lucide-react";
import AuthHeader from "../../components/AuthHeader";
import { apiClient } from "../../services/apiClient.js";
import {
  detectRoleFromEmail,
  getCurrentSession,
  getDashboardPathForRole,
  getOrCreateDemoAccountForLogin,
  setCurrentSession,
  setSelectedFacultyId,
  setSelectedStudentId,
} from "../../utils/learnupRecords.js";
import "./loginPage.css";

async function loginWithBackend(email, password) {
  return apiClient.post("/auth/login", { email, password });
}

const BACKEND_ROLE_TO_APP_ROLE = {
  student: "student",
  instructor: "faculty",
  faculty: "faculty",
  admin: "admin",
  super_admin: "admin",
};

function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAppRoleFromBackendRole(role) {
  return BACKEND_ROLE_TO_APP_ROLE[String(role || "").toLowerCase()] || null;
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const passwordPlaceholder = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  const session = getCurrentSession();

  if (session?.role) {
    return <Navigate to={getDashboardPathForRole(session.role)} replace />;
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString().trim() ?? "";

    if (!email) {
      setEmailError("Email is required.");
      setLoginError("");
      return;
    }

    if (!password) {
      setEmailError("");
      setLoginError("Password is required.");
      return;
    }

    if (!isValidEmailFormat(email)) {
      setEmailError("Please enter a valid email address.");
      setLoginError("");
      return;
    }

    setEmailError("");
    let backendLogin = null;
    let backendLoginError = null;

    try {
      backendLogin = await loginWithBackend(email, password);
    } catch (error) {
      backendLoginError = error;
    }

    if (backendLogin?.access_token) {
      const backendRole = backendLogin.role;
      const appRole = getAppRoleFromBackendRole(backendRole);

      if (!appRole) {
        setLoginError("Login failed. Please check your email and password.");
        return;
      }

      setLoginError("");
      try {
        localStorage.setItem("learnup_access_token", backendLogin.access_token);
        if (backendLogin.user || backendLogin.current_user || backendLogin.account || backendLogin.profile) {
          localStorage.setItem(
            "learnup_current_user",
            JSON.stringify(
              backendLogin.user || backendLogin.current_user || backendLogin.account || backendLogin.profile,
            ),
          );
        }
      } catch {
        // If localStorage is unavailable, the session object below still preserves login state.
      }

      try {
        const mePath = appRole === "faculty" ? "/faculty/me" : "/auth/me";
        const meResponse = await apiClient.get(mePath);
        if (meResponse) {
          localStorage.setItem("learnup_current_user", JSON.stringify(meResponse));
        }
      } catch {
        // Fall back to the login payload if the role-specific profile is unavailable.
      }

      setCurrentSession(appRole, {
        email: backendLogin.email || email,
        name: backendLogin.full_name || backendLogin.name || email,
        backendRole,
        accessToken: backendLogin.access_token,
        access_token: backendLogin.access_token,
        tokenType: backendLogin.token_type || "bearer",
      });
      navigate(getDashboardPathForRole(appRole), { replace: true });
      return;
    }

    const role = detectRoleFromEmail(email);

    if (!role) {
      console.info(
        `[LearnUp] Backend login failed (${backendLoginError?.status || 0}: ${backendLoginError?.message || "No response"}). ` +
          "No demo fallback is available for this email domain.",
      );
      setLoginError("Login failed. Please check your email and password.");
      return;
    }

    console.info(
      `[LearnUp] Backend login unavailable (${backendLoginError?.status || 0}: ${backendLoginError?.message || "No response"}). ` +
        "Using temporary demo login fallback.",
    );

    // Temporary demo authentication fallback: any non-empty password is accepted for
    // valid ERU institutional domains until backend auth is fully configured.
    const account = getOrCreateDemoAccountForLogin(role, email);
    const demoAccount = {
      ...account,
      isDemo: true,
      is_demo: true,
    };

    if (role === "student") {
      setSelectedStudentId(demoAccount.id);
    }

    if (role === "faculty") {
      setSelectedFacultyId(demoAccount.id);
    }

    try {
      localStorage.setItem("learnup_current_user", JSON.stringify(demoAccount));
    } catch {
      // The role session below still keeps the demo login usable.
    }

    setLoginError("");
    setCurrentSession(role, {
      email: demoAccount.email || email,
      name: demoAccount.name || demoAccount.fullName || email,
      userId: demoAccount.id || demoAccount.studentId || demoAccount.facultyId || demoAccount.adminId || "",
      isDemoSession: true,
    });
    navigate(getDashboardPathForRole(role), { replace: true });
  };

  return (
    <div className="login-page">
      <AuthHeader />

      <main className="login-page__main">
        <section className="login-card">
          <div className="login-card__intro">
            <h1>Welcome</h1>
            <p>Please enter your details to sign in.</p>
          </div>

          <div className="login-tabs" role="tablist" aria-label="Auth tabs">
            <button
              type="button"
              className="login-tabs__tab login-tabs__tab--active"
              role="tab"
              aria-selected={true}
            >
              Login
            </button>
            <button
              type="button"
              className="login-tabs__tab"
              role="tab"
              aria-selected={false}
              onClick={() => navigate("/create-account")}
            >
              Create New Account
            </button>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            <label className="login-field">
              <span className="login-field__label">Email Address</span>
              <span className="login-field__control">
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
                    if (loginError) {
                      setLoginError("");
                    }
                  }}
                />
              </span>
              {emailError && (
                <span className="login-form__error" role="alert">
                  {emailError}
                </span>
              )}
            </label>

            <div className="login-field">
              <div className="login-field__row">
                <span className="login-field__label">Password</span>
                <Link to="/forgot-password" className="login-field__link">
                  Forgot Password?
                </Link>
              </div>

              <span className="login-field__control">
                <Lock size={16} strokeWidth={2.1} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={passwordPlaceholder}
                  autoComplete="current-password"
                  aria-invalid={loginError ? "true" : "false"}
                  onChange={() => {
                    if (loginError) {
                      setLoginError("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <Eye size={16} strokeWidth={2.1} />
                </button>
              </span>
            </div>

            {loginError && (
              <span className="login-form__error" role="alert">
                {loginError}
              </span>
            )}

            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>

            <button type="submit" className="login-submit">
              Sign In
            </button>

            <div className="login-divider">
              <span />
              <p>OR CONTINUE WITH</p>
              <span />
            </div>

            <div className="login-socials">
              <button type="button" className="login-social">
                <span
                  className="login-social__icon login-social__icon--google"
                  aria-hidden="true"
                >
                  G
                </span>
                <span>Google</span>
              </button>

              <button type="button" className="login-social">
                <span
                  className="login-social__icon login-social__icon--facebook"
                  aria-hidden="true"
                >
                  f
                </span>
                <span>Facebook</span>
              </button>
            </div>
          </form>

          <div className="login-card__footer">
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="login-card__footer-link"
                onClick={() => navigate("/create-account")}
              >
                Sign up for free
              </button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
