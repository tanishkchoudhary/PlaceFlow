import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Building, MapPin, Award, Calendar, CheckSquare, Plus, ArrowLeft, CheckCircle, AlertCircle 
} from 'lucide-react';
import jobService from '../../services/jobService';

const ALL_BRANCHES = [
  'Computer Science Engineering',
  'Data Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

const JobCreateEdit = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    location: '',
    job_type: 'Full Time',
    salary: '',
    minimum_cgpa: 6.0,
    maximum_backlogs: 0,
    graduation_year: 2026,
    deadline: '',
    allowed_branches: ['Computer Science Engineering', 'Data Science', 'Information Technology'],
    skills: ['Python', 'Java', 'Git'],
  });

  const [skillsInput, setSkillsInput] = useState('Python, Java, Git');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const data = await jobService.getJobById(id);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        responsibilities: data.responsibilities || '',
        location: data.location || '',
        job_type: data.job_type || 'Full Time',
        salary: data.salary || '',
        minimum_cgpa: data.minimum_cgpa || 0,
        maximum_backlogs: data.maximum_backlogs || 0,
        graduation_year: data.graduation_year || 2026,
        deadline: data.deadline ? data.deadline.substring(0, 10) : '',
        allowed_branches: data.allowed_branches || [],
        skills: data.skills || [],
      });
      setSkillsInput(data.skills ? data.skills.join(', ') : '');
    } catch (err) {
      console.error('Failed to load job details:', err);
      setNotification({ type: 'error', message: 'Failed to load job details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBranchToggle = (branchName) => {
    setFormData((prev) => {
      const current = prev.allowed_branches;
      if (current.includes(branchName)) {
        return { ...prev, allowed_branches: current.filter((b) => b !== branchName) };
      } else {
        return { ...prev, allowed_branches: [...current, branchName] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      ...formData,
      minimum_cgpa: parseFloat(formData.minimum_cgpa),
      maximum_backlogs: parseInt(formData.maximum_backlogs),
      graduation_year: parseInt(formData.graduation_year),
      deadline: new Date(formData.deadline).toISOString(),
      skills: parsedSkills,
    };

    try {
      if (isEditMode) {
        await jobService.updateJob(id, payload);
        setNotification({ type: 'success', message: 'Job posting updated successfully!' });
      } else {
        await jobService.createJob(payload);
        setNotification({ type: 'success', message: 'Job posting created successfully!' });
      }
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1200);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to save job posting.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="portal-page-container"><p>Loading Job Form...</p></div>;
  }

  return (
    <div className="portal-page-container">
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Job Postings
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">{isEditMode ? 'Edit Job Opportunity' : 'Post New Job Opportunity'}</h1>
          <p className="page-subtitle">Define role responsibilities, package details, and eligibility criteria for candidates.</p>
        </div>
      </div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="job-form">
        {/* Section 1: Basic Position Details */}
        <div className="content-card">
          <h3 className="section-title">
            <Briefcase size={20} className="section-icon" /> Position Overview
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Software Development Engineer (SDE-1)"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, Hyderabad, Remote"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Type *</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Package / Salary / Stipend *</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. ₹ 12.5 LPA or ₹ 45,000 / month"
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Application Deadline *</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Description & Responsibilities */}
        <div className="content-card">
          <h3 className="section-title">Description & Responsibilities</h3>
          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Overview of the company, role, team, and projects..."
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Key Responsibilities *</label>
            <textarea
              name="responsibilities"
              rows={4}
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="Day-to-day responsibilities, expected deliverables, tools..."
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Required Skills (Comma-separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Python, Java, React, SQL, Git"
              className="form-input"
            />
          </div>
        </div>

        {/* Section 3: ELIGIBILITY CRITERIA */}
        <div className="content-card">
          <h3 className="section-title">
            <CheckSquare size={20} className="section-icon" /> Candidate Eligibility Criteria
          </h3>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Minimum CGPA (0.00 - 10.00) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="minimum_cgpa"
                value={formData.minimum_cgpa}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Active Backlogs Allowed *</label>
              <input
                type="number"
                min="0"
                name="maximum_backlogs"
                value={formData.maximum_backlogs}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Eligible Graduation Year *</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Allowed Engineering Branches *</label>
            <p className="hint-text" style={{ marginBottom: '0.75rem' }}>Select all branches eligible to apply for this position:</p>
            <div className="branches-checkbox-grid">
              {ALL_BRANCHES.map((branch) => {
                const isSelected = formData.allowed_branches.includes(branch);
                return (
                  <label key={branch} className={`checkbox-card-item ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleBranchToggle(branch)}
                    />
                    <span>{branch}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Actions Bar */}
        <div className="form-actions-bar">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary btn-lg">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Saving...' : isEditMode ? 'Update Job Posting' : 'Publish Job Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobCreateEdit;
