import React, { useState, useEffect } from 'react';
import { getJobsByEmployer, postJob, getJobApplications, updateApplicationStatus, deleteJob } from '../api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, Plus, Mail, Phone, FileText, Trash2, Eye, ArrowLeft } from 'lucide-react';
import './Lists.css';

const EmployerDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [jobApplications, setJobApplications] = useState({});
    const [showPostModal, setShowPostModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewingJobId, setViewingJobId] = useState(null);

    const [newJob, setNewJob] = useState({
        title: '',
        location: '',
        salary: '',
        requirements: '',
        qualifications: '',
        experience: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, [user.id]);

    const fetchData = async () => {
        try {
            const jobsRes = await getJobsByEmployer(user.id);
            setJobs(jobsRes.data);
            
            const appsMap = {};
            for (let job of jobsRes.data) {
                const appsRes = await getJobApplications(job._id);
                appsMap[job._id] = appsRes.data;
            }
            setJobApplications(appsMap);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            await postJob({
                ...newJob,
                employerId: user.id,
                company: user.companyName || 'TechFlow',
                requirements: newJob.requirements.split(',').map(s => s.trim()),
                qualifications: newJob.qualifications.split(',').map(s => s.trim()),
                experience: newJob.experience
            });
            setShowPostModal(false);
            setNewJob({ title: '', location: '', salary: '', requirements: '', qualifications: '', experience: '', description: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to post job', error);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job posting?")) return;
        try {
            await deleteJob(jobId);
            setJobs(jobs.filter(j => j._id !== jobId));
            const newJobApps = {...jobApplications};
            delete newJobApps[jobId];
            setJobApplications(newJobApps);
            if (viewingJobId === jobId) setViewingJobId(null);
        } catch (error) {
            console.error('Failed to delete job', error);
        }
    };

    const handleStatusUpdate = async (appId, jobId, status) => {
        try {
            await updateApplicationStatus(appId, status);
            setJobApplications(prev => {
                const updated = { ...prev };
                updated[jobId] = updated[jobId].map(app => 
                    app._id === appId ? { ...app, status } : app
                );
                return updated;
            });
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    if (loading) return <div className="empty-state">Loading dashboard...</div>;

    const totalActiveJobs = jobs.length;
    const totalApps = Object.values(jobApplications).flat().length;

    return (
        <div>
            <div className="page-header">
                <h1 className="gradient-text">Employer Dashboard</h1>
                <p>Manage your job postings and review candidates.</p>
                <button className="btn btn-primary mt-4" onClick={() => setShowPostModal(true)}>
                    <Plus size={20} /> Post New Job
                </button>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card glass-card">
                    <div className="stat-icon text-purple"><Briefcase size={32} /></div>
                    <div className="stat-info">
                        <h3>Active Jobs</h3>
                        <span>{totalActiveJobs}</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon text-blue"><Users size={32} /></div>
                    <div className="stat-info">
                        <h3>Total Applications</h3>
                        <span>{totalApps}</span>
                    </div>
                </div>
            </div>

            <div className="list-container mt-8">
                {viewingJobId ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <button className="btn btn-secondary btn-sm" onClick={() => setViewingJobId(null)}>
                                <ArrowLeft size={16} /> Back to Jobs
                            </button>
                            <h2 style={{ margin: 0 }}>Applicants for <span className="text-purple">{jobs.find(j => j._id === viewingJobId)?.title}</span></h2>
                        </div>
                        {(() => {
                            const apps = jobApplications[viewingJobId] || [];
                            if (apps.length === 0) {
                                return (
                                    <div className="empty-state">
                                        <Users className="mb-4" size={48} />
                                        <h3>No applicants yet</h3>
                                    </div>
                                );
                            }
                            return apps.map(app => (
                                <div key={app._id} className="applicant-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem' }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{app.candidateName}</div>
                                            <div className="flex flex-wrap gap-4 text-light" style={{ fontSize: '0.85rem' }}>
                                                <span className="flex items-center gap-1"><Mail size={14} /> {app.email}</span>
                                                <span className="flex items-center gap-1"><Phone size={14} /> {app.phone}</span>
                                            </div>
                                        </div>
                                        <div className={`status-badge status-${app.status}`}>
                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </div>
                                    </div>

                                    <div className="grid-2 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            <div className="text-purple" style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Qualification</div>
                                            <div>{app.qualification}</div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            <div className="text-purple" style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Experience</div>
                                            <div>{app.experience}</div>
                                        </div>
                                    </div>

                                    <div className="mb-4" style={{ fontSize: '0.9rem' }}>
                                        <div className="text-purple" style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Skills</div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {app.skills?.map((skill, i) => (
                                                <span key={i} className="badge badge-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4" style={{ fontSize: '0.9rem' }}>
                                        <div className="text-purple" style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Candidate Info</div>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', opacity: 0.9 }}>{app.pitch}</div>
                                    </div>

                                    <div className="flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                        <div className="flex gap-2">
                                            {app.resumeUrl ? (
                                                <a 
                                                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${app.resumeUrl}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary btn-sm flex items-center gap-2"
                                                >
                                                    <FileText size={14} /> View Resume
                                                </a>
                                            ) : (
                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>No resume</span>
                                            )}
                                            
                                            <a 
                                                href={`mailto:${app.email}?subject=Update regarding your application for ${jobs.find(j => j._id === viewingJobId)?.title}`}
                                                className="btn btn-secondary btn-sm flex items-center gap-2"
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                                            >
                                                <Mail size={14} /> Email Candidate
                                            </a>
                                        </div>
                                        <div className="flex gap-2">
                                            {app.status === 'applied' || app.status === 'reviewing' ? (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(app._id, viewingJobId, 'shortlisted')}>Shortlist</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(app._id, viewingJobId, 'rejected')}>Reject</button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="btn btn-secondary btn-sm" 
                                                    onClick={() => handleStatusUpdate(app._id, viewingJobId, 'reviewing')}
                                                >
                                                    Move to Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                ) : (
                    <div>
                        <h2 className="mb-4">Your Job Postings</h2>
                        {jobs.length === 0 ? (
                            <div className="empty-state">
                                <Briefcase className="mb-4" size={48} />
                                <h3>No jobs posted yet</h3>
                            </div>
                        ) : (
                            jobs.map(job => {
                                const apps = jobApplications[job._id] || [];
                                const pendingApps = apps.filter(a => a.status === 'applied' || a.status === 'reviewing');
                                
                                return (
                                    <div key={job._id} className="list-item">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{job.title}</h3>
                                                <div className="text-light" style={{ fontSize: '0.9rem' }}>
                                                    Posted {new Date(job.createdAt).toLocaleDateString()} • ₹{job.salary || 'Competitive'}
                                                </div>
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-purple">
                                                        {apps.length} Applicants
                                                    </span>
                                                    {pendingApps.length > 0 && (
                                                        <span style={{ fontSize: '0.8rem', marginLeft: '10px' }} className="text-warning">
                                                            ({pendingApps.length} Needs Review)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-col" style={{ alignItems: 'flex-end' }}>
                                                <button className="btn btn-secondary btn-sm flex items-center gap-2" onClick={() => setViewingJobId(job._id)}>
                                                    <Eye size={16} /> View Applicants
                                                </button>
                                                <button className="btn btn-danger btn-sm flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={() => handleDeleteJob(job._id)}>
                                                    <Trash2 size={16} /> Delete Job
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {showPostModal && (
                <div className="modal-overlay active">
                    <div className="modal-content glass-card">
                        <button className="close-modal" onClick={() => setShowPostModal(false)}>&times;</button>
                        <h2 className="mb-4 gradient-text">Post a New Role</h2>
                        <form onSubmit={handlePostJob}>
                            <div className="form-group">
                                <label>Job Title</label>
                                <input type="text" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Salary Range (₹)</label>
                                    <input type="text" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Requirements (comma separated)</label>
                                <input type="text" required value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Qualifications (comma separated)</label>
                                <input type="text" required value={newJob.qualifications} onChange={e => setNewJob({...newJob, qualifications: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Experience Level</label>
                                <input type="text" required value={newJob.experience} onChange={e => setNewJob({...newJob, experience: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="4" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full mt-4">Publish Job</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerDashboard;
