import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2, ChevronLeft, ChevronRight, Trash2, Eye, Mail, Phone, Building2, MessageSquare } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminContactsPage = () => {
    const { token } = useAdminAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const limit = 20;

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchContacts();
    }, [page, filter]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/admin/contacts`, {
                ...authHeaders,
                params: { skip: page * limit, limit, status: filter !== 'all' ? filter : undefined }
            });
            setContacts(response.data.contacts);
            setTotal(response.data.total);
        } catch (error) {
            toast.error('Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (contactId, newStatus) => {
        try {
            await axios.put(`${API}/admin/contacts/${contactId}`, { status: newStatus }, authHeaders);
            toast.success('Contact updated');
            fetchContacts();
        } catch (error) {
            toast.error('Failed to update contact');
        }
    };

    const handleDelete = async (contactId) => {
        if (!confirm('Delete this contact inquiry?')) return;
        try {
            await axios.delete(`${API}/admin/contacts/${contactId}`, authHeaders);
            toast.success('Contact deleted');
            fetchContacts();
        } catch (error) {
            toast.error('Failed to delete contact');
        }
    };

    const viewContact = (contact) => {
        setSelectedContact(contact);
        setShowDetail(true);
    };

    const totalPages = Math.ceil(total / limit);

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-500/20 text-blue-400';
            case 'in_progress': return 'bg-amber-500/20 text-amber-400';
            case 'resolved': return 'bg-green-500/20 text-green-400';
            case 'closed': return 'bg-slate-500/20 text-slate-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const getServiceColor = (service) => {
        switch (service) {
            case 'accounting': return 'bg-blue-500/20 text-blue-400';
            case 'marketing': return 'bg-amber-500/20 text-amber-400';
            case 'ai': return 'bg-purple-500/20 text-purple-400';
            case 'combined': return 'bg-green-500/20 text-green-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div data-testid="admin-contacts-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-white">Contact Inquiries</h1>
                    <p className="text-slate-400 mt-1">{total} total inquiries</p>
                </div>
                <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(0); }}>
                    <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
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
                                        <th className="text-left p-4 text-slate-400 font-medium">Contact</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Service</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                                        <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                                        <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map((contact) => (
                                        <tr key={contact.contact_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <p className="text-white font-medium">{contact.name}</p>
                                                <p className="text-slate-400 text-sm">{contact.email}</p>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getServiceColor(contact.service_interest)}>
                                                    {contact.service_interest}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getStatusColor(contact.status)}>
                                                    {contact.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm">
                                                {new Date(contact.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => viewContact(contact)} className="text-slate-400 hover:text-white">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Select value={contact.status} onValueChange={(v) => handleStatusChange(contact.contact_id, v)}>
                                                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-700 border-slate-600">
                                                            <SelectItem value="new">New</SelectItem>
                                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                                            <SelectItem value="resolved">Resolved</SelectItem>
                                                            <SelectItem value="closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.contact_id)} className="text-red-400 hover:text-red-300">
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

            {/* Contact Detail Dialog */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Contact Details</DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-500" />
                                    <a href={`mailto:${selectedContact.email}`} className="text-finmar-gold hover:underline">
                                        {selectedContact.email}
                                    </a>
                                </div>
                                {selectedContact.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-slate-500" />
                                        <a href={`tel:${selectedContact.phone}`} className="text-white">{selectedContact.phone}</a>
                                    </div>
                                )}
                                {selectedContact.business_name && (
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-slate-500" />
                                        <span className="text-white">{selectedContact.business_name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-5 h-5 text-finmar-gold" />
                                    <span className="font-semibold">Message</span>
                                </div>
                                <p className="text-slate-300 whitespace-pre-wrap">{selectedContact.message}</p>
                            </div>

                            <div className="flex items-center justify-between text-sm text-slate-400">
                                <span>Submitted: {new Date(selectedContact.created_at).toLocaleString()}</span>
                                <Badge className={getServiceColor(selectedContact.service_interest)}>
                                    {selectedContact.service_interest}
                                </Badge>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminContactsPage;
