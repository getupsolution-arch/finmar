import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import {
    User, Mail, Building2, Phone, Lock, Save, Loader2,
    CreditCard, Calendar, ArrowRight, AlertTriangle, Check
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = () => {
    const { user, token, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        business_name: '',
        phone: ''
    });
    const [saving, setSaving] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    };

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                business_name: user.business_name || '',
                phone: user.phone || ''
            });
        }
        fetchSubscription();
    }, [user]);

    const fetchSubscription = async () => {
        try {
            const response = await axios.get(`${API}/subscriptions/my`, authHeaders);
            setSubscription(response.data);
        } catch (error) {
            console.error('Failed to fetch subscription');
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const response = await axios.put(`${API}/profile`, profile, authHeaders);
            updateUser(response.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwords.new.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setChangingPassword(true);
        try {
            await axios.post(`${API}/profile/change-password`, {
                current_password: passwords.current,
                new_password: passwords.new
            }, authHeaders);
            toast.success('Password changed successfully');
            setShowPasswordDialog(false);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleCancelSubscription = async () => {
        setCancelling(true);
        try {
            await axios.post(`${API}/subscriptions/cancel`, {}, authHeaders);
            toast.success('Subscription cancelled');
            setShowCancelDialog(false);
            setSubscription(null);
            // Update user context
            updateUser({ ...user, subscription_status: 'cancelled', current_plan: null });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to cancel subscription');
        } finally {
            setCancelling(false);
        }
    };

    const getPlanName = () => {
        if (!subscription) return 'No active plan';
        return `${subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)} - ${subscription.plan_tier.charAt(0).toUpperCase() + subscription.plan_tier.slice(1)}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12" data-testid="profile-page">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="font-heading text-3xl font-bold text-finmar-navy">Profile Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your account and subscription</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-finmar-gold" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div>
                                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                                    <div className="relative mt-1.5">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            id="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="pl-10 h-12 bg-slate-100"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                                    <div className="relative mt-1.5">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            id="name"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="pl-10 h-12"
                                            data-testid="profile-name-input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="business" className="text-slate-700">Business Name</Label>
                                    <div className="relative mt-1.5">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            id="business"
                                            value={profile.business_name}
                                            onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                                            placeholder="Your Business Pty Ltd"
                                            className="pl-10 h-12"
                                            data-testid="profile-business-input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                                    <div className="relative mt-1.5">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            id="phone"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="+61 400 000 000"
                                            className="pl-10 h-12"
                                            data-testid="profile-phone-input"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy"
                                        data-testid="save-profile-btn"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5 mr-2" />
                                        )}
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPasswordDialog(true)}
                                        data-testid="change-password-btn"
                                    >
                                        <Lock className="w-5 h-5 mr-2" />
                                        Change Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Subscription Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-0 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-finmar-gold" />
                                    Subscription
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {subscription ? (
                                    <>
                                        <div className="p-4 bg-gradient-to-r from-finmar-navy to-slate-800 rounded-xl text-white">
                                            <p className="text-slate-400 text-sm">Current Plan</p>
                                            <p className="font-heading text-xl font-bold">{getPlanName()}</p>
                                            <p className="text-2xl font-bold mt-2">${subscription.amount}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}</span>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => window.location.href = '/pricing'}
                                                data-testid="change-plan-btn"
                                            >
                                                Change Plan
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setShowCancelDialog(true)}
                                                data-testid="cancel-subscription-btn"
                                            >
                                                Cancel Subscription
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <Badge className="bg-slate-100 text-slate-600 mb-4">No Active Plan</Badge>
                                        <p className="text-slate-500 text-sm mb-4">Subscribe to unlock all features</p>
                                        <Button
                                            className="w-full bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy"
                                            onClick={() => window.location.href = '/pricing'}
                                            data-testid="subscribe-btn"
                                        >
                                            View Plans
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Password Dialog */}
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    className="mt-1.5"
                                    data-testid="current-password-input"
                                />
                            </div>
                            <div>
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="mt-1.5"
                                    data-testid="new-password-input"
                                />
                            </div>
                            <div>
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="mt-1.5"
                                    data-testid="confirm-password-input"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                            <Button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy"
                                data-testid="submit-password-btn"
                            >
                                {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Cancel Subscription Dialog */}
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                Cancel Subscription
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-slate-600">
                                Are you sure you want to cancel your subscription? You'll lose access to:
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-slate-600">
                                    <Check className="w-4 h-4 text-red-500" />
                                    AI Business Insights
                                </li>
                                <li className="flex items-center gap-2 text-slate-600">
                                    <Check className="w-4 h-4 text-red-500" />
                                    Premium Support
                                </li>
                                <li className="flex items-center gap-2 text-slate-600">
                                    <Check className="w-4 h-4 text-red-500" />
                                    Service Features
                                </li>
                            </ul>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>Keep Subscription</Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                                data-testid="confirm-cancel-btn"
                            >
                                {cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Cancel'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default ProfilePage;
