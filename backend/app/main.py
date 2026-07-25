from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.config import UPLOAD_DIR
from app.routers import (
    auth_router,
    students_router,
    jobs_router,
    applications_router,
    admin_router,
    notifications_router,
    analytics_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PlaceFlow API",
    description="College Placement & Recruitment Management System REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(admin_router)
app.include_router(notifications_router)
app.include_router(analytics_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to PlaceFlow API - College Placement & Recruitment Management System",
        "docs": "/docs",
        "status": "healthy"
    }
