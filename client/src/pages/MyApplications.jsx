import React, { useState, useEffect } from 'react';
import { getMyApplications } from '../api';
import { useAuth } from '../context/AuthContext';
import { FileText } from 'lucide-react';
import './Lists.css';

const MyApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await getMyApplications(user.id);
                setApplications(res.data);
            } catch (error) {
                console.error('Failed to fetch applications', error);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, [user.id]);

    if (loading) return <div className="empty-state">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="gradient-text">Application Tracking</h1>
                <p>Monitor the status of your applications in real-time.</p>
            </div>

            {applications.length === 0 ? (
                <div className="empty-state">
                    <FileText className="mb-4" size={48} />
                    <h3>No applications yet</h3>
                    <p>Start applying to jobs to track them here.</p>
                </div>
            ) : (
                <div className="list-container">
                    {applications.map(app => (
                        <div key={app._id} className="list-item">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                                        {app.jobId ? app.jobId.title : 'Deleted Job'}
                                    </h3>
                                    <div className="text-light" style={{ fontSize: '0.9rem' }}>
                                        {app.jobId ? app.jobId.company : ''} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`status-badge status-${app.status}`}>
                                    {app.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
