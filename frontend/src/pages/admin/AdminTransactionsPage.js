import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminTransactionsPage = () => {
    const { token } = useAdminAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchTransactions();
    }, [page, filter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/admin/transactions`, {
                ...authHeaders,
                params: { skip: page * limit, limit, status: filter !== 'all' ? filter : undefined }
            });
            setTransactions(response.data.transactions);
            setTotal(response.data.total);
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-400';
            case 'pending': return 'bg-amber-500/20 text-amber-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    // Calculate totals
    const totalRevenue = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div data-testid="admin-transactions-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-white">Transactions</h1>
                    <p className="text-slate-400 mt-1">{total} total transactions</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-green-500/20 rounded-xl px-4 py-2">
                        <p className="text-xs text-green-400">Page Revenue</p>
                        <p className="text-xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
                    </div>
                    <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(0); }}>
                        <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                                        <th className="text-left p-4 text-slate-400 font-medium">Transaction ID</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr key={txn.transaction_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <p className="text-white font-mono text-sm">{txn.transaction_id}</p>
                                                <p className="text-slate-500 text-xs">{txn.user_id}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-white">{txn.plan_type}</span>
                                                <span className="text-slate-400 ml-1">/ {txn.plan_tier}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4 text-green-400" />
                                                    <span className="text-white font-semibold">{txn.amount}</span>
                                                    <span className="text-slate-400 text-sm">{txn.currency}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getStatusColor(txn.status)}>
                                                    {txn.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm">
                                                {new Date(txn.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-700">
                            <p className="text-slate-400 text-sm">Page {page + 1} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-slate-700">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
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

export default AdminTransactionsPage;
