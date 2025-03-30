import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FavoritesProvider } from './context/FavouritesContext';
import { getStoredAuth } from './utils/auth';

// Core components that are used on most pages - eagerly loaded
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Home/About page eagerly for better SEO on the main page
import Home from './pages/About'; // About page content becomes main Home page

// Implement a better loading component with semantic content
const LoadingSpinner = ({ pageName = 'Page' }) => (
  <div className="flex flex-col justify-center items-center min-h-screen">
    <h1 className="text-2xl font-bold mb-4">Loading {pageName}...</h1>
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
    <noscript>
      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-400">
        <h2 className="text-xl font-semibold">JavaScript Required</h2>
        <p>Please enable JavaScript to view Auto Hafuzi website content.</p>
      </div>
    </noscript>
  </div>
);

// Preload critical routes
const preloadRoutes = () => {
  // Start preloading the most common routes
  import('./pages/Home'); // Original Home page now serves as CarSearch
  import('./pages/CarHolder');
  import('./pages/CarDetail');
};

// Lazy load all page components (except Home which is loaded eagerly)
const CarSearch = lazy(() => import('./pages/Home')); // Original Home page renamed to CarSearch
const CarHolder = lazy(() => import('./pages/CarHolder'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const FavoritesPage = lazy(() => import('./pages/FavouritesPage'));
const ContactPage = lazy(() => import('./pages/Contact'));
const PrivatesiaPage = lazy(() => import('./pages/Privatesia')); // Privacy Policy page
const KushtetPage = lazy(() => import('./pages/Kushtet')); // Terms of Service page

// Admin components - load these last as they are less frequently used
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
const NotFound = lazy(() => import('./pages/NotFound'));

// Create a layout component to reduce repetition
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  pageName?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, pageName = 'Page' }) => (
  <>
    <Navbar />
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner pageName={pageName} />}>
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
  // Set global metadata for SEO
  useEffect(() => {
    // Set default title as fallback
    if (!document.title) {
      document.title = "Auto Hafuzi - Automjete Premium në Shqipëri";
    }
    
    // Check if meta description exists, if not create one
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', 'Auto Hafuzi ofron makina premium në Shqipëri, përfshirë Mercedes, BMW, Audi dhe më shumë, që nga viti 2010. Vizitoni sallonin tonë në Fushë-Kruje.');
      document.head.appendChild(metaDescription);
    }
    
    // Start preloading critical routes when the app loads
    preloadRoutes();
  }, []);

  return (
    <Router>
      <FavoritesProvider>
        <Routes>
          {/* Home route - eagerly loaded for SEO */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <Home />
                </main>
                <Footer />
              </>
            }
          />
          
          <Route
            path="/search"
            element={
              <MainLayout pageName="Search">
                <CarSearch />
              </MainLayout>
            }
          />
          
          <Route
            path="/cars"
            element={
              <MainLayout pageName="Cars">
                <CarHolder />
              </MainLayout>
            }
          />
          
          <Route
            path="/car/:id"
            element={
              <MainLayout pageName="Car Details">
                <CarDetail />
              </MainLayout>
            }
          />
          
          <Route
            path="/favorites"
            element={
              <MainLayout pageName="Favorites">
                <FavoritesPage />
              </MainLayout>
            }
          />
          
          <Route
            path="/contact"
            element={
              <MainLayout pageName="Contact">
                <ContactPage />
              </MainLayout>
            }
          />
          
          {/* New Privacy and Terms routes */}
          <Route
            path="/privatesia"
            element={
              <MainLayout pageName="Politika e Privatësisë">
                <PrivatesiaPage />
              </MainLayout>
            }
          />
          
          <Route
            path="/kushtet"
            element={
              <MainLayout pageName="Kushtet e Shërbimit">
                <KushtetPage />
              </MainLayout>
            }
          />
          
          {/* Legacy routes that redirect to new ones */}
          <Route
            path="/privacy"
            element={<Navigate to="/privatesia" replace />}
          />
          
          <Route
            path="/terms"
            element={<Navigate to="/kushtet" replace />}
          />
          
          {/* Auth routes */}
          <Route 
            path="/auth" 
            element={
              <Suspense fallback={<LoadingSpinner pageName="Login" />}>
                <AdminLogin />
              </Suspense>
            } 
          />

          <Route
            path="/auth/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner pageName="Dashboard" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Add Car" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Edit Car" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Options" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Exterior Colors" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Upholstery Management" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Contact Messages" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Makes" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Models" />}>
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
                <Suspense fallback={<LoadingSpinner pageName="Variants" />}>
                  <AdminDashboard>
                    <VariantsPage />
                  </AdminDashboard>
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route 
            path="*" 
            element={
              <Suspense fallback={<LoadingSpinner pageName="Not Found" />}>
                <NotFound />
              </Suspense>
            } 
          />

        </Routes>
      </FavoritesProvider>
    </Router>
  );
}

export default App;