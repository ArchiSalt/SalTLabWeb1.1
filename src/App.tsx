import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import HomePage from './components/HomePage';

// Dynamic imports for code splitting
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));
const SignupPage = React.lazy(() => import('./components/auth/SignupPage'));
const DonationPage = React.lazy(() => import('./components/payments/DonationPage'));
const SuccessPage = React.lazy(() => import('./components/payments/SuccessPage'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const PrivateToolsPage = React.lazy(() => import('./components/admin/PrivateToolsPage'));
const StyleMatch = React.lazy(() => import('./components/StyleMatch'));
const SitePlanner = React.lazy(() => import('./components/SitePlanner'));
const PlanGenerator = React.lazy(() => import('./components/PlanGenerator'));
const Codebot = React.lazy(() => import('./components/Codebot'));
const EstimatedCost = React.lazy(() => import('./components/EstimatedCost'));
const ContactPage = React.lazy(() => import('./components/ContactPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/style-match" element={<StyleMatch />} />
            <Route path="/site-planner" element={<SitePlanner />} />
            <Route path="/plan-generator" element={<PlanGenerator />} />
            <Route path="/codebot" element={<Codebot />} />
            <Route path="/estimated-cost" element={<EstimatedCost />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/" element={<HomePage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/private-tools"
              element={
                <AdminRoute>
                  <PrivateToolsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/donate"
              element={
                <ProtectedRoute>
                  <DonationPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;