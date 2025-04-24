import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import TestConnection from './pages/TestConnection';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();
    
    // Show loading indicator or return null while checking authentication
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }
    
    // Only redirect if we're sure the user is not authenticated (after loading is complete)
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

const DefaultRoute = () => {
    const { user, isAuthenticated, loading } = useAuth();

    // Show loading indicator while checking authentication
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }
    
    // Only redirect if we're sure the user is not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    switch (user.role) {
        case 'manager':
        case 'admin':
            return <Navigate to="/manager-dashboard" />;
        case 'employee':
            return <Navigate to="/employee-dashboard" />;
        default:
            return <Navigate to="/login" />;
    }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/" element={<DefaultRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test-connection" element={<TestConnection />} />
            <Route
              path="/manager-dashboard/*"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <ManagerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-dashboard/*"
              element={
                <PrivateRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
