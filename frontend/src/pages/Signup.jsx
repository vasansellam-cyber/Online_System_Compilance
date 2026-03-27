import React, { useState } from 'react';
import { Mail, Lock, UserPlus, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
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
        email: formData.email,
        password: formData.password
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
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      
      <div className="glass-panel login-card">
        <div className="login-header">
          <div className="logo-box">
            <UserPlus size={32} color="var(--primary-color)" />
          </div>
          <h1>Create Account</h1>
          <p>Join the antigravity platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                name="email"
                className="input-field with-icon"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                name="password"
                className="input-field with-icon"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="input-field with-icon"
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

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                Sign Up
                <ArrowRight size={20} className="btn-icon" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
