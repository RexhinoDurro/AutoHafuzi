import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CarHolder from './pages/CarHolder';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import CarForm from './components/CarForm/CarForm';
import CarDetail from './pages/CarDetail';
import OptionsPage from './pages/OptionsPage';
import ColorManagementPage from './pages/ColorManagementPage';
import UpholsteryManagementPage from './pages/UpholsteryManagementPage';
import { getStoredAuth } from './utils/auth';
import Footer from './components/Footer';
import AboutPage from './pages/About';
import FavoritesPage from './pages/FavouritesPage';
import { FavoritesProvider } from './context/FavouritesContext';
import ContactPage from './pages/Contact';
import ContactMessages from './components/ContactMessages';
import MakesPage from './pages/MakesPage';
import ModelsPage from './pages/ModelsPage';
import VariantsPage from './pages/VariantsPage';

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
      <FavoritesProvider>
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
            
            {/* Favorites Page Route */}
            <Route
              path="/favorites"
              element={
                <>
                  <Navbar />
                  <FavoritesPage />
                  <Footer/>
                </>
              }
            />
            
            {/* Contact Page Route */}
            <Route
              path="/contact"
              element={
                <>
                  <Navbar />
                  <ContactPage />
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
                  <AdminDashboard>
                    <CarForm />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth/edit-car/:id"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <CarForm />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />
            
            {/* Options page route */}
            <Route
              path="/options"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <OptionsPage />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />

            {/* Colors page route */}
            <Route
              path="/exterior-colors"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <ColorManagementPage />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />
            
            {/* Upholstery management route */}
            <Route
              path="/upholstery-management"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <UpholsteryManagementPage />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />

            {/* Admin Contact Messages Route */}
            <Route
              path="/auth/contact-messages"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <ContactMessages />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />
            
            {/* Make, Model, Variant Management Routes */}
            <Route
              path="/auth/makes"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <MakesPage />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth/makes/:makeId/models"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <ModelsPage />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/auth/makes/:makeId/models/:modelId/variants"
              element={
                <ProtectedRoute>
                  <AdminDashboard>
                    <VariantsPage />
                  </AdminDashboard>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </FavoritesProvider>
    </Router>
  );
}

export default App;