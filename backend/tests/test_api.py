import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test_placeflow.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_placeflow.db"):
        os.remove("./test_placeflow.db")

client = TestClient(app)

# Helper tokens
tokens = {}

def test_1_student_registration():
    response = client.post(
        "/api/auth/register/student",
        json={
            "email": "test_student@placeflow.demo",
            "password": "Password@123",
            "full_name": "Test Student",
            "college_id": "TEST2026001",
            "phone": "+91 99999 88888",
            "branch": "Computer Science Engineering",
            "cgpa": 8.5,
            "graduation_year": 2026,
            "active_backlogs": 0,
            "skills": ["Python", "React"]
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "student"
    tokens["student"] = data["access_token"]

def test_2_recruiter_registration():
    response = client.post(
        "/api/auth/register/recruiter",
        json={
            "email": "test_recruiter@placeflow.demo",
            "password": "Password@123",
            "full_name": "Test Recruiter",
            "company_name": "Test Tech Inc",
            "designation": "Hiring Manager",
            "phone": "+91 88888 77777"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["verification_status"] == "pending"

def test_3_login_success():
    response = client.post(
        "/api/auth/login",
        json={"email": "test_student@placeflow.demo", "password": "Password@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "student"

def test_4_invalid_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "test_student@placeflow.demo", "password": "WrongPassword"}
    )
    assert response.status_code == 401

def test_5_protected_endpoint_without_token():
    response = client.get("/api/students/me")
    assert response.status_code == 401

def test_6_role_authorization():
    # Student trying to call recruiter-only endpoint
    headers = {"Authorization": f"Bearer {tokens['student']}"}
    response = client.post(
        "/api/jobs",
        json={
            "title": "Unauthorized Job",
            "description": "Desc",
            "responsibilities": "Resp",
            "location": "Remote",
            "job_type": "Full Time",
            "salary": "10 LPA",
            "allowed_branches": ["Computer Science Engineering"],
            "graduation_year": 2026
        },
        headers=headers
    )
    assert response.status_code == 403

def test_7_admin_setup_and_recruiter_approval():
    # Create admin user directly or register recruiter setup
    from app.models.models import User
    db = TestingSessionLocal()
    from app.utils.security import get_password_hash
    admin = User(email="admin@test.com", password_hash=get_password_hash("Admin@123"), role="admin", is_active=True)
    db.add(admin)
    db.commit()

    # Login as admin
    res = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "Admin@123"})
    assert res.status_code == 200
    tokens["admin"] = res.json()["access_token"]

    # Approve recruiter via admin endpoint
    admin_headers = {"Authorization": f"Bearer {tokens['admin']}"}
    rec_res = client.get("/api/admin/recruiters", headers=admin_headers)
    assert rec_res.status_code == 200
    rec_id = rec_res.json()[0]["id"]

    approve_res = client.put(f"/api/admin/recruiters/{rec_id}/status?verification_status=approved", headers=admin_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # Now login as recruiter
    rec_login = client.post("/api/auth/login", json={"email": "test_recruiter@placeflow.demo", "password": "Password@123"})
    assert rec_login.status_code == 200
    tokens["recruiter"] = rec_login.json()["access_token"]

def test_8_create_job_as_approved_recruiter():
    headers = {"Authorization": f"Bearer {tokens['recruiter']}"}
    response = client.post(
        "/api/jobs",
        json={
            "title": "Software Engineer",
            "description": "Develop full stack cloud apps.",
            "responsibilities": "Code REST APIs",
            "location": "Bangalore",
            "job_type": "Full Time",
            "salary": "12 LPA",
            "minimum_cgpa": 7.0,
            "maximum_backlogs": 0,
            "graduation_year": 2026,
            "allowed_branches": ["Computer Science Engineering", "Information Technology"],
            "deadline": "2028-12-31T23:59:59",
            "skills": ["Python", "React"]
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Software Engineer"
    tokens["job_id"] = data["id"]

def test_9_student_eligibility():
    headers = {"Authorization": f"Bearer {tokens['student']}"}
    response = client.get(f"/api/jobs/{tokens['job_id']}/eligibility", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] is True

def test_10_ineligible_student():
    # Register student with low CGPA
    res = client.post(
        "/api/auth/register/student",
        json={
            "email": "low_cgpa@placeflow.demo",
            "password": "Password@123",
            "full_name": "Low CGPA Student",
            "college_id": "TEST2026002",
            "phone": "+91 99999 77777",
            "branch": "Civil Engineering",
            "cgpa": 5.5,
            "graduation_year": 2026,
            "active_backlogs": 2
        }
    )
    assert res.status_code == 201
    ineligible_token = res.json()["access_token"]

    headers = {"Authorization": f"Bearer {ineligible_token}"}
    response = client.get(f"/api/jobs/{tokens['job_id']}/eligibility", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] is False
    assert len(data["reasons"]) > 0

def test_11_successful_application():
    headers = {"Authorization": f"Bearer {tokens['student']}"}
    response = client.post(f"/api/applications/jobs/{tokens['job_id']}/apply", headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Applied"
    tokens["app_id"] = data["id"]

def test_12_duplicate_application_rejection():
    headers = {"Authorization": f"Bearer {tokens['student']}"}
    response = client.post(f"/api/applications/jobs/{tokens['job_id']}/apply", headers=headers)
    assert response.status_code == 400
    assert "already applied" in response.json()["detail"].lower()

def test_13_recruiter_application_status_update():
    headers = {"Authorization": f"Bearer {tokens['recruiter']}"}
    response = client.put(
        f"/api/applications/{tokens['app_id']}/status",
        json={"status": "Shortlisted"},
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Shortlisted"

def test_14_student_notification_created():
    headers = {"Authorization": f"Bearer {tokens['student']}"}
    response = client.get("/api/notifications", headers=headers)
    assert response.status_code == 200
    notifs = response.json()
    assert len(notifs) >= 2  # Submission notif + Shortlisted notif
    assert "Shortlisted" in notifs[0]["title"]

def test_15_admin_access():
    headers = {"Authorization": f"Bearer {tokens['admin']}"}
    response = client.get("/api/admin/students", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 2
