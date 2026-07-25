import os
import sys
import csv
from datetime import datetime, timedelta
import random

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.models import User, Student, Company, Recruiter, Skill, Job, JobAllowedBranch, Application, Notification, AuditLog
from app.utils.security import get_password_hash

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset")
os.makedirs(DATASET_DIR, exist_ok=True)

INDIAN_FIRST_NAMES = [
    "Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Neha", "Aditya", "Sneha",
    "Kunal", "Pooja", "Rahul", "Shreya", "Siddharth", "Kavya", "Varun", "Riya",
    "Ishaan", "Tanvi", "Arjun", "Meera", "Dev", "Divya", "Karan", "Nisha",
    "Akash", "Simran", "Aman", "Swati", "Nikhil", "Deepika", "Manish", "Bhavna",
    "Gaurav", "Anita", "Rishabh", "Preeti", "Yash", "Ritu", "Harsh", "Sakshi",
    "Abhishek", "Kirti", "Mayank", "Sonam", "Tarun", "Payal", "Vikas", "Archana"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Joshi", "Mehta",
    "Rao", "Nair", "Iyer", "Chowdhury", "Das", "Reddy", "Deshmukh", "Kulkarni",
    "Agarwal", "Bhat", "Shah", "Malhotra", "Kapoor", "Banerjee", "Sengupta", "Pillai"
]

BRANCHES = [
    "Computer Science Engineering",
    "Data Science",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
]

SKILLS_POOL = [
    "Python", "Java", "JavaScript", "React", "Node.js", "C++", "SQL",
    "Data Structures", "Machine Learning", "Git", "Docker", "AWS",
    "PostgreSQL", "HTML/CSS", "TensorFlow", "Pandas", "System Design"
]

COMPANIES_DATA = [
    {"name": "TechCorp Solutions", "description": "Leading Cloud & Enterprise Software Services provider.", "location": "Bangalore", "website": "https://techcorp.example.com"},
    {"name": "Nexus Systems", "description": "High-frequency trading and fintech software architecture.", "location": "Hyderabad", "website": "https://nexussystems.example.com"},
    {"name": "DataDynamics Labs", "description": "AI & Big Data analytics platform development.", "location": "Pune", "website": "https://datadynamics.example.com"},
    {"name": "CyberPulse Security", "description": "Cybersecurity, threat detection & network safety.", "location": "Gurgaon", "website": "https://cyberpulse.example.com"},
    {"name": "InnoSoft Digital", "description": "Product engineering, UI/UX and mobile application studio.", "location": "Mumbai", "website": "https://innosoft.example.com"},
    {"name": "CloudMatrix Systems", "description": "DevOps, infrastructure and cloud native engineering.", "location": "Noida", "website": "https://cloudmatrix.example.com"},
    {"name": "FinEdge Analytics", "description": "Quantitative finance & banking automation algorithms.", "location": "Bangalore", "website": "https://finedge.example.com"},
    {"name": "Vortex Technologies", "description": "Embedded systems, IoT & hardware interface software.", "location": "Chennai", "website": "https://vortextech.example.com"},
    {"name": "Zenith AI Labs", "description": "Generative AI, NLP & computer vision research & products.", "location": "Bangalore", "website": "https://zenithai.example.com"},
    {"name": "GlobalLogic Services", "description": "Global IT consulting and digital transformation.", "location": "Hyderabad", "website": "https://globallogic.example.com"}
]

JOBS_DATA = [
    {
        "company_idx": 0,
        "title": "Software Development Engineer (SDE-1)",
        "description": "We are seeking talented SDE-1 engineers to join our core backend cloud services team. You will build scalable microservices and database pipelines.",
        "responsibilities": "Design REST APIs, write clean unit-tested code, collaborate with frontend team, optimize DB queries.",
        "location": "Bangalore",
        "job_type": "Full Time",
        "salary": "₹ 14.5 LPA",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Data Science", "Information Technology"],
        "skills": ["Python", "Java", "Data Structures", "SQL", "Git"]
    },
    {
        "company_idx": 0,
        "title": "Frontend Engineer Intern",
        "description": "6-month internship with high PPO potential. Work on modern web user interfaces using React, JavaScript & CSS.",
        "responsibilities": "Build accessible UI components, integrate backend APIs, optimize Web Vitals.",
        "location": "Bangalore",
        "job_type": "Internship",
        "salary": "₹ 45,000 / month",
        "min_cgpa": 6.5,
        "max_backlogs": 1,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Information Technology", "Data Science", "Electronics & Communication"],
        "skills": ["React", "JavaScript", "HTML/CSS", "Git"]
    },
    {
        "company_idx": 1,
        "title": "Quantitative Developer",
        "description": "Join our algorithmic trading infrastructure team developing low-latency execution engines.",
        "responsibilities": "Optimize C++ and Python algorithms, analyze order book feeds, implement risk checks.",
        "location": "Hyderabad",
        "job_type": "Full Time",
        "salary": "₹ 22.0 LPA",
        "min_cgpa": 8.5,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Data Science", "Electrical Engineering"],
        "skills": ["C++", "Python", "Data Structures", "System Design"]
    },
    {
        "company_idx": 2,
        "title": "Associate Data Scientist",
        "description": "Work on predictive modeling, NLP, and machine learning pipelines for Fortune 500 analytics.",
        "responsibilities": "Preprocess data, train ML models using Scikit-Learn/TensorFlow, build analytics dashboards.",
        "location": "Pune",
        "job_type": "Full Time",
        "salary": "₹ 12.0 LPA",
        "min_cgpa": 7.0,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Data Science", "Computer Science Engineering", "Information Technology"],
        "skills": ["Python", "Machine Learning", "Pandas", "SQL", "TensorFlow"]
    },
    {
        "company_idx": 3,
        "title": "Cyber Security Analyst",
        "description": "Monitor security operations, perform vulnerability assessments, and secure cloud endpoints.",
        "responsibilities": "Conduct threat analysis, inspect network logs, implement IAM access controls.",
        "location": "Gurgaon",
        "job_type": "Full Time",
        "salary": "₹ 10.0 LPA",
        "min_cgpa": 6.5,
        "max_backlogs": 1,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Information Technology", "Electronics & Communication"],
        "skills": ["Python", "Git", "System Design", "AWS"]
    },
    {
        "company_idx": 4,
        "title": "Full Stack Developer",
        "description": "Build end-to-end web applications using Node.js, React, and PostgreSQL.",
        "responsibilities": "Implement full stack features, write REST endpoints, design database schemas.",
        "location": "Mumbai",
        "job_type": "Full Time",
        "salary": "₹ 11.5 LPA",
        "min_cgpa": 7.0,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Information Technology", "Data Science"],
        "skills": ["JavaScript", "React", "Node.js", "PostgreSQL", "HTML/CSS"]
    },
    {
        "company_idx": 5,
        "title": "DevOps Engineer",
        "description": "Manage Kubernetes clusters, CI/CD pipelines, and cloud automation scripts.",
        "responsibilities": "Automate deployment manifests, manage AWS resources, set up monitoring alerts.",
        "location": "Noida",
        "job_type": "Full Time",
        "salary": "₹ 13.0 LPA",
        "min_cgpa": 7.2,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Information Technology", "Electrical Engineering"],
        "skills": ["Docker", "AWS", "Git", "Python"]
    },
    {
        "company_idx": 6,
        "title": "Fintech Software Analyst",
        "description": "Develop payment gateway integrations, banking transaction software, and reconciliation engines.",
        "responsibilities": "Maintain Java backend services, ensure ACID transactional compliance, optimize SQL queries.",
        "location": "Bangalore",
        "job_type": "Full Time",
        "salary": "₹ 15.0 LPA",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Information Technology", "Data Science"],
        "skills": ["Java", "SQL", "System Design", "PostgreSQL"]
    },
    {
        "company_idx": 7,
        "title": "Embedded Software Engineer",
        "description": "Write micro-controller firmware and real-time operating system (RTOS) code for smart IoT devices.",
        "responsibilities": "Write C/C++ hardware drivers, debug sensor interface protocols (SPI, I2C), verify timing limits.",
        "location": "Chennai",
        "job_type": "Full Time",
        "salary": "₹ 9.5 LPA",
        "min_cgpa": 6.8,
        "max_backlogs": 1,
        "grad_year": 2026,
        "allowed_branches": ["Electronics & Communication", "Electrical Engineering", "Mechanical Engineering"],
        "skills": ["C++", "Data Structures"]
    },
    {
        "company_idx": 8,
        "title": "AI & Computer Vision Researcher",
        "description": "Work on state-of-the-art vision models for autonomous systems and video analysis.",
        "responsibilities": "Train PyTorch models, fine-tune neural architectures, evaluate benchmark datasets.",
        "location": "Bangalore",
        "job_type": "Full Time",
        "salary": "₹ 20.0 LPA",
        "min_cgpa": 8.0,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Data Science"],
        "skills": ["Python", "Machine Learning", "TensorFlow", "Pandas"]
    },
    {
        "company_idx": 9,
        "title": "Graduate Engineer Trainee (GET)",
        "description": "Open entry-level role across all engineering disciplines with comprehensive 3-month onboarding.",
        "responsibilities": "Participate in rotation modules across software, quality testing, and technical documentation.",
        "location": "Hyderabad",
        "job_type": "Full Time",
        "salary": "₹ 7.5 LPA",
        "min_cgpa": 6.0,
        "max_backlogs": 2,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Data Science", "Information Technology", "Electronics & Communication", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
        "skills": ["Python", "Java", "SQL", "Git"]
    },
    {
        "company_idx": 0,
        "title": "Backend Engineering Intern",
        "description": "3-month summer internship for pre-final and final year students with hands-on Python/FastAPI experience.",
        "responsibilities": "Build modular API endpoints, document OpenAPI schemas, perform unit testing.",
        "location": "Bangalore",
        "job_type": "Internship",
        "salary": "₹ 40,000 / month",
        "min_cgpa": 7.0,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Information Technology", "Data Science"],
        "skills": ["Python", "SQL", "Git"]
    },
    {
        "company_idx": 1,
        "title": "Systems Infrastructure Engineer",
        "description": "Maintain high-performance distributed servers, Linux kernel tunings, and network routing rules.",
        "responsibilities": "Configure high-speed network sockets, troubleshoot latency bottlenecks, automate Linux scripts.",
        "location": "Hyderabad",
        "job_type": "Full Time",
        "salary": "₹ 16.0 LPA",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Electrical Engineering", "Electronics & Communication"],
        "skills": ["C++", "Docker", "Git", "System Design"]
    },
    {
        "company_idx": 2,
        "title": "Data Engineering Analyst",
        "description": "Construct ETL pipelines, data warehouses in Snowflake/BigQuery, and Spark streaming jobs.",
        "responsibilities": "Write complex SQL transformations, maintain Airflow DAGs, optimize table partitioning.",
        "location": "Pune",
        "job_type": "Full Time",
        "salary": "₹ 11.0 LPA",
        "min_cgpa": 6.8,
        "max_backlogs": 1,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Data Science", "Information Technology"],
        "skills": ["Python", "SQL", "Pandas"]
    },
    {
        "company_idx": 4,
        "title": "UI/UX Front-End Developer",
        "description": "Design interactive web dashboards, design systems, and responsive user flows.",
        "responsibilities": "Convert Figma mocks to React code, write clean CSS animations, ensure high accessibility.",
        "location": "Mumbai",
        "job_type": "Full Time",
        "salary": "₹ 9.0 LPA",
        "min_cgpa": 6.5,
        "max_backlogs": 1,
        "grad_year": 2026,
        "allowed_branches": ["Computer Science Engineering", "Information Technology", "Electronics & Communication"],
        "skills": ["React", "JavaScript", "HTML/CSS"]
    }
]

def seed_database():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    random.seed(42)  # For deterministic generation

    # 1. Create Skills
    print("Seeding skills...")
    skill_objs = {}
    for s_name in SKILLS_POOL:
        sk = Skill(name=s_name)
        db.add(sk)
        db.commit()
        db.refresh(sk)
        skill_objs[s_name] = sk

    # 2. Create Admin Account
    print("Seeding Admin account...")
    admin_user = User(
        email="admin@placeflow.demo",
        password_hash=get_password_hash("Admin@123"),
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    # 3. Create Companies & Recruiters (including demo recruiter)
    print("Seeding Companies & Recruiters...")
    company_objs = []
    recruiter_objs = []
    
    csv_companies = []
    for idx, c_data in enumerate(COMPANIES_DATA):
        comp = Company(
            name=c_data["name"],
            description=c_data["description"],
            location=c_data["location"],
            website=c_data["website"]
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)
        company_objs.append(comp)

        csv_companies.append({
            "id": comp.id,
            "name": comp.name,
            "description": comp.description,
            "location": comp.location,
            "website": comp.website
        })

        # Recruiter user
        rec_email = "recruiter@placeflow.demo" if idx == 0 else f"recruiter{idx+1}@{comp.name.lower().replace(' ', '')}.com"
        rec_password = "Recruiter@123" if idx == 0 else "Recruiter@123"
        rec_user = User(
            email=rec_email,
            password_hash=get_password_hash(rec_password),
            role="recruiter",
            is_active=True
        )
        db.add(rec_user)
        db.commit()
        db.refresh(rec_user)

        rec = Recruiter(
            user_id=rec_user.id,
            company_id=comp.id,
            full_name=f"{INDIAN_FIRST_NAMES[idx]} {INDIAN_LAST_NAMES[idx]}",
            designation="University Hiring Manager" if idx % 2 == 0 else "Senior Talent Acquisition Specialist",
            phone=f"+91 98765 {10000+idx}",
            verification_status="approved" if idx < 8 else "pending"
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        recruiter_objs.append(rec)

    # 4. Create Students (including demo student)
    print("Seeding 50 Students...")
    student_objs = []
    csv_students = []

    # Primary demo student
    demo_student_user = User(
        email="student@placeflow.demo",
        password_hash=get_password_hash("Student@123"),
        role="student",
        is_active=True
    )
    db.add(demo_student_user)
    db.commit()
    db.refresh(demo_student_user)

    demo_student = Student(
        user_id=demo_student_user.id,
        full_name="Aarav Sharma",
        college_id="CS2026001",
        phone="+91 98123 45678",
        branch="Computer Science Engineering",
        cgpa=8.85,
        graduation_year=2026,
        active_backlogs=0,
        preferred_role="Software Development Engineer",
        preferred_location="Bangalore",
        preferred_job_type="Full Time",
        resume_path="resume_aarav.pdf"
    )
    for s_skill in ["Python", "Java", "React", "Data Structures", "SQL", "Git"]:
        demo_student.skills.append(skill_objs[s_skill])

    db.add(demo_student)
    db.commit()
    db.refresh(demo_student)
    student_objs.append(demo_student)

    csv_students.append({
        "id": demo_student.id,
        "email": demo_student_user.email,
        "full_name": demo_student.full_name,
        "college_id": demo_student.college_id,
        "phone": demo_student.phone,
        "branch": demo_student.branch,
        "cgpa": demo_student.cgpa,
        "graduation_year": demo_student.graduation_year,
        "active_backlogs": demo_student.active_backlogs,
        "skills": ";".join([sk.name for sk in demo_student.skills])
    })

    # Remaining 49 students
    for i in range(2, 51):
        fn = INDIAN_FIRST_NAMES[i % len(INDIAN_FIRST_NAMES)]
        ln = INDIAN_LAST_NAMES[i % len(INDIAN_LAST_NAMES)]
        full_name = f"{fn} {ln}"
        email = f"student{i}@placeflow.demo"
        col_id = f"CS2026{i:03d}"
        branch = BRANCHES[i % len(BRANCHES)]
        
        # Mix of high, average, and lower CGPAs / backlogs for testing eligibility
        if i % 10 == 0:
            cgpa = round(random.uniform(5.8, 6.4), 2)
            backlogs = random.choice([1, 2])
        elif i % 5 == 0:
            cgpa = round(random.uniform(6.5, 7.4), 2)
            backlogs = random.choice([0, 1])
        else:
            cgpa = round(random.uniform(7.5, 9.6), 2)
            backlogs = 0

        st_user = User(
            email=email,
            password_hash=get_password_hash("Student@123"),
            role="student",
            is_active=True
        )
        db.add(st_user)
        db.commit()
        db.refresh(st_user)

        st = Student(
            user_id=st_user.id,
            full_name=full_name,
            college_id=col_id,
            phone=f"+91 98{random.randint(10000000, 99999999)}",
            branch=branch,
            cgpa=cgpa,
            graduation_year=2026,
            active_backlogs=backlogs,
            preferred_role="Software Engineer" if "Computer" in branch or "IT" in branch else "Analyst",
            preferred_location="Bangalore" if i % 2 == 0 else "Hyderabad",
            preferred_job_type="Full Time",
            resume_path=f"resume_student_{i}.pdf"
        )
        # Assign 3-5 random skills
        selected_skills = random.sample(SKILLS_POOL, k=random.randint(3, 5))
        for sk_name in selected_skills:
            st.skills.append(skill_objs[sk_name])

        db.add(st)
        db.commit()
        db.refresh(st)
        student_objs.append(st)

        csv_students.append({
            "id": st.id,
            "email": email,
            "full_name": full_name,
            "college_id": col_id,
            "phone": st.phone,
            "branch": branch,
            "cgpa": cgpa,
            "graduation_year": 2026,
            "active_backlogs": backlogs,
            "skills": ";".join(selected_skills)
        })

    # 5. Create Jobs
    print("Seeding Jobs...")
    job_objs = []
    csv_jobs = []

    for idx, j_data in enumerate(JOBS_DATA):
        rec = recruiter_objs[j_data["company_idx"]]
        comp = company_objs[j_data["company_idx"]]
        deadline_date = datetime.utcnow() + timedelta(days=30 + (idx * 2))

        job = Job(
            company_id=comp.id,
            recruiter_id=rec.id,
            title=j_data["title"],
            description=j_data["description"],
            responsibilities=j_data["responsibilities"],
            location=j_data["location"],
            job_type=j_data["job_type"],
            salary=j_data["salary"],
            minimum_cgpa=j_data["min_cgpa"],
            maximum_backlogs=j_data["max_backlogs"],
            graduation_year=j_data["grad_year"],
            deadline=deadline_date,
            status="Active" if idx < 13 else "Closed"
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        for br in j_data["allowed_branches"]:
            db.add(JobAllowedBranch(job_id=job.id, branch=br))

        for sk_name in j_data["skills"]:
            job.skills.append(skill_objs[sk_name])

        db.commit()
        db.refresh(job)
        job_objs.append(job)

        csv_jobs.append({
            "id": job.id,
            "company_name": comp.name,
            "recruiter_name": rec.full_name,
            "title": job.title,
            "location": job.location,
            "job_type": job.job_type,
            "salary": job.salary,
            "minimum_cgpa": job.minimum_cgpa,
            "maximum_backlogs": job.maximum_backlogs,
            "graduation_year": job.graduation_year,
            "deadline": deadline_date.strftime("%Y-%m-%d"),
            "status": job.status,
            "allowed_branches": ";".join(j_data["allowed_branches"])
        })

    # 6. Create Applications
    print("Seeding 35+ Applications & Notifications...")
    statuses_sample = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"]
    csv_apps = []

    # Demo student applications
    demo_job_1 = job_objs[0]  # TechCorp SDE-1
    demo_job_2 = job_objs[1]  # TechCorp Frontend Intern
    demo_job_3 = job_objs[7]  # FinEdge Analyst

    app1 = Application(student_id=demo_student.id, job_id=demo_job_1.id, status="Shortlisted", applied_at=datetime.utcnow() - timedelta(days=10))
    app2 = Application(student_id=demo_student.id, job_id=demo_job_2.id, status="Selected", applied_at=datetime.utcnow() - timedelta(days=15))
    app3 = Application(student_id=demo_student.id, job_id=demo_job_3.id, status="Under Review", applied_at=datetime.utcnow() - timedelta(days=5))

    db.add_all([app1, app2, app3])
    db.commit()

    # Create notifications for demo student
    n1 = Notification(
        user_id=demo_student_user.id,
        title="Application Update: Shortlisted",
        message=f"Congratulations! You have been shortlisted for '{demo_job_1.title}' at {demo_job_1.company.name}.",
        is_read=False
    )
    n2 = Notification(
        user_id=demo_student_user.id,
        title="Application Update: Selected",
        message=f"🎉 Offer Received! You have been SELECTED for '{demo_job_2.title}' at {demo_job_2.company.name}!",
        is_read=True
    )
    n3 = Notification(
        user_id=demo_student_user.id,
        title="New Eligible Opportunity",
        message=f"New opportunity posted: '{job_objs[2].title}' at {job_objs[2].company.name}. Check your eligibility and apply now!",
        is_read=False
    )
    db.add_all([n1, n2, n3])
    db.commit()

    # Generate applications for other students
    created_pairs = set([(demo_student.id, demo_job_1.id), (demo_student.id, demo_job_2.id), (demo_student.id, demo_job_3.id)])

    app_id_counter = 1
    for st in student_objs:
        # Apply student to 1-3 random active jobs where they meet basic criteria
        target_jobs = random.sample(job_objs[:13], k=random.randint(1, 3))
        for job in target_jobs:
            if (st.id, job.id) in created_pairs:
                continue
            created_pairs.add((st.id, job.id))

            # Decide status based on student CGPA
            if st.cgpa >= 8.5:
                st_status = random.choice(["Shortlisted", "Interview", "Selected", "Under Review"])
            elif st.cgpa >= 7.5:
                st_status = random.choice(["Applied", "Under Review", "Shortlisted", "Rejected"])
            else:
                st_status = random.choice(["Applied", "Under Review", "Rejected"])

            applied_time = datetime.utcnow() - timedelta(days=random.randint(1, 20))
            app = Application(
                student_id=st.id,
                job_id=job.id,
                status=st_status,
                applied_at=applied_time,
                updated_at=applied_time + timedelta(days=random.randint(0, 3))
            )
            db.add(app)
            db.commit()
            db.refresh(app)

            csv_apps.append({
                "id": app.id,
                "student_name": st.full_name,
                "student_college_id": st.college_id,
                "job_title": job.title,
                "company_name": job.company.name,
                "status": app.status,
                "applied_at": applied_time.strftime("%Y-%m-%d")
            })

    # 7. Write CSV Datasets
    print("Writing CSV files in dataset/ directory...")
    with open(os.path.join(DATASET_DIR, "students.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=csv_students[0].keys())
        writer.writeheader()
        writer.writerows(csv_students)

    with open(os.path.join(DATASET_DIR, "companies.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=csv_companies[0].keys())
        writer.writeheader()
        writer.writerows(csv_companies)

    with open(os.path.join(DATASET_DIR, "jobs.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=csv_jobs[0].keys())
        writer.writeheader()
        writer.writerows(csv_jobs)

    with open(os.path.join(DATASET_DIR, "applications.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=csv_apps[0].keys())
        writer.writeheader()
        writer.writerows(csv_apps)

    db.close()
    print("\n✅ SEEDING COMPLETE!")
    print("--------------------------------------------------")
    print("DEMO ACCOUNTS CREATED:")
    print("1. STUDENT:   student@placeflow.demo   / Student@123")
    print("2. RECRUITER: recruiter@placeflow.demo / Recruiter@123")
    print("3. ADMIN:     admin@placeflow.demo     / Admin@123")
    print("--------------------------------------------------")

if __name__ == "__main__":
    seed_database()
