import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, GraduationCap, Award, Upload, Plus, X, FileText, CheckCircle, AlertCircle 
} from 'lucide-react';
import studentService from '../../services/studentService';

const BRANCHES = [
  'Computer Science Engineering',
  'Data Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other'
];

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    branch: '',
    cgpa: '',
    graduation_year: '',
    active_backlogs: 0,
    preferred_role: '',
    preferred_location: '',
    preferred_job_type: 'Full Time',
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        branch: data.branch || '',
        cgpa: data.cgpa || '',
        graduation_year: data.graduation_year || '',
        active_backlogs: data.active_backlogs || 0,
        preferred_role: data.preferred_role || '',
        preferred_location: data.preferred_location || '',
        preferred_job_type: data.preferred_job_type || 'Full Time',
      });
      setSkills(data.skills || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const payload = {
        ...formData,
        cgpa: parseFloat(formData.cgpa),
        graduation_year: parseInt(formData.graduation_year),
        active_backlogs: parseInt(formData.active_backlogs),
        skills,
      };

      const updated = await studentService.updateProfile(payload);
      setProfile(updated);
      setNotification({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      alert('Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    setUploadingResume(true);
    try {
      const res = await studentService.uploadResume(file);
      setProfile((prev) => ({ ...prev, resume_path: res.resume_path }));
      setNotification({ type: 'success', message: 'Resume uploaded successfully!' });
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to upload resume.' });
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return <div className="portal-page-container"><p>Loading Profile...</p></div>;
  }

  return (
    <div className="portal-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal details, academic metrics, skills, and placement preferences.</p>
        </div>
      </div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Section 1: Personal Information */}
        <div className="content-card">
          <h3 className="section-title">
            <User size={20} className="section-icon" /> Personal Information
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                value={profile?.email || ''}
                className="form-input disabled"
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">College / Student ID (Read-only)</label>
              <input
                type="text"
                value={profile?.college_id || ''}
                className="form-input disabled"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Information */}
        <div className="content-card">
          <h3 className="section-title">
            <GraduationCap size={20} className="section-icon" /> Academic Information
          </h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Branch / Stream *</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current CGPA (0.00 - 10.00) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year *</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Backlogs *</label>
              <input
                type="number"
                min="0"
                name="active_backlogs"
                value={formData.active_backlogs}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills */}
        <div className="content-card">
          <h3 className="section-title">
            <Award size={20} className="section-icon" /> Technical Skills
          </h3>
          <div className="skills-input-wrapper">
            <div className="input-with-button">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. Python, React, C++, SQL)"
                className="form-input"
              />
              <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                <Plus size={18} /> Add
              </button>
            </div>
            <div className="skills-chips-container">
              {skills.map((skill) => (
                <span key={skill} className="skill-chip">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="chip-remove-btn">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <p className="hint-text">No skills added yet. Add key skills to boost eligibility matching.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Resume & Documents */}
        <div className="content-card">
          <h3 className="section-title">
            <FileText size={20} className="section-icon" /> Resume / CV
          </h3>
          <div className="resume-section-box">
            {profile?.resume_path ? (
              <div className="resume-status-card">
                <FileText size={32} className="file-icon" />
                <div className="file-info">
                  <p className="file-name">{profile.resume_path}</p>
                  <p className="file-status">Uploaded & Ready for Recruiters</p>
                </div>
              </div>
            ) : (
              <div className="no-resume-box">
                <p>No resume uploaded yet.</p>
              </div>
            )}

            <div className="upload-btn-wrapper">
              <input
                type="file"
                id="resume-upload-input"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="resume-upload-input" className="btn btn-secondary">
                <Upload size={18} /> {uploadingResume ? 'Uploading...' : 'Upload New Resume'}
              </label>
              <span className="file-hint">PDF, DOC, or DOCX formats accepted (Max 5MB)</span>
            </div>
          </div>
        </div>

        {/* Section 5: Placement Preferences */}
        <div className="content-card">
          <h3 className="section-title">Placement Preferences</h3>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Preferred Job Role</label>
              <input
                type="text"
                name="preferred_role"
                value={formData.preferred_role}
                onChange={handleChange}
                placeholder="e.g. Software Engineer, Data Scientist"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Location</label>
              <input
                type="text"
                name="preferred_location"
                value={formData.preferred_location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, Remote, Hyderabad"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Type Preference</label>
              <select
                name="preferred_job_type"
                value={formData.preferred_job_type}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
