import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Users, FileCheck, CheckCircle2, UserCheck, PlusCircle, ArrowRight, Building 
} from 'lucide-react';
import jobService from '../../services/jobService';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const loadRecruiterData = async () => {
    setLoading(true);
    try {
      // Fetch recruiter's jobs
      const jobsData = await jobService.getJobs({ status_filter: 'All' });
      setJobs(jobsData);

      // Fetch applicants for the first active job or all
      if (jobsData.length > 0) {
        const appsProms = jobsData.map((j) => jobService.getJobApplicants(j.id).catch(() => []));
        const allAppsArrays = await Promise.all(appsProms);
        const combined = allAppsArrays.flat();
        setApplications(combined);
      }
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const selectedCount = applications.filter((a) => a.status === 'Selected').length;

  if (loading) {
    return <div className="portal-page-container"><p>Loading Recruiter Dashboard...</p></div>;
  }

  return (
    <div className="portal-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruiter Dashboard</h1>
          <p className="page-subtitle">Manage your active job listings, review student applications, and update recruitment stages.</p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-5">
        <div className="stat-card">
          <div className="stat-icon-bg cyan">
            <Briefcase size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeJobsCount}</span>
            <span className="stat-label">Active Jobs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg purple">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalAppsCount}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg amber">
            <FileCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{shortlistedCount}</span>
            <span className="stat-label">Shortlisted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg cyan">
            <UserCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{interviewCount}</span>
            <span className="stat-label">Interviews</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{selectedCount}</span>
            <span className="stat-label">Selected</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section */}
      <div className="dashboard-grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Left Column: Recent Applications */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Candidate Applications</h3>
            <Link to="/recruiter/jobs" className="link-action">
              View All Candidates <ArrowRight size={16} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state-mini">
              <p>No applications received yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Branch / CGPA</th>
                    <th>Job Title</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.student_name}</strong>
                      </td>
                      <td>
                        {app.student_branch} ({app.student_cgpa} CGPA)
                      </td>
                      <td>{app.job_title}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Active Job Postings */}
        <div className="content-card">
          <div className="card-header">
            <h3>Active Job Postings</h3>
            <Link to="/recruiter/jobs" className="link-action">
              Manage Jobs ({jobs.length}) <ArrowRight size={16} />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state-mini">
              <p>You haven't posted any jobs yet.</p>
              <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Post First Job
              </Link>
            </div>
          ) : (
            <div className="job-list-mini">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="job-item-mini">
                  <div className="job-item-details">
                    <h4 className="job-title-mini">{job.title}</h4>
                    <p className="job-company-mini">
                      {job.job_type} &bull; {job.salary} &bull; Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="job-actions-mini">
                    <StatusBadge status={job.status} />
                    <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-secondary btn-sm" style={{ marginLeft: '0.5rem' }}>
                      Applicants
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
