import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import JobBoard from './pages/JobBoard';
import EmployerDashboard from './pages/EmployerDashboard';
import MyApplications from './pages/MyApplications';
import JobDetails from './pages/JobDetails';
import CandidateProfile from './pages/CandidateProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './index.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'employer' ? '/dashboard' : '/'} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'employer' ? '/dashboard' : '/'} replace />;
  }
  return children;
};

const AppContent = () => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute allowedRole="candidate">
              <JobBoard />
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute allowedRole="candidate">
              <MyApplications />
            </ProtectedRoute>
          } />
          <Route path="/job/:id" element={
            <ProtectedRoute allowedRole="candidate">
              <JobDetails />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateProfile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
