from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from database import Base


class Ticket(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True, index=True)
    opened_date = Column(Date, nullable=False)
    opened_time = Column(Time, nullable=False)
    subject = Column(String(200), nullable=True)
    description = Column(String, nullable=False)
    category_id = Column(Integer, nullable=False)
    urgency_level = Column(Integer, nullable=False, default=1)
    current_status = Column(String(50), nullable=False, default='פתוח')
    opened_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # הערה: בקוד ה-C# יש גם קשרים (Category, Attachments, Messages,
    # TicketAssignments, TicketStatusHistories, Aianalyses) - נוסיף אותם
    # כשנעבוד על המסכים שצריכים אותם (טיפול בפנייה, ניתוח AI וכו')