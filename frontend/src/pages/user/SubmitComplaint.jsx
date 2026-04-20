import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import './SubmitComplaint.css';
const API = import.meta.env.VITE_API_URL;

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    subject: '',
    summary: '',
    priority: 'Medium',
    area: 'IT'
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/complaints`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setStatus({ type: 'success', message: 'Data transmitted successfully!' });
      setFormData({ subject: '', summary: '', priority: 'Medium', area: 'IT' });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to transmit data. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-view animate-fade-in form-container">
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Submit Complaint</h2>
        <p>Log a new compliance request into the system.</p>
      </div>

      <div className="enterprise-card">
        <div className="enterprise-card-header">
          <Send size={20} style={{ color: 'var(--brand-primary)' }} />
          <h3>New Request Form</h3>
        </div>
        
        <div className="enterprise-card-body">
          {status.message && (
            <div className={`form-status ${status.type}`}>
              {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label" htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="input-field"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief title of your issue"
              />
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="priority">Priority Level</label>
              <select
                id="priority"
                name="priority"
                className="input-field"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low - Minor Issue</option>
                <option value="Medium">Medium - Standard Issue</option>
                <option value="High">High - Critical Issue</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="area">Target Area / Department</label>
              <select
                id="area"
                name="area"
                className="input-field"
                value={formData.area}
                onChange={handleChange}
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="summary">Detailed Summary</label>
              <textarea
                id="summary"
                name="summary"
                className="input-field textarea-field"
                value={formData.summary}
                onChange={handleChange}
                required
                placeholder="Elaborate on the issue specifics..."
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" style={{width: '18px', height: '18px', borderWidth: '2px'}}></span> : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;