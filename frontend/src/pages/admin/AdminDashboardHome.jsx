import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import '../user/UserDashboardHome.css'; // Reusing for grid styling
const API = import.meta.env.VITE_API_URL;

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    resolvers: 0,
    unblockRequests: 0,
    complaints: { total: 0, resolved: 0, inProgress: 0, pending: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="dashboard-view animate-fade-in">
      
      {stats.unblockRequests > 0 && (
        <div className="form-status error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} />
            <span><strong>Attention:</strong> There {stats.unblockRequests === 1 ? 'is' : 'are'} {stats.unblockRequests} pending account unblock request{stats.unblockRequests !== 1 && 's'}.</span>
          </div>
          <button 
            onClick={() => window.location.href = '/admin-dashboard/users'}
            style={{ padding: '0.5rem 1rem', background: '#fff', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Review Now
          </button>
        </div>
      )}

      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2>System Overview</h2>
        <p>Global analytics and current system occupancy.</p>
      </div>

      <div className="advanced-stats-grid">
        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Total Users</h3>
            <Users size={18} className="stat-icon" />
          </div>
          <p className="stat-value">{stats.users}</p>
        </div>

        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Active Resolvers</h3>
            <CheckCircle2 size={18} className="stat-icon" style={{ color: '#8b5cf6' }} />
          </div>
          <p className="stat-value">{stats.resolvers}</p>
        </div>

        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Total Complaints</h3>
            <FileText size={18} className="stat-icon" style={{ color: '#3b82f6' }} />
          </div>
          <p className="stat-value">{stats.complaints.total}</p>
        </div>

        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Pending Action</h3>
            <AlertCircle size={18} className="stat-icon" style={{ color: '#f59e0b' }} />
          </div>
          <p className="stat-value">{stats.complaints.pending}</p>
        </div>
      </div>
      
      <div className="cyber-banner" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }}>
        <div className="cyber-banner-content">
          <h3>User Administration</h3>
          <p>Manage access levels, review block appeals, and supervise the community safely.</p>
        </div>
        <button className="cyber-btn" onClick={() => window.location.href = '/admin-dashboard/users'}>
          Go to User Management
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardHome;