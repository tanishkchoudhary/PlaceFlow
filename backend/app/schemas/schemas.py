from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Student Schemas ---
class StudentRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    college_id: str
    phone: str
    branch: str
    cgpa: float
    graduation_year: int
    active_backlogs: int = 0
    skills: List[str] = []
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    preferred_job_type: Optional[str] = None

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    active_backlogs: Optional[int] = None
    skills: Optional[List[str]] = None
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    preferred_job_type: Optional[str] = None

class StudentResponse(BaseModel):
    id: int
    user_id: int
    email: str
    full_name: str
    college_id: str
    phone: str
    branch: str
    cgpa: float
    graduation_year: int
    active_backlogs: int
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    preferred_job_type: Optional[str] = None
    resume_path: Optional[str] = None
    skills: List[str] = []
    profile_completion: int = 0

    class Config:
        from_attributes = True

# --- Recruiter & Company Schemas ---
class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int

    class Config:
        from_attributes = True

class RecruiterRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str
    company_description: Optional[str] = None
    company_location: Optional[str] = None
    company_website: Optional[str] = None
    designation: str
    phone: str

class RecruiterResponse(BaseModel):
    id: int
    user_id: int
    email: str
    full_name: str
    company_id: int
    company_name: str
    designation: str
    phone: str
    verification_status: str

    class Config:
        from_attributes = True

# --- Job Schemas ---
class JobCreate(BaseModel):
    title: str
    description: str
    responsibilities: str
    location: str
    job_type: str  # 'Full Time', 'Internship'
    salary: str
    minimum_cgpa: float = 0.0
    allowed_branches: List[str]
    maximum_backlogs: int = 0
    graduation_year: int
    deadline: datetime
    skills: List[str] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[str] = None
    minimum_cgpa: Optional[float] = None
    allowed_branches: Optional[List[str]] = None
    maximum_backlogs: Optional[int] = None
    graduation_year: Optional[int] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None
    skills: Optional[List[str]] = None

class JobResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    recruiter_id: int
    recruiter_name: str
    title: str
    description: str
    responsibilities: str
    location: str
    job_type: str
    salary: str
    minimum_cgpa: float
    maximum_backlogs: int
    graduation_year: int
    deadline: datetime
    status: str
    created_at: datetime
    allowed_branches: List[str] = []
    skills: List[str] = []

    class Config:
        from_attributes = True

# --- Eligibility Engine Schemas ---
class EligibilityCriteria(BaseModel):
    cgpa: bool
    branch: bool
    backlogs: bool
    graduation_year: bool

class EligibilityResponse(BaseModel):
    eligible: bool
    criteria: EligibilityCriteria
    reasons: List[str]

# --- Application Schemas ---
class ApplicationStatusUpdate(BaseModel):
    status: str  # 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'

class ApplicationResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_email: str
    student_branch: str
    student_cgpa: float
    student_skills: List[str] = []
    job_id: int
    job_title: str
    company_name: str
    job_location: str
    job_type: str
    salary: str
    status: str
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit Log Schema ---
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
