import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserComplaints.css';

const UserComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/complaints', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaints(response.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

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
      <div className="dashboard-header">
        <h2>My Complaints</h2>
        <p>Track the status of your submitted complaints.</p>
      </div>
      
      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner"></span>
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>
      ) : complaints.length === 0 ? (
        <div className="data-table-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          You have no complaints right now.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Priority</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="data-row">
                  <td>
                    <div className="subject-cell" style={{ fontWeight: 500 }}>{c.subject}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.summary}
                    </div>
                    {c.status === 'Resolved' && c.solution && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-main)', borderLeft: '3px solid #10b981', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong style={{ display: 'block', color: '#10b981', marginBottom: '0.25rem' }}>Resolution Context:</strong>
                        {c.solution}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge-clean ${getPriorityClass(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge-clean ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.assignedResolver ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        {c.status === 'Resolved' ? 'Resolved by: ' : 'Assigned: '} 
                        <strong>{c.assignedResolver.username}</strong>
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Unassigned ({c.area})</span>
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

export default UserComplaints;
