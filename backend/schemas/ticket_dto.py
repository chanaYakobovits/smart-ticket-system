from pydantic import BaseModel
from datetime import date, time
from typing import Optional


class TicketDTO(BaseModel):
    id: Optional[int] = None
    subject: Optional[str] = None
    description: str
    category_id: int = 1
    urgency_level: int = 1
    current_status: str = "פתוח"
    opened_by_user_id: int
    opened_date: Optional[date] = None
    opened_time: Optional[time] = None

    class Config:
        from_attributes = True


class TicketCreateDTO(BaseModel):
    """מה שנשלח מהלקוח כשפותחים פנייה חדשה - שדות מינימליים בלבד"""
    subject: Optional[str] = None
    description: str
    opened_by_user_id: int