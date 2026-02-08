import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Button } from '../components/ui/button';
import { Toaster } from '../components/ui/sonner';
import {
    LayoutDashboard, Users, CreditCard, MessageSquare, 
    DollarSign, LogOut, ChevronRight, Menu, X
} from 'lucide-react';

const AdminLayout = () => {
    const { admin, logout } = useAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: Users, label: 'Users', href: '/admin/users' },
        { icon: CreditCard, label: 'Subscriptions', href: '/admin/subscriptions' },
        { icon: MessageSquare, label: 'Contacts', href: '/admin/contacts' },
        { icon: DollarSign, label: 'Transactions', href: '/admin/transactions' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-700">
                        <Link to="/admin/dashboard" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-finmar-gold rounded-xl flex items-center justify-center">
                                <span className="text-finmar-navy font-heading font-bold text-xl">F</span>
                            </div>
                            <div>
                                <span className="font-heading font-bold text-xl text-white">FINMAR</span>
                                <span className="block text-xs text-finmar-gold">Admin Portal</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                    isActive(item.href)
                                        ? 'bg-finmar-gold text-finmar-navy'
                                        : 'text-slate-300 hover:bg-slate-700'
                                }`}
                                data-testid={`admin-nav-${item.label.toLowerCase()}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                                {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        ))}
                    </nav>

                    {/* Admin Info */}
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                <span className="text-finmar-gold font-semibold">
                                    {admin?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{admin?.name}</p>
                                <p className="text-slate-400 text-sm truncate">{admin?.email}</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700"
                            onClick={handleLogout}
                            data-testid="admin-logout-btn"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 lg:ml-64">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 bg-slate-800 border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-white p-2"
                            data-testid="mobile-menu-btn"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-heading font-bold text-white">FINMAR Admin</span>
                        <div className="w-10" />
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    );
};

export default AdminLayout;
