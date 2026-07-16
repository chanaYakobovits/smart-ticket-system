from pydantic import BaseModel, Field
from datetime import date, time, datetime
from typing import Optional, List


class CategoryDTO(BaseModel):
    id: int
    category_name: str

    class Config:
        from_attributes = True


class AttachmentDTO(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_url: str

    class Config:
        from_attributes = True


class MessageUserDTO(BaseModel):
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class MessageDTO(BaseModel):
    id: int
    content: str
    sent_at: datetime
    user: MessageUserDTO

    class Config:
        from_attributes = True


class AssignmentUserDTO(BaseModel):
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class AssignmentDTO(BaseModel):
    user: AssignmentUserDTO

    class Config:
        from_attributes = True


class StatusHistoryDTO(BaseModel):
    id: int
    previous_status: str
    new_status: str
    changed_at: datetime
    comment: Optional[str] = None

    class Config:
        from_attributes = True


class AIAnalysisDTO(BaseModel):
    predicted_category_id: int
    urgency_score: float
    risk_level: str
    analysis_text: str
    suggested_response: Optional[str] = None

    class Config:
        from_attributes = True



class TicketDTO(BaseModel):
    id: Optional[int] = None

    subject: Optional[str] = None
    description: str

    category_id: int
    urgency_level: int

    current_status: str = "פתוח"

    opened_by_user_id: int

    opened_date: Optional[date] = None
    opened_time: Optional[time] = None

    class Config:
        from_attributes = True



class TicketCreateDTO(BaseModel):
    subject: Optional[str] = None
    description: str



class TicketDetailsDTO(TicketDTO):

    category: Optional[CategoryDTO] = None

    attachments: List[AttachmentDTO] = Field(default_factory=list)

    messages: List[MessageDTO] = Field(default_factory=list)

    ticket_assignment: List[AssignmentDTO] = Field(default_factory=list)

    ticket_status_history: List[StatusHistoryDTO] = Field(default_factory=list)

    ai_analysis: Optional[AIAnalysisDTO] = None


    class Config:
        from_attributes = True