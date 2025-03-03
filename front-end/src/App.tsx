// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CarForm from './components/CarForm/CarForm';
import CarDetail from './pages/CarDetail';  // Add this import
import { getStoredAuth } from './utils/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = getStoredAuth();
  
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          
          {/* Add CarDetail route */}
          <Route
            path="/car/:id"
            element={
              <>
                <Navbar />
                <CarDetail />
              </>
            }
          />
          
          {/* Admin routes */}
          <Route path="/auth/login" element={<AdminLogin />} />
          <Route
            path="/auth/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/add-car"
            element={
              <ProtectedRoute>
                <CarForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/edit-car/:id"
            element={
              <ProtectedRoute>
                <CarForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;