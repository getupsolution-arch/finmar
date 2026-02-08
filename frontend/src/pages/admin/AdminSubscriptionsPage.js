import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2, ChevronLeft, ChevronRight, CreditCard, Calendar, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSubscriptionsPage = () => {
    const { token } = useAdminAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchSubscriptions();
    }, [page, filter]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/admin/subscriptions`, {
                ...authHeaders,
                params: { skip: page * limit, limit, status: filter !== 'all' ? filter : undefined }
            });
            setSubscriptions(response.data.subscriptions);
            setTotal(response.data.total);
        } catch (error) {
            toast.error('Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (subscriptionId, newStatus) => {
        try {
            await axios.put(`${API}/admin/subscriptions/${subscriptionId}?status=${newStatus}`, {}, authHeaders);
            toast.success('Subscription updated');
            fetchSubscriptions();
        } catch (error) {
            toast.error('Failed to update subscription');
        }
    };

    const totalPages = Math.ceil(total / limit);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400';
            case 'inactive': return 'bg-slate-500/20 text-slate-400';
            case 'cancelled': return 'bg-red-500/20 text-red-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const getPlanColor = (planType) => {
        switch (planType) {
            case 'accounting': return 'bg-blue-500/20 text-blue-400';
            case 'marketing': return 'bg-amber-500/20 text-amber-400';
            case 'combined': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div data-testid="admin-subscriptions-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-white">Subscriptions</h1>
                    <p className="text-slate-400 mt-1">{total} total subscriptions</p>
                </div>
                <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-finmar-gold" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Next Billing</th>
                                        <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.map((sub) => (
                                        <tr key={sub.subscription_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <p className="text-white font-medium">{sub.user_name}</p>
                                                <p className="text-slate-400 text-sm">{sub.user_email}</p>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getPlanColor(sub.plan_type)}>
                                                    {sub.plan_type}
                                                </Badge>
                                                <span className="ml-2 text-slate-300">{sub.plan_tier}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-white font-semibold">${sub.amount}</span>
                                                <span className="text-slate-400">/mo</span>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getStatusColor(sub.status)}>
                                                    {sub.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm">
                                                {new Date(sub.next_billing_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <Select 
                                                    value={sub.status} 
                                                    onValueChange={(v) => handleStatusChange(sub.subscription_id, v)}
                                                >
                                                    <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-700 border-slate-600">
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-700">
                            <p className="text-slate-400 text-sm">
                                Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-slate-700">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-slate-400 text-sm">Page {page + 1} of {totalPages}</span>
                                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="border-slate-700">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSubscriptionsPage;
