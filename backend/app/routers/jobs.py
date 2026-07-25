from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.models import Job, JobAllowedBranch, Skill, Company, Recruiter, Student, Application, User
from app.schemas.schemas import JobCreate, JobUpdate, JobResponse, EligibilityResponse, ApplicationResponse
from app.dependencies.auth import get_current_user, get_current_recruiter, get_current_student
from app.services.eligibility import EligibilityService
from app.services.audit import log_action

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

def build_job_response(job: Job) -> JobResponse:
    return JobResponse(
        id=job.id,
        company_id=job.company_id,
        company_name=job.company.name if job.company else "",
        recruiter_id=job.recruiter_id,
        recruiter_name=job.recruiter.full_name if job.recruiter else "",
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
    )

@router.get("", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = None,
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    status_filter: Optional[str] = "Active",
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    if status_filter and status_filter != "All":
        query = query.filter(Job.status == status_filter)

    if search:
        search_pattern = f"%{search}%"
        query = query.join(Company).filter(
            (Job.title.ilike(search_pattern)) | (Company.name.ilike(search_pattern))
        )

    if job_type and job_type != "All":
        query = query.filter(Job.job_type == job_type)

    if location and location != "All":
        query = query.filter(Job.location.ilike(f"%{location}%"))

    jobs = query.order_by(Job.created_at.desc()).all()

    if skill:
        skill_clean = skill.strip().lower()
        jobs = [j for j in jobs if any(skill_clean in s.name.lower() for s in j.skills)]

    return [build_job_response(j) for j in jobs]

@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return build_job_response(job)

@router.get("/{job_id}/eligibility", response_model=EligibilityResponse)
def check_job_eligibility(
    job_id: int,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return EligibilityService.evaluate(student, job)

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    payload: JobCreate,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    job = Job(
        company_id=recruiter.company_id,
        recruiter_id=recruiter.id,
        title=payload.title,
        description=payload.description,
        responsibilities=payload.responsibilities,
        location=payload.location,
        job_type=payload.job_type,
        salary=payload.salary,
        minimum_cgpa=payload.minimum_cgpa,
        maximum_backlogs=payload.maximum_backlogs,
        graduation_year=payload.graduation_year,
        deadline=payload.deadline,
        status="Active"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Allowed branches
    for branch_name in payload.allowed_branches:
        branch_entry = JobAllowedBranch(job_id=job.id, branch=branch_name)
        db.add(branch_entry)

    # Required skills
    for skill_name in payload.skills:
        skill = db.query(Skill).filter(Skill.name.ilike(skill_name.strip())).first()
        if not skill:
            skill = Skill(name=skill_name.strip())
            db.add(skill)
            db.commit()
            db.refresh(skill)
        job.skills.append(skill)

    db.commit()
    db.refresh(job)

    log_action(db, recruiter.user_id, f"Created job posting: {job.title}", "job", job.id)
    return build_job_response(job)

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    payload: JobUpdate,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.recruiter_id != recruiter.id and recruiter.user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this job posting")

    if payload.title is not None:
        job.title = payload.title
    if payload.description is not None:
        job.description = payload.description
    if payload.responsibilities is not None:
        job.responsibilities = payload.responsibilities
    if payload.location is not None:
        job.location = payload.location
    if payload.job_type is not None:
        job.job_type = payload.job_type
    if payload.salary is not None:
        job.salary = payload.salary
    if payload.minimum_cgpa is not None:
        job.minimum_cgpa = payload.minimum_cgpa
    if payload.maximum_backlogs is not None:
        job.maximum_backlogs = payload.maximum_backlogs
    if payload.graduation_year is not None:
        job.graduation_year = payload.graduation_year
    if payload.deadline is not None:
        job.deadline = payload.deadline
    if payload.status is not None:
        job.status = payload.status

    if payload.allowed_branches is not None:
        db.query(JobAllowedBranch).filter(JobAllowedBranch.job_id == job.id).delete()
        for branch_name in payload.allowed_branches:
            db.add(JobAllowedBranch(job_id=job.id, branch=branch_name))

    if payload.skills is not None:
        job.skills.clear()
        for skill_name in payload.skills:
            skill = db.query(Skill).filter(Skill.name.ilike(skill_name.strip())).first()
            if not skill:
                skill = Skill(name=skill_name.strip())
                db.add(skill)
                db.commit()
                db.refresh(skill)
            job.skills.append(skill)

    db.commit()
    db.refresh(job)

    log_action(db, recruiter.user_id, f"Updated job posting: {job.title}", "job", job.id)
    return build_job_response(job)

@router.put("/{job_id}/status")
def update_job_status(
    job_id: int,
    status_val: str = Query(..., alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user.role == "recruiter":
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if not recruiter or job.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not authorized to update status of this job")
    elif current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    job.status = status_val
    db.commit()

    log_action(db, current_user.id, f"Changed job status to {status_val}", "job", job.id)
    return {"message": f"Job status updated to {status_val}", "job_id": job.id, "status": job.status}

@router.get("/{job_id}/applicants", response_model=List[ApplicationResponse])
def get_job_applicants(
    job_id: int,
    recruiter: Recruiter = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.recruiter_id != recruiter.id and recruiter.user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view applicants for this job")

    apps = db.query(Application).filter(Application.job_id == job_id).order_by(Application.applied_at.desc()).all()
    res = []
    for app in apps:
        student = app.student
        res.append(ApplicationResponse(
            id=app.id,
            student_id=student.id,
            student_name=student.full_name,
            student_email=student.user.email,
            student_branch=student.branch,
            student_cgpa=student.cgpa,
            student_skills=[s.name for s in student.skills],
            job_id=job.id,
            job_title=job.title,
            company_name=job.company.name,
            job_location=job.location,
            job_type=job.job_type,
            salary=job.salary,
            status=app.status,
            applied_at=app.applied_at,
            updated_at=app.updated_at
        ))
    return res
