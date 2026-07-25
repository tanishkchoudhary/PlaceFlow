import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import StudentLayout from './layouts/StudentLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentJobs from './pages/student/Jobs';
import StudentJobDetails from './pages/student/JobDetails';
import StudentApplications from './pages/student/Applications';
import StudentNotifications from './pages/student/Notifications';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import JobCreateEdit from './pages/recruiter/JobCreateEdit';
import RecruiterApplicants from './pages/recruiter/Applicants';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Student Portal Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="jobs" element={<StudentJobs />} />
            <Route path="jobs/:id" element={<StudentJobDetails />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          {/* Recruiter Portal Routes */}
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="jobs/create" element={<JobCreateEdit />} />
            <Route path="jobs/:id/edit" element={<JobCreateEdit />} />
            <Route path="applicants" element={<RecruiterApplicants />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

