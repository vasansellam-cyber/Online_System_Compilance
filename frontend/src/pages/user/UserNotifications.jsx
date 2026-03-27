import React from 'react';
import { Bell, ShieldAlert } from 'lucide-react';
import './UserNotifications.css';

const UserNotifications = () => {
  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-header">
        <h2>Communications Hub</h2>
        <p>Stay updated with the latest system alerts and notifications.</p>
      </div>
      
      <div className="notifications-list">
        
        {/* Unread Alert */}
        <div className="notification-card unread">
          <div className="notification-indicator"></div>
          <div className="notification-icon-container">
            <Bell size={20} />
          </div>
          <div className="notification-content">
            <h4>System initialization complete</h4>
            <p>Welcome to the portal. Your profile has been generated successfully.</p>
            <div className="notification-meta">
              <span className="time">Just now</span>
              <span>•</span>
              <span>System</span>
            </div>
          </div>
        </div>

        {/* Read Alert */}
        <div className="notification-card">
          <div className="notification-indicator" style={{ backgroundColor: 'transparent' }}></div>
          <div className="notification-icon-container">
            <ShieldAlert size={20} />
          </div>
          <div className="notification-content">
            <h4>Security Verified</h4>
            <p>You have successfully logged in form a new secure connection.</p>
            <div className="notification-meta">
              <span className="time">Yesterday</span>
              <span>•</span>
              <span>Security</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserNotifications;
