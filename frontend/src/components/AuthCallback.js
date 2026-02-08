import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { processGoogleSession } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processSession = async () => {
            try {
                const hash = location.hash;
                const sessionIdMatch = hash.match(/session_id=([^&]+)/);
                
                if (sessionIdMatch) {
                    const sessionId = sessionIdMatch[1];
                    const user = await processGoogleSession(sessionId);
                    
                    // Redirect to dashboard with user data
                    navigate('/dashboard', { replace: true, state: { user } });
                } else {
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login', { replace: true });
            }
        };

        processSession();
    }, [location, navigate, processGoogleSession]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-finmar-gold" />
                <p className="text-slate-600 font-medium">Signing you in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
