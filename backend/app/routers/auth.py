from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Student, Recruiter, Company, Skill
from app.schemas.schemas import StudentRegister, RecruiterRegister, UserLogin, Token, UserResponse
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.dependencies.auth import get_current_user
from app.services.audit import log_action

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register/student", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_student(payload: StudentRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    existing_college_id = db.query(Student).filter(Student.college_id == payload.college_id).first()
    if existing_college_id:
        raise HTTPException(status_code=400, detail="College ID is already registered")

    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role="student",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    student = Student(
        user_id=user.id,
        full_name=payload.full_name,
        college_id=payload.college_id,
        phone=payload.phone,
        branch=payload.branch,
        cgpa=payload.cgpa,
        graduation_year=payload.graduation_year,
        active_backlogs=payload.active_backlogs,
        preferred_role=payload.preferred_role,
        preferred_location=payload.preferred_location,
        preferred_job_type=payload.preferred_job_type
    )

    # Process skills
    if payload.skills:
        for skill_name in payload.skills:
            skill = db.query(Skill).filter(Skill.name.ilike(skill_name.strip())).first()
            if not skill:
                skill = Skill(name=skill_name.strip())
                db.add(skill)
                db.commit()
                db.refresh(skill)
            student.skills.append(skill)

    db.add(student)
    db.commit()
    db.refresh(student)

    log_action(db, user.id, "Registered student account", "student", student.id)

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": student.full_name
    }

@router.post("/register/recruiter", status_code=status.HTTP_201_CREATED)
def register_recruiter(payload: RecruiterRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Find or create company
    company = db.query(Company).filter(Company.name.ilike(payload.company_name.strip())).first()
    if not company:
        company = Company(
            name=payload.company_name.strip(),
            description=payload.company_description,
            location=payload.company_location,
            website=payload.company_website
        )
        db.add(company)
        db.commit()
        db.refresh(company)

    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role="recruiter",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    recruiter = Recruiter(
        user_id=user.id,
        company_id=company.id,
        full_name=payload.full_name,
        designation=payload.designation,
        phone=payload.phone,
        verification_status="pending"  # Admin approval required
    )
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

    log_action(db, user.id, "Registered recruiter account", "recruiter", recruiter.id)

    return {
        "message": "Your recruiter account has been submitted for Placement Admin approval.",
        "verification_status": "pending",
        "user_id": user.id
    }

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact placement admin.")

    if payload.role and payload.role != user.role:
        raise HTTPException(
            status_code=403,
            detail=f"Role mismatch: This account is registered as '{user.role}', not '{payload.role}'."
        )

    # Check recruiter verification status
    full_name = "User"
    if user.role == "student" and user.student_profile:
        full_name = user.student_profile.full_name
    elif user.role == "recruiter" and user.recruiter_profile:
        full_name = user.recruiter_profile.full_name
        if user.recruiter_profile.verification_status != "approved":
            raise HTTPException(
                status_code=403,
                detail="Your recruiter account is pending approval by the Placement Administrator."
            )
    elif user.role == "admin":
        full_name = "Placement Administrator"

    token = create_access_token({"user_id": user.id, "email": user.email, "role": user.role})
    log_action(db, user.id, "Logged in", "user", user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": full_name
    }

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }
    if current_user.role == "student" and current_user.student_profile:
        s = current_user.student_profile
        res["student_profile"] = {
            "id": s.id,
            "full_name": s.full_name,
            "college_id": s.college_id,
            "phone": s.phone,
            "branch": s.branch,
            "cgpa": s.cgpa,
            "graduation_year": s.graduation_year,
            "active_backlogs": s.active_backlogs,
            "preferred_role": s.preferred_role,
            "preferred_location": s.preferred_location,
            "preferred_job_type": s.preferred_job_type,
            "resume_path": s.resume_path,
            "skills": [sk.name for sk in s.skills]
        }
    elif current_user.role == "recruiter" and current_user.recruiter_profile:
        r = current_user.recruiter_profile
        res["recruiter_profile"] = {
            "id": r.id,
            "full_name": r.full_name,
            "designation": r.designation,
            "phone": r.phone,
            "company_id": r.company_id,
            "company_name": r.company.name if r.company else "",
            "verification_status": r.verification_status
        }
    return res
