import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Briefcase, MapPin, Building, Calendar, Award, CheckCircle, XCircle 
} from 'lucide-react';
import jobService from '../../services/jobService';
import studentService from '../../services/studentService';
import EmptyState from '../../components/common/EmptyState';

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [eligibleOnly, setEligibleOnly] = useState(false);

  useEffect(() => {
    fetchJobsAndEligibility();
  }, []);

  const fetchJobsAndEligibility = async () => {
    setLoading(true);
    try {
      const [allJobs, eligJobs] = await Promise.all([
        jobService.getJobs({ status_filter: 'Active' }),
        studentService.getEligibleJobs(),
      ]);
      setJobs(allJobs);
      setEligibleJobs(eligJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const eligibleJobIds = new Set(eligibleJobs.map((j) => j.id));

  // Extract unique locations for filter dropdown
  const locations = ['All', ...new Set(jobs.map((j) => j.location).filter(Boolean))];

  // Filter jobs dynamically
  const filteredJobs = jobs.filter((job) => {
    // Search matching
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company_name.toLowerCase().includes(query) ||
      job.skills.some((s) => s.toLowerCase().includes(query));

    // Job type matching
    const matchesType = selectedJobType === 'All' || job.job_type === selectedJobType;

    // Location matching
    const matchesLocation = selectedLocation === 'All' || job.location === selectedLocation;

    // Eligible only matching
    const matchesEligible = !eligibleOnly || eligibleJobIds.has(job.id);

    return matchesSearch && matchesType && matchesLocation && matchesEligible;
  });

  return (
    <div className="portal-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Find Job Opportunities</h1>
          <p className="page-subtitle">Discover placement opportunities matched to your eligibility and career preferences.</p>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="content-card filter-control-bar">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, company name, or skill..."
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Job Type:</label>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Location:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="filter-select"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <label className="checkbox-toggle-container">
            <input
              type="checkbox"
              checked={eligibleOnly}
              onChange={(e) => setEligibleOnly(e.target.checked)}
            />
            <span className="toggle-switch"></span>
            <span className="toggle-label">Eligible Only</span>
          </label>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {loading ? (
        <p>Loading opportunities...</p>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          description="Try adjusting your search keywords or clearing filters to view more job postings."
          action={
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedJobType('All');
                setSelectedLocation('All');
                setEligibleOnly(false);
              }}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="jobs-cards-grid">
          {filteredJobs.map((job) => {
            const isEligible = eligibleJobIds.has(job.id);
            return (
              <div key={job.id} className="job-card-elevated">
                <div className="job-card-header">
                  <div>
                    <h3 className="job-card-title">{job.title}</h3>
                    <p className="job-card-company">
                      <Building size={14} /> {job.company_name}
                    </p>
                  </div>
                  {isEligible ? (
                    <span className="eligibility-tag eligible">
                      <CheckCircle size={14} /> Eligible
                    </span>
                  ) : (
                    <span className="eligibility-tag ineligible">
                      <XCircle size={14} /> Not Eligible
                    </span>
                  )}
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
                  <span>Max Backlogs: <strong>{job.maximum_backlogs}</strong></span>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="job-skills-chips">
                    {job.skills.map((skill) => (
                      <span key={skill} className="skill-pill-sm">{skill}</span>
                    ))}
                  </div>
                )}

                <div className="job-card-footer">
                  <Link to={`/student/jobs/${job.id}`} className="btn btn-primary btn-block">
                    View Details & Apply
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

export default StudentJobs;
