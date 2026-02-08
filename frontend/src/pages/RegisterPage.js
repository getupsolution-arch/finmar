import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        business_name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);
        try {
            await register(formData.email, formData.password, formData.name, formData.business_name);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + '/dashboard';
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    return (
        <div className="min-h-screen flex" data-testid="register-page">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-finmar-gold to-amber-400 items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-lg text-center"
                >
                    <div className="w-20 h-20 mx-auto bg-finmar-navy/20 rounded-2xl flex items-center justify-center mb-8">
                        <span className="text-finmar-navy font-heading font-bold text-4xl">F</span>
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-finmar-navy mb-4">
                        Start Your Growth Journey
                    </h2>
                    <p className="text-finmar-navy/80 leading-relaxed">
                        Join hundreds of Australian businesses using FINMAR for accounting, 
                        marketing, and AI-powered automation.
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 pt-24">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-8">
                        <Link to="/" className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-finmar-navy rounded-xl flex items-center justify-center">
                                <span className="text-white font-heading font-bold text-xl">F</span>
                            </div>
                            <span className="font-heading font-bold text-2xl text-finmar-navy">FINMAR</span>
                        </Link>
                        <h1 className="font-heading text-3xl font-bold text-finmar-navy">Create your account</h1>
                        <p className="text-slate-500 mt-2">Start managing your business smarter</p>
                    </div>

                    {/* Google Signup */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 mb-6"
                        onClick={handleGoogleSignup}
                        data-testid="google-signup-btn"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500">or register with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-slate-700">Full Name *</Label>
                            <div className="relative mt-1.5">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Smith"
                                    className="pl-10 h-12"
                                    data-testid="name-input"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="business_name" className="text-slate-700">Business Name</Label>
                            <div className="relative mt-1.5">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="business_name"
                                    name="business_name"
                                    type="text"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    placeholder="Your Business Pty Ltd"
                                    className="pl-10 h-12"
                                    data-testid="business-input"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-slate-700">Email *</Label>
                            <div className="relative mt-1.5">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@business.com.au"
                                    className="pl-10 h-12"
                                    data-testid="email-input"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-slate-700">Password *</Label>
                            <div className="relative mt-1.5">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    className="pl-10 pr-10 h-12"
                                    data-testid="password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password *</Label>
                            <div className="relative mt-1.5">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="pl-10 h-12"
                                    data-testid="confirm-password-input"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy font-semibold mt-2"
                            data-testid="register-submit-btn"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <p className="text-center mt-6 text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-finmar-gold hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
