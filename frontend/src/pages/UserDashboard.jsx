import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Bell, 
  LogOut, 
  Menu,
  X,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState({ email: '', role: '', username: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Theme state logic
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Apply theme on mount and switch
    if (isDarkTheme) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userData && !token) {
        navigate('/login');
        return;
      }
      
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser({ email: 'user@example.com', role: 'user', username: 'DemoUser' });
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = response.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    loadUser();
    fetchNotifications();
    
    // Listen for custom storage events to update avatar instantly when changed in Settings
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/user-dashboard':
        return 'Dashboard';
      case '/user-dashboard/complaints':
        return 'My Complaints';
      case '/user-dashboard/submit-complaint':
        return 'Submit New Complaint';
      case '/user-dashboard/notifications':
        return 'Notifications';
      case '/user-dashboard/settings':
        return 'Settings';
      default:
        return 'Compliance Portal';
    }
  };

  if (!user.email) return <div className="loading-screen"><span className="spinner"></span></div>;

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="logo">
          <div className="logo-icon"><LayoutDashboard size={20} /></div>
          <span>Compliance Portal</span>
        </div>
        <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-box">
            <LayoutDashboard size={24} color="#ffffff" strokeWidth={2} />
          </div>
          <h2>Compliance Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/user-dashboard" end className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeMobileMenu}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-dashboard/complaints" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeMobileMenu}>
                <FileText size={20} />
                <span>Complaints</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-dashboard/submit-complaint" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeMobileMenu}>
                <FileText size={20} />
                <span>Submit Complaint</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-dashboard/notifications" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeMobileMenu}>
                <Bell size={20} />
                <span>Notifications</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-dashboard/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={closeMobileMenu}>
                <Settings size={20} />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user.username || 'User'}</span>
              <span className="user-email">{user.email || 'user@example.com'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={closeMobileMenu}></div>}

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-navbar">
          <div className="page-title">
            <h3>{getPageTitle()}</h3>
            <p className="text-muted">Manage your compliance requests seamlessly.</p>
          </div>
          <div className="nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="icon-btn" 
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              title="Toggle Theme"
            >
              {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn" onClick={() => navigate('/user-dashboard/notifications')}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
          </div>
        </header>
        
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
