import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, FileCheck, Calendar, Award, ArrowRight, Building, MapPin, CheckCircle, Clock 
} from 'lucide-react';
import studentService from '../../services/studentService';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profData, appsData, jobsData] = await Promise.all([
          studentService.getProfile(),
          studentService.getApplications(),
          studentService.getEligibleJobs(),
        ]);
        setProfile(profData);
        setApplications(appsData);
        setEligibleJobs(jobsData);
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="portal-page-container"><p>Loading Dashboard...</p></div>;
  }

  const interviewsCount = applications.filter(a => a.status === 'Interview' || a.status === 'Shortlisted').length;
  const offersCount = applications.filter(a => a.status === 'Selected').length;

  return (
    <div className="portal-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {profile?.full_name || 'Student'}! 👋</h1>
          <p className="page-subtitle">Here is an overview of your recruitment journey and eligible opportunities.</p>
        </div>
        <Link to="/student/jobs" className="btn btn-primary">
          <Briefcase size={18} />
          <span>Explore Jobs</span>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon-bg cyan">
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{eligibleJobs.length}</span>
            <span className="stat-label">Eligible Jobs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg purple">
            <FileCheck size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{applications.length}</span>
            <span className="stat-label">Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg amber">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{interviewsCount}</span>
            <span className="stat-label">Interviews / Shortlisted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg emerald">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{offersCount}</span>
            <span className="stat-label">Offers Received</span>
          </div>
        </div>
      </div>

      {/* Profile Completion Box */}
      <div className="content-card profile-completion-card">
        <div className="completion-info">
          <h3>Profile Strength</h3>
          <p>Complete your academic details, skills, and upload your resume to maximize recruiter visibility.</p>
        </div>
        <div className="completion-bar-wrapper">
          <ProgressBar percentage={profile?.profile_completion || 0} />
          {profile?.profile_completion < 100 && (
            <Link to="/student/profile" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
              Complete Profile
            </Link>
          )}
        </div>
      </div>

      {/* Dashboard Main 2-Column Section */}
      <div className="dashboard-grid-2">
        {/* Left Column: Recommended / Eligible Opportunities */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recommended Opportunities</h3>
            <Link to="/student/jobs" className="link-action">
              View All ({eligibleJobs.length}) <ArrowRight size={16} />
            </Link>
          </div>

          {eligibleJobs.length === 0 ? (
            <div className="empty-state-mini">
              <p>No eligible opportunities available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="job-list-mini">
              {eligibleJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="job-item-mini">
                  <div className="job-item-details">
                    <h4 className="job-title-mini">{job.title}</h4>
                    <p className="job-company-mini">
                      <Building size={14} /> {job.company_name} &bull; <MapPin size={14} /> {job.location}
                    </p>
                    <div className="job-tags-mini">
                      <span className="tag-pill">{job.job_type}</span>
                      <span className="tag-pill highlight">{job.salary}</span>
                      <span className="tag-pill success">Eligible</span>
                    </div>
                  </div>
                  <Link to={`/student/jobs/${job.id}`} className="btn btn-secondary btn-sm">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Applications */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Applications</h3>
            <Link to="/student/applications" className="link-action">
              View All ({applications.length}) <ArrowRight size={16} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state-mini">
              <p>You haven't applied for any positions yet.</p>
              <Link to="/student/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Find Eligible Jobs
              </Link>
            </div>
          ) : (
            <div className="applications-list-mini">
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className="application-item-mini">
                  <div className="app-main-info">
                    <h4 className="app-title-mini">{app.job_title}</h4>
                    <p className="app-company-mini">{app.company_name}</p>
                    <span className="app-date-mini">
                      <Clock size={12} /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
