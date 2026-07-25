import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building, MapPin, Briefcase, Award, Calendar, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Send 
} from 'lucide-react';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import studentService from '../../services/studentService';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const loadJobDetails = async () => {
    setLoading(true);
    try {
      const [jobData, eligData, appsData] = await Promise.all([
        jobService.getJobById(id),
        jobService.checkEligibility(id),
        studentService.getApplications(),
      ]);
      setJob(jobData);
      setEligibility(eligData);
      setMyApplications(appsData);
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const existingApplication = myApplications.find((a) => a.job_id === parseInt(id));

  const handleApply = async () => {
    if (!eligibility?.eligible) return;
    setApplying(true);
    setNotification(null);

    try {
      await applicationService.applyToJob(id);
      setNotification({ type: 'success', message: 'Application submitted successfully!' });
      // Reload applications
      const updatedApps = await studentService.getApplications();
      setMyApplications(updatedApps);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to submit application.' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="portal-page-container"><p>Loading Job Details...</p></div>;
  }

  if (!job) {
    return (
      <div className="portal-page-container">
        <p>Job posting not found.</p>
        <Link to="/student/jobs" className="btn btn-secondary">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="portal-page-container">
      {/* Back Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Opportunities
        </button>
      </div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Job Banner */}
      <div className="content-card job-details-header-card">
        <div className="job-banner-info">
          <h1 className="job-details-title">{job.title}</h1>
          <p className="job-details-company">
            <Building size={18} /> {job.company_name}
          </p>
          <div className="job-meta-row">
            <span><MapPin size={16} /> {job.location}</span>
            <span><Briefcase size={16} /> {job.job_type}</span>
            <span className="highlight-text"><Award size={16} /> {job.salary}</span>
            <span><Calendar size={16} /> Apply by: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action Button Section */}
        <div className="job-banner-actions">
          {existingApplication ? (
            <div className="application-applied-badge">
              <CheckCircle2 size={20} />
              <span>Applied on {new Date(existingApplication.applied_at).toLocaleDateString()}</span>
              <span className="app-status-tag">{existingApplication.status}</span>
            </div>
          ) : eligibility?.eligible ? (
            <button 
              onClick={handleApply} 
              disabled={applying || job.status !== 'Active'} 
              className="btn btn-primary btn-lg"
            >
              <Send size={18} /> {applying ? 'Submitting...' : 'Apply Now'}
            </button>
          ) : (
            <button disabled className="btn btn-disabled btn-lg">
              Not Eligible to Apply
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Section: Details & Eligibility Engine Box */}
      <div className="dashboard-grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Left Column: Description & Responsibilities */}
        <div className="content-card">
          <div className="job-section-block">
            <h3>Job Description</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
          </div>

          <div className="job-section-block" style={{ marginTop: '1.5rem' }}>
            <h3>Key Responsibilities</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{job.responsibilities}</p>
          </div>

          <div className="job-section-block" style={{ marginTop: '1.5rem' }}>
            <h3>Required Technical Skills</h3>
            <div className="skills-chips-container">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)
              ) : (
                <p>No specific skills listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: ELIGIBILITY ENGINE BOX */}
        <div className="content-card">
          <h3 className="section-title">Eligibility Criteria Check</h3>

          {/* Eligibility Banner Status */}
          {eligibility?.eligible ? (
            <div className="eligibility-banner-box pass">
              <CheckCircle2 size={28} className="banner-icon" />
              <div>
                <h4>You're Eligible!</h4>
                <p>You satisfy all academic and branch criteria specified for this job opportunity.</p>
              </div>
            </div>
          ) : (
            <div className="eligibility-banner-box fail">
              <XCircle size={28} className="banner-icon" />
              <div>
                <h4>Not Eligible</h4>
                <p>You do not meet one or more eligibility criteria required by the recruiter.</p>
              </div>
            </div>
          )}

          {/* Detailed Criteria Checklist */}
          <div className="criteria-checklist">
            <div className={`criteria-item ${eligibility?.criteria?.cgpa ? 'pass' : 'fail'}`}>
              {eligibility?.criteria?.cgpa ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>Minimum CGPA: <strong>{job.minimum_cgpa}</strong></span>
            </div>

            <div className={`criteria-item ${eligibility?.criteria?.branch ? 'pass' : 'fail'}`}>
              {eligibility?.criteria?.branch ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>
                Allowed Branches: <strong>{job.allowed_branches?.join(', ') || 'All Branches'}</strong>
              </span>
            </div>

            <div className={`criteria-item ${eligibility?.criteria?.backlogs ? 'pass' : 'fail'}`}>
              {eligibility?.criteria?.backlogs ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>Maximum Active Backlogs: <strong>{job.maximum_backlogs}</strong></span>
            </div>

            <div className={`criteria-item ${eligibility?.criteria?.graduation_year ? 'pass' : 'fail'}`}>
              {eligibility?.criteria?.graduation_year ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>Graduation Year: <strong>{job.graduation_year || 'Any'}</strong></span>
            </div>
          </div>

          {/* Failed Reasons List */}
          {eligibility?.reasons && eligibility.reasons.length > 0 && (
            <div className="eligibility-reasons-box">
              <h5>Failed Criteria Breakdown:</h5>
              <ul>
                {eligibility.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
