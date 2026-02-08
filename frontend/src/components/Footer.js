import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Mail, Phone, MapPin, Linkedin, Facebook, Instagram,
    Calculator, Megaphone, Sparkles, Shield
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const services = [
        { name: 'Accounting', href: '/services#accounting', icon: Calculator },
        { name: 'Marketing', href: '/services#marketing', icon: Megaphone },
        { name: 'AI Tools', href: '/services#ai', icon: Sparkles },
    ];

    const company = [
        { name: 'About Us', href: '/about' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Contact', href: '/contact' },
        { name: 'Blog', href: '/blog' },
    ];

    const legal = [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Refund Policy', href: '/refund' },
    ];

    return (
        <footer className="bg-finmar-navy text-white" data-testid="footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer */}
                <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-finmar-gold rounded-xl flex items-center justify-center">
                                <span className="text-finmar-navy font-heading font-bold text-xl">F</span>
                            </div>
                            <span className="font-heading font-bold text-2xl">FINMAR</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Australia's integrated platform for Accounting, Digital Marketing, 
                            and AI-powered business automation.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-finmar-gold hover:text-finmar-navy transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                               className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-finmar-gold hover:text-finmar-navy transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                               className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-finmar-gold hover:text-finmar-navy transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-heading font-semibold text-lg mb-6">Services</h4>
                        <ul className="space-y-4">
                            {services.map((item) => (
                                <li key={item.name}>
                                    <Link to={item.href} className="flex items-center gap-2 text-slate-400 hover:text-finmar-gold transition-colors">
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-heading font-semibold text-lg mb-6">Company</h4>
                        <ul className="space-y-4">
                            {company.map((item) => (
                                <li key={item.name}>
                                    <Link to={item.href} className="text-slate-400 hover:text-finmar-gold transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-heading font-semibold text-lg mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:hello@finmar.com.au" className="flex items-center gap-3 text-slate-400 hover:text-finmar-gold transition-colors">
                                    <Mail className="w-5 h-5" />
                                    hello@finmar.com.au
                                </a>
                            </li>
                            <li>
                                <a href="tel:+61400000000" className="flex items-center gap-3 text-slate-400 hover:text-finmar-gold transition-colors">
                                    <Phone className="w-5 h-5" />
                                    +61 400 000 000
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400">
                                <MapPin className="w-5 h-5 mt-0.5" />
                                <span>Sydney, NSW<br />Australia</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Shield className="w-4 h-4" />
                        <span>&copy; {currentYear} FINMAR. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {legal.map((item) => (
                            <Link key={item.name} to={item.href} className="text-slate-400 text-sm hover:text-finmar-gold transition-colors">
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
