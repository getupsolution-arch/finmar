import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { MobileProvider, OfflineIndicator } from './mobile';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AuthCallback from './components/AuthCallback';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminContactsPage from './pages/admin/AdminContactsPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';

import './App.css';

// AppRouter handles session_id detection for Google OAuth
function AppRouter() {
    const location = useLocation();

    // CRITICAL: Check URL fragment for session_id synchronously during render
    // This prevents race conditions with ProtectedRoute
    if (location.hash?.includes('session_id=')) {
        return <AuthCallback />;
    }

    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public routes with layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/payment-success" element={
                        <ProtectedRoute>
                            <PaymentSuccessPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />
            </Route>

            {/* Auth routes without layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={
                <AdminProtectedRoute>
                    <AdminLayout />
                </AdminProtectedRoute>
            }>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="contacts" element={<AdminContactsPage />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
            </Route>
        </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <MobileProvider>
                <AuthProvider>
                    <AdminAuthProvider>
                        <OfflineIndicator />
                        <AppRouter />
                    </AdminAuthProvider>
                </AuthProvider>
            </MobileProvider>
        </BrowserRouter>
    );
}

export default App;
