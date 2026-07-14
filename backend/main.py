from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, tickets
from dotenv import load_dotenv
from limiter import limiter

load_dotenv()

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