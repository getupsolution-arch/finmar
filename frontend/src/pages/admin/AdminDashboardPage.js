import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAdminAuth } from '../../context/AdminAuthContext';
import axios from 'axios';
import {
    Users, CreditCard, MessageSquare, DollarSign, TrendingUp,
    ArrowUpRight, ArrowDownRight, Loader2, Calculator, Megaphone, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboardPage = () => {
    const { token } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, chartRes] = await Promise.all([
                axios.get(`${API}/admin/dashboard/stats`, authHeaders),
                axios.get(`${API}/admin/revenue/chart?days=30`, authHeaders)
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = stats ? [
        { 
            title: 'Total Users', 
            value: stats.total_users, 
            icon: Users, 
            color: 'bg-blue-500',
            trend: '+12%'
        },
        { 
            title: 'Active Subscriptions', 
            value: stats.active_subscriptions, 
            icon: CreditCard, 
            color: 'bg-green-500',
            trend: '+8%'
        },
        { 
            title: 'New Contacts', 
            value: stats.new_contacts, 
            icon: MessageSquare, 
            color: 'bg-amber-500',
            trend: stats.new_contacts > 0 ? 'Action needed' : 'All clear'
        },
        { 
            title: 'Total Revenue', 
            value: `$${stats.total_revenue?.toLocaleString() || 0}`, 
            icon: DollarSign, 
            color: 'bg-purple-500',
            trend: '+24%'
        }
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-finmar-gold" />
            </div>
        );
    }

    return (
        <div data-testid="admin-dashboard">
            <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Overview of your FINMAR platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                        stat.trend.includes('+') ? 'text-green-400' : 
                                        stat.trend === 'Action needed' ? 'text-amber-400' : 'text-slate-400'
                                    }`}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm">{stat.title}</p>
                                <p className="font-heading text-3xl font-bold text-white mt-1">{stat.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-finmar-gold" />
                                Revenue (Last 30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis 
                                            dataKey="_id" 
                                            stroke="#94a3b8" 
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            tickFormatter={(value) => value?.slice(5) || ''}
                                        />
                                        <YAxis 
                                            stroke="#94a3b8" 
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#f8fafc' }}
                                            formatter={(value) => [`$${value}`, 'Revenue']}
                                        />
                                        <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Subscription Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-slate-800 border-slate-700 h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Subscription Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { icon: Calculator, label: 'Accounting', count: stats?.subscription_by_type?.accounting || 0, color: 'bg-blue-500' },
                                { icon: Megaphone, label: 'Marketing', count: stats?.subscription_by_type?.marketing || 0, color: 'bg-amber-500' },
                                { icon: Sparkles, label: 'Combined', count: stats?.subscription_by_type?.combined || 0, color: 'bg-purple-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                                            <item.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white font-medium">{item.label}</span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">{item.count}</span>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Monthly Revenue</span>
                                    <span className="text-xl font-bold text-finmar-gold">
                                        ${stats?.monthly_revenue?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
