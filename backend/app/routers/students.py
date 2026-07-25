from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import os
import shutil
from typing import List, Optional

from app.database import get_db
from app.models.models import Student, Skill, Job, Application, Notification
from app.schemas.schemas import StudentResponse, StudentProfileUpdate, JobResponse, ApplicationResponse
from app.dependencies.auth import get_current_student
from app.services.eligibility import EligibilityService
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/api/students", tags=["Students"])

def calculate_completion(student: Student) -> int:
    fields = [
        student.full_name,
        student.college_id,
        student.phone,
        student.branch,
        student.cgpa is not None,
        student.graduation_year is not None,
        student.preferred_role,
        student.preferred_location,
        student.preferred_job_type,
        student.resume_path,
        len(student.skills) > 0
    ]
    completed = sum(1 for f in fields if f)
    return int((completed / len(fields)) * 100)

@router.get("/me", response_model=StudentResponse)
def get_my_profile(student: Student = Depends(get_current_student)):
    completion = calculate_completion(student)
    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        email=student.user.email,
        full_name=student.full_name,
        college_id=student.college_id,
        phone=student.phone,
        branch=student.branch,
        cgpa=student.cgpa,
        graduation_year=student.graduation_year,
        active_backlogs=student.active_backlogs,
        preferred_role=student.preferred_role,
        preferred_location=student.preferred_location,
        preferred_job_type=student.preferred_job_type,
        resume_path=student.resume_path,
        skills=[s.name for s in student.skills],
        profile_completion=completion
    )

@router.put("/me", response_model=StudentResponse)
def update_my_profile(
    payload: StudentProfileUpdate,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    if payload.full_name is not None:
        student.full_name = payload.full_name
    if payload.phone is not None:
        student.phone = payload.phone
    if payload.branch is not None:
        student.branch = payload.branch
    if payload.cgpa is not None:
        student.cgpa = payload.cgpa
    if payload.graduation_year is not None:
        student.graduation_year = payload.graduation_year
    if payload.active_backlogs is not None:
        student.active_backlogs = payload.active_backlogs
    if payload.preferred_role is not None:
        student.preferred_role = payload.preferred_role
    if payload.preferred_location is not None:
        student.preferred_location = payload.preferred_location
    if payload.preferred_job_type is not None:
        student.preferred_job_type = payload.preferred_job_type

    if payload.skills is not None:
        student.skills.clear()
        for skill_name in payload.skills:
            if not skill_name.strip():
                continue
            skill = db.query(Skill).filter(Skill.name.ilike(skill_name.strip())).first()
            if not skill:
                skill = Skill(name=skill_name.strip())
                db.add(skill)
                db.commit()
                db.refresh(skill)
            student.skills.append(skill)

    db.commit()
    db.refresh(student)

    completion = calculate_completion(student)
    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        email=student.user.email,
        full_name=student.full_name,
        college_id=student.college_id,
        phone=student.phone,
        branch=student.branch,
        cgpa=student.cgpa,
        graduation_year=student.graduation_year,
        active_backlogs=student.active_backlogs,
        preferred_role=student.preferred_role,
        preferred_location=student.preferred_location,
        preferred_job_type=student.preferred_job_type,
        resume_path=student.resume_path,
        skills=[s.name for s in student.skills],
        profile_completion=completion
    )

@router.post("/me/resume")
def upload_resume(
    file: UploadFile = File(...),
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF, DOC, or DOCX files are allowed.")
    
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"resume_student_{student.id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    student.resume_path = filename
    db.commit()
    return {"message": "Resume uploaded successfully", "resume_path": filename}

@router.get("/me/applications", response_model=List[ApplicationResponse])
def get_my_applications(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.student_id == student.id).order_by(Application.applied_at.desc()).all()
    res = []
    for app in apps:
        res.append(ApplicationResponse(
            id=app.id,
            student_id=student.id,
            student_name=student.full_name,
            student_email=student.user.email,
            student_branch=student.branch,
            student_cgpa=student.cgpa,
            student_skills=[s.name for s in student.skills],
            job_id=app.job.id,
            job_title=app.job.title,
            company_name=app.job.company.name,
            job_location=app.job.location,
            job_type=app.job.job_type,
            salary=app.job.salary,
            status=app.status,
            applied_at=app.applied_at,
            updated_at=app.updated_at
        ))
    return res

@router.get("/me/eligible-jobs", response_model=List[JobResponse])
def get_eligible_jobs(
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    active_jobs = db.query(Job).filter(Job.status == "Active").all()
    eligible_jobs = []
    for job in active_jobs:
        eval_res = EligibilityService.evaluate(student, job)
        if eval_res["eligible"]:
            eligible_jobs.append(JobResponse(
                id=job.id,
                company_id=job.company_id,
                company_name=job.company.name,
                recruiter_id=job.recruiter_id,
                recruiter_name=job.recruiter.full_name,
                title=job.title,
                description=job.description,
                responsibilities=job.responsibilities,
                location=job.location,
                job_type=job.job_type,
                salary=job.salary,
                minimum_cgpa=job.minimum_cgpa,
                maximum_backlogs=job.maximum_backlogs,
                graduation_year=job.graduation_year,
                deadline=job.deadline,
                status=job.status,
                created_at=job.created_at,
                allowed_branches=[b.branch for b in job.allowed_branches],
                skills=[s.name for s in job.skills]
            ))
    return eligible_jobs
