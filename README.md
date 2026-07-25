# PlaceFlow – College Placement & Recruitment Management System 🎓💼

PlaceFlow is a centralized, role-based **College Placement & Recruitment Management System** designed to streamline campus hiring drives for **Students**, **Recruiters**, and **Placement Administrators**.

---

## 🌟 Key Features & Modules

### 👨‍🎓 1. Student Portal
- **Profile & Resume Management**: Complete academic profile (CGPA, Branch, Graduation Year, Active Backlogs, Resume Upload).
- **Automated Eligibility Engine**: Discover jobs where student meets all criteria (CGPA, allowed branch, graduation year, backlog limit).
- **Application Tracking**: One-click application and real-time status tracking (Applied, Shortlisted, Interview, Selected, Rejected).
- **Notification System**: Instant updates on recruitment status changes and job announcements.

### 🏢 2. Recruiter Portal
- **Recruiter Registration & Admin Approval**: Mandatory placement admin verification before posting jobs.
- **Job Creation & Eligibility Rules**: Define job postings with flexible constraints (allowed engineering branches, minimum CGPA, max backlogs, CTC/stipend, application deadline).
- **Applicant Management**: View eligible candidate profiles, download resumes, and update recruitment status.

### 🛡️ 3. Placement Administrator Portal
- **System Overview & Approval Hub**: Approve pending recruiter registrations and manage system entities (Students, Recruiters, Companies, Jobs).
- **Placement Analytics & Dashboards**: Interactive charts powered by Recharts (Branch-wise placement rate, Top hiring companies, Application status distribution, Highest & Average CTC stats).
- **Audit Logs**: Full audit trail of platform actions.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router v7, Lucide React Icons, Recharts, Custom CSS Theme tokens.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, Pydantic v2, Passlib (Bcrypt), PyJWT.
- **Database**: SQLite (`placeflow.db`).

---

## 🚀 How to Run the Project

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the Backend API

```bash
cd backend

# Activate virtual environment (if created)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial demo data (Students, Recruiters, Jobs, Applications)
python seed.py

# Start FastAPI Uvicorn server
uvicorn app.main:app --reload --port 8000
```
> **Swagger API Docs**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

---

### 2. Start the Frontend React App

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
> Access app in browser: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Placement Admin** | `admin@placeflow.edu` | `admin123` | Full administrative control & placement analytics |
| **Recruiter (Google)** | `recruiter@google.com` | `recruiter123` | Approved recruiter for Google India |
| **Recruiter (Microsoft)** | `recruiter@microsoft.com` | `recruiter123` | Approved recruiter for Microsoft |
| **Student** | `student@placeflow.edu` | `student123` | CSE Student (CGPA: 8.8, 0 Backlogs) |

---

## 🧪 Running Automated Tests

To run the full backend test suite:

```bash
cd backend
pytest -v
```

All 15 automated test cases cover:
- Student & Recruiter Registration
- Authentication & JWT Token issuance
- Admin Recruiter Approval
- Job Posting & Eligibility Checking
- Application Submission & Prevention of Duplicate Applications
- Application Status Updates & Notification generation

---

## 📂 Project Structure

```
PlaceFlow/
├── backend/
│   ├── app/
│   │   ├── dependencies/    # Auth & Database session dependencies
│   │   ├── models/          # SQLAlchemy database entities
│   │   ├── routers/         # FastAPI endpoint controllers
│   │   ├── schemas/         # Pydantic data schemas
│   │   ├── services/        # Business logic & eligibility engine
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest automated test suites
│   ├── placeflow.db         # SQLite database file
│   ├── requirements.txt     # Python backend dependencies
│   └── seed.py              # Demo database seeding script
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components & status badges
│   │   ├── context/         # AuthContext & state management
│   │   ├── layouts/         # Student, Recruiter, Admin & Main layouts
│   │   ├── pages/           # Portal dashboards & module pages
│   │   ├── services/        # Axios/Fetch API service modules
│   │   ├── styles/          # Global theme CSS tokens & styles
│   │   └── App.jsx          # React Router entrypoint & routes
│   └── package.json
└── README.md
