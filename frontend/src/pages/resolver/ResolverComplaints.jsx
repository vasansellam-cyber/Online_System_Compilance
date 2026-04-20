import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle } from 'lucide-react';
import '../user/UserComplaints.css'; // Reuse table styling
const API = import.meta.env.VITE_API_URL;

const ResolverComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [resolvingId, setResolvingId] = useState(null);
  const [solutionText, setSolutionText] = useState('');

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/complaints/resolver`, {
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

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openResolveModal = (id) => {
    setResolvingId(id);
    setSolutionText('');
  };

  const closeResolveModal = () => {
    setResolvingId(null);
    setSolutionText('');
  };

  const submitResolve = async (e) => {
    e.preventDefault();
    if (!solutionText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/api/complaints/${resolvingId}/status`, 
        { status: 'Resolved', solution: solutionText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionStatus('Complaint resolved successfully');
      setResolvingId(null);
      fetchComplaints();
      setTimeout(() => setActionStatus(''), 3000);
    } catch (err) {
      console.error('Error resolving complaint:', err);
      setActionStatus('Failed to update complaint');
      setResolvingId(null);
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
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Complaints Queue</h2>
        <p>Review and resolve complaints assigned to your department.</p>
      </div>
      
      {actionStatus && (
        <div className="form-status success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={18} />
          {actionStatus}
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner"></span>
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>
      ) : complaints.length === 0 ? (
        <div className="data-table-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Queue is empty. No complaints assigned to your area.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Subject & Summary</th>
                <th>Priority</th>
                <th>Submitted On</th>
                <th>Assignment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="data-row">
                  <td>
                     <div className="text-muted" style={{ fontSize: '0.85rem' }}>{c.user?.email}</div>
                  </td>
                  <td>
                    <div className="subject-cell" style={{ fontWeight: '500'}}>{c.subject}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.summary}
                    </div>
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
                    {c.assignedResolver ? (
                      <span className="badge-clean stat-progress" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Assigned to You
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Area Pool (Unassigned)</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-clean ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status !== 'Resolved' && c.status !== 'Rejected' ? (
                       <button 
                         className="btn-primary" 
                         style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                         onClick={() => openResolveModal(c._id)}
                       >
                         {!c.assignedResolver ? "Claim & Resolve" : "Resolve"}
                       </button>
                    ) : (
                       <span className="text-muted" style={{ fontSize: '0.85rem' }}>Actioned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Advanced Glassmorphism Resolution Modal Overlay */}
      {resolvingId && (
        <div 
          className="modal-backdrop animate-fade-in"
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 9999, padding: '1rem' 
          }}
        >
          <div 
            className="modal-content"
            style={{ 
              background: 'var(--bg-secondary)', padding: '2.5rem', 
              borderRadius: 'var(--radius-lg, 12px)', width: '100%', maxWidth: '540px', 
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Provide Resolution Details
              </h3>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Please describe the specific steps taken to resolve this compliance ticket. 
                <br />This response will be visible to the issuer on their dashboard.
              </p>
            </div>
            
            <form onSubmit={submitResolve}>
              <div style={{ marginBottom: '2rem' }}>
                <textarea
                  required
                  autoFocus
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="e.g., Reviewed system logs and cleared the cache. Service is fully restored..."
                  style={{ 
                    width: '100%', minHeight: '140px', padding: '1rem', 
                    borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)', 
                    background: 'var(--bg-primary)', color: 'var(--text-primary)', 
                    fontSize: '0.95rem', lineHeight: 1.5, resize: 'vertical',
                    fontFamily: 'inherit', transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--text-muted)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={closeResolveModal}
                  style={{ 
                    padding: '0.6rem 1.25rem', background: 'transparent', 
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', 
                    color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.target.style.background = 'var(--bg-tertiary)'; }}
                  onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '0.6rem 1.5rem', background: 'var(--text-primary)', 
                    border: '1px solid transparent', borderRadius: 'var(--radius-md, 8px)', 
                    color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 600,
                    transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                  onMouseOver={(e) => { e.target.style.opacity = '0.9'; }}
                  onMouseOut={(e) => { e.target.style.opacity = '1'; }}
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolverComplaints;