import { useState, useEffect } from "react";
import authService from '../../Services/authService';


function validateRegisterForm(form) {
  const errors = {};
  if (!form.fullName || form.fullName.trim().length < 2)
    errors.fullName = "שם מלא חובה (לפחות 2 תווים)";
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
    errors.email = "כתובת אימייל לא תקינה";
  if (!form.employeeId) errors.employeeId = "מספר עובד חובה";
  if (!form.department) errors.department = "יש לבחור מחלקה";
  if (!form.role) errors.role = "יש לבחור תפקיד";
  if (!form.password || form.password.length < 8)
    errors.password = "סיסמה חייבת להכיל לפחות 8 תווים";
  else if (!/[A-Z]/.test(form.password))
    errors.password = "סיסמה חייבת להכיל לפחות אות גדולה אחת ";
  else if (!/[a-z]/.test(form.password))
    errors.password = "סיסמה חייבת להכיל לפחות אות קטנה אחת ";
  else if (!/[0-9]/.test(form.password))
    errors.password = "סיסמה חייבת להכיל לפחות מספר אחד";
  else if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password))
    errors.password = "סיסמה חייבת להכיל לפחות תו מיוחד אחד ";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "הסיסמאות אינן תואמות";
  if (!form.terms) errors.terms = "יש לאשר תנאי שימוש";
  return errors;
}

export default function AuthPages({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ employeeId: "", password: "", rememberMe: false });
  const [showLoginError, setShowLoginError] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: "", email: "", employeeId: "", phone: "",
    department: "", role: "", password: "", confirmPassword: "", terms: false,
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerTouched, setRegisterTouched] = useState({});
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [showRegisterError, setShowRegisterError] = useState(false);
  const [registerErrorMessage, setRegisterErrorMessage] = useState("");

  const [allDepartments, setAllDepartments] = useState([]);
  const [allUserTypes, setAllUserTypes] = useState([]);


  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);


  const loadRegisterData = async () => {
    try {
      const [types, departments] = await Promise.all([
        authService.getUserTypes(),
        authService.getDepartments(),
      ]);
      setAllUserTypes(types);
      setAllDepartments(departments);
    } catch (err) {
      console.error("Error loading register data:", err);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "register") {
      loadRegisterData();
      setShowRegisterSuccess(false);
    } else {
      setShowLoginError(false);
    }
  };

 
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.employeeId || !loginForm.password) return;

    try {
      const response = await authService.login({
        employeeId: loginForm.employeeId,
        password: loginForm.password,
        rememberMe : loginForm.rememberMe
      });
      if (response?.success) {
        onLoginSuccess?.();
      } else {
        triggerLoginError();
      }
    } catch {
      triggerLoginError();
    }
  };

  const triggerLoginError = () => {
    setShowLoginError(true);
    setTimeout(() => setShowLoginError(false), 5000);
  };

  
  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newForm = { ...registerForm, [name]: type === "checkbox" ? checked : value };
    setRegisterForm(newForm);
    if (registerTouched[name]) {
      setRegisterErrors(validateRegisterForm(newForm));
    }
  };

  const handleRegisterBlur = (e) => {
    const { name } = e.target;
    setRegisterTouched((prev) => ({ ...prev, [name]: true }));
    setRegisterErrors(validateRegisterForm(registerForm));
  };

  const onRegister = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(registerForm).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setRegisterTouched(allTouched);
    const errors = validateRegisterForm(registerForm);
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const nameParts = registerForm.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    const user = {
      first_name: firstName,
      last_name: lastName,
      email: registerForm.email,
      employee_id: registerForm.employeeId,
      phone: registerForm.phone,
      password: registerForm.password,
      user_type_id: registerForm.role,
      department_id: registerForm.department,
      job_title: '',
      status: 'active'
    };

    try {
      const response = await authService.addUser(user);
      if (response?.success) {
        setShowRegisterSuccess(true);
        setRegisterForm({
          fullName: "", email: "", employeeId: "", phone: "",
          department: "", role: "", password: "", confirmPassword: "", terms: false,
        });
        setTimeout(() => switchTab("login"), 4000);
      } else {
        setRegisterErrorMessage(response?.message || "אירעה שגיאה בהרשמה.");
        setShowRegisterError(true);
      }
    } catch (err) {
      setRegisterErrorMessage(err?.message || "אירעה שגיאה בהרשמה.");
      setShowRegisterError(true);
    }
  };

  // ============================================================
  // Forgot password handlers
  // ============================================================
  const onForgotPassword = (e) => {
    e.preventDefault();
    setForgotEmail(loginForm.employeeId || "");
    setShowForgotModal(true);
  };

  const onForgotSubmit = async () => {
    if (!forgotEmail) {
      setForgotError("נא להזין כתובת מייל");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotMessage(res.message);
    } catch {
      setForgotError("שגיאה בשליחת המייל, נסי שנית");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotMessage("");
    setForgotError("");
  };

  // ============================================================
  // Render
  // ============================================================
 
  return (  
    <>
      <style>{CSS}</style>
      <div className="container">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-content">
            <div className="logo-container">
              <div className="logo">מ.פ</div>
              <h1 className="brand-title">מערכת ניהול<br />פניות עובדים</h1>
              <p className="brand-subtitle">פלטפורמה חכמה לניהול ומעקב אחר פניות העובדים בארגון</p>
            </div>
            <ul className="features-list">
              <li>ניתוב חכם ואוטומטי של פניות באמצעות AI</li>
              <li>מעקב ובקרה מלאה על זמני טיפול</li>
              <li>דשבורד ניהולי מתקדם לקבלת החלטות</li>
              <li>אבטחת מידע ברמה הגבוהה ביותר</li>
            </ul>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-header">
            <div className="form-tabs">
              <button
                className={`tab-button${activeTab === "login" ? " active" : ""}`}
                onClick={() => switchTab("login")}
              >התחברות</button>
              <button
                className={`tab-button${activeTab === "register" ? " active" : ""}`}
                onClick={() => switchTab("register")}
              >הרשמה</button>
            </div>
          </div>

          {/* Login Form */}
          <div className={`form-content${activeTab === "login" ? " active" : ""}`}>
            <h2 className="form-title">ברוכים השבים</h2>
            <p className="form-description">התחברו למערכת כדי לנהל את הפניות שלכם</p>

            <div className={`alert error${showLoginError ? " show" : ""}`}>
              שם המשתמש או הסיסמה אינם נכונים. אנא נסו שנית.
            </div>

            <form onSubmit={onLogin}>
              <div className="form-group">
                <label><span className="required">*</span>קוד משתמש או אימייל</label>
                <input type="text" name="employeeId" value={loginForm.employeeId}
                  onChange={handleLoginChange} placeholder="הזינו קוד משתמש או כתובת אימייל" />
              </div>
              <div className="form-group">
                <label><span className="required">*</span>סיסמה</label>
                <input type="password" name="password" value={loginForm.password}
                  onChange={handleLoginChange} placeholder="הזינו סיסמה" />
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="remember-me" name="rememberMe"
                  checked={loginForm.rememberMe} onChange={handleLoginChange} />
                <label htmlFor="remember-me">זכור אותי במכשיר זה</label>
              </div>
              <button type="submit" className="submit-button">התחבר למערכת</button>
              <div className="forgot-password">
                <a href="#" onClick={onForgotPassword}>שכחתי סיסמה</a>
              </div>
            </form>
          </div>

          {/* Register Form */}
          <div className={`form-content${activeTab === "register" ? " active" : ""}`}>
            <h2 className="form-title">הוספת עובד חדש</h2>
            <p className="form-description">מלאו את הפרטים להוספת עובד למערכת</p>

            <div className={`alert success${showRegisterSuccess ? " show" : ""}`}>
              העובד נוסף בהצלחה! ניתן להתחבר למערכת.
            </div>
            <div className={`alert error${showRegisterError ? " show" : ""}`}>
              {registerErrorMessage}
            </div>

            <form onSubmit={onRegister}>
              {[
                { name: "fullName", label: "שם מלא", type: "text", placeholder: "הזינו שם פרטי ושם משפחה", required: true },
                { name: "email", label: "כתובת אימייל", type: "email", placeholder: "example@company.co.il", required: true, hint: "ישמש לכניסה למערכת ולקבלת התראות" },
                { name: "employeeId", label: "מספר עובד", type: "text", placeholder: "הזינו מספר עובד", required: true },
                { name: "phone", label: "טלפון", type: "tel", placeholder: "050-1234567", required: false },
              ].map(({ name, label, type, placeholder, required, hint }) => (
                <div className="form-group" key={name}>
                  <label><span className="required">{required ? "*" : ""}</span>{label}</label>
                  <input type={type} name={name} value={registerForm[name]}
                    onChange={handleRegisterChange} onBlur={handleRegisterBlur}
                    placeholder={placeholder}
                    className={registerErrors[name] && registerTouched[name] ? "error" : ""}
                  />
                  {hint && <span className="input-hint">{hint}</span>}
                  {registerErrors[name] && registerTouched[name] &&
                    <span className="error-message" style={{ display: "block" }}>{registerErrors[name]}</span>}
                </div>
              ))}

              <div className="form-group">
                <label><span className="required">*</span>מחלקה</label>
                <select name="department" value={registerForm.department}
                  onChange={handleRegisterChange} onBlur={handleRegisterBlur}
                  className={registerErrors.department && registerTouched.department ? "error" : ""}>
                  <option value="">בחרו מחלקה</option>
                  {allDepartments.map((d) => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
                {registerErrors.department && registerTouched.department &&
                  <span className="error-message" style={{ display: "block" }}>{registerErrors.department}</span>}
              </div>

              <div className="form-group">
                <label><span className="required">*</span>תפקיד במערכת</label>
                <select name="role" value={registerForm.role}
                  onChange={handleRegisterChange} onBlur={handleRegisterBlur}
                  className={registerErrors.role && registerTouched.role ? "error" : ""}>
                  <option value="">בחרו תפקיד עובד</option>
                  {allUserTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.description}</option>
                  ))}
                </select>
                {registerErrors.role && registerTouched.role &&
                  <span className="error-message" style={{ display: "block" }}>{registerErrors.role}</span>}
              </div>

              {[
                { name: "password", label: "סיסמה", placeholder: "בחרו סיסמה חזקה", hint: "לפחות 8 תווים, עם אותיות ומספרים" },
                { name: "confirmPassword", label: "אימות סיסמה", placeholder: "הזינו את הסיסמה שנית" },
              ].map(({ name, label, placeholder, hint }) => (
                <div className="form-group" key={name}>
                  <label><span className="required">*</span>{label}</label>
                  <input type="password" name={name} value={registerForm[name]}
                    onChange={handleRegisterChange} onBlur={handleRegisterBlur}
                    placeholder={placeholder}
                    className={registerErrors[name] && registerTouched[name] ? "error" : ""}
                  />
                  {hint && <span className="input-hint">{hint}</span>}
                  {registerErrors[name] && registerTouched[name] &&
                    <span className="error-message" style={{ display: "block" }}>{registerErrors[name]}</span>}
                </div>
              ))}

              <div className="checkbox-group">
                <input type="checkbox" id="terms" name="terms"
                  checked={registerForm.terms} onChange={handleRegisterChange} />
                <label htmlFor="terms">
                  אני מאשר/ת את{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>תנאי השימוש</a> ו
                  <a href="#" onClick={(e) => e.preventDefault()}>מדיניות הפרטיות</a>
                </label>
              </div>

              <button type="submit" className="submit-button"
                disabled={Object.keys(validateRegisterForm(registerForm)).length > 0 && Object.keys(registerTouched).length > 0}>
                הוסף עובד למערכת
              </button>
            </form>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="modal-overlay" onClick={closeForgotModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeForgotModal}>✕</button>
              <h3>איפוס סיסמה</h3>
              <p>הזיני את כתובת המייל שלך ונשלח קישור לאיפוס</p>
              <div className="form-group">
                <label>כתובת מייל</label>
                <input type="email" value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="example@company.co.il" />
              </div>
              <div className={`alert error${forgotError ? " show" : ""}`}>{forgotError}</div>
              <div className={`alert success${forgotMessage ? " show" : ""}`}>{forgotMessage}</div>
              <button className="submit-button" onClick={onForgotSubmit} disabled={forgotLoading}>
                {forgotLoading ? "שולח..." : "שלח קישור לאיפוס"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


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

/* Global Styles */
body {
    font-family: 'Assistant', 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: var(--text-primary);
    position: relative;
    overflow-x: hidden;
}

/* Decorative background elements */
body::before {
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

body::after {
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

/* Container */
.container {
    width: 100%;
    max-width: 1100px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    background: var(--white);
    border-radius: 20px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    position: relative;
    z-index: 1;
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Brand Section */
.brand-section {
    background: linear-gradient(165deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
}

.brand-section::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 60px,
        rgba(255, 255, 255, 0.03) 60px,
        rgba(255, 255, 255, 0.03) 120px
    );
    animation: brandPattern 40s linear infinite;
}

@keyframes brandPattern {
    0% { transform: translate(0, 0); }
    100% { transform: translate(84.85px, 84.85px); }
}

.brand-content {
    position: relative;
    z-index: 1;
}

.logo-container {
    margin-bottom: 40px;
}

.logo {
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
    color: var(--white);
    border: 2px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 20px;
}

.brand-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--white);
    margin-bottom: 12px;
    line-height: 1.3;
}

.brand-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 300;
    line-height: 1.6;
}

.features-list {
    list-style: none;
    margin-top: 50px;
    position: relative;
    z-index: 1;
}

.features-list li {
    color: rgba(255, 255, 255, 0.9);
    padding: 16px 0;
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 15px;
    font-weight: 400;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.features-list li:nth-child(1) { animation-delay: 0.1s; }
.features-list li:nth-child(2) { animation-delay: 0.2s; }
.features-list li:nth-child(3) { animation-delay: 0.3s; }
.features-list li:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.features-list li::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    flex-shrink: 0;
    font-weight: 700;
}

/* Form Section */
.form-section {
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.form-header {
    margin-bottom: 40px;
}

.form-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 30px;
    background: var(--bg-gradient-start);
    padding: 6px;
    border-radius: 12px;
}

.tab-button {
    flex: 1;
    padding: 14px 24px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
}

.tab-button.active {
    background: var(--white);
    color: var(--primary-blue);
    box-shadow: var(--shadow-sm);
}

.tab-button:hover:not(.active) {
    color: var(--text-primary);
}

.form-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.form-description {
    color: var(--text-secondary);
    font-size: 15px;
    line-height: 1.5;
}

.form-content {
    display: none;
}

.form-content.active {
    display: block;
    animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Form Elements */
.form-group {
    margin-bottom: 24px;
}

label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
}

.required {
    color: #d32f2f;
    margin-right: 4px;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="tel"],
select {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid var(--border-color);
    border-radius: 10px;
    font-size: 15px;
    font-family: inherit;
    transition: all 0.3s ease;
    background: var(--white);
    color: var(--text-primary);
}

input:focus,
select:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 4px rgba(0, 103, 184, 0.08);
}

input::placeholder {
    color: #999;
}

.input-hint {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 6px;
    display: block;
}

.error-message {
    color: #d32f2f;
    font-size: 13px;
    margin-top: 6px;
    display: none;
}

input.error {
    border-color: #d32f2f;
}

input.error + .error-message {
    display: block;
}

/* Checkbox */
.checkbox-group {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 20px 0;
}

.checkbox-group input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: var(--primary-blue);
}

.checkbox-group label {
    margin: 0;
    font-weight: 400;
    font-size: 14px;
    cursor: pointer;
    line-height: 1.5;
}

.checkbox-group a {
    color: var(--primary-blue);
    text-decoration: none;
    font-weight: 600;
}

.checkbox-group a:hover {
    text-decoration: underline;
}

/* Submit Button */
.submit-button {
    width: 100%;
    padding: 16px;
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
    position: relative;
    overflow: hidden;
}

.submit-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.submit-button:hover:not(:disabled)::before {
    left: 100%;
}

.submit-button:active:not(:disabled) {
    transform: translateY(0);
}

.submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Forgot Password */
.forgot-password {
    text-align: center;
    margin-top: 16px;
}

.forgot-password a {
    color: var(--primary-blue);
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
}

.forgot-password a:hover {
    text-decoration: underline;
}

/* Alerts */
.alert {
    padding: 14px 16px;
    border-radius: 10px;
    margin-bottom: 24px;
    display: none;
    font-size: 14px;
    line-height: 1.5;
}

.alert.error {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
}

.alert.success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #81c784;
}

.alert.show {
    display: block;
    animation: slideDown 0.3s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Design */
@media (max-width: 900px) {
    .container {
        grid-template-columns: 1fr;
    }

    .brand-section {
        padding: 40px 30px;
    }

    .features-list {
        margin-top: 30px;
    }

    .form-section {
        padding: 40px 30px;
    }
}

@media (max-width: 480px) {
    body {
        padding: 10px;
    }

    .container {
        border-radius: 16px;
    }

    .brand-section,
    .form-section {
        padding: 30px 24px;
    }

    .brand-title {
        font-size: 26px;
    }

    .form-title {
        font-size: 24px;
    }

    .tab-button {
        padding: 12px 16px;
        font-size: 14px;
    }
}
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 61, 113, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

.modal-box {
  background: var(--white);
  padding: 2.5rem;
  border-radius: 20px;
  width: 90%;
  max-width: 440px;
  position: relative;
  direction: rtl;
  text-align: right;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-box h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-box p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.modal-close {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--bg-gradient-start);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--border-color);
  color: var(--text-primary);
}`;
