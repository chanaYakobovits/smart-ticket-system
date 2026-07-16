from pydantic import BaseModel
from datetime import datetime

class AttachmentDTO(BaseModel):
    id: int
    ticket_id: int
    uploaded_by_user_id: int
    file_name: str
    file_type: str
    file_url: str
    uploaded_at: datetime

    class Config:
        from_attributes = True