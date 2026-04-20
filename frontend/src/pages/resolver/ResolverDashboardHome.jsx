import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import '../user/UserDashboardHome.css'; // Reusing UserDashboardHome styles for stats cards
const API = import.meta.env.VITE_API_URL;

const ResolverDashboardHome = () => {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/api/complaints/resolver/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching resolver stats', error);
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
      
      <div className="advanced-stats-grid">
        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Area Total Complaints</h3>
            <FileText size={18} className="stat-icon" />
          </div>
          <p className="stat-value">{stats.total}</p>
        </div>

        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Resolved</h3>
            <CheckCircle2 size={18} className="stat-icon" style={{ color: '#10b981' }} />
          </div>
          <p className="stat-value">{stats.resolved}</p>
        </div>

        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">In Progress</h3>
            <Clock size={18} className="stat-icon" style={{ color: '#3b82f6' }} />
          </div>
          <p className="stat-value">{stats.inProgress}</p>
        </div>

        <div className="advanced-stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Pending Action</h3>
            <AlertCircle size={18} className="stat-icon" style={{ color: '#f59e0b' }} />
          </div>
          <p className="stat-value">{stats.pending}</p>
        </div>
      </div>
      
      <div className="cyber-banner" style={{ marginTop: '2rem' }}>
        <div className="cyber-banner-content">
          <h3>Ready to resolve issues?</h3>
          <p>Go to your complaints queue to view and action pending reports for your area.</p>
        </div>
        <button className="cyber-btn" onClick={() => window.location.href = '/resolver-dashboard/complaints'}>
          View Complaints Queue
        </button>
      </div>
    </div>
  );
};

export default ResolverDashboardHome;