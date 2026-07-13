import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ticketService from "../../Services/ticketService";

export default function NewTicket() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [currentUserId, setCurrentUserId] = useState(0);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({ message: false });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useState(() => {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      setCurrentUserId(user.id);
      setUserName(`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim());
      setUserInitials(`${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`);
    }
  }, []);

  const charCount = message.length;
  const isMessageInvalid = charCount < 10;
  const isFormInvalid = isMessageInvalid;

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ message: true });
    if (isFormInvalid) return;

    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      subject: subject || "",
      description: message,
      opened_by_user_id: currentUserId,
    };

    try {
      await ticketService.addTicket(payload);
      setSubject("");
      setMessage("");
      setUploadedFiles([]);
      navigate("/employee/home");
    } catch (err) {
      setSubmitError("אירעה שגיאה בשליחת הפנייה. נסה שנית.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => navigate("/employee/home");
  const onCancel = () => {
    setSubject("");
    setMessage("");
    setUploadedFiles([]);
    navigate("/employee/home");
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files) setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
  };
  const onFileSelect = (e) => {
    const files = e.target.files;
    if (files) setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
  };
  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const formatFileSize = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;

  return (
    <>
      <style>{CSS}</style>
      <div className="page-wrapper">
        {/* Header */}
        <header className="main-header">
          <div className="header-content">
            <div className="header-right">
              <button className="btn-back" onClick={goBack}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                חזרה
              </button>
              <div className="page-breadcrumb">
                <span className="breadcrumb-item">הפניות שלי</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="breadcrumb-item active">פתיחת פנייה חדשה</span>
              </div>
            </div>

            <div className="header-left">
              <div className="user-menu-compact">
                <div className="user-avatar">{userInitials}</div>
                <span className="user-name">{userName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-container">
            {/* Form Card */}
            <div className="form-card">
              <div className="form-header">
                <div className="form-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 8v16M8 16h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="form-header-content">
                  <h2 className="form-title">פתיחת פנייה חדשה</h2>
                  <p className="form-subtitle">נשמח לסייע לך. אנא מלא/י את הפרטים הבאים ונטפל בפנייתך בהקדם</p>
                </div>
              </div>

              <form onSubmit={onSubmit}>
                {/* Subject Field (Optional) */}
                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    נושא הפנייה
                    <span className="label-hint"> (אופציונלי)</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="form-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="לדוגמה: בעיה בכרטיס נוכחות, בקשה לחופשה, שאלה לגבי שכר..."
                  />
                  <span className="input-hint">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" />
                      <path d="M7 4v4M7 10h.01" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                    הנושא יעזור לנו לנתב את הפנייה למטפל המתאים
                  </span>
                </div>

                {/* Message Field (Required) */}
                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    <span className="required">*</span>
                    תיאור הפנייה
                  </label>
                  <textarea
                    id="message"
                    className="form-textarea"
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched({ message: true })}
                    placeholder={`נא לתאר את הפנייה בפירוט...\n\nדוגמה:\nשלום,\nאני מעוניין/ת לקבל הבהרה לגבי חישוב ימי החופשה שלי לשנת 2026.\nלפי התלוש האחרון שלי נותרו לי 15 ימים, אך חשבתי שצריכים להיות לי יותר.\nאשמח אם תוכלו לבדוק ולעדכן אותי.\nתודה!`}
                  ></textarea>
                  <div className="textarea-footer">
                    <span className={`char-count${charCount < 10 ? " warning" : ""}`}>
                      {charCount} תווים
                      {charCount < 10 && <span className="char-min"> (מינימום 10)</span>}
                    </span>
                  </div>
                  {isMessageInvalid && touched.message && (
                    <span className="error-message">נא להזין לפחות 10 תווים</span>
                  )}
                </div>

                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">
                    קבצים מצורפים
                    <span className="label-hint"> (אופציונלי)</span>
                  </label>

                  <label
                    className={`upload-area${uploadedFiles.length > 0 ? " has-files" : ""}${isDragging ? " dragging" : ""}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={onFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                      style={{ display: "none" }}
                    />
                    <div className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M24 16v16M16 24h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="upload-text">
                      <strong>לחץ להעלאה</strong> או גרור קבצים לכאן
                    </div>
                    <div className="upload-hint">PDF, Word, Excel, תמונות - עד 10MB לקובץ</div>
                  </label>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="files-list">
                      {uploadedFiles.map((file, i) => (
                        <div className="file-item" key={`${file.name}-${i}`}>
                          <div className="file-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path d="M13 2v7h7" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </div>
                          <div className="file-info">
                            <div className="file-name">{file.name}</div>
                            <div className="file-size">{formatFileSize(file.size)}</div>
                          </div>
                          <button type="button" className="file-remove" onClick={() => removeFile(i)}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Info Box */}
                <div className="info-box">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <strong>מערכת AI חכמה</strong>
                    <p>המערכת שלנו תנתח את הפנייה באופן אוטומטי ותנתב אותה למטפל המתאים ביותר. זמן התגובה הממוצע הוא עד 24 שעות.</p>
                  </div>
                </div>

                {submitError && <span className="error-message">{submitError}</span>}

                {/* Action Buttons */}
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={onCancel}>
                    ביטול
                  </button>
                  <button type="submit" className="btn-primary" disabled={isFormInvalid || isSubmitting}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M18 2L9 11M18 2l-7 16-2-7-7-2 16-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {isSubmitting ? "שולח..." : "שליחת פנייה"}
                  </button>
                </div>
              </form>
            </div>

            {/* Help Card */}
            <div className="help-card">
              <h3 className="help-title">זקוק/ה לעזרה?</h3>
              <div className="help-items">
                <div className="help-item">
                  <div className="help-item-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm1-11H9v6h2V6zm0 8H9v2h2v-2z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="help-item-content">
                    <strong>שאלות נפוצות</strong>
                    <p>ראה תשובות לשאלות נפוצות במערכת</p>
                  </div>
                </div>

                <div className="help-item">
                  <div className="help-item-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 9h14M9 3v14" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="help-item-content">
                    <strong>מדריך למשתמש</strong>
                    <p>הוראות שימוש מפורטות במערכת</p>
                  </div>
                </div>

                <div className="help-item">
                  <div className="help-item-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="help-item-content">
                    <strong>צור קשר ישיר</strong>
                    <p>hr@company.co.il | 03-1234567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const CSS = `
:root {
    --primary-blue: #0067b8;
    --light-blue: #4da3d6;
    --dark-blue: #003d71;
    --accent-teal: #00a3ad;
    --bg-page: #f5f8fa;
    --white: #ffffff;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --text-muted: #999999;
    --border-color: #e0e7ed;
    --success-bg: #e8f5e9;
    --success-color: #2e7d32;
    --warning-bg: #fff3e0;
    --warning-color: #e65100;
    --error-color: #d32f2f;
    --shadow-sm: 0 2px 8px rgba(0, 103, 184, 0.08);
    --shadow-md: 0 4px 20px rgba(0, 103, 184, 0.12);
}

.page-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-page);
    font-family: 'Assistant', 'Heebo', -apple-system, sans-serif;
    direction: rtl;
}

.main-header {
    background: var(--white);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.btn-back {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--white);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
}

.btn-back:hover {
    border-color: var(--primary-blue);
    color: var(--primary-blue);
}

.page-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.breadcrumb-item { color: var(--text-muted); }
.breadcrumb-item.active { color: var(--text-primary); font-weight: 600; }
.breadcrumb-item svg { color: var(--text-muted); }

.user-menu-compact {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-weight: 600;
    font-size: 16px;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.main-content { flex: 1; padding: 40px 32px; }

.content-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 32px;
}

.form-card {
    background: var(--white);
    border-radius: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.form-header {
    padding: 32px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.form-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--primary-blue), var(--light-blue));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    flex-shrink: 0;
}

.form-header-content { flex: 1; }

.form-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.form-subtitle {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
}

form { padding: 32px; }

.form-group { margin-bottom: 32px; }

.form-label {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 10px;
}

.label-hint { font-weight: 400; color: var(--text-muted); font-size: 14px; }
.required { color: var(--error-color); margin-left: 4px; }

.form-input,
.form-textarea {
    width: 100%;
    padding: 14px 18px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 15px;
    font-family: inherit;
    color: var(--text-primary);
    background: var(--white);
    transition: all 0.3s ease;
    resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 4px rgba(0, 103, 184, 0.08);
}

.form-input::placeholder,
.form-textarea::placeholder { color: var(--text-muted); }

.form-textarea { min-height: 200px; line-height: 1.6; }

.input-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--text-secondary);
}

.input-hint svg { color: var(--primary-blue); flex-shrink: 0; }

.textarea-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.char-count { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.char-count.warning { color: var(--warning-color); }
.char-min { font-weight: 400; }

.error-message {
    display: block;
    color: var(--error-color);
    font-size: 13px;
    margin-top: 6px;
    font-weight: 500;
}

.upload-area {
    display: block;
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fafbfc;
}

.upload-area:hover,
.upload-area.dragging {
    border-color: var(--primary-blue);
    background: rgba(0, 103, 184, 0.02);
}

.upload-area.has-files { border-color: var(--success-color); background: var(--success-bg); }

.upload-icon { width: 64px; height: 64px; margin: 0 auto 16px; color: var(--text-muted); }
.upload-text { font-size: 15px; color: var(--text-primary); margin-bottom: 6px; }
.upload-text strong { color: var(--primary-blue); }
.upload-hint { font-size: 13px; color: var(--text-secondary); }

.files-list {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--bg-page);
    border-radius: 10px;
    border: 1px solid var(--border-color);
}

.file-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-blue);
    flex-shrink: 0;
}

.file-info { flex: 1; }
.file-name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.file-size { font-size: 12px; color: var(--text-secondary); }

.file-remove {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.file-remove:hover { background: #ffebee; color: var(--error-color); }

.info-box {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: rgba(0, 103, 184, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(0, 103, 184, 0.15);
    margin-bottom: 32px;
}

.info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-blue);
    flex-shrink: 0;
}

.info-content { flex: 1; }
.info-content strong { display: block; font-size: 15px; color: var(--text-primary); margin-bottom: 6px; }
.info-content p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; }

.form-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-start;
    padding-top: 32px;
    border-top: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary {
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-blue), var(--light-blue));
    color: var(--white);
    border: none;
    box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-secondary { background: var(--white); color: var(--text-secondary); border: 2px solid var(--border-color); }
.btn-secondary:hover { border-color: var(--primary-blue); color: var(--primary-blue); }

.help-card {
    background: var(--white);
    border-radius: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    padding: 28px;
    height: fit-content;
    position: sticky;
    top: 100px;
}

.help-title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; }
.help-items { display: flex; flex-direction: column; gap: 16px; }

.help-item {
    display: flex;
    gap: 14px;
    padding: 16px;
    border-radius: 12px;
    background: var(--bg-page);
    transition: all 0.3s ease;
    cursor: pointer;
}

.help-item:hover { background: rgba(0, 103, 184, 0.05); }

.help-item-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-blue);
    flex-shrink: 0;
}

.help-item-content strong { display: block; font-size: 14px; color: var(--text-primary); margin-bottom: 4px; }
.help-item-content p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0; }

@media (max-width: 1024px) {
    .content-container { grid-template-columns: 1fr; }
    .help-card { position: static; }
}

@media (max-width: 768px) {
    .main-content { padding: 24px 20px; }
    .header-content { padding: 12px 20px; }
    .page-breadcrumb { display: none; }
    .form-header { flex-direction: column; padding: 24px; }
    form { padding: 24px; }
    .form-actions { flex-direction: column; }
    .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
}
`;