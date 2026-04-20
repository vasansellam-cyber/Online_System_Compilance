import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Database } from 'lucide-react';
import '../user/UserComplaints.css'; // Reuse table stylings
const API = import.meta.env.VITE_API_URL;

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [resolvers, setResolvers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [compRes, usersRes] = await Promise.all([
        axios.get(`${API}/api/admin/complaints`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setComplaints(compRes.data);
      setResolvers(usersRes.data.filter(u => u.role === 'resolver'));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignResolver = async (id, newResolverId) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/api/admin/complaints/${id}/assign`, 
        { resolverId: newResolverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state temporarily so we don't have to refetch instantly
      const resolver = resolvers.find(r => r._id === newResolverId);
      setComplaints(complaints.map(c => 
        c._id === id ? { 
          ...c, 
          assignedResolver: resolver ? { _id: resolver._id, username: resolver.username } : null,
          area: resolver ? resolver.area : c.area 
        } : c
      ));
    } catch (err) {
      console.error('Error assigning resolver:', err);
      alert('Failed to reassign target resolver.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'stat-pending';
      case 'In Progress': return 'stat-progress';
      case 'Resolved': return 'stat-resolved';
      case 'Rejected': return 'stat-rejected';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'pri-high';
      case 'Medium': return 'pri-med';
      case 'Low': return 'pri-low';
      default: return '';
    }
  };

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Global Complaints</h2>
          <p>Supervise and re-route every ticket in the system.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ background: '#fff', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          onClick={fetchData}
        >
          <RefreshCw size={16} /> Sync Table
        </button>
      </div>
      
      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner"></span>
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>
      ) : complaints.length === 0 ? (
        <div className="data-table-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Database size={32} style={{ margin: '0 auto 1rem auto', display: 'block' }} />
          No complaints registered in the system yet.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Issuer</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignment</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="data-row">
                  <td>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{c.user?.email || 'System'}</div>
                  </td>
                  <td>
                    <div className="subject-cell" style={{ fontWeight: 500 }}>{c.subject}</div>
                  </td>
                  <td>
                    <span className={`badge-clean ${getPriorityClass(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-clean ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {updatingId === c._id ? (
                      <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#3b82f6' }}></span>
                    ) : (
                      <select 
                        value={c.assignedResolver?._id || ''} 
                        onChange={(e) => handleAssignResolver(c._id, e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer', maxWidth: '180px' }}
                        disabled={c.status === 'Resolved'}
                        title={c.status === 'Resolved' ? "Cannot reassign resolved tickets" : "Change assigned resolver"}
                      >
                         <option value="">-- Unassigned ({c.area}) --</option>
                         {resolvers.map(r => (
                           <option key={r._id} value={r._id}>{r.username} ({r.area})</option>
                         ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;