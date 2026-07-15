import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session
from models.category import Category
import ssl
import httpx

load_dotenv()
print("OPENAI KEY EXISTS:", bool(os.getenv("OPENAI_API_KEY")))

class AIService:

    @staticmethod
    def analyze_ticket(db: Session,subject: str,description: str):
        ctx = ssl.create_default_context()
        ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT

        http_client = httpx.Client(
            verify=ctx
        )

        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            http_client=http_client
        )
        categories = db.query(Category).all()

        category_text = "\n".join(
            [
                f"- Id: {c.id}, שם: {c.category_name}"
                for c in categories
            ]
        )

        prompt = f"""
אתה מערכת AI לניתוח פניות עובדים.

המטרה שלך היא לנתח את הפנייה ולבחור את הקטגוריה המתאימה ביותר.

הקטגוריות האפשריות הן:

{category_text}

פנייה:

נושא:
{subject}

תיאור:
{description}

החזר JSON בלבד.

בפורמט הבא:

{{
    "predictedCategoryId": 0,
    "urgencyScore": 1,
    "riskLevel": "Low",
    "analysisText": "",
    "suggestedResponse": ""
}}

כללים:

predictedCategoryId חייב להיות אחד מה Id שקיבלת.

urgencyScore:
1 = נמוכה
2 = בינונית
3 = גבוהה
4 = קריטית

riskLevel חייב להיות:
Low
Medium
High

analysisText יהיה בעברית.

suggestedResponse תהיה בעברית.

אין להחזיר שום טקסט נוסף.
"""

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            max_completion_tokens=300,
            response_format={"type": "json_object"},
            temperature=0.2,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        result = json.loads(
            response.choices[0].message.content
        )
        print("AI RESULT:")
        print(result)
        return result
