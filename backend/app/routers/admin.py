from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import User, Student, Recruiter, Company, Job, Application, AuditLog
from app.schemas.schemas import StudentResponse, RecruiterResponse, CompanyResponse, JobResponse, ApplicationResponse, AuditLogResponse
from app.dependencies.auth import get_current_admin
from app.services.notification import create_notification
from app.services.audit import log_action

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

@router.get("/students")
def get_all_students(
    branch: Optional[str] = None,
    search: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if branch and branch != "All":
        query = query.filter(Student.branch == branch)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter((Student.full_name.ilike(search_pattern)) | (Student.college_id.ilike(search_pattern)))

    students = query.all()
    res = []
    for s in students:
        res.append({
            "id": s.id,
            "user_id": s.user_id,
            "email": s.user.email,
            "full_name": s.full_name,
            "college_id": s.college_id,
            "phone": s.phone,
            "branch": s.branch,
            "cgpa": s.cgpa,
            "graduation_year": s.graduation_year,
            "active_backlogs": s.active_backlogs,
            "is_active": s.user.is_active,
            "skills": [sk.name for sk in s.skills],
            "resume_path": s.resume_path
        })
    return res

@router.put("/students/{student_id}/status")
def toggle_student_status(
    student_id: int,
    is_active: bool = Query(...),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.user.is_active = is_active
    db.commit()

    action_name = "Activated" if is_active else "Deactivated"
    log_action(db, admin.id, f"{action_name} student account #{student.id}", "student", student.id)

    return {"message": f"Student account {action_name.lower()} successfully", "student_id": student.id, "is_active": is_active}

@router.get("/recruiters")
def get_all_recruiters(
    status_filter: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Recruiter)
    if status_filter and status_filter != "All":
        query = query.filter(Recruiter.verification_status == status_filter)

    recruiters = query.all()
    res = []
    for r in recruiters:
        res.append({
            "id": r.id,
            "user_id": r.user_id,
            "email": r.user.email,
            "full_name": r.full_name,
            "company_id": r.company_id,
            "company_name": r.company.name if r.company else "",
            "designation": r.designation,
            "phone": r.phone,
            "verification_status": r.verification_status,
            "created_at": r.user.created_at
        })
    return res

@router.put("/recruiters/{recruiter_id}/status")
def update_recruiter_verification_status(
    recruiter_id: int,
    verification_status: str = Query(..., regex="^(approved|rejected|pending)$"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    recruiter = db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    recruiter.verification_status = verification_status
    db.commit()

    notif_msg = f"Your recruiter account has been APPROVED by the Placement Administrator. You can now log in and post job opportunities!" if verification_status == "approved" else f"Your recruiter account application status is: {verification_status}."
    create_notification(db, user_id=recruiter.user_id, title=f"Recruiter Account Status: {verification_status.upper()}", message=notif_msg)

    log_action(db, admin.id, f"Set recruiter #{recruiter.id} status to '{verification_status}'", "recruiter", recruiter.id)

    return {"message": f"Recruiter status updated to {verification_status}", "recruiter_id": recruiter.id, "status": recruiter.verification_status}

@router.get("/companies")
def get_all_companies(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    companies = db.query(Company).all()
    res = []
    for c in companies:
        recruiters_count = len(c.recruiters)
        active_jobs_count = sum(1 for j in c.jobs if j.status == "Active")
        total_apps = sum(len(j.applications) for j in c.jobs)
        selections_count = sum(sum(1 for a in j.applications if a.status == "Selected") for j in c.jobs)

        res.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "location": c.location,
            "website": c.website,
            "recruiters_count": recruiters_count,
            "active_jobs_count": active_jobs_count,
            "total_applications": total_apps,
            "selected_candidates": selections_count
        })
    return res

@router.get("/jobs", response_model=List[JobResponse])
def get_admin_jobs(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    res = []
    for job in jobs:
        res.append(JobResponse(
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
        ))
    return res

@router.get("/applications", response_model=List[ApplicationResponse])
def get_admin_applications(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).order_by(Application.applied_at.desc()).all()
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

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return logs
