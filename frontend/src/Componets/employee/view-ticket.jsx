import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ticketService from '../../Services/ticketService';

export default function ViewTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  // סטייט לנתוני הפנייה והמשתמש
  const [ticketId] = useState(Number(id));
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  
  const [ticketSubject, setTicketSubject] = useState('');
  const [originalMessage, setOriginalMessage] = useState('');
  const [status, setStatus] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const [urgency, setUrgency] = useState('');
  const [urgencyClass, setUrgencyClass] = useState('');
  const [category, setCategory] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [createdTime, setCreatedTime] = useState('');
  const [canClose, setCanClose] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  const [handler, setHandler] = useState('');
  const [handlerInitials, setHandlerInitials] = useState('');

  // SLA ערכי ברירת מחדל
  const [slaPercentage] = useState(0);
  const [slaStatus] = useState('sla-ok');
  const [slaRemaining] = useState('לא ידוע');
  const [slaTarget] = useState('לא ידוע');

  const [attachments, setAttachments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [responses, setResponses] = useState([]);

  // סטייט עבור הטופס
  const [comment, setComment] = useState('');

  // פונקציות עזר להמרת סטטוסים ודחיפות
  const getStatusClass = (statusStr) => {
    switch (statusStr) {
      case 'פתוח': return 'status-open';
      case 'בטיפול': return 'status-pending';
      case 'סגור': return 'status-resolved';
      default: return '';
    }
  };

  const getUrgencyLabel = (level) => {
    switch (level) {
      case 1: return 'נמוכה';
      case 2: return 'בינונית';
      case 3: return 'גבוהה';
      case 4: return 'קריטית';
      default: return 'לא ידוע';
    }
  };

  const getUrgencyClass = (level) => {
    switch (level) {
      case 1: return 'urgency-low';
      case 2: return 'urgency-medium';
      case 3: return 'urgency-high';
      case 4: return 'urgency-critical';
      default: return '';
    }
  };

  // טעינת נתונים ראשונית (נתוני משתמש וקריאת שרת)
  useEffect(() => {
    const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      setUserName(`${user.firstName || ''} ${user.lastName || ''}`);
      setUserInitials(`${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`);
    }

    if (!ticketId) return;

    // קריאה לשרת (בהנחה ש-getTicketById מחזיר Promise או פרומיס מסוג אחר, כאן נטפל כ-Promise)
    // אם ה-service המקורי משתמש ב-RxJS Observable, תצטרך לעשות לו .toPromise() או לשנות את ה-service ל-fetch/axios
    ticketService.getTicketById(ticketId)
      .then((ticket) => {
        setTicketSubject(ticket.subject || 'ללא נושא');
        setOriginalMessage(ticket.description);
        setStatus(ticket.currentStatus);
        setStatusClass(getStatusClass(ticket.currentStatus));
        setUrgency(getUrgencyLabel(ticket.urgencyLevel));
        setUrgencyClass(getUrgencyClass(ticket.urgencyLevel));
        setCategory(ticket.category?.categoryName || 'לא ידוע');
        setCreatedDate(ticket.openedDate);
        setCreatedTime(ticket.openedTime);
        setCanClose(ticket.currentStatus !== 'סגור');

        // מטפל
        if (ticket.ticket_assignments?.length > 0) {
          const assignment = ticket.ticket_assignments[0];
          setHandler(`${assignment.user?.firstName ?? ''} ${assignment.user?.lastName ?? ''}`);
          setHandlerInitials(`${assignment.user?.firstName?.charAt(0) ?? ''}${assignment.user?.lastName?.charAt(0) ?? ''}`);
        }

        // קבצים מצורפים
        const mappedAttachments = (ticket.attachments ?? []).map((a) => ({
          id: a.id,
          name: a.fileName,
          size: `${(a.fileSize / 1024).toFixed(2)} KB`
        }));
        setAttachments(mappedAttachments);

        // היסטוריית סטטוסים
        const mappedTimeline = (ticket.ticket_status_histories ?? []).map((h) => ({
          type: 'status',
          title: `סטטוס שונה ל: ${h.newStatus}`,
          time: h.changedAt,
          description: h.comment
        }));

        // הוספת אירוע פתיחה בתחילת ה-timeline
        mappedTimeline.unshift({
          type: 'created',
          title: 'הפנייה נפתחה',
          time: `${ticket.openedDate} ${ticket.openedTime}`
        });
        setTimeline(mappedTimeline);

        // תגובות
        const mappedResponses = (ticket.messages ?? []).map((m) => ({
          authorInitials: `${m.user?.firstName?.charAt(0) ?? ''}${m.user?.lastName?.charAt(0) ?? ''}`,
          authorName: `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`,
          authorRole: m.user?.jobTitle || 'עובד',
          date: m.sentAt?.split('T')[0] ?? '',
          time: m.sentAt?.split('T')[1]?.substring(0, 5) ?? '',
          message: m.content
        }));
        setResponses(mappedResponses);

        // עדכון אחרון
        const lastUpd = ticket.ticket_status_histories?.length > 0
          ? ticket.ticket_status_histories[ticket.ticket_status_histories.length - 1].changedAt
          : `${ticket.openedDate}`;
        setLastUpdate(lastUpd);
      })
      .catch(() => {
        navigate('/employee/home');
      });
  }, [ticketId, navigate]);

  // פונקציות אירועים
  const handleGoBack = () => navigate('/employee/home');
  const handleAttachFile = () => {};
  const handlePrintTicket = () => window.print();
  const handleShareTicket = () => {};
  const handleDownloadFile = (fileId) => {};
  
  const handleCloseTicket = () => {
    console.log('סגירת פנייה', ticketId);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    console.log('תגובה:', comment);
    setComment('');
  };

  return (
    <>
    <style>{CSS}</style>
    <div className="page-wrapper">
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="header-right">
            <button className="btn-back" onClick={handleGoBack}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              חזרה לרשימה
            </button>
            <div className="ticket-header-info">
              <span className="ticket-number">#{ticketId}</span>
              <span className={`status-badge ${statusClass}`}>{status}</span>
            </div>
          </div>

          <div className="header-left">
            <div className="user-menu-compact">
              <div className="user-avatar">{userInitials}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {/* Main Card */}
          <div className="ticket-main-card">
            {/* Ticket Header */}
            <div className="ticket-details-header">
              <div className="ticket-title-section">
                <h1 className="ticket-title">{ticketSubject || 'ללא נושא'}</h1>
                <div className="ticket-meta">
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor"/>
                      <path d="M8 4v4l2 2" stroke="currentColor" strokeLinecap="round"/>
                    </svg>
                    נפתח ב-{createdDate}
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6z" stroke="currentColor"/>
                      <path d="M4 7h8M8 4v8" stroke="currentColor"/>
                    </svg>
                    {category}
                  </span>
                </div>
              </div>
              <div className={`urgency-badge ${urgencyClass}`}>
                <span className="urgency-dot"></span>
                {urgency}
              </div>
            </div>

            {/* Original Message */}
            <div className="message-card original">
              <div className="message-header">
                <div className="message-author">
                  <div className="user-avatar">{userInitials}</div>
                  <div className="author-info">
                    <div className="author-name">{userName}</div>
                    <div className="author-role">עובד</div>
                  </div>
                </div>
                <div className="message-time">{createdDate} · {createdTime}</div>
              </div>
              <div className="message-content">
                <p>{originalMessage}</p>
              </div>
              
              {/* Attached Files */}
              {attachments.length > 0 && (
                <div className="message-attachments">
                  <div className="attachments-title">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8.5 1.5L3 7l5.5 5.5L14 7 8.5 1.5z" stroke="currentColor"/>
                      <path d="M3 12l3 3" stroke="currentColor" strokeLinecap="round"/>
                    </svg>
                    קבצים מצורפים
                  </div>
                  <div className="attachments-list">
                    {attachments.map((file) => (
                      <div className="attachment-item" key={file.id}>
                        <div className="attachment-icon">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M11 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-6-5z" stroke="currentColor"/>
                            <path d="M11 2v5h6" stroke="currentColor"/>
                          </svg>
                        </div>
                        <div className="attachment-info">
                          <div className="attachment-name">{file.name}</div>
                          <div className="attachment-size">{file.size}</div>
                        </div>
                        <button className="attachment-download" onClick={() => handleDownloadFile(file.id)}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 2v10M5 8l4 4 4-4M3 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline / History */}
            <div className="timeline-section">
              <h3 className="timeline-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                היסטוריית הפנייה
              </h3>

              <div className="timeline">
                {timeline.map((event, index) => (
                  <div className="timeline-item" key={index}>
                    <div className={`timeline-dot ${event.type}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <strong>{event.title}</strong>
                        <span className="timeline-time">{event.time}</span>
                      </div>
                      {event.description && <p>{event.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Responses */}
            {responses.length > 0 && (
              <div className="responses-section">
                <h3 className="responses-title">תגובות ומענה</h3>
                
                {responses.map((response, index) => (
                  <div className="message-card response" key={index}>
                    <div className="message-header">
                      <div className="message-author">
                        <div className="author-avatar handler">{response.authorInitials}</div>
                        <div className="author-info">
                          <div className="author-name">{response.authorName}</div>
                          <div className="author-role">{response.authorRole}</div>
                        </div>
                      </div>
                      <div className="message-time">{response.date} · {response.time}</div>
                    </div>
                    <div className="message-content">
                      <p>{response.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="add-comment-section">
              <h3 className="comment-title">הוספת תגובה</h3>
              <form onSubmit={handleSubmitComment}>
                <textarea 
                  className="comment-textarea"
                  placeholder="הוסף/י תגובה או מידע נוסף לפנייה..."
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                
                <div className="comment-actions">
                  <button type="button" className="btn-attach" onClick={handleAttachFile}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M14.5 8.5l-7 7a4 4 0 1 1-5.7-5.7l7-7a2.5 2.5 0 0 1 3.5 3.5l-7 7a1 1 0 1 1-1.4-1.4l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    צרף קובץ
                  </button>
                  
                  <button type="submit" className="btn-send" disabled={!comment.trim()}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M16 2L8 10M16 2l-6 14-2-6-6-2 14-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    שליחת תגובה
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="ticket-sidebar">
            {/* Info Card */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">פרטי הפנייה</h3>
              
              <div className="info-row">
                <span className="info-label">סטטוס</span>
                <span className={`status-badge small ${statusClass}`}>{status}</span>
              </div>

              <div className="info-row">
                <span className="info-label">דחיפות</span>
                <span className={`urgency-badge small ${urgencyClass}`}>
                  <span className="urgency-dot"></span>
                  {urgency}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">קטגוריה</span>
                <span className="info-value">{category}</span>
              </div>

              <div className="info-row">
                <span className="info-label">מטפל</span>
                {handler ? (
                  <div className="handler-badge">
                    <div className="handler-avatar-small">{handlerInitials}</div>
                    <span>{handler}</span>
                  </div>
                ) : (
                  <span className="info-value">טרם שויך</span>
                )}
              </div>

              <div className="info-row">
                <span className="info-label">תאריך פתיחה</span>
                <span className="info-value">{createdDate}</span>
              </div>

              <div className="info-row">
                <span className="info-label">עדכון אחרון</span>
                <span className="info-value">{lastUpdate}</span>
              </div>
            </div>

            {/* SLA Card */}
            <div className="sidebar-card sla-card">
              <h3 className="sidebar-title">זמן טיפול</h3>
              
              <div className="sla-progress">
                <div className="sla-bar">
                  <div className={`sla-fill ${slaStatus}`} style={{ width: `${slaPercentage}%` }}></div>
                </div>
                <div className="sla-text">
                  <span className="sla-time">{slaRemaining}</span>
                  <span className="sla-label">נותרו לטיפול</span>
                </div>
              </div>

              <div className="sla-info">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor"/>
                  <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeLinecap="round"/>
                </svg>
                <span>זמן טיפול SLA: {slaTarget}</span>
              </div>
            </div>

            {/* Actions Card */}
            <div className="sidebar-card actions-card">
              <h3 className="sidebar-title">פעולות</h3>
              
              <button className="action-button" onClick={handlePrintTicket}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7V3h10v4M5 14H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2"/>
                  <rect x="5" y="11" width="10" height="6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                הדפסת פנייה
              </button>

              <button className="action-button" onClick={handleShareTicket}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="5" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="15" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7.5 11.5l5 2.5M7.5 8.5l5-2.5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                שיתוף פנייה
              </button>

              {canClose && (
                <button className="action-button danger" onClick={handleCloseTicket}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  סגירת פנייה
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
  
}

const CSS = `
/* View Ticket - Styles */

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
    --shadow-sm: 0 2px 8px rgba(0, 103, 184, 0.08);
    --shadow-md: 0 4px 20px rgba(0, 103, 184, 0.12);
    
    /* Status Colors */
    --status-new: #2196f3;
    --status-pending: #ff9800;
    --status-resolved: #4caf50;
    --status-closed: #757575;
    
    /* Urgency Colors */
    --urgency-low: #4caf50;
    --urgency-medium: #ff9800;
    --urgency-high: #f44336;
}

/* Main Layout */
.page-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-page);
}

.main-header {
    background: var(--white);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 24px;
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

.ticket-header-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.ticket-number {
    font-size: 18px;
    font-weight: 700;
    color: var(--primary-blue);
}

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

/* Main Content */
.main-content {
    flex: 1;
    padding: 32px;
}

.content-container {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 24px;
}

/* Ticket Main Card */
.ticket-main-card {
    background: var(--white);
    border-radius: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
}

.ticket-details-header {
    padding: 32px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.ticket-title-section {
    flex: 1;
}

.ticket-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.ticket-meta {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--text-secondary);
}

.meta-item svg {
    color: var(--text-muted);
}

.urgency-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
}

.urgency-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.urgency-badge.low {
    background: rgba(76, 175, 80, 0.1);
    color: var(--urgency-low);
}

.urgency-badge.low .urgency-dot {
    background: var(--urgency-low);
}

.urgency-badge.medium {
    background: rgba(255, 152, 0, 0.1);
    color: var(--urgency-medium);
}

.urgency-badge.medium .urgency-dot {
    background: var(--urgency-medium);
}

.urgency-badge.high {
    background: rgba(244, 67, 54, 0.1);
    color: var(--urgency-high);
}

.urgency-badge.high .urgency-dot {
    background: var(--urgency-high);
}

/* Message Cards */
.message-card {
    padding: 24px 32px;
    border-bottom: 1px solid var(--border-color);
}

.message-card.original {
    background: rgba(0, 103, 184, 0.02);
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.message-author {
    display: flex;
    align-items: center;
    gap: 12px;
}

.author-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-blue), var(--accent-teal));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-weight: 600;
    font-size: 18px;
}

.author-avatar.handler {
    background: linear-gradient(135deg, #4caf50, #81c784);
}

.author-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.author-role {
    font-size: 13px;
    color: var(--text-secondary);
}

.message-time {
    font-size: 13px;
    color: var(--text-muted);
}

.message-content {
    line-height: 1.7;
    color: var(--text-primary);
    font-size: 15px;
}

.message-content p {
    margin: 0 0 12px 0;
}

.message-content p:last-child {
    margin-bottom: 0;
}

/* Attachments */
.message-attachments {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.attachments-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 12px;
}

.attachments-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.attachment-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg-page);
    border-radius: 10px;
    transition: all 0.3s ease;
}

.attachment-item:hover {
    background: rgba(0, 103, 184, 0.05);
}

.attachment-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-blue);
}

.attachment-info {
    flex: 1;
}

.attachment-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}

.attachment-size {
    font-size: 12px;
    color: var(--text-secondary);
}

.attachment-download {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: var(--primary-blue);
    color: var(--white);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.attachment-download:hover {
    background: var(--dark-blue);
}

/* Timeline */
.timeline-section {
    padding: 32px;
    border-bottom: 1px solid var(--border-color);
}

.timeline-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 24px;
}

.timeline {
    position: relative;
}

.timeline::before {
    content: '';
    position: absolute;
    right: 8px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--border-color);
}

.timeline-item {
    position: relative;
    padding-right: 32px;
    padding-bottom: 24px;
}

.timeline-item:last-child {
    padding-bottom: 0;
}

.timeline-dot {
    position: absolute;
    right: 0;
    top: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--white);
    border: 3px solid var(--primary-blue);
    z-index: 1;
}

.timeline-dot.success {
    border-color: var(--urgency-low);
}

.timeline-dot.warning {
    border-color: var(--urgency-medium);
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.timeline-header strong {
    font-size: 14px;
    color: var(--text-primary);
}

.timeline-time {
    font-size: 13px;
    color: var(--text-muted);
}

.timeline-content p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
}

/* Responses */
.responses-section {
    padding: 32px;
}

.responses-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
}

/* Add Comment */
.add-comment-section {
    padding: 32px;
    background: var(--bg-page);
}

.comment-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
}

.comment-textarea {
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
    min-height: 100px;
}

.comment-textarea:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 4px rgba(0, 103, 184, 0.08);
}

.comment-actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;
}

.btn-attach,
.btn-send {
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-family: inherit;
}

.btn-attach {
    background: var(--white);
    color: var(--text-secondary);
    border: 2px solid var(--border-color);
}

.btn-attach:hover {
    border-color: var(--primary-blue);
    color: var(--primary-blue);
}

.btn-send {
    background: linear-gradient(135deg, var(--primary-blue), var(--light-blue));
    color: var(--white);
    border: none;
    box-shadow: var(--shadow-sm);
}

.btn-send:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Sidebar */
.ticket-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.sidebar-card {
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    padding: 24px;
}

.sidebar-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.info-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
}

.info-value {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}

.status-badge.small {
    padding: 4px 10px;
    font-size: 12px;
}

.status-badge.new {
    background: rgba(33, 150, 243, 0.1);
    color: var(--status-new);
}

.status-badge.pending {
    background: rgba(255, 152, 0, 0.1);
    color: var(--status-pending);
}

.status-badge.resolved {
    background: rgba(76, 175, 80, 0.1);
    color: var(--status-resolved);
}

.status-badge.closed {
    background: rgba(117, 117, 117, 0.1);
    color: var(--status-closed);
}

.urgency-badge.small {
    font-size: 12px;
    padding: 4px 10px;
}

.handler-badge {
    display: flex;
    align-items: center;
    gap: 8px;
}

.handler-avatar-small {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4caf50, #81c784);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-size: 11px;
    font-weight: 600;
}

/* SLA Card */
.sla-card {
    background: linear-gradient(135deg, rgba(0, 103, 184, 0.05), rgba(0, 163, 173, 0.05));
}

.sla-progress {
    margin-bottom: 16px;
}

.sla-bar {
    width: 100%;
    height: 8px;
    background: rgba(0, 103, 184, 0.1);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
}

.sla-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s ease;
}

.sla-fill.good {
    background: linear-gradient(90deg, #4caf50, #81c784);
}

.sla-fill.warning {
    background: linear-gradient(90deg, #ff9800, #ffb74d);
}

.sla-fill.danger {
    background: linear-gradient(90deg, #f44336, #e57373);
}

.sla-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sla-time {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
}

.sla-label {
    font-size: 13px;
    color: var(--text-secondary);
}

.sla-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
    padding: 12px;
    background: var(--white);
    border-radius: 8px;
}

/* Actions Card */
.action-button {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--white);
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
    font-family: inherit;
    margin-bottom: 10px;
}

.action-button:last-child {
    margin-bottom: 0;
}

.action-button:hover {
    border-color: var(--primary-blue);
    color: var(--primary-blue);
    background: rgba(0, 103, 184, 0.02);
}

.action-button.danger {
    color: #d32f2f;
}

.action-button.danger:hover {
    border-color: #d32f2f;
    background: rgba(211, 47, 47, 0.05);
}

/* Responsive */
@media (max-width: 1024px) {
    .content-container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .main-content {
        padding: 20px;
    }

    .ticket-details-header {
        flex-direction: column;
        gap: 16px;
    }

    .message-card {
        padding: 20px;
    }

    .timeline-section {
        padding: 20px;
    }
}

`;