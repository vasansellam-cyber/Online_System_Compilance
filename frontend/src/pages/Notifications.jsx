import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckSquare, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`http://localhost:5000/api/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
    
    if (notif.link) {
      navigate(notif.link);
    } else {
      fetchNotifications();
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} color="#10b981" />;
      case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'error': return <AlertCircle size={20} color="#ef4444" />;
      default: return <Info size={20} color="#3b82f6" />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="dashboard-view animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={24} /> Notifications 
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.8rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-muted">Stay updated on your recent activity.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.5rem 1rem' }}
            onClick={markAllAsRead}
          >
            <CheckSquare size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          <Bell size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <p>You're all caught up! No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((notif) => (
            <div 
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${notif.read ? 'var(--border-color)' : 'var(--text-main)'}`,
                padding: '1.25rem',
                borderRadius: '8px',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                cursor: 'pointer',
                opacity: notif.read ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: notif.read ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {!notif.read && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#3b82f6' }}></div>
              )}
              
              <div style={{ padding: '4px' }}>
                {getIcon(notif.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: notif.read ? '400' : '600', color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                  {notif.message}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
