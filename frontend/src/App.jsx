import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Page imports
import { Home } from './pages/Home';
import { Packages } from './pages/Packages';
import { PackageDetails } from './pages/PackageDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyBookings } from './pages/MyBookings';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-brand-500 selection:text-white">
          
          {/* Global Sticky Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/packages/:id" element={<PackageDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all -> Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Global Multi-Column Footer */}
          <Footer />

          {/* Toast Notification Container */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '16px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#14b8a6',
                  secondary: '#fff',
                },
              },
            }}
          />

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
