import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import {
    LayoutDashboard, Calculator, Megaphone, Sparkles, TrendingUp,
    DollarSign, Calendar, ArrowRight, Send, Loader2, RefreshCw,
    CreditCard, ChevronRight, MessageSquare, Brain, BarChart3
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DashboardPage = () => {
    const { user, token } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, chatRes] = await Promise.all([
                axios.get(`${API}/subscriptions/my`, authHeaders),
                axios.get(`${API}/ai/chat-history`, authHeaders)
            ]);
            setSubscription(subRes.data);
            setChatHistory(chatRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAiQuery = async (e) => {
        e.preventDefault();
        if (!aiQuery.trim()) return;

        setAiLoading(true);
        try {
            const response = await axios.post(`${API}/ai/insights`, {
                query: aiQuery,
                context: subscription ? `User subscription: ${subscription.plan_type} ${subscription.plan_tier}` : null
            }, authHeaders);
            
            setAiResponse(response.data.insight);
            setChatHistory(prev => [{
                query: aiQuery,
                response: response.data.insight,
                created_at: new Date().toISOString()
            }, ...prev.slice(0, 9)]);
            setAiQuery('');
        } catch (error) {
            toast.error('AI service temporarily unavailable');
        } finally {
            setAiLoading(false);
        }
    };

    const getPlanDetails = () => {
        if (!subscription) return null;
        const planNames = {
            accounting: { starter: 'Starter', growth: 'Growth', advanced: 'Advanced', premium: 'Premium' },
            marketing: { basic: 'Basic', growth: 'Growth', pro: 'Pro', ultimate: 'Ultimate + AI' },
            combined: { essentials: 'Essentials', growth: 'Growth', pro: 'Pro', executive: 'Executive' }
        };
        return planNames[subscription.plan_type]?.[subscription.plan_tier] || subscription.plan_tier;
    };

    const quickInsights = [
        { icon: Calculator, title: 'BAS Due', value: 'Feb 28', color: 'text-blue-600 bg-blue-50' },
        { icon: TrendingUp, title: 'Revenue MTD', value: '$24,500', color: 'text-green-600 bg-green-50' },
        { icon: Megaphone, title: 'Ad Spend', value: '$1,200', color: 'text-amber-600 bg-amber-50' },
        { icon: BarChart3, title: 'Leads', value: '47', color: 'text-purple-600 bg-purple-50' }
    ];

    const suggestedQueries = [
        "How can I reduce my BAS liability?",
        "What marketing strategy works for retail?",
        "Tips to improve cash flow",
        "Best practices for payroll compliance"
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12" data-testid="dashboard-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="font-heading text-3xl font-bold text-finmar-navy">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {user?.business_name || 'Your business dashboard'}
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {quickInsights.map((stat, idx) => (
                        <Card key={idx} className="border-0 shadow-card">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">{stat.title}</p>
                                    <p className="font-heading text-xl font-bold text-finmar-navy">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Subscription Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-0 shadow-card overflow-hidden">
                                <div className="bg-gradient-to-r from-finmar-navy to-slate-800 p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-300 text-sm">Your Subscription</p>
                                            {subscription ? (
                                                <>
                                                    <h2 className="font-heading text-2xl font-bold mt-1">
                                                        {getPlanDetails()}
                                                    </h2>
                                                    <Badge className="mt-2 bg-finmar-gold text-finmar-navy">
                                                        {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)}
                                                    </Badge>
                                                </>
                                            ) : (
                                                <h2 className="font-heading text-2xl font-bold mt-1">No Active Plan</h2>
                                            )}
                                        </div>
                                        {subscription && (
                                            <div className="text-right">
                                                <p className="text-slate-300 text-sm">Monthly</p>
                                                <p className="font-heading text-3xl font-bold">${subscription.amount}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    {subscription ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-5 h-5" />
                                                <span>Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}</span>
                                            </div>
                                            <Link to="/pricing">
                                                <Button variant="outline" size="sm" data-testid="manage-subscription-btn">
                                                    Manage Plan
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-slate-500 mb-4">Start your journey with FINMAR</p>
                                            <Link to="/pricing">
                                                <Button className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy" data-testid="choose-plan-btn">
                                                    Choose a Plan
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* AI Assistant */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="border-0 shadow-card bg-gradient-to-br from-slate-900 to-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-finmar-gold to-amber-400 rounded-xl flex items-center justify-center">
                                            <Brain className="w-5 h-5 text-finmar-navy" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-white">AI Business Assistant</CardTitle>
                                            <p className="text-slate-400 text-sm">Powered by GPT-5.2</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* AI Response */}
                                    {aiResponse && (
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                            <p className="text-slate-300 whitespace-pre-wrap">{aiResponse}</p>
                                        </div>
                                    )}

                                    {/* Query Input */}
                                    <form onSubmit={handleAiQuery} className="flex gap-2">
                                        <Input
                                            value={aiQuery}
                                            onChange={(e) => setAiQuery(e.target.value)}
                                            placeholder="Ask about your business..."
                                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                            data-testid="ai-query-input"
                                        />
                                        <Button 
                                            type="submit" 
                                            disabled={aiLoading}
                                            className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy"
                                            data-testid="ai-submit-btn"
                                        >
                                            {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        </Button>
                                    </form>

                                    {/* Suggested Queries */}
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedQueries.map((query, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setAiQuery(query)}
                                                className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full hover:bg-slate-700 transition-colors"
                                            >
                                                {query}
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="border-0 shadow-card">
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { icon: Calculator, label: 'View Financials', href: '#' },
                                        { icon: Megaphone, label: 'Marketing Report', href: '#' },
                                        { icon: CreditCard, label: 'Billing History', href: '#' },
                                        { icon: MessageSquare, label: 'Support', href: '/contact' }
                                    ].map((action, idx) => (
                                        <Link key={idx} to={action.href}>
                                            <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                                                <action.icon className="w-5 h-5 text-finmar-gold" />
                                                {action.label}
                                            </Button>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent AI Chats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="border-0 shadow-card">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Recent AI Insights</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={fetchData}>
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {chatHistory.length > 0 ? (
                                        <div className="space-y-3">
                                            {chatHistory.slice(0, 3).map((chat, idx) => (
                                                <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                                    <p className="text-sm font-medium text-finmar-navy truncate">{chat.query}</p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{chat.response}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-4">
                                            No recent conversations
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
