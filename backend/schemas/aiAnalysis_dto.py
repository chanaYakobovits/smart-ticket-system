from pydantic import BaseModel

class AIAnalysisDto(BaseModel):
    predicted_category_id: int
    urgency_score: int
    risk_level: str
    analysis_text: str
    suggested_response: str