import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, Code, FileText, Upload, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import './Lists.css'; // Reusing some base styles

const CandidateProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        bio: '',
        skills: [],
        resumeUrl: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users/${user.id}`);
            setProfile(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load profile' });
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put(`http://localhost:5000/api/users/${user.id}`, {
                name: profile.name,
                bio: profile.bio,
                skills: profile.skills
            });
            setProfile(res.data);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/users/${user.id}/resume`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile({ ...profile, resumeUrl: res.data.resumeUrl });
            setMessage({ type: 'success', text: 'Resume uploaded successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload resume' });
        } finally {
            setUploading(false);
        }
    };

    const addSkill = () => {
        if (skillInput && !profile.skills.includes(skillInput)) {
            setProfile({ ...profile, skills: [...profile.skills, skillInput] });
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setProfile({
            ...profile,
            skills: profile.skills.filter(skill => skill !== skillToRemove)
        });
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '0', overflow: 'hidden' }}>
                {/* Profile Header */}
                <div className="profile-hero" style={{ 
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2))', 
                    padding: '3rem 2.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div className="profile-avatar-large">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${profile.name}&background=7c3aed&color=fff&size=128`} 
                                alt={profile.name}
                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                            />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{profile.name}</h1>
                            <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.2rem' }}>{profile.email}</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
                        >
                            <User size={18} /> Edit Profile
                        </button>
                    )}
                </div>

                <div style={{ padding: '2.5rem' }}>
                    {message.text && (
                        <div className={`alert alert-${message.type}`} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Personal Information</h2>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label><User size={16} /> Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Mail size={16} /> Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        value={profile.email}
                                        disabled
                                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><Briefcase size={16} /> Professional Bio</label>
                                <textarea 
                                    className="form-control"
                                    rows="4"
                                    placeholder="Tell employers about yourself..."
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label><Code size={16} /> Skills</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="Add a skill (e.g. React, Node.js)"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    />
                                    <button type="button" onClick={addSkill} className="btn btn-secondary">Add</button>
                                </div>
                                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {profile.skills.map(skill => (
                                        <span key={skill} className="skill-tag">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)}>&times;</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-display">
                            <section className="mb-8">
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Info size={22} /> About Me
                                </h3>
                                <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ lineHeight: '1.7', fontSize: '1.05rem', margin: 0, opacity: 0.9, whiteSpace: 'pre-line' }}>
                                        {profile.bio || "No bio added yet. Click 'Edit Profile' to tell employers about yourself."}
                                    </p>
                                </div>
                            </section>

                            <section className="mb-8">
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Code size={22} /> Core Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.length > 0 ? (
                                        profile.skills.map(skill => (
                                            <span key={skill} className="badge" style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-muted">No skills listed yet.</p>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={22} /> Resume / CV
                                </h3>
                                {profile.resumeUrl ? (
                                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                            <div className="icon-circle" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                                <FileText size={24} className="text-success" />
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Resume Attached</p>
                                                <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: 0 }}>Your professional resume is ready for applications.</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <a 
                                                href={`http://localhost:5000${profile.resumeUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                            >
                                                View Resume
                                            </a>
                                            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                                                {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Update Resume'}
                                                <input type="file" hidden onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder" style={{ 
                                        border: '2px dashed rgba(255,255,255,0.1)', 
                                        borderRadius: '16px', 
                                        padding: '3rem', 
                                        textAlign: 'center',
                                        background: 'rgba(255,255,255,0.02)'
                                    }}>
                                        <Upload size={40} className="text-muted" style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No resume uploaded</p>
                                        <p className="text-muted mb-4">Upload your CV to stand out to employers and apply for jobs instantly.</p>
                                        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                            {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Upload My Resume'}
                                            <input type="file" hidden onChange={handleResumeUpload} accept=".pdf,.doc,.docx" />
                                        </label>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .profile-avatar-large {
                    position: relative;
                    padding: 4px;
                    background: linear-gradient(135deg, var(--primary), #ec4899);
                    border-radius: 50%;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.8);
                }
                .skill-tag {
                    background: rgba(124, 58, 237, 0.15);
                    color: #a78bfa;
                    padding: 0.4rem 0.8rem;
                    border-radius: 99px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1px solid rgba(124, 58, 237, 0.3);
                }
                .skill-tag button {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    font-size: 1.1rem;
                    line-height: 1;
                    padding: 0;
                    margin-left: 0.2rem;
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 600px) {
                    .grid-2 { grid-template-columns: 1fr; }
                }
                .icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(124, 58, 237, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .divider {
                    height: 1px;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
                }
            `}} />
        </div>
    );
};

export default CandidateProfile;
