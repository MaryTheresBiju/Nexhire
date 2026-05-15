import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, submitApplication, getMyApplications, getUserProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Building, CheckCircle, User, Mail, Phone, GraduationCap, Briefcase, Code, Info, FileText } from 'lucide-react';
import './JobBoard.css';

const JobBoard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [salaryFilter, setSalaryFilter] = useState('');
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        fetchData();
    }, [user.id]);

    const fetchData = async () => {
        try {
            const [jobsRes, appsRes, profileRes] = await Promise.all([
                getJobs(),
                getMyApplications(user.id),
                getUserProfile(user.id)
            ]);
            setJobs(jobsRes.data);
            setAppliedJobs(new Set(appsRes.data.map(app => app.jobId._id)));
            
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
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await submitApplication({
                jobId: selectedJob._id,
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
            setAppliedJobs(prev => new Set(prev).add(selectedJob._id));
            setSelectedJob(null);
            setFormData(prev => ({ ...prev, pitch: '' }));
        } catch (error) {
            console.error('Application failed', error);
            alert('Failed to submit application. Please check all fields.');
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesRole = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = locationFilter === '' || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
        
        let matchesSalary = true;
        if (salaryFilter !== '') {
            const jobSalaryNum = parseInt(job.salary?.toString().replace(/[^0-9]/g, ''), 10);
            const filterSalaryNum = parseInt(salaryFilter, 10);
            if (!isNaN(filterSalaryNum)) {
                if (!isNaN(jobSalaryNum)) {
                    matchesSalary = jobSalaryNum >= filterSalaryNum;
                } else {
                    matchesSalary = false; // Exclude jobs with non-numeric salaries if a specific minimum is requested
                }
            }
        }
        
        return matchesRole && matchesLocation && matchesSalary;
    });

    if (loading) return <div className="empty-state">Loading jobs...</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="gradient-text">Discover Opportunities</h1>
                <p>Find your next big role with leading companies worldwide.</p>
            </div>
            
            <div className="search-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="search-bar" style={{ marginBottom: 0 }}>
                    <Search className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by role or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="search-bar" style={{ marginBottom: 0 }}>
                    <MapPin className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Filter by location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    />
                </div>
                <div className="search-bar" style={{ marginBottom: 0 }}>
                    <span className="search-icon" style={{ fontWeight: 'bold' }}>₹</span>
                    <input 
                        type="number" 
                        placeholder="Minimum salary..."
                        value={salaryFilter}
                        onChange={(e) => setSalaryFilter(e.target.value)}
                    />
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="empty-state">
                    <Search className="mb-4" size={48} />
                    <h3>No jobs found</h3>
                </div>
            ) : (
                <div className="job-grid">
                    {filteredJobs.map(job => (
                        <div key={job._id} className="job-card glass-card">
                            <div className="job-header">
                                <div>
                                    <h3 
                                        className="job-title" 
                                        onClick={() => navigate(`/job/${job._id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {job.title}
                                    </h3>
                                    <div className="job-company">
                                         <Building size={16} /> {job.company}
                                         <span style={{ marginLeft: '1rem', color: 'var(--success)', fontWeight: 600 }}>
                                             ₹{job.salary || 'Competitive'}
                                         </span>
                                     </div>
                                </div>
                            </div>

                            <div className="job-footer">
                                <span className="job-salary">₹{job.salary || 'Competitive'}</span>
                                {appliedJobs.has(job._id) ? (
                                    <button className="btn btn-secondary btn-sm flex items-center gap-2" disabled>
                                        <CheckCircle size={16} /> Applied
                                    </button>
                                ) : (
                                    <button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => setSelectedJob(job)}
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedJob && (
                <div className="modal-overlay active">
                    <div className="modal-content glass-card" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button className="close-modal" onClick={() => setSelectedJob(null)}>&times;</button>
                        <h2 className="mb-2">Apply for <span className="text-purple">{selectedJob.title}</span></h2>
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

export default JobBoard;
