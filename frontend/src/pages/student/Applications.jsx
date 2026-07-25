import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, Building, MapPin, Award, CheckCircle, AlertCircle, ChevronRight 
} from 'lucide-react';
import studentService from '../../services/studentService';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const STAGES = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await studentService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (status) => {
    if (status === 'Rejected') return -1;
    return STAGES.indexOf(status);
  };

  const filteredApps = applications.filter((app) => {
    if (selectedStatusFilter === 'All') return true;
    return app.status === selectedStatusFilter;
  });

  const totalCount = applications.length;
  const underReviewCount = applications.filter(a => a.status === 'Under Review' || a.status === 'Applied').length;
  const interviewCount = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview').length;
  const selectedCount = applications.filter(a => a.status === 'Selected').length;

  return (
    <div className="portal-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track the real-time status and recruitment stage progression of your submitted job applications.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon-bg cyan">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg purple">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{underReviewCount}</span>
            <span className="stat-label">Under Review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg amber">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{interviewCount}</span>
            <span className="stat-label">Interviews / Shortlisted</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg emerald">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{selectedCount}</span>
            <span className="stat-label">Offers Received</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs-container">
        {['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${selectedStatusFilter === status ? 'active' : ''}`}
            onClick={() => setSelectedStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <p>Loading applications...</p>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={
            selectedStatusFilter === 'All'
              ? "You haven't applied for any jobs yet."
              : `No applications with status '${selectedStatusFilter}'.`
          }
          action={
            <Link to="/student/jobs" className="btn btn-primary btn-sm">
              Explore Available Jobs
            </Link>
          }
        />
      ) : (
        <div className="applications-timeline-list">
          {filteredApps.map((app) => {
            const currentStageIdx = getStageIndex(app.status);

            return (
              <div key={app.id} className="content-card application-timeline-card">
                <div className="app-card-top">
                  <div>
                    <h3 className="app-job-title">{app.job_title}</h3>
                    <p className="app-company-name">
                      <Building size={16} /> {app.company_name} &bull; <MapPin size={16} /> {app.job_location}
                    </p>
                  </div>
                  <div className="app-card-top-right">
                    <span className="app-salary-tag"><Award size={14} /> {app.salary}</span>
                    <StatusBadge status={app.status} />
                  </div>
                </div>

                {/* Status Progress Step Tracker */}
                <div className="status-timeline-tracker">
                  {app.status === 'Rejected' ? (
                    <div className="status-rejected-box">
                      <AlertCircle size={18} />
                      <span>Application status: <strong>Rejected</strong></span>
                    </div>
                  ) : (
                    <div className="timeline-steps">
                      {STAGES.map((stage, idx) => {
                        const isCompleted = currentStageIdx >= idx;
                        const isCurrent = currentStageIdx === idx;
                        return (
                          <div 
                            key={stage} 
                            className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                          >
                            <div className="step-circle">{idx + 1}</div>
                            <span className="step-label">{stage}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="app-card-footer">
                  <span className="app-timestamp">
                    Applied on {new Date(app.applied_at).toLocaleDateString()} &bull; Last updated {new Date(app.updated_at).toLocaleDateString()}
                  </span>
                  <Link to={`/student/jobs/${app.job_id}`} className="link-action">
                    View Job Posting <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
