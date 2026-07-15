from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from routers import auth, tickets

from limiter import limiter



app = FastAPI(title="Smart Ticket System API")
app.state.limiter = limiter

# הגדרת CORS עבור React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(tickets.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Ticket System API"}