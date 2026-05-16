import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'employer') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to login';
            setError(message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <h2 className="gradient-text">Welcome Back</h2>
                    <p>Log in to access your NexHire account.</p>
                </div>
                {error && <div className="text-danger mb-4 text-center">{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-icon-wrapper">
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                            <Mail className="input-icon" size={18} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon-wrapper">
                            <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} />
                            <Lock className="input-icon" size={18} />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Log In</button>
                </form>
                <div className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
