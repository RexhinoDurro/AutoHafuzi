import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CarHolder from './pages/CarHolder';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CarForm from './components/CarForm/CarForm';
import CarDetail from './pages/CarDetail';
import OptionsPage from './pages/OptionsPage'; // Import the new OptionsPage component
import ColorManagementPage from './pages/ColorManagementPage';
import { getStoredAuth } from './utils/auth';
import Footer from './components/Footer';
import AboutPage from './pages/About';

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
                <Footer/>
              </>
            }
          />
          
          <Route
            path="/cars"
            element={
              <>
                <Navbar />
                <CarHolder />
                <Footer/>
              </>
            }
          />
          
          <Route
            path="/car/:id"
            element={
              <>
                <Navbar />
                <CarDetail />
                <Footer/>
              </>
            }
          />
          
          <Route
            path="/about/"
            element={
              <>
                <Navbar />
                <AboutPage />
                <Footer/>
              </>
            }
          />
          
          {/* Auth routes */}
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
          
          {/* New Options page route */}
          <Route
            path="/options"
            element={
              <ProtectedRoute>
                <OptionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exterior-colors"
            element={
              <ProtectedRoute>
                <ColorManagementPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;