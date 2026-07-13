from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, tickets  # ← ייבוא של ראוטרים
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="Smart Ticket System API")

# הגדרת CORS עבור React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# רישום הראוטרים במערכת
app.include_router(auth.router)
app.include_router(tickets.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Ticket System API"}