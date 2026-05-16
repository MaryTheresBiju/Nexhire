import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Building, Briefcase, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('candidate');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companyType: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const signupData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role
            };

            if (role === 'employer') {
                signupData.companyName = formData.companyName;
                signupData.companyType = formData.companyType;
            }

            await signup(signupData);
            navigate('/login');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to sign up';
            setError(message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <h2 className="gradient-text">Create Account</h2>
                    <p>Join NexHire and discover opportunities.</p>
                </div>
                
                <div className="role-toggle">
                    <button 
                        className={`role-btn ${role === 'candidate' ? 'active' : ''}`} 
                        onClick={() => setRole('candidate')}
                        type="button"
                    >
                        Candidate
                    </button>
                    <button 
                        className={`role-btn ${role === 'employer' ? 'active' : ''}`} 
                        onClick={() => setRole('employer')}
                        type="button"
                    >
                        Employer
                    </button>
                </div>

                {error && <div className="text-danger mb-4 text-center">{error}</div>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    {role === 'candidate' && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-icon-wrapper">
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                                <User className="input-icon" size={18} />
                            </div>
                        </div>
                    )}

                    {role === 'employer' && (
                        <>
                            <div className="form-group">
                                <label>Representative Name</label>
                                <div className="input-icon-wrapper">
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                                    <User className="input-icon" size={18} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Company Name</label>
                                <div className="input-icon-wrapper">
                                    <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} />
                                    <Building className="input-icon" size={18} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>What kind of company is that?</label>
                                <div className="input-icon-wrapper">
                                    <input type="text" name="companyType" required value={formData.companyType} onChange={handleChange} />
                                    <Briefcase className="input-icon" size={18} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>{role === 'employer' ? 'Company Email' : 'Email'}</label>
                        <div className="input-icon-wrapper">
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                            <Mail className="input-icon" size={18} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon-wrapper">
                            <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} />
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
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-icon-wrapper">
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} />
                            <Lock className="input-icon" size={18} />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Sign Up</button>
                </form>
                <div className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
