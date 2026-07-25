import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import RoleSelector from '../components/auth/RoleSelector';
import PasswordInput from '../components/auth/PasswordInput';

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['student', 'recruiter', 'admin'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for edited field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!role) {
      newErrors.role = 'Please select a role';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const formErrors = validate();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setNotification({
      type: 'info',
      message: 'Form validated successfully! Authentication backend will be connected in the next development phase.',
    });
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to PlaceFlow"
    >
      {notification && (
        <div className={`auth-notification-banner ${notification.type}`}>
          <CheckCircle size={20} className="banner-icon" />
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        {/* Role Selection */}
        <RoleSelector
          roles={['student', 'recruiter', 'admin']}
          selectedRole={role}
          onSelectRole={(r) => {
            setRole(r);
            setErrors((prev) => ({ ...prev, role: '' }));
          }}
        />
        {errors.role && <div className="form-error-msg role-error">{errors.role}</div>}

        {/* Email Address */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <Mail size={18} className="input-left-icon" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={
                role === 'student'
                  ? 'student@college.edu'
                  : role === 'recruiter'
                  ? 'recruiter@company.com'
                  : 'admin@college.edu'
              }
              className={`form-input has-left-icon ${errors.email ? 'input-error' : ''}`}
              required
            />
          </div>
          {errors.email && <span className="form-error-msg">{errors.email}</span>}
        </div>

        {/* Password */}
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        {/* Remember Me & Forgot Password */}
        <div className="form-options-row">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-label">Remember Me</span>
          </label>

          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert('Password reset feature will be connected with the backend service.');
            }}
            className="forgot-password-link"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary btn-auth-submit">
          Sign In as {role === 'admin' ? 'Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
        </button>

        {/* Footer Link */}
        <div className="auth-footer-prompt">
          <span>Don't have an account?</span>{' '}
          <Link to={`/register${role !== 'admin' ? `?role=${role}` : ''}`} className="auth-link-highlight">
            Create Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
