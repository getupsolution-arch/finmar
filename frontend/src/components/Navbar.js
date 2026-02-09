import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { 
    Menu, X, ChevronDown, Calculator, Megaphone, Sparkles, 
    LayoutDashboard, LogOut, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Pages with dark hero backgrounds (need white text when not scrolled)
    const darkHeroPages = ['/'];
    const hasDarkHero = darkHeroPages.includes(location.pathname);
    
    // Use dark text if scrolled OR if page doesn't have dark hero
    const useDarkText = scrolled || !hasDarkHero;

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Services', href: '/services', icon: Sparkles },
        { name: 'Pricing', href: '/pricing', icon: Calculator },
        { name: 'Contact', href: '/contact', icon: Megaphone },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled || !hasDarkHero ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scrolled ? 'bg-finmar-navy' : 'bg-finmar-gold'}`}>
                            <span className={`font-heading font-bold text-xl ${scrolled ? 'text-white' : 'text-finmar-navy'}`}>F</span>
                        </div>
                        <span className={`font-heading font-bold text-2xl transition-colors ${scrolled ? 'text-finmar-navy' : 'text-white'}`}>FINMAR</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                data-testid={`nav-${link.name.toLowerCase()}`}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                    isActive(link.href) 
                                        ? 'text-finmar-gold' 
                                        : scrolled ? 'text-slate-600 hover:text-finmar-navy' : 'text-white/80 hover:text-white'
                                }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-btn">
                                        <div className="w-8 h-8 bg-finmar-gold rounded-full flex items-center justify-center">
                                            {user?.picture ? (
                                                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <User className="w-4 h-4 text-finmar-navy" />
                                            )}
                                        </div>
                                        <span className="font-medium text-slate-700">{user?.name?.split(' ')[0]}</span>
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="nav-dashboard">
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="nav-profile">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} data-testid="nav-logout">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className={scrolled ? '' : 'text-white hover:text-white hover:bg-white/10'} data-testid="nav-login-btn">Login</Button>
                                </Link>
                                <Link to="/pricing">
                                    <Button 
                                        className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy font-semibold rounded-full px-6"
                                        data-testid="nav-get-started-btn"
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2"
                        data-testid="mobile-menu-btn"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        isActive(link.href)
                                            ? 'bg-finmar-gold/10 text-finmar-gold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t space-y-3">
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full" variant="outline">Dashboard</Button>
                                        </Link>
                                        <Button onClick={handleLogout} variant="ghost" className="w-full">
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full" variant="outline">Login</Button>
                                        </Link>
                                        <Link to="/pricing" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
