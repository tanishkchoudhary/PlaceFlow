import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  id = 'password',
  name = 'password',
  label = 'Password',
  value,
  onChange,
  onBlur,
  placeholder = '••••••••',
  error,
  required = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      </div>

      <div className="input-wrapper">
        <Lock size={18} className="input-left-icon" />
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`form-input has-left-icon has-right-icon ${error ? 'input-error' : ''}`}
          required={required}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={toggleVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <span className="form-error-msg">{error}</span>}
    </div>
  );
};

export default PasswordInput;
