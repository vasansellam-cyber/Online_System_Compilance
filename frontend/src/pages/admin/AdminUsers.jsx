import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, ShieldAlert, Check, X } from 'lucide-react';
import '../user/UserComplaints.css'; // Reuse table stylings
const API = import.meta.env.VITE_API_URL;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/api/admin/users/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); // refresh data
    } catch (err) {
      console.error('Error toggling user block status:', err);
      alert('Failed to update user status');
    }
  };

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2>User Management</h2>
        <p>Review standard accounts, resolvers, and block appeals.</p>
      </div>
      
      {loading ? (
        <div className="dashboard-loading">
          <span className="spinner"></span>
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div>
      ) : (
        <div className="data-table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Status</th>
                <th>Unblock Request</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="data-row">
                  <td>
                    <div className="subject-cell" style={{ fontWeight: 500 }}>{u.username}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className="badge-clean stat-progress" style={{ textTransform: 'capitalize' }}>
                      {u.role} {u.area && `(${u.area})`}
                    </span>
                  </td>
                  <td>
                    {u.isBlocked ? (
                      <span className="badge-clean stat-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldAlert size={14} /> Blocked
                      </span>
                    ) : (
                      <span className="badge-clean stat-resolved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={14} /> Active
                      </span>
                    )}
                  </td>
                  <td>
                    {u.unblockRequestMessage ? (
                      <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: '#fef2f2', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid #fecaca' }} title={u.unblockRequestMessage}>
                        {u.unblockRequestMessage}
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>-</span>
                    )}
                  </td>
                  <td>
                    {u.isBlocked ? (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => toggleBlock(u._id, u.isBlocked)}
                      >
                        <Check size={14} /> Unblock
                      </button>
                    ) : (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to block ${u.username}?`)) {
                            toggleBlock(u._id, u.isBlocked);
                          }
                        }}
                      >
                        <X size={14} /> Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No users found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;