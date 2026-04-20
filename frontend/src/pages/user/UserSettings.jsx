import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import './UserSettings.css';
const API = import.meta.env.VITE_API_URL;

const UserSettings = () => {
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passStatus, setPassStatus] = useState({ type: '', message: '' });
  
  const [photoStatus, setPhotoStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  
  // This state is just to show preview to the user
  const [avatarPreview, setAvatarPreview] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.profilePicture || null;
  });

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    if (passStatus.message) setPassStatus({ type: '', message: '' });
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPassStatus({ type: 'error', message: 'New passwords do not match' });
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/api/users/password`, 
        { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassStatus({ type: 'success', message: 'Password updated successfully' });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPassStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      return setPhotoStatus({ type: 'error', message: 'Please select an image file (PNG/JPG)' });
    }
    
    // Limit to 2MB to keep base64 strings reasonable
    if (file.size > 2 * 1024 * 1024) {
      return setPhotoStatus({ type: 'error', message: 'Image must be less than 2MB' });
    }

    setPhotoLoading(true);
    setPhotoStatus({ type: '', message: '' });
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setAvatarPreview(base64String); // Show preview immediately
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API}/api/users/profile-picture`, 
          { profilePicture: base64String },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update local storage so Sidebar picks it up on refresh or state sync
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profilePicture = response.data.user.profilePicture;
        localStorage.setItem('user', JSON.stringify(user));
        
        setPhotoStatus({ type: 'success', message: 'Profile picture updated! Refresh to see changes across app.' });
        
        // Dispatch custom event so context/sidebar can listen (optional advanced reactivity)
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        setPhotoStatus({ type: 'error', message: 'Failed to upload image' });
      } finally {
        setPhotoLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="dashboard-view animate-fade-in settings-container">
      <div className="dashboard-header">
        <h2>Account Settings</h2>
        <p>Manage your profile appearance and security preferences.</p>
      </div>
      
      <div className="settings-grid">
        {/* Profile Picture Panel */}
        <div className="settings-panel">
          <div className="panel-header">
            <h3><Camera size={20} className="panel-icon"/> Profile Picture</h3>
          </div>
          
          <div className="panel-body">
            <div className="avatar-upload-section">
              <div className="avatar-preview-container">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile Preview" className="avatar-preview-img" />
                ) : (
                  <div className="avatar-placeholder">User</div>
                )}
                {photoLoading && <div className="avatar-spinner"><span className="spinner"></span></div>}
              </div>
              
              <div className="upload-controls">
                <p className="help-text">JPG, GIF or PNG. 2MB max.</p>
                <div className="upload-btn-wrapper">
                  <button className="btn-secondary">Upload New Picture</button>
                  <input type="file" name="myfile" onChange={handlePhotoUpload} accept="image/*" />
                </div>
              </div>
            </div>
            
            {photoStatus.message && (
              <div className={`status-banner ${photoStatus.type}`}>
                {photoStatus.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                <span>{photoStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Security / Password Panel */}
        <div className="settings-panel">
          <div className="panel-header">
            <h3><Lock size={20} className="panel-icon"/> Security & Password</h3>
          </div>
          
          <div className="panel-body">
            <form onSubmit={submitPasswordChange} className="password-form">
              <div className="input-group">
                <label className="input-label" htmlFor="oldPassword">Current Password</label>
                <input 
                  type="password" 
                  id="oldPassword" 
                  name="oldPassword" 
                  className="input-field" 
                  value={passwords.oldPassword} 
                  onChange={handlePasswordChange} 
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  className="input-field" 
                  value={passwords.newPassword} 
                  onChange={handlePasswordChange} 
                  required 
                  minLength="6"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="input-field" 
                  value={passwords.confirmPassword} 
                  onChange={handlePasswordChange} 
                  required 
                />
              </div>
              
              {passStatus.message && (
                <div className={`status-banner ${passStatus.type}`}>
                  {passStatus.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                  <span>{passStatus.message}</span>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Updating Security...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserSettings;