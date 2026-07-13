from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


DATABASE_URL = "postgresql://postgres@localhost:5432/tickets_db"

# יצירת מנוע החיבור (ההקבלה ל-DbContext ב-.NET)
engine = create_engine(DATABASE_URL)

# יצירת מפעל לייצור Sessions (צינורות תקשורת זמניים לכל בקשת API)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# מחלקת הבסיס שממנה יורשים כל המודלים (כבר השתמשנו בה ב-user.py)
Base = declarative_base()

# פונקציית עזר (Dependency) שמנהלת את פתיחת וסגירת החיבור בכל בקשת API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()