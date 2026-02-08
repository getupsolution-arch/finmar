import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { 
    Mail, Phone, MapPin, Send, Loader2, Clock,
    Calculator, Megaphone, Sparkles, Building2, User
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        business_name: '',
        service_interest: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.service_interest || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API}/contact`, formData);
            toast.success('Message sent successfully! We\'ll be in touch soon.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                business_name: '',
                service_interest: '',
                message: ''
            });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        { icon: Mail, label: 'Email', value: 'hello@finmar.com.au', href: 'mailto:hello@finmar.com.au' },
        { icon: Phone, label: 'Phone', value: '+61 400 000 000', href: 'tel:+61400000000' },
        { icon: MapPin, label: 'Location', value: 'Sydney, NSW, Australia', href: null },
        { icon: Clock, label: 'Hours', value: 'Mon-Fri 9am-5pm AEST', href: null }
    ];

    return (
        <div className="min-h-screen pt-24" data-testid="contact-page">
            {/* Header */}
            <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-finmar-gold font-semibold text-sm uppercase tracking-wider">Contact Us</span>
                        <h1 className="font-heading text-4xl md:text-5xl font-bold text-finmar-navy mt-4 mb-6">
                            Let's Talk Business
                        </h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Have questions about our services? Ready to get started? 
                            We'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <h2 className="font-heading text-2xl font-bold text-finmar-navy mb-6">
                                Get in Touch
                            </h2>
                            <div className="space-y-6">
                                {contactInfo.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-finmar-gold/10 rounded-xl flex items-center justify-center shrink-0">
                                            <item.icon className="w-6 h-6 text-finmar-gold" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">{item.label}</p>
                                            {item.href ? (
                                                <a href={item.href} className="text-finmar-navy font-medium hover:text-finmar-gold transition-colors">
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="text-finmar-navy font-medium">{item.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Info Cards */}
                            <div className="mt-10 space-y-4">
                                <div className="bg-blue-50 rounded-xl p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calculator className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-semibold text-blue-900">Accounting Inquiries</h4>
                                    </div>
                                    <p className="text-sm text-blue-700">BAS, payroll, bookkeeping questions</p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Megaphone className="w-5 h-5 text-amber-600" />
                                        <h4 className="font-semibold text-amber-900">Marketing Inquiries</h4>
                                    </div>
                                    <p className="text-sm text-amber-700">Social media, ads, branding questions</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        <h4 className="font-semibold text-purple-900">AI & Automation</h4>
                                    </div>
                                    <p className="text-sm text-purple-700">Dashboard, CRM, automation queries</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-white rounded-2xl shadow-card p-8 border border-slate-100">
                                <h3 className="font-heading text-xl font-semibold text-finmar-navy mb-6">
                                    Send us a Message
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <Label htmlFor="name" className="text-slate-700">Full Name *</Label>
                                            <div className="relative mt-1.5">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="John Smith"
                                                    className="pl-10 h-12"
                                                    data-testid="contact-name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="text-slate-700">Email *</Label>
                                            <div className="relative mt-1.5">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="you@business.com.au"
                                                    className="pl-10 h-12"
                                                    data-testid="contact-email"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                                            <div className="relative mt-1.5">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+61 400 000 000"
                                                    className="pl-10 h-12"
                                                    data-testid="contact-phone"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="business_name" className="text-slate-700">Business Name</Label>
                                            <div className="relative mt-1.5">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <Input
                                                    id="business_name"
                                                    name="business_name"
                                                    value={formData.business_name}
                                                    onChange={handleChange}
                                                    placeholder="Your Business Pty Ltd"
                                                    className="pl-10 h-12"
                                                    data-testid="contact-business"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="service_interest" className="text-slate-700">Service Interest *</Label>
                                        <Select 
                                            value={formData.service_interest} 
                                            onValueChange={(value) => setFormData({...formData, service_interest: value})}
                                        >
                                            <SelectTrigger className="mt-1.5 h-12" data-testid="contact-service">
                                                <SelectValue placeholder="Select a service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="accounting">Accounting & Bookkeeping</SelectItem>
                                                <SelectItem value="marketing">Digital Marketing</SelectItem>
                                                <SelectItem value="ai">AI Tools & Automation</SelectItem>
                                                <SelectItem value="combined">Combined Package</SelectItem>
                                                <SelectItem value="other">Other / General Inquiry</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="message" className="text-slate-700">Message *</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell us about your business needs..."
                                            className="mt-1.5 min-h-[150px]"
                                            data-testid="contact-message"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy font-semibold"
                                        data-testid="contact-submit"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
