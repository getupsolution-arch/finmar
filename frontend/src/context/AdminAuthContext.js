import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('finmar_admin_token'));

    const checkAuth = useCallback(async () => {
        try {
            if (token) {
                const response = await axios.get(`${API}/admin/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAdmin(response.data);
            }
        } catch (error) {
            setAdmin(null);
            setToken(null);
            localStorage.removeItem('finmar_admin_token');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const response = await axios.post(`${API}/admin/login`, { email, password });
        const { access_token, admin: adminData } = response.data;
        localStorage.setItem('finmar_admin_token', access_token);
        setToken(access_token);
        setAdmin(adminData);
        return adminData;
    };

    const logout = () => {
        localStorage.removeItem('finmar_admin_token');
        setToken(null);
        setAdmin(null);
    };

    const value = {
        admin,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!admin
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};
