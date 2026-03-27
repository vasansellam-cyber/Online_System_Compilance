import React, { useState } from 'react';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Utilizing the same CSS file for identical card layout

const Register = () => {
  const [formData, setFormData] = useState({ 
    role: 'user', 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    area: 'IT'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        role: formData.role,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        ...(formData.role === 'resolver' && { area: formData.area })
      });
      setSuccess(response.data.message || 'Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">
            <UserPlus size={28} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1>Create Account</h1>
          <p>Join the antigravity platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-row">
            <div className="input-group">
              <label className="input-label" htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="resolver">Resolver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                className="input-field"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.role === 'resolver' && (
            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" htmlFor="area">Resolution Area</label>
              <select
                id="area"
                name="area"
                className="input-field"
                value={formData.area}
                onChange={handleChange}
                required
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="input-field"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-row" style={{ marginBottom: '0.25rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="confirmPassword">Confirm</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="error-message" style={{ color: '#10b981' }}>
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Sign Up'}
          </button>
          
          <div className="divider">Or continue with</div>
          
          <button type="button" className="btn-google" onClick={() => alert('Google Sign Up placeholder')}>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
