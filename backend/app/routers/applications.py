from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.models import Application, Job, Student, User, Recruiter
from app.schemas.schemas import ApplicationResponse, ApplicationStatusUpdate
from app.dependencies.auth import get_current_user, get_current_student, get_current_recruiter
from app.services.eligibility import EligibilityService
from app.services.notification import create_notification
from app.services.audit import log_action

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    job_id: int,
    student: Student = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "Active":
        raise HTTPException(status_code=400, detail="This job is closed or inactive for applications.")

    if datetime.utcnow() > job.deadline:
        raise HTTPException(status_code=400, detail="Application deadline for this job has passed.")

    # Check duplicate application
    existing_app = db.query(Application).filter(
        Application.student_id == student.id,
        Application.job_id == job.id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this job.")

    # Evaluate eligibility
    eval_res = EligibilityService.evaluate(student, job)
    if not eval_res["eligible"]:
        reasons_str = " ".join(eval_res["reasons"])
        raise HTTPException(status_code=400, detail=f"You are not eligible for this job. {reasons_str}")

    app = Application(
        student_id=student.id,
        job_id=job.id,
        status="Applied"
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    create_notification(
        db,
        user_id=student.user_id,
        title="Application Submitted",
        message=f"You successfully applied for '{job.title}' at {job.company.name}."
    )

    log_action(db, student.user_id, f"Applied to job: {job.title}", "application", app.id)

    return ApplicationResponse(
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
    )

@router.get("/me", response_model=list[ApplicationResponse])
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

@router.put("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == "recruiter":
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if not recruiter or app.job.recruiter_id != recruiter.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this application")
    elif current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    old_status = app.status
    new_status = payload.status
    app.status = new_status
    app.updated_at = datetime.utcnow()
    db.commit()

    # Automatically notify student upon status change
    notif_messages = {
        "Shortlisted": f"Congratulations! You have been shortlisted for '{app.job.title}' at {app.job.company.name}.",
        "Interview": f"Interview Update: You have been scheduled for an interview for '{app.job.title}' at {app.job.company.name}.",
        "Selected": f"🎉 Offer Received! You have been SELECTED for '{app.job.title}' at {app.job.company.name}!",
        "Rejected": f"Application Update: Your application for '{app.job.title}' at {app.job.company.name} was not selected.",
        "Under Review": f"Your application for '{app.job.title}' at {app.job.company.name} is now under review."
    }

    msg = notif_messages.get(new_status, f"Your application status for '{app.job.title}' at {app.job.company.name} was updated to '{new_status}'.")
    create_notification(
        db,
        user_id=app.student.user_id,
        title=f"Application Update: {new_status}",
        message=msg
    )

    log_action(db, current_user.id, f"Changed application #{app.id} status from '{old_status}' to '{new_status}'", "application", app.id)

    student = app.student
    return ApplicationResponse(
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
    )
