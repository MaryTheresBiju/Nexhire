import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, submitApplication, getMyApplications, getUserProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Building, ArrowLeft, CheckCircle, User, Mail, Phone, GraduationCap, Briefcase, Code, Info, FileText } from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    
    // Application Form State
    const [formData, setFormData] = useState({
        name: user.name,
        email: '',
        phone: '',
        qualification: '',
        experience: '',
        skills: '',
        pitch: '',
        resumeUrl: ''
    });

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                const [jobRes, appsRes, profileRes] = await Promise.all([
                    getJobById(id),
                    getMyApplications(user.id),
                    getUserProfile(user.id)
                ]);
                setJob(jobRes.data);
                setApplied(appsRes.data.some(app => app.jobId._id === id));
                
                // Pre-fill from profile
                if (profileRes.data) {
                    setFormData(prev => ({
                        ...prev,
                        email: profileRes.data.email,
                        skills: profileRes.data.skills?.join(', ') || '',
                        resumeUrl: profileRes.data.resumeUrl || ''
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch job details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobData();
    }, [id, user.id]);

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await submitApplication({
                jobId: job._id,
                candidateId: user.id,
                candidateName: formData.name,
                email: formData.email,
                phone: formData.phone,
                qualification: formData.qualification,
                experience: formData.experience,
                skills: formData.skills.split(',').map(s => s.trim()),
                resumeUrl: formData.resumeUrl,
                pitch: formData.pitch
            });
            setApplied(true);
            setShowApplyModal(false);
        } catch (error) {
            console.error('Application failed', error);
            alert('Failed to submit application. Please check all fields.');
        }
    };

    if (loading) return <div className="empty-state">Loading job details...</div>;
    if (!job) return <div className="empty-state">Job not found.</div>;

    return (
        <div className="container mt-8" style={{ maxWidth: '900px' }}>
            <button className="btn btn-secondary mb-6 flex items-center gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> Back to Jobs
            </button>

            <div className="glass-card p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="gradient-text mb-2" style={{ fontSize: '2.5rem' }}>{job.title}</h1>
                        <div className="flex items-center gap-4 text-light">
                            <span className="flex items-center gap-1"><Building size={18} /> {job.company}</span>
                            <span className="flex items-center gap-1"><MapPin size={18} /> {job.location}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{job.salary || 'Competitive'}</div>
                        <div className="text-light" style={{ fontSize: '0.9rem' }}>Posted {new Date(job.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>

                <div className="job-meta-grid mb-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 className="mb-3 text-purple">Experience Level</h3>
                        <p>{job.experience || 'Not specified'}</p>
                    </div>
                    <div>
                        <h3 className="mb-3 text-purple">Qualifications</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.qualifications?.length > 0 ? (
                                job.qualifications.map((qual, i) => (
                                    <span key={i} className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{qual}</span>
                                ))
                            ) : 'Not specified'}
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="mb-3 text-purple">Key Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                        {job.requirements?.map((req, i) => (
                            <span key={i} className="badge">{req}</span>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="mb-3 text-purple">Job Description</h3>
                    <div className="text-light" style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                        {job.description}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    {applied ? (
                        <button className="btn btn-secondary btn-lg flex items-center gap-2" style={{ padding: '1rem 3rem' }} disabled>
                            <CheckCircle size={20} /> You've Applied for this Role
                        </button>
                    ) : (
                        <button className="btn btn-primary btn-lg" style={{ padding: '1rem 4rem' }} onClick={() => setShowApplyModal(true)}>
                            Apply Now
                        </button>
                    )}
                </div>
            </div>

            {showApplyModal && (
                <div className="modal-overlay active">
                    <div className="modal-content glass-card" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button className="close-modal" onClick={() => setShowApplyModal(false)}>&times;</button>
                        <h2 className="mb-2">Apply for <span className="text-purple">{job.title}</span></h2>
                        <p className="text-muted mb-6">Complete your application details below.</p>
                        
                        <form onSubmit={handleApply} className="apply-form">
                            <div className="grid-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label><User size={16} /> Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Mail size={16} /> Gmail / Email</label>
                                    <input 
                                        type="email" 
                                        required 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label><Phone size={16} /> Phone Number</label>
                                    <input 
                                        type="tel" 
                                        required 
                                        placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><GraduationCap size={16} /> Qualification</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. B.Tech Computer Science"
                                        value={formData.qualification}
                                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label><Briefcase size={16} /> Experience</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. 2 Years in Web Development"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Code size={16} /> Skills</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="React, Node.js, CSS (comma separated)"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label><Info size={16} /> Small Candidate Info / Cover Letter</label>
                                <textarea 
                                    rows="4" 
                                    required 
                                    placeholder="Briefly explain why you're a good fit for this role..."
                                    value={formData.pitch}
                                    onChange={(e) => setFormData({...formData, pitch: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="resume-attachment-notice glass-card p-4 mb-6" style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-purple" size={20} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Resume Attachment</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                                {formData.resumeUrl ? '✅ Profile resume will be attached automatically' : '⚠️ No resume found in profile. Please update your profile first.'}
                                            </div>
                                        </div>
                                    </div>
                                    {formData.resumeUrl && (
                                        <div className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>Attached</div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full py-3" style={{ fontSize: '1.1rem' }}>
                                Submit Application
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .apply-form .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: rgba(255,255,255,0.8);
                }
                .apply-form input, .apply-form textarea {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 0.8rem;
                    color: white;
                    width: 100%;
                }
                .apply-form input:focus, .apply-form textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(255,255,255,0.08);
                }
            `}} />
        </div>
    );
};

export default JobDetails;
