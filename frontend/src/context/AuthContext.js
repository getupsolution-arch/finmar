import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('finmar_token'));

    const checkAuth = useCallback(async () => {
        try {
            if (token) {
                const response = await axios.get(`${API}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                setUser(response.data);
            } else {
                // Try cookie-based auth
                const response = await axios.get(`${API}/auth/me`, {
                    withCredentials: true
                });
                setUser(response.data);
            }
        } catch (error) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('finmar_token');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const response = await axios.post(`${API}/auth/login`, { email, password });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('finmar_token', access_token);
        setToken(access_token);
        setUser(userData);
        return userData;
    };

    const register = async (email, password, name, business_name) => {
        const response = await axios.post(`${API}/auth/register`, { 
            email, password, name, business_name 
        });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('finmar_token', access_token);
        setToken(access_token);
        setUser(userData);
        return userData;
    };

    const processGoogleSession = async (sessionId) => {
        const response = await axios.post(`${API}/auth/session`, 
            { session_id: sessionId },
            { withCredentials: true }
        );
        setUser(response.data.user);
        return response.data.user;
    };

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('finmar_token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        processGoogleSession,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
