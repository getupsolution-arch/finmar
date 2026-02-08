import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import {
    Search, Users, Trash2, Edit, Eye, Loader2, ChevronLeft, ChevronRight,
    Mail, Phone, Building2, Calendar, CreditCard
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminUsersPage = () => {
    const { token } = useAdminAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({});
    const limit = 20;

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/admin/users`, {
                ...authHeaders,
                params: { skip: page * limit, limit, search: search || undefined }
            });
            setUsers(response.data.users);
            setTotal(response.data.total);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetail = async (userId) => {
        try {
            const response = await axios.get(`${API}/admin/users/${userId}`, authHeaders);
            setUserDetail(response.data);
            setShowDetail(true);
        } catch (error) {
            toast.error('Failed to fetch user details');
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditData({
            name: user.name,
            business_name: user.business_name || '',
            phone: user.phone || '',
            subscription_status: user.subscription_status,
            role: user.role || 'user'
        });
        setShowEdit(true);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`${API}/admin/users/${selectedUser.user_id}`, editData, authHeaders);
            toast.success('User updated successfully');
            setShowEdit(false);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            await axios.delete(`${API}/admin/users/${userId}`, authHeaders);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div data-testid="admin-users-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-white">Users</h1>
                    <p className="text-slate-400 mt-1">{total} total users</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="pl-10 bg-slate-800 border-slate-700 text-white"
                        data-testid="user-search-input"
                    />
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
                                        <th className="text-left p-4 text-slate-400 font-medium">User</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Business</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Role</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Joined</th>
                                        <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.user_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                                        {user.picture ? (
                                                            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                                                        ) : (
                                                            <span className="text-finmar-gold font-semibold">{user.name?.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{user.name}</p>
                                                        <p className="text-slate-400 text-sm">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300">{user.business_name || '-'}</td>
                                            <td className="p-4">
                                                <Badge className={user.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                                                    {user.subscription_status || 'inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={user.role === 'admin' ? 'bg-finmar-gold/20 text-finmar-gold' : 'bg-slate-500/20 text-slate-400'}>
                                                    {user.role || 'user'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => fetchUserDetail(user.user_id)}
                                                        className="text-slate-400 hover:text-white"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleEdit(user)}
                                                        className="text-slate-400 hover:text-white"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(user.user_id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-700">
                            <p className="text-slate-400 text-sm">
                                Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="border-slate-700"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-slate-400 text-sm">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="border-slate-700"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Detail Dialog */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {userDetail && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                                    {userDetail.user.picture ? (
                                        <img src={userDetail.user.picture} alt="" className="w-16 h-16 rounded-full" />
                                    ) : (
                                        <span className="text-2xl text-finmar-gold font-bold">{userDetail.user.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{userDetail.user.name}</h3>
                                    <p className="text-slate-400">{userDetail.user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Building2 className="w-4 h-4 text-slate-500" />
                                    {userDetail.user.business_name || 'No business'}
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                    {userDetail.user.phone || 'No phone'}
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    Joined {new Date(userDetail.user.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-slate-500" />
                                    <Badge className={userDetail.user.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                                        {userDetail.user.subscription_status || 'No subscription'}
                                    </Badge>
                                </div>
                            </div>

                            {userDetail.subscription && (
                                <div className="bg-slate-700/50 rounded-xl p-4">
                                    <h4 className="font-semibold mb-2">Active Subscription</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p className="text-slate-400">Plan: <span className="text-white">{userDetail.subscription.plan_type} - {userDetail.subscription.plan_tier}</span></p>
                                        <p className="text-slate-400">Amount: <span className="text-white">${userDetail.subscription.amount}/mo</span></p>
                                        <p className="text-slate-400">Next billing: <span className="text-white">{new Date(userDetail.subscription.next_billing_date).toLocaleDateString()}</span></p>
                                    </div>
                                </div>
                            )}

                            {userDetail.transactions?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Recent Transactions</h4>
                                    <div className="space-y-2">
                                        {userDetail.transactions.slice(0, 3).map((txn, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg text-sm">
                                                <span className="text-slate-300">{txn.plan_type} - {txn.plan_tier}</span>
                                                <span className="text-white font-medium">${txn.amount}</span>
                                                <Badge className={txn.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                                                    {txn.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={showEdit} onOpenChange={setShowEdit}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400">Name</label>
                            <Input
                                value={editData.name || ''}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Business Name</label>
                            <Input
                                value={editData.business_name || ''}
                                onChange={(e) => setEditData({ ...editData, business_name: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Phone</label>
                            <Input
                                value={editData.phone || ''}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Role</label>
                            <Select value={editData.role} onValueChange={(v) => setEditData({ ...editData, role: v })}>
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsersPage;
