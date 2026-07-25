from typing import List, Dict, Any
from app.models.models import Student, Job

class EligibilityService:
    @staticmethod
    def evaluate(student: Student, job: Job) -> Dict[str, Any]:
        cgpa_pass = student.cgpa >= job.minimum_cgpa
        
        allowed_branch_names = [b.branch.strip().lower() for b in job.allowed_branches]
        student_branch_clean = student.branch.strip().lower()
        branch_pass = len(allowed_branch_names) == 0 or (student_branch_clean in allowed_branch_names) or ("other" in allowed_branch_names) or ("all" in allowed_branch_names)

        backlogs_pass = student.active_backlogs <= job.maximum_backlogs
        grad_year_pass = (job.graduation_year == 0) or (student.graduation_year == job.graduation_year)

        reasons: List[str] = []
        if not cgpa_pass:
            reasons.append(f"Minimum required CGPA is {job.minimum_cgpa} (Your CGPA: {student.cgpa}).")
        if not branch_pass:
            allowed_str = ", ".join([b.branch for b in job.allowed_branches])
            reasons.append(f"Allowed branches are [{allowed_str}] (Your branch: {student.branch}).")
        if not backlogs_pass:
            reasons.append(f"Maximum allowed active backlogs is {job.maximum_backlogs} (Your backlogs: {student.active_backlogs}).")
        if not grad_year_pass:
            reasons.append(f"Eligible graduation year is {job.graduation_year} (Your graduation year: {student.graduation_year}).")

        is_eligible = cgpa_pass and branch_pass and backlogs_pass and grad_year_pass

        return {
            "eligible": is_eligible,
            "criteria": {
                "cgpa": cgpa_pass,
                "branch": branch_pass,
                "backlogs": backlogs_pass,
                "graduation_year": grad_year_pass
            },
            "reasons": reasons
        }
