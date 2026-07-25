import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, PlusCircle, Users, Edit, Lock, Unlock, Calendar, MapPin, Award 
} from 'lucide-react';
import jobService from '../../services/jobService';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobs({ status_filter: 'All' });
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    try {
      await jobService.updateJobStatus(jobId, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      alert('Failed to update job status: ' + err.message);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === 'All') return true;
    return job.status === statusFilter;
  });

  return (
    <div className="portal-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Job Postings</h1>
          <p className="page-subtitle">View, edit, or toggle status for your active and past recruitment drives.</p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn btn-primary">
          <PlusCircle size={18} /> Post New Job
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-tabs-container">
        {['All', 'Active', 'Closed', 'Draft'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Jobs List Grid */}
      {loading ? (
        <p>Loading your job postings...</p>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job postings found"
          description={
            statusFilter === 'All'
              ? "You haven't created any job postings yet."
              : `No job postings with status '${statusFilter}'.`
          }
          action={
            <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm">
              Create Job Posting
            </Link>
          }
        />
      ) : (
        <div className="jobs-cards-grid">
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-card-elevated">
              <div className="job-card-header">
                <div>
                  <h3 className="job-card-title">{job.title}</h3>
                  <p className="job-card-company">{job.company_name}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="job-card-details">
                <div className="detail-meta-item">
                  <MapPin size={14} /> {job.location}
                </div>
                <div className="detail-meta-item">
                  <Briefcase size={14} /> {job.job_type}
                </div>
                <div className="detail-meta-item highlight">
                  <Award size={14} /> {job.salary}
                </div>
                <div className="detail-meta-item">
                  <Calendar size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                </div>
              </div>

              <div className="job-card-criteria-summary">
                <span>Min CGPA: <strong>{job.minimum_cgpa}</strong></span>
                <span>Branches: <strong>{job.allowed_branches?.length || 0} allowed</strong></span>
              </div>

              <div className="job-card-actions-bar">
                <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-primary btn-sm">
                  <Users size={16} /> View Applicants
                </Link>

                <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-secondary btn-sm">
                  <Edit size={16} /> Edit
                </Link>

                <button
                  onClick={() => handleToggleStatus(job.id, job.status)}
                  className={`btn btn-sm ${job.status === 'Active' ? 'btn-danger-outline' : 'btn-success-outline'}`}
                >
                  {job.status === 'Active' ? <Lock size={16} /> : <Unlock size={16} />}
                  {job.status === 'Active' ? 'Close' : 'Reopen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
