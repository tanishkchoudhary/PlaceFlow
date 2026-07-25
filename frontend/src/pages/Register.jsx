import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Building, Briefcase, Phone, Hash, BookOpen, Calendar, CheckCircle, Info, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import RoleSelector from '../components/auth/RoleSelector';
import PasswordInput from '../components/auth/PasswordInput';

const BRANCH_OPTIONS = [
  'Computer Science Engineering',
  'Data Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

const GRADUATION_YEARS = ['2024', '2025', '2026', '2027', '2028', '2029'];

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student';

  const [role, setRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    // Shared
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false,

    // Student specific
    enrollmentNo: '',
    branch: '',
    graduationYear: '2026',

    // Recruiter specific
    companyName: '',
    designation: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'recruiter' || roleParam === 'student') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Password Strength Check
  const getPasswordCriteria = (pass) => {
    return {
      minLength: pass.length >= 8,
      hasUpper: /[A-Z]/.test(pass),
      hasLower: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
    };
  };

  const passwordCriteria = getPasswordCriteria(formData.password);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const validate = () => {
    const newErrors = {};

    // Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = role === 'student' ? 'College email is required' : 'Official work email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password must meet all security criteria';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms
    if (!formData.termsAgreed) {
      newErrors.termsAgreed = 'You must agree to the Terms & Conditions';
    }

    // Student fields
    if (role === 'student') {
      if (!formData.enrollmentNo.trim()) {
        newErrors.enrollmentNo = 'College ID / Enrollment Number is required';
      }
      if (!formData.branch) {
        newErrors.branch = 'Please select your branch';
      }
      if (!formData.graduationYear) {
        newErrors.graduationYear = 'Please select your graduation year';
      }
    }

    // Recruiter fields
    if (role === 'recruiter') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.designation.trim()) {
        newErrors.designation = 'Designation is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setNotification({
      type: 'info',
      message: `Registration form for ${role.toUpperCase()} validated successfully! Authentication backend will be connected in the next development phase.`,
    });
  };

  return (
    <AuthLayout
      title="Create Your PlaceFlow Account"
      subtitle="Join your campus placement ecosystem"
    >
      {notification && (
        <div className={`auth-notification-banner ${notification.type}`}>
          <CheckCircle size={20} className="banner-icon" />
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        {/* Role Selection (Student vs Recruiter only) */}
        <RoleSelector
          roles={['student', 'recruiter']}
          selectedRole={role}
          onSelectRole={(r) => {
            setRole(r);
            setErrors({});
          }}
        />

        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <User size={18} className="input-left-icon" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Rahul Sharma"
              className={`form-input has-left-icon ${errors.fullName ? 'input-error' : ''}`}
              required
            />
          </div>
          {errors.fullName && <span className="form-error-msg">{errors.fullName}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            {role === 'student' ? 'College Email' : 'Official Work Email'}{' '}
            <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <Mail size={18} className="input-left-icon" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={role === 'student' ? 'rahul@college.edu' : 'rahul@company.com'}
              className={`form-input has-left-icon ${errors.email ? 'input-error' : ''}`}
              required
            />
          </div>
          {errors.email && <span className="form-error-msg">{errors.email}</span>}
        </div>

        {/* STUDENT SPECIFIC FIELDS */}
        {role === 'student' && (
          <>
            {/* Enrollment Number */}
            <div className="form-group">
              <label htmlFor="enrollmentNo" className="form-label">
                College ID / Enrollment Number <span className="required-star">*</span>
              </label>
              <div className="input-wrapper">
                <Hash size={18} className="input-left-icon" />
                <input
                  id="enrollmentNo"
                  name="enrollmentNo"
                  type="text"
                  value={formData.enrollmentNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 21BCE0452"
                  className={`form-input has-left-icon ${errors.enrollmentNo ? 'input-error' : ''}`}
                  required
                />
              </div>
              {errors.enrollmentNo && <span className="form-error-msg">{errors.enrollmentNo}</span>}
            </div>

            {/* Branch & Graduation Year Grid */}
            <div className="form-row-grid">
              <div className="form-group">
                <label htmlFor="branch" className="form-label">
                  Branch <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <BookOpen size={18} className="input-left-icon" />
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-select has-left-icon ${errors.branch ? 'input-error' : ''}`}
                    required
                  >
                    <option value="">Select Branch</option>
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                {errors.branch && <span className="form-error-msg">{errors.branch}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="graduationYear" className="form-label">
                  Graduation Year <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-left-icon" />
                  <select
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-select has-left-icon ${errors.graduationYear ? 'input-error' : ''}`}
                    required
                  >
                    {GRADUATION_YEARS.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
                {errors.graduationYear && <span className="form-error-msg">{errors.graduationYear}</span>}
              </div>
            </div>
          </>
        )}

        {/* RECRUITER SPECIFIC FIELDS */}
        {role === 'recruiter' && (
          <>
            <div className="form-group">
              <label htmlFor="companyName" className="form-label">
                Company Name <span className="required-star">*</span>
              </label>
              <div className="input-wrapper">
                <Building size={18} className="input-left-icon" />
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Acme Tech Solutions"
                  className={`form-input has-left-icon ${errors.companyName ? 'input-error' : ''}`}
                  required
                />
              </div>
              {errors.companyName && <span className="form-error-msg">{errors.companyName}</span>}
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label htmlFor="designation" className="form-label">
                  Designation <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <Briefcase size={18} className="input-left-icon" />
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Lead Talent Partner"
                    className={`form-input has-left-icon ${errors.designation ? 'input-error' : ''}`}
                    required
                  />
                </div>
                {errors.designation && <span className="form-error-msg">{errors.designation}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-left-icon" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+91 98765 43210"
                    className={`form-input has-left-icon ${errors.phone ? 'input-error' : ''}`}
                    required
                  />
                </div>
                {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
              </div>
            </div>

            <div className="recruiter-notice-box">
              <Info size={16} className="notice-icon" />
              <span>
                Recruiter accounts may require verification by the Placement Admin before job postings can be published.
              </span>
            </div>
          </>
        )}

        {/* Password */}
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          required
        />

        {/* Live Password Strength Criteria Checklist */}
        <div className="password-checklist">
          <div className="checklist-title">Password Must Contain:</div>
          <div className="checklist-grid">
            <span className={`checklist-item ${passwordCriteria.minLength ? 'valid' : ''}`}>
              <ShieldCheck size={14} /> At least 8 characters
            </span>
            <span className={`checklist-item ${passwordCriteria.hasUpper ? 'valid' : ''}`}>
              <ShieldCheck size={14} /> 1 uppercase letter (A-Z)
            </span>
            <span className={`checklist-item ${passwordCriteria.hasLower ? 'valid' : ''}`}>
              <ShieldCheck size={14} /> 1 lowercase letter (a-z)
            </span>
            <span className={`checklist-item ${passwordCriteria.hasNumber ? 'valid' : ''}`}>
              <ShieldCheck size={14} /> 1 number (0-9)
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Repeat password"
          error={errors.confirmPassword}
          required
        />

        {/* Terms Agreement Checkbox */}
        <div className="form-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="termsAgreed"
              checked={formData.termsAgreed}
              onChange={handleChange}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-label">
              I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} className="auth-link-highlight">Terms & Conditions</a> and <a href="#privacy" onClick={(e) => e.preventDefault()} className="auth-link-highlight">Privacy Policy</a>
            </span>
          </label>
          {errors.termsAgreed && <span className="form-error-msg">{errors.termsAgreed}</span>}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary btn-auth-submit">
          Create {role === 'student' ? 'Student' : 'Recruiter'} Account
        </button>

        {/* Footer Link */}
        <div className="auth-footer-prompt">
          <span>Already have an account?</span>{' '}
          <Link to={`/login?role=${role}`} className="auth-link-highlight">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
