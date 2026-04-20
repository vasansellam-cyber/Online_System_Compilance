import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, RefreshCw, User, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
const API = import.meta.env.VITE_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({ role: 'user', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [blockedUserEmail, setBlockedUserEmail] = useState('');
  const [unblockMessage, setUnblockMessage] = useState('');
  const [unblockStatus, setUnblockStatus] = useState('');
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    setShowAccountsModal(true);
    setLoadingAccounts(true);
    try {
      const response = await axios.get(`${API}/api/auth/users`);
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to load accounts', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAccountSelect = async (email) => {
    setLoading(true);
    setShowAccountsModal(false);
    try {
      const response = await axios.post(`${API}/api/auth/mock-google-login`, { email });
      console.log('Mock Google Login successful:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // redirect based on role
        if (response.data.user.role === 'resolver') {
          navigate('/resolver-dashboard');
        } else if (response.data.user.role === 'user') {
          navigate('/user-dashboard');
        } else {
          navigate('/dashboard'); // fallback
        }
      } else {
        navigate('/user-dashboard'); 
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errorCode === 'USER_BLOCKED') {
        setBlockedUserEmail(errData.email);
      } else {
        setError(errData?.message || 'Failed to login via Mock Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUnblock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/auth/request-unblock`, {
        email: blockedUserEmail,
        message: unblockMessage
      });
      setUnblockStatus(response.data.message || 'Request sent');
      setTimeout(() => {
        setBlockedUserEmail('');
        setUnblockMessage('');
        setUnblockStatus('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit unblock request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        role: formData.role,
        email: formData.email,
        password: formData.password
      });
      console.log('Login successful:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      const userToStore = response.data.user || { role: formData.role, email: formData.email };
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      if (userToStore.role === 'resolver') {
        navigate('/resolver-dashboard');
      } else if (userToStore.role === 'user') {
        navigate('/user-dashboard');
      } else if (userToStore.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard'); // placeholder for other roles
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errorCode === 'USER_BLOCKED') {
        setBlockedUserEmail(errData.email);
      } else {
        setError(errData?.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (blockedUserEmail) {
    return (
      <div className="login-container animate-fade-in">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-box" style={{ background: '#ef4444' }}>
              <AlertCircle size={28} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 style={{ color: '#ef4444' }}>Account Blocked</h1>
            <p>Your access has been suspended by an administrator.</p>
          </div>
          
          <div className="login-form">
            {unblockStatus ? (
              <div className="form-status success">
                {unblockStatus}
              </div>
            ) : (
              <form onSubmit={handleRequestUnblock}>
                <div className="input-group">
                  <label className="input-label" htmlFor="unblockMessage">Appeal Message</label>
                  <textarea
                    id="unblockMessage"
                    className="input-field"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Briefly explain why you need access to be restored..."
                    value={unblockMessage}
                    onChange={(e) => setUnblockMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Submit Request'}
                </button>
              </form>
            )}
            
            <button 
              type="button" 
              className="btn-google" 
              style={{ marginTop: '1rem' }}
              onClick={() => { setBlockedUserEmail(''); setError(''); }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-box">
            <RefreshCw size={28} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your antigravity platform account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
            />
          </div>

          <div className="form-options">
            <div className="checkbox-group">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <div className="forgot-password">
              <a href="#reset">Forgot Password?</a>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>
          
          <div className="divider">Or continue with</div>
          
          <button type="button" className="btn-google" onClick={handleGoogleClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
        </form>
      </div>

      {showAccountsModal && (
        <div className="modal-overlay" onClick={() => setShowAccountsModal(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><User size={20} /> Choose an account</h2>
              <button className="close-btn" onClick={() => setShowAccountsModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            {loadingAccounts ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--primary-color)' }}></span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="no-accounts">
                No accounts registered yet.<br/>
                Please create one first.
              </div>
            ) : (
              accounts.map((acc, index) => (
                <button 
                  key={index} 
                  className="account-item"
                  onClick={() => handleAccountSelect(acc.email)}
                >
                  <span className="account-email">{acc.username} ({acc.email})</span>
                  <span className="account-role">Role: {acc.role}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;