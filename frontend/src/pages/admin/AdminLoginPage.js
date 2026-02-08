import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAdminAuth } from '../context/AdminAuthContext';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome, Admin!');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid admin credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4" data-testid="admin-login-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto bg-finmar-gold/20 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-finmar-gold" />
                        </div>
                        <h1 className="font-heading text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-slate-400 mt-2">FINMAR Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <div className="relative mt-1.5">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@finmar.com.au"
                                    className="pl-10 h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                    data-testid="admin-email-input"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative mt-1.5">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    className="pl-10 pr-10 h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                    data-testid="admin-password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy font-semibold"
                            data-testid="admin-login-btn"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In as Admin'
                            )}
                        </Button>
                    </form>

                    <p className="text-center mt-6 text-slate-500 text-sm">
                        Protected admin area. Unauthorized access is prohibited.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLoginPage;
