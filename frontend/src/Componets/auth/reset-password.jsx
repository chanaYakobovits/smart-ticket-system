import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from '../../Services/authService';

function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;
  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isInvalid =
    !newPassword || !confirmPassword || newPassword.length < 8 || newPassword !== confirmPassword;

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });
    if (isInvalid || !token) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      await authService.resetPassword(token, newPassword);
      setSuccessMessage("הסיסמה עודכנה בהצלחה!");
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err) {
      setErrorMessage(err?.message ?? "הקישור אינו תקף או שפג תוקפו");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="reset-container">
        <div className="reset-box">
          <div className="reset-header">
            <div className="reset-logo">מ.פ</div>
            <h2>הגדרת סיסמה חדשה</h2>
            <p>הסיסמה חייבת להכיל לפחות 8 תווים</p>
          </div>

          <div className="reset-body">
            <div className={`alert error${errorMessage ? " show" : ""}`}>{errorMessage}</div>
            <div className={`alert success${successMessage ? " show" : ""}`}>
              {successMessage}
              {successMessage && (
                <>
                  <br />
                  <small>מעביר אותך לדף הכניסה...</small>
                </>
              )}
            </div>

            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label>סיסמה חדשה</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, newPassword: true }))}
                    placeholder="הזיני סיסמה חדשה"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {passwordTooShort && touched.newPassword && (
                  <span className="error-message">סיסמה חייבת להכיל לפחות 8 תווים</span>
                )}
              </div>

              <div className="form-group">
                <label>אימות סיסמה</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                    placeholder="הזיני את הסיסמה שנית"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {passwordMismatch && touched.confirmPassword && (
                  <span className="error-message">הסיסמאות אינן תואמות</span>
                )}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isInvalid || isLoading || !!successMessage}
              >
                {isLoading ? "מעדכן..." : "עדכן סיסמה"}
              </button>
            </form>

            <div className="back-to-login">
              <a href="/auth">חזרה לדף הכניסה</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;

const CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-blue: #0067b8;
  --light-blue: #4da3d6;
  --dark-blue: #003d71;
  --accent-teal: #00a3ad;
  --bg-gradient-start: #f0f7ff;
  --bg-gradient-end: #e6f3ff;
  --white: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #d4e7f7;
  --shadow-sm: 0 2px 8px rgba(0, 103, 184, 0.08);
  --shadow-md: 0 4px 20px rgba(0, 103, 184, 0.12);
  --shadow-lg: 0 8px 32px rgba(0, 103, 184, 0.15);
}

.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  direction: rtl;
  padding: 20px;
  font-family: 'Assistant', 'Heebo', -apple-system, sans-serif;
  position: relative;
  overflow: hidden;
}

.reset-container::before {
  content: '';
  position: absolute;
  top: -150px;
  left: -150px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 103, 184, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 20s infinite ease-in-out;
}

.reset-container::after {
  content: '';
  position: absolute;
  bottom: -200px;
  right: -200px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 163, 173, 0.04) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 25s infinite ease-in-out reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 30px); }
}

.reset-box {
  background: var(--white);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.reset-header {
  background: linear-gradient(165deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  padding: 2rem 2.5rem;
  text-align: right;
  position: relative;
  overflow: hidden;
}

.reset-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg, transparent, transparent 60px,
    rgba(255,255,255,0.03) 60px, rgba(255,255,255,0.03) 120px
  );
}

.reset-logo {
  width: 56px;
  height: 56px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  border: 2px solid rgba(255,255,255,0.2);
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.reset-header h2 {
  color: white;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}

.reset-header p {
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.reset-body {
  padding: 2rem 2.5rem;
}

.form-group {
  margin-bottom: 1.4rem;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px;
  padding-left: 48px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: var(--white);
  color: var(--text-primary);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 4px rgba(0, 103, 184, 0.08);
}

.toggle-password {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.toggle-password:hover { color: var(--primary-blue); }

.error-message {
  color: #c62828;
  font-size: 13px;
  margin-top: 6px;
  display: block;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--light-blue) 100%);
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  box-shadow: var(--shadow-sm);
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-button:hover:not(:disabled)::before { left: 100%; }
.submit-button:disabled { opacity: 0.6; cursor: not-allowed; }

.alert {
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 1.2rem;
  display: none;
  font-size: 14px;
  line-height: 1.5;
}

.alert.show {
  display: block;
  animation: slideDown 0.3s ease;
}

.alert.error { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }
.alert.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #81c784; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.back-to-login {
  text-align: center;
  margin-top: 1.2rem;
}

.back-to-login a {
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.back-to-login a:hover { text-decoration: underline; }

@media (max-width: 480px) {
  .reset-header, .reset-body { padding: 1.5rem; }
}
`;