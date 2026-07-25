from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

student_skills = Table(
    "student_skills",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True)
)

job_skills = Table(
    "job_skills",
    Base.metadata,
    Column("job_id", Integer, ForeignKey("jobs.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'student', 'recruiter', 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("Recruiter", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    college_id = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    branch = Column(String, nullable=False)
    cgpa = Column(Float, nullable=False)
    graduation_year = Column(Integer, nullable=False)
    active_backlogs = Column(Integer, default=0)
    preferred_role = Column(String, nullable=True)
    preferred_location = Column(String, nullable=True)
    preferred_job_type = Column(String, nullable=True)
    resume_path = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")
    skills = relationship("Skill", secondary=student_skills, back_populates="students")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)

    recruiters = relationship("Recruiter", back_populates="company")
    jobs = relationship("Job", back_populates="company")


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    full_name = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    verification_status = Column(String, default="pending")  # 'pending', 'approved', 'rejected'

    user = relationship("User", back_populates="recruiter_profile")
    company = relationship("Company", back_populates="recruiters")
    jobs = relationship("Job", back_populates="recruiter")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    students = relationship("Student", secondary=student_skills, back_populates="skills")
    jobs = relationship("Job", secondary=job_skills, back_populates="skills")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    job_type = Column(String, nullable=False)  # 'Full Time', 'Internship'
    salary = Column(String, nullable=False)
    minimum_cgpa = Column(Float, nullable=False, default=0.0)
    maximum_backlogs = Column(Integer, nullable=False, default=0)
    graduation_year = Column(Integer, nullable=False)
    deadline = Column(DateTime, nullable=False)
    status = Column(String, default="Active")  # 'Active', 'Closed', 'Draft'
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="jobs")
    recruiter = relationship("Recruiter", back_populates="jobs")
    allowed_branches = relationship("JobAllowedBranch", back_populates="job", cascade="all, delete-orphan")
    skills = relationship("Skill", secondary=job_skills, back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class JobAllowedBranch(Base):
    __tablename__ = "job_allowed_branches"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    branch = Column(String, nullable=False)

    job = relationship("Job", back_populates="allowed_branches")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(String, default="Applied")  # 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="applications")
    job = relationship("Job", back_populates="applications")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
