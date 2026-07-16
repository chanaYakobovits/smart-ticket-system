import os
import uuid
from typing import List
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models.attachment import Attachment

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB, תואם למה שכתוב ב-UI
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".xlsx", ".xls"}


class AttachmentService:

    @staticmethod
    async def save_files(
        db: Session, ticket_id: int, user_id: int, files: List[UploadFile]
    ) -> List[Attachment]:
        saved: List[Attachment] = []
        ticket_dir = os.path.join(UPLOAD_DIR, "tickets", str(ticket_id))
        os.makedirs(ticket_dir, exist_ok=True)

        for file in files:
            if not file.filename:
                continue

            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue  # אפשר גם להעלות HTTPException(400) אם רוצים לדחות את כל הבקשה

            contents = await file.read()
            if len(contents) > MAX_FILE_SIZE:
                continue

            safe_name = f"{uuid.uuid4().hex}{ext}"
            file_path = os.path.join(ticket_dir, safe_name)
            with open(file_path, "wb") as f:
                f.write(contents)

            attachment = Attachment(
                ticket_id=ticket_id,
                uploaded_by_user_id=user_id,
                file_name=file.filename,
                file_type=file.content_type or ext,
                file_url=f"/uploads/tickets/{ticket_id}/{safe_name}",
                file_size=len(contents)
            )
            db.add(attachment)
            saved.append(attachment)

        if saved:
            db.commit()
            for a in saved:
                db.refresh(a)

        return saved