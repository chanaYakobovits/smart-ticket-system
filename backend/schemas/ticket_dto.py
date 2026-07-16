from pydantic import BaseModel, Field,field_validator
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
    file_size: Optional[int] = None
    message_id: Optional[int] = None

    class Config:
        from_attributes = True

class RejectedFileDTO(BaseModel):
    file_name: str
    reason: str

class MessageUserDTO(BaseModel):
    first_name: str
    last_name: str
    job_title: Optional[str] = None

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

    current_status: str = "חדשה"

    opened_by_user_id: int

    opened_date: Optional[date] = None
    opened_time: Optional[time] = None

    ticket_assignment: List[AssignmentDTO] = Field(default_factory=list)

    class Config:
        from_attributes = True


class TicketCreateDTO(BaseModel):
    subject: Optional[str] = None
    description: str = Field(..., min_length=10)

    @field_validator("description")
    @classmethod
    def description_must_have_real_content(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("תיאור הפנייה חייב להכיל לפחות 10 תווים")
        return v



class TicketDetailsDTO(TicketDTO):

    category: Optional[CategoryDTO] = None

    attachments: List[AttachmentDTO] = Field(default_factory=list)

    messages: List[MessageDTO] = Field(default_factory=list)

    ticket_assignment: List[AssignmentDTO] = Field(default_factory=list)

    ticket_status_history: List[StatusHistoryDTO] = Field(default_factory=list)

    ai_analysis: Optional[AIAnalysisDTO] = None


    class Config:
        from_attributes = True

class AddMessageResponseDTO(BaseModel):
    ticket: TicketDetailsDTO
    rejected_files: List[RejectedFileDTO] = Field(default_factory=list)

    class Config:
        from_attributes = True