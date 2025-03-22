import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FavoritesProvider } from './context/FavouritesContext';
import { getStoredAuth } from './utils/auth';

// Core components that are used on most pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Implement a loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy load all page components
const Home = lazy(() => import('./pages/Home'));
const CarHolder = lazy(() => import('./pages/CarHolder'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const AboutPage = lazy(() => import('./pages/About'));
const FavoritesPage = lazy(() => import('./pages/FavouritesPage'));
const ContactPage = lazy(() => import('./pages/Contact'));

// Admin components
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CarForm = lazy(() => import('./components/CarForm/CarForm'));
const OptionsPage = lazy(() => import('./pages/OptionsPage'));
const ColorManagementPage = lazy(() => import('./pages/ColorManagementPage'));
const UpholsteryManagementPage = lazy(() => import('./pages/UpholsteryManagementPage'));
const ContactMessages = lazy(() => import('./components/ContactMessages'));
const MakesPage = lazy(() => import('./pages/MakesPage'));
const ModelsPage = lazy(() => import('./pages/ModelsPage'));
const VariantsPage = lazy(() => import('./pages/VariantsPage'));

// Create a layout component to reduce repetition
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </>
);


interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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
        <Routes>
          {/* Public routes with MainLayout */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          
          <Route
            path="/cars"
            element={
              <MainLayout>
                <CarHolder />
              </MainLayout>
            }
          />
          
          <Route
            path="/car/:id"
            element={
              <MainLayout>
                <CarDetail />
              </MainLayout>
            }
          />
          
          <Route
            path="/about/"
            element={
              <MainLayout>
                <AboutPage />
              </MainLayout>
            }
          />
          
          <Route
            path="/favorites"
            element={
              <MainLayout>
                <FavoritesPage />
              </MainLayout>
            }
          />
          
          <Route
            path="/contact"
            element={
              <MainLayout>
                <ContactPage />
              </MainLayout>
            }
          />
          
          {/* Auth routes */}
          <Route 
            path="/auth" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminLogin />
              </Suspense>
            } 
          />

          <Route
            path="/auth/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Admin routes using the AdminDashboard as layout */}
          <Route
            path="/auth/add-car"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <CarForm />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auth/edit-car/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <CarForm />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/options"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <OptionsPage />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exterior-colors"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <ColorManagementPage />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/upholstery-management"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <UpholsteryManagementPage />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auth/contact-messages"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <ContactMessages />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/auth/makes"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <MakesPage />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/auth/makes/:makeId/models"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <ModelsPage />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/auth/makes/:makeId/models/:modelId/variants"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard>
                    <VariantsPage />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </FavoritesProvider>
    </Router>
  );
}

export default App;