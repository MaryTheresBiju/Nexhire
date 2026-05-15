import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-nav">
            <div className="nav-brand">
                <Flame className="brand-icon" />
                <span>NexHire</span>
            </div>
            
            {user && (
                <>
                    <div className="nav-links">
                        {user.role === 'candidate' ? (
                            <>
                                <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Find Jobs</NavLink>
                                <NavLink to="/applications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>My Applications</NavLink>
                                <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Profile</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
                            </>
                        )}
                    </div>
                    <div className="nav-controls">
                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className="text-muted" style={{ fontWeight: 500 }}>{user.name}</span>
                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=${user.role === 'employer' ? '3b82f6' : '7c3aed'}&color=fff`} alt="Profile" />
                            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;
