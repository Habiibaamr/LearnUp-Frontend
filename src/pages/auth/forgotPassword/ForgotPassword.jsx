import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CircleDot, Eye, Lock, Mail, RotateCcw } from "lucide-react";
import AuthHeader from "../../../components/AuthHeader";
import learnupLogo from "../../../assets/learnup-logo.png";
import "./forgotPassword.css";

const emptyOtp = ["", "", "", "", "", ""];
const passwordPlaceholder = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

function BrandLockup({ compact = false }) {
  return (
    <div className={`forgot-password__brand ${compact ? "forgot-password__brand--compact" : ""}`}>
      <img src={learnupLogo} alt="LearnUp" className="learnup-logo" />
    </div>
  );
}

function PageHeader() {
  return <AuthHeader />;
}

function PageFooter({ showLinks = false }) {
  return (
    <footer className="forgot-password__footer">
      <p>&copy; 2024 LearnUp Learning Management. All rights reserved.</p>
      {showLinks && (
        <nav aria-label="Footer links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
        </nav>
      )}
    </footer>
  );
}

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpRefs = useRef([]);

  const focusOtp = (index) => {
    otpRefs.current[index]?.focus();
  };

  const handleSendCode = (event) => {
    event.preventDefault();
    console.log("Forgot password email:", { email });
    setStep(2);
    window.setTimeout(() => focusOtp(0), 0);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < otp.length - 1) {
      focusOtp(index + 1);
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      focusOtp(index - 1);
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, otp.length)
      .split("");

    if (!pastedCode.length) {
      return;
    }

    const nextOtp = [...emptyOtp];
    pastedCode.forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    focusOtp(Math.min(pastedCode.length, otp.length) - 1);
  };

  const handleVerifyCode = (event) => {
    event.preventDefault();
    console.log("Verify reset code:", { email, otp: otp.join("") });
    setStep(3);
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    console.log("Reset password:", {
      email,
      otp: otp.join(""),
      password,
      confirmPassword,
    });
  };

  return (
    <div className="forgot-password-page">
      <PageHeader />

      <main className="forgot-password__main">
        {step === 1 && (
          <section className="forgot-password-card forgot-password-card--forgot">
            <BrandLockup />

            <div className="forgot-password-card__intro">
              <h1>
                Forgot
                <br />
                Password?
              </h1>
              <p>
                No worries! Enter your email address below and we'll send you a
                link to reset your password.
              </p>
            </div>

            <form className="forgot-password-form" onSubmit={handleSendCode}>
              <label className="forgot-password-field">
                <span>Email Address</span>
                <span className="forgot-password-field__control">
                  <Mail size={13} strokeWidth={2.2} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </span>
              </label>

              <button type="submit" className="forgot-password-button">
                <span>send verify code</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>
            </form>

            <div className="forgot-password-card__login">
              <Link to="/login">
                <ArrowLeft size={13} strokeWidth={2.5} />
                <span>Back to Login</span>
              </Link>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="forgot-password-card forgot-password-card--verify">
            <div className="forgot-password-mail-icon" aria-hidden="true">
              <Mail size={24} strokeWidth={2.1} />
            </div>

            <div className="forgot-password-card__intro">
              <h1>Verify your email</h1>
              <p>
                We've sent a 6-digit code to your email address. Please enter it
                below to complete your registration.
              </p>
            </div>

            <form className="forgot-password-verify-form" onSubmit={handleVerifyCode}>
              <div className="forgot-password-otp" aria-label="6-digit verification code">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      otpRefs.current[index] = node;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              <button type="submit" className="forgot-password-button">
                <span>Verify &amp; Complete</span>
                <CircleDot size={16} strokeWidth={2.2} />
              </button>
            </form>

            <div className="forgot-password-resend">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={() => console.log("Resend code:", { email })}
              >
                <RotateCcw size={13} strokeWidth={2.2} />
                <span>Resend code</span>
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="forgot-password-card forgot-password-card--reset">
            <BrandLockup />

            <div className="forgot-password-card__intro">
              <h1>reset your password</h1>
              <p>
                please enter and confirm your new password below to secure your
                contact
              </p>
            </div>

            <form className="forgot-password-form" onSubmit={handleResetPassword}>
              <label className="forgot-password-field">
                <span>Password</span>
                <span className="forgot-password-field__control">
                  <Lock size={13} strokeWidth={2.2} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={passwordPlaceholder}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="forgot-password-field__toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <Eye size={13} strokeWidth={2.1} />
                  </button>
                </span>
              </label>

              <label className="forgot-password-field">
                <span>confirm password</span>
                <span className="forgot-password-field__control">
                  <Lock size={13} strokeWidth={2.2} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={passwordPlaceholder}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="forgot-password-field__toggle"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() => setShowConfirmPassword((value) => !value)}
                  >
                    <Eye size={13} strokeWidth={2.1} />
                  </button>
                </span>
              </label>

              <button type="submit" className="forgot-password-button">
                <span>confirm new password</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>
            </form>
          </section>
        )}
      </main>

      <PageFooter showLinks={step === 2} />
    </div>
  );
}

export default ForgotPassword;
