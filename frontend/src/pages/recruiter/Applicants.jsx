import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, Filter, Search, ArrowLeft, FileText, CheckCircle, Clock, CheckCircle2 
} from 'lucide-react';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

const RecruiterApplicants = () => {
  const { id: jobId } = useParams();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplicantsData();
  }, [jobId]);

  const fetchApplicantsData = async () => {
    setLoading(true);
    try {
      if (jobId) {
        const [jobData, appsData] = await Promise.all([
          jobService.getJobById(jobId),
          jobService.getJobApplicants(jobId),
        ]);
        setJob(jobData);
        setApplicants(appsData);
      } else {
        // Fetch all jobs, then all applicants
        const jobsData = await jobService.getJobs({ status_filter: 'All' });
        const appsProms = jobsData.map((j) => jobService.getJobApplicants(j.id).catch(() => []));
        const allApps = (await Promise.all(appsProms)).flat();
        setApplicants(allApps);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    setNotification(null);
    try {
      const updated = await applicationService.updateApplicationStatus(appId, newStatus);
      setApplicants((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: updated.status } : app))
      );
      setNotification({
        type: 'success',
        message: `Updated status for ${updated.student_name} to '${newStatus}'. Student has been notified.`,
      });
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  // Extract unique branches for filter dropdown
  const branches = ['All', ...new Set(applicants.map((a) => a.student_branch).filter(Boolean))];

  const filteredApplicants = applicants.filter((app) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      app.student_name.toLowerCase().includes(query) ||
      app.job_title.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesBranch = branchFilter === 'All' || app.student_branch === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  return (
    <div className="portal-page-container">
      {jobId && (
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/recruiter/jobs" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back to Job Postings
          </Link>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            {job ? `Applicants for '${job.title}'` : 'Candidate Applications'}
          </h1>
          <p className="page-subtitle">
            Review candidate resumes, CGPA, and update recruitment pipeline statuses.
          </p>
        </div>
      </div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <CheckCircle2 size={20} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="content-card filter-control-bar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate by name or job title..."
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Status Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Branch Filter:</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="filter-select"
            >
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applicants Data Table */}
      {loading ? (
        <p>Loading applicants...</p>
      ) : filteredApplicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants found"
          description="No candidate applications match the selected criteria."
        />
      ) : (
        <div className="content-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate Name & Email</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Skills</th>
                  <th>Job Position</th>
                  <th>Applied Date</th>
                  <th>Status Stage</th>
                  <th>Action Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.student_name}</strong>
                      <div className="hint-text">{app.student_email}</div>
                    </td>
                    <td>{app.student_branch}</td>
                    <td>
                      <span className="badge-highlight">{app.student_cgpa}</span>
                    </td>
                    <td>
                      <div className="skills-chips-mini">
                        {app.student_skills?.slice(0, 3).map((sk) => (
                          <span key={sk} className="skill-pill-xs">{sk}</span>
                        ))}
                      </div>
                    </td>
                    <td>{app.job_title}</td>
                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className="table-action-select"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicants;
