import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ticketService from "../../Services/ticketService";

export default function EmployeeHome() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading,setLoading]=useState(true);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [currentUserId, setCurrentUserId] = useState(0);
  const [error,setError]=useState("");
  const [allTickets, setAllTickets] = useState([]);

  
  useEffect(() => {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      setCurrentUserId(user.id);
      setUserName(`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim());
      setUserInitials(
        `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`
      );
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    loadTickets();
  }, [currentUserId]);

  const loadTickets = async () => {
    setLoading(true);
  
    try {
      const data = await ticketService.getTicketsByUser(currentUserId);
      setAllTickets(data);
    } catch (err) {
      console.error(err);
      setError("אירעה שגיאה בטעינת הפניות");
    } finally {
      setLoading(false);
    }
  };

  // סטטיסטיקות
  const totalTickets = allTickets.length;
  const pendingTickets = allTickets.filter(
    (t) => t.current_status === "חדשה" || t.current_status === "בטיפול"
  ).length;
  const resolvedTickets = allTickets.filter((t) => t.current_status === "סגור").length;
  const urgentTickets = allTickets.filter((t) => t.urgency_level >= 4).length;

  // פילטור, חיפוש ומיון
  const tickets = useMemo(() => {
    let filtered = [...allTickets];

    if (activeFilter === "open") filtered = filtered.filter((t) => t.current_status === "חדשה");
    else if (activeFilter === "pending") filtered = filtered.filter((t) => t.current_status === "בטיפול");
    else if (activeFilter === "resolved") filtered = filtered.filter((t) => t.current_status === "סגור");

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
 
      filtered = filtered.filter(
        (t) =>
          (t.subject ?? "").toLowerCase().includes(query) ||
          (t.description ?? "").toLowerCase().includes(query)
      );
    }

    if (sortBy === "date")
      filtered.sort((a, b) => new Date(b.opened_date).getTime() - new Date(a.opened_date).getTime());
    else if (sortBy === "status")
      filtered.sort((a, b) => a.current_status?.localeCompare(b.current_status));
    else if (sortBy === "urgency") filtered.sort((a, b) => b.urgency_level  - a.urgency_level );

    return filtered;
  }, [allTickets, activeFilter, searchQuery, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(tickets.length / itemsPerPage) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tickets.slice(start, start + itemsPerPage);
  }, [tickets, currentPage, itemsPerPage]);

  // Helpers
  const getStatusClass = (status) => {
    switch (status) {
      case "חדשה": return "status-open";
      case "בטיפול": return "status-pending";
      case "סגור": return "status-resolved";
      default: return "";
    }
  };

  const getUrgencyLabel = (level) => {
    switch (level) {
      case 1: return "נמוכה";
      case 2: return "בינונית";
      case 3: return "גבוהה";
      case 4: return "קריטית";
      default: return "לא ידוע";
    }
  };

  const getUrgencyClass = (level) => {
    switch (level) {
      case 1: return "urgency-low";
      case 2: return "urgency-medium";
      case 3: return "urgency-high";
      case 4: return "urgency-critical";
      default: return "";
    }
  };
  const formatDate = (date) => {
    if (!date) return "";
  
    return new Date(date).toLocaleDateString("he-IL");
  };
  const previousPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const viewTicket = (id) => navigate(`/employee/view-ticket/${id}`);
  const onNewTicket = () => navigate("/employee/new-ticket");

  const onLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/auth");
  };


  if (loading) {
    return (
      <div className="page-wrapper">
        <h2 style={{ textAlign: "center", marginTop: "100px" }}>
          טוען פניות...
        </h2>
      </div>
    );
  }

  // Render
  return (
    <>
      <style>{CSS}</style>
      <div className="page-wrapper">
        {/* Header */}
        <header className="main-header">
          <div className="header-content">
            <div className="header-right">
              <div className="logo-section">
                <div className="logo-icon">מ.פ</div>
                <div className="logo-text">
                  <h1>מערכת ניהול פניות</h1>
                  <span>עובדים</span>
                </div>
              </div>
            </div>

            <div className="header-left">
              <div className="user-menu">
                <div className="user-avatar">{userInitials}</div>
                <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">עובד</span>
                </div>
                <button className="icon-button">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <button className="icon-button notifications">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="notification-badge">3</span>
              </button>

              <button className="btn-logout" onClick={onLogout}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M7 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M14 13l4-4-4-4M18 9H7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                יציאה
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-container">
            {/* Page Header */}
            <div className="page-header">
              <div className="page-header-right">
                <h2 className="page-title">הפניות שלי</h2>
                <p className="page-subtitle">צפייה וניהול של כל הפניות שפתחת במערכת</p>
              </div>
              <div className="page-header-left">
                <button className="btn-primary" onClick={onNewTicket}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  פתיחת פנייה חדשה
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">סה"כ פניות</div>
                  <div className="stat-value">{totalTickets}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">ממתינות לטיפול</div>
                  <div className="stat-value">{pendingTickets}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">טופלו</div>
                  <div className="stat-value">{resolvedTickets}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon red">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">דחיפות גבוהה</div>
                  <div className="stat-value">{urgentTickets}</div>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="filters-section">
              <div className="search-box">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="חיפוש פניות..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button className={`filter-btn${activeFilter === "all" ? " active" : ""}`} onClick={() => setActiveFilter("all")}>
                  הכל
                </button>
                <button className={`filter-btn${activeFilter === "open" ? " active" : ""}`} onClick={() => setActiveFilter("open")}>
                  חדשות
                </button>
                <button className={`filter-btn${activeFilter === "pending" ? " active" : ""}`} onClick={() => setActiveFilter("pending")}>
                  בטיפול
                </button>
                <button className={`filter-btn${activeFilter === "resolved" ? " active" : ""}`} onClick={() => setActiveFilter("resolved")}>
                  טופלו
                </button>
              </div>

              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">מיון לפי תאריך</option>
                <option value="status">מיון לפי סטטוס</option>
                <option value="urgency">מיון לפי דחיפות</option>
              </select>
              <button className="filter-btn" onClick={loadTickets}> רענן </button>
            </div>

            {/* Tickets Table */}
            <div className="table-card">
              <div className="table-responsive">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>מספר פנייה</th>
                      <th>נושא</th>
                      <th>תאריך פתיחה</th>
                      <th>סטטוס</th>
                      <th>דחיפות</th>
                      <th>מטפל</th>
                      <th>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <span className="ticket-number">#{ticket.id}</span>
                        </td>
                        <td>
                          <div className="ticket-subject">{ticket.subject || "ללא נושא"}</div>
                        </td>
                        <td>
                          <span className="ticket-date">{formatDate(ticket.opened_date)}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(ticket.current_status)}`}>
                            {ticket.current_status}
                          </span>
                        </td>
                        <td>
                          <span className={`urgency-badge ${getUrgencyClass(ticket.urgency_level)}`}>
                            <span className="urgency-dot"></span>
                            {getUrgencyLabel(ticket.urgency_level)}
                          </span>
                        </td>
                        <td>
                          <span className="no-handler">טרם שויך</span>
                        </td>
                        <td>
                          <button className="action-btn" onClick={() => viewTicket(ticket.id)}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                              <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="2" />
                              <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            צפייה
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {tickets.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
                      <path d="M32 20v16M32 44h.02" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3>אין פניות להצגה</h3>
                  <p>לא נמצאו פניות התואמות את החיפוש</p>
                </div>
              )}

              {/* Pagination */}
              {tickets.length > 0 && (
                <div className="pagination">
                  <button className="pagination-btn" disabled={currentPage === 1} onClick={previousPage}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>

                  <div className="pagination-info">
                    עמוד {currentPage} מתוך {totalPages}
                  </div>

                  <button className="pagination-btn" disabled={currentPage === totalPages} onClick={nextPage}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
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
    --shadow-sm: 0 2px 8px rgba(0, 103, 184, 0.08);
    --shadow-md: 0 4px 20px rgba(0, 103, 184, 0.12);
    --shadow-lg: 0 8px 32px rgba(0, 103, 184, 0.15);

    --status-new: #2196f3;
    --status-pending: #ff9800;
    --status-resolved: #4caf50;
    --status-closed: #757575;

    --urgency-low: #4caf50;
    --urgency-medium: #ff9800;
    --urgency-high: #f44336;
}

.page-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Assistant', 'Heebo', -apple-system, sans-serif;
    background: var(--bg-page);
    color: var(--text-primary);
    direction: rtl;
}

.main-header {
    background: var(--white);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-right,
.header-left {
    display: flex;
    align-items: center;
    gap: 24px;
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 14px;
}

.logo-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-blue), var(--light-blue));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-weight: 700;
    font-size: 18px;
}

.logo-text h1 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
}

.logo-text span {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 400;
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    border-radius: 12px;
    background: var(--bg-page);
    cursor: pointer;
    transition: all 0.3s ease;
}

.user-menu:hover { background: #e8f0f7; }

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

.user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.user-role {
    font-size: 12px;
    color: var(--text-secondary);
}

.icon-button {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    background: var(--bg-page);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
}

.icon-button:hover {
    background: #e8f0f7;
    color: var(--primary-blue);
}

.notification-badge {
    position: absolute;
    top: -4px;
    left: -4px;
    background: #f44336;
    color: var(--white);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--white);
}

.btn-logout {
    padding: 10px 20px;
    border-radius: 10px;
    border: 2px solid var(--border-color);
    background: var(--white);
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-family: inherit;
}

.btn-logout:hover {
    border-color: var(--primary-blue);
    color: var(--primary-blue);
}

.main-content { flex: 1; padding: 32px; }

.content-container { max-width: 1400px; margin: 0 auto; }

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
}

.page-subtitle { font-size: 15px; color: var(--text-secondary); }

.btn-primary {
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--primary-blue), var(--light-blue));
    color: var(--white);
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-sm);
    font-family: inherit;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.stat-card {
    background: var(--white);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-icon.blue { background: rgba(33, 150, 243, 0.1); color: #2196f3; }
.stat-icon.orange { background: rgba(255, 152, 0, 0.1); color: #ff9800; }
.stat-icon.green { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
.stat-icon.red { background: rgba(244, 67, 54, 0.1); color: #f44336; }

.stat-content { flex: 1; }

.stat-label {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 6px;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
}

.filters-section {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    align-items: center;
}

.search-box {
    flex: 1;
    min-width: 280px;
    position: relative;
    display: flex;
    align-items: center;
}

.search-box svg {
    position: absolute;
    right: 16px;
    color: var(--text-muted);
    pointer-events: none;
}

.search-box input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 15px;
    font-family: inherit;
    transition: all 0.3s ease;
    background: var(--white);
}

.search-box input:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 4px rgba(0, 103, 184, 0.08);
}

.filter-buttons {
    display: flex;
    gap: 8px;
    background: var(--white);
    padding: 6px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.filter-btn {
    padding: 10px 20px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-family: inherit;
}

.filter-btn.active { background: var(--primary-blue); color: var(--white); }
.filter-btn:hover:not(.active) { background: var(--bg-page); }

.sort-select {
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 14px;
    font-family: inherit;
    background: var(--white);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
}

.sort-select:focus { outline: none; border-color: var(--primary-blue); }

.table-card {
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.table-responsive { overflow-x: auto; }

.tickets-table { width: 100%; border-collapse: collapse; }

.tickets-table thead {
    background: var(--bg-page);
    border-bottom: 2px solid var(--border-color);
}

.tickets-table th {
    padding: 16px 20px;
    text-align: right;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tickets-table tbody tr {
    border-bottom: 1px solid var(--border-color);
    transition: background 0.2s ease;
}

.tickets-table tbody tr:hover { background: #fafbfc; }

.tickets-table td {
    padding: 20px;
    font-size: 14px;
    color: var(--text-primary);
}

.ticket-number { font-weight: 700; color: var(--primary-blue); }

.ticket-subject {
    font-weight: 500;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ticket-date { color: var(--text-secondary); font-size: 13px; }

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

.status-badge.status-open { background: rgba(33, 150, 243, 0.1); color: var(--status-new); }
.status-badge.status-pending { background: rgba(255, 152, 0, 0.1); color: var(--status-pending); }
.status-badge.status-resolved { background: rgba(76, 175, 80, 0.1); color: var(--status-resolved); }

.urgency-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
}

.urgency-dot { width: 8px; height: 8px; border-radius: 50%; }

.urgency-badge.urgency-low { color: var(--urgency-low); }
.urgency-badge.urgency-low .urgency-dot { background: var(--urgency-low); }
.urgency-badge.urgency-medium { color: var(--urgency-medium); }
.urgency-badge.urgency-medium .urgency-dot { background: var(--urgency-medium); }
.urgency-badge.urgency-high,
.urgency-badge.urgency-critical { color: var(--urgency-high); }
.urgency-badge.urgency-high .urgency-dot,
.urgency-badge.urgency-critical .urgency-dot { background: var(--urgency-high); }

.no-handler { color: var(--text-muted); font-style: italic; font-size: 13px; }

.action-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--white);
    color: var(--primary-blue);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    font-family: inherit;
}

.action-btn:hover {
    background: var(--primary-blue);
    color: var(--white);
    border-color: var(--primary-blue);
}

.empty-state { padding: 80px 40px; text-align: center; }

.empty-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    color: var(--text-muted);
    opacity: 0.4;
}

.empty-state h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.empty-state p { font-size: 15px; color: var(--text-secondary); }

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 24px;
    border-top: 1px solid var(--border-color);
}

.pagination-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--white);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
    background: var(--primary-blue);
    color: var(--white);
    border-color: var(--primary-blue);
}

.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pagination-info {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
}

@media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
    .header-content { padding: 12px 20px; }
    .main-content { padding: 20px; }
    .page-header { flex-direction: column; gap: 20px; }
    .stats-grid { grid-template-columns: 1fr; }
    .filters-section { flex-direction: column; align-items: stretch; }
    .search-box { min-width: 100%; }
    .filter-buttons { width: 100%; justify-content: space-between; }
    .table-responsive { overflow-x: scroll; }
    .tickets-table { min-width: 800px; }
}
`;