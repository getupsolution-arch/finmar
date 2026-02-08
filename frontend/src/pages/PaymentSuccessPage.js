import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle2, Loader2, ArrowRight, XCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token, updateUser } = useAuth();
    const [status, setStatus] = useState('checking'); // checking, success, failed
    const [attempts, setAttempts] = useState(0);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            setStatus('failed');
            return;
        }

        const pollPaymentStatus = async () => {
            if (attempts >= 10) {
                setStatus('failed');
                toast.error('Payment verification timed out. Please contact support.');
                return;
            }

            try {
                const response = await axios.get(`${API}/payments/status/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });

                if (response.data.payment_status === 'paid') {
                    setStatus('success');
                    toast.success('Payment successful! Your subscription is now active.');
                    
                    // Refresh user data
                    try {
                        const userRes = await axios.get(`${API}/auth/me`, {
                            headers: { Authorization: `Bearer ${token}` },
                            withCredentials: true
                        });
                        updateUser(userRes.data);
                    } catch (e) {
                        console.error('Failed to refresh user data');
                    }
                } else if (response.data.status === 'expired') {
                    setStatus('failed');
                    toast.error('Payment session expired');
                } else {
                    // Continue polling
                    setAttempts(prev => prev + 1);
                    setTimeout(pollPaymentStatus, 2000);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                setAttempts(prev => prev + 1);
                setTimeout(pollPaymentStatus, 2000);
            }
        };

        pollPaymentStatus();
    }, [sessionId, token, attempts, updateUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20" data-testid="payment-success-page">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full mx-4"
            >
                <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                    {status === 'checking' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-finmar-gold/10 rounded-full flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-finmar-gold animate-spin" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold text-finmar-navy mb-2">
                                Verifying Payment
                            </h1>
                            <p className="text-slate-500">
                                Please wait while we confirm your payment...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold text-finmar-navy mb-2">
                                Payment Successful!
                            </h1>
                            <p className="text-slate-500 mb-8">
                                Your subscription is now active. Welcome to FINMAR!
                            </p>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy rounded-full px-8"
                                data-testid="go-to-dashboard-btn"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold text-finmar-navy mb-2">
                                Payment Verification Failed
                            </h1>
                            <p className="text-slate-500 mb-8">
                                We couldn't verify your payment. If you were charged, please contact support.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => navigate('/pricing')}
                                    className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy rounded-full"
                                    data-testid="try-again-btn"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => navigate('/contact')}
                                    variant="outline"
                                    className="rounded-full"
                                    data-testid="contact-support-btn"
                                >
                                    Contact Support
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccessPage;
