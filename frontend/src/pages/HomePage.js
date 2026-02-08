import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { 
    ArrowRight, CheckCircle2, Calculator, Megaphone, Sparkles, 
    TrendingUp, Shield, Clock, Users, Star, ChevronRight,
    BarChart3, FileText, Zap, Target
} from 'lucide-react';

const HomePage = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const stagger = {
        animate: { transition: { staggerChildren: 0.1 } }
    };

    const services = [
        {
            icon: Calculator,
            title: 'Accounting & Bookkeeping',
            description: 'Monthly bookkeeping, BAS & GST reporting, payroll processing, and Xero/QuickBooks support.',
            features: ['BAS & GST Compliance', 'Payroll Processing', 'Financial Statements'],
            color: 'bg-blue-50 text-blue-600'
        },
        {
            icon: Megaphone,
            title: 'Digital Marketing',
            description: 'Social media management, Google & Meta Ads, SEO optimization, and content creation.',
            features: ['Social Media Management', 'Google & Meta Ads', 'SEO Optimization'],
            color: 'bg-amber-50 text-amber-600'
        },
        {
            icon: Sparkles,
            title: 'AI Tools & Automation',
            description: 'AI Financial Dashboard, Document OCR, CRM automation, and business insights.',
            features: ['AI Financial Dashboard', 'Document Automation', 'Marketing Workflows'],
            color: 'bg-purple-50 text-purple-600'
        }
    ];

    const stats = [
        { value: '500+', label: 'Active Clients', icon: Users },
        { value: '$50M+', label: 'Revenue Managed', icon: TrendingUp },
        { value: '99.9%', label: 'Compliance Rate', icon: Shield },
        { value: '24/7', label: 'AI Support', icon: Clock }
    ];

    const testimonials = [
        {
            quote: "FINMAR transformed our business operations. Their accounting and marketing integration saved us over 20 hours per week.",
            author: "Sarah Mitchell",
            role: "CEO, Mitchell Trades",
            rating: 5
        },
        {
            quote: "The AI dashboard gives us real-time insights we never had before. Absolutely game-changing for our growth.",
            author: "James Chen",
            role: "Founder, Chen Medical",
            rating: 5
        },
        {
            quote: "Finally, one platform that handles compliance AND growth. The best investment we've made this year.",
            author: "Emma Wilson",
            role: "Director, Wilson Retail",
            rating: 5
        }
    ];

    const benefits = [
        { icon: Target, title: 'One Platform', desc: 'Finance + Marketing + AI in one place' },
        { icon: BarChart3, title: 'Predictable Pricing', desc: 'Transparent monthly subscriptions' },
        { icon: Zap, title: 'AI-Powered', desc: 'Automation that saves hours' },
        { icon: FileText, title: 'ATO Compliant', desc: '100% Australian tax compliance' }
    ];

    return (
        <div className="overflow-hidden" data-testid="home-page">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-finmar-gold/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-finmar-coral/10 rounded-full blur-3xl" />
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-8">
                                <Sparkles className="w-4 h-4 text-finmar-gold" />
                                Australia's #1 Business Platform
                            </div>
                            
                            <h1 className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                                Finance. Marketing.{' '}
                                <span className="text-finmar-gold">Automated.</span>
                            </h1>
                            
                            <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-xl">
                                FINMAR combines Accounting, Digital Marketing, and AI Automation 
                                into one powerful subscription platform. Built for Australian SMBs.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/pricing">
                                    <Button 
                                        size="lg" 
                                        className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy font-semibold rounded-full px-8 h-14 text-lg"
                                        data-testid="hero-get-started-btn"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/services">
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg"
                                        data-testid="hero-explore-btn"
                                    >
                                        Explore Services
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1634117622592-114e3024ff27?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMGZpbmFuY2lhbCUyMGdyb3d0aCUyMGdyYXBoJTIwM2R8ZW58MHx8fHwxNzcwNTM1OTMwfDA&ixlib=rb-4.1.0&q=85"
                                    alt="FINMAR Dashboard Preview"
                                    className="rounded-2xl shadow-2xl"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Revenue Growth</p>
                                            <p className="text-xl font-bold text-finmar-navy">+47%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={index}
                                variants={fadeInUp}
                                className="text-center"
                            >
                                <div className="w-14 h-14 mx-auto bg-finmar-gold/10 rounded-xl flex items-center justify-center mb-4">
                                    <stat.icon className="w-7 h-7 text-finmar-gold" />
                                </div>
                                <p className="font-heading text-3xl md:text-4xl font-bold text-finmar-navy">{stat.value}</p>
                                <p className="text-slate-500 mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 bg-slate-50" id="services">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <span className="text-finmar-gold font-semibold text-sm uppercase tracking-wider">Our Services</span>
                        <h2 className="font-heading text-4xl md:text-5xl font-bold text-finmar-navy mt-4 mb-6">
                            Everything Your Business Needs
                        </h2>
                        <p className="text-slate-600 text-lg">
                            One platform. Complete business support. From compliance to growth.
                        </p>
                    </motion.div>

                    <motion.div 
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group"
                            >
                                <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <service.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold text-finmar-navy mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-slate-600 mb-6">{service.description}</p>
                                <ul className="space-y-3">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle2 className="w-4 h-4 text-finmar-gold" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="text-center mt-12">
                        <Link to="/services">
                            <Button variant="outline" size="lg" className="rounded-full" data-testid="view-all-services-btn">
                                View All Services
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-finmar-gold font-semibold text-sm uppercase tracking-wider">Why FINMAR</span>
                            <h2 className="font-heading text-4xl md:text-5xl font-bold text-finmar-navy mt-4 mb-6">
                                Built for Australian Business Success
                            </h2>
                            <p className="text-slate-600 text-lg mb-10">
                                Stop juggling multiple agencies and tools. FINMAR delivers complete business 
                                support in one integrated platform—designed specifically for Australian SMBs.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-6">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-finmar-gold/10 rounded-lg flex items-center justify-center shrink-0">
                                            <benefit.icon className="w-5 h-5 text-finmar-gold" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-finmar-navy">{benefit.title}</h4>
                                            <p className="text-sm text-slate-500">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1748050869869-0efaf9599d83?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWFtJTIwY29sbGFib3JhdGlvbiUyMGF1c3RyYWxpYW58ZW58MHx8fHwxNzcwNTM1OTI1fDA&ixlib=rb-4.1.0&q=85"
                                alt="Team collaboration"
                                className="rounded-2xl shadow-xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-finmar-navy">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-finmar-gold font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                        <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mt-4">
                            Trusted by Australian Businesses
                        </h2>
                    </motion.div>

                    <motion.div 
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {testimonials.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-finmar-gold text-finmar-gold" />
                                    ))}
                                </div>
                                <p className="text-slate-300 mb-6 leading-relaxed">"{item.quote}"</p>
                                <div>
                                    <p className="text-white font-semibold">{item.author}</p>
                                    <p className="text-slate-400 text-sm">{item.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-finmar-gold to-amber-400">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-heading text-4xl md:text-5xl font-bold text-finmar-navy mb-6">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="text-finmar-navy/80 text-lg mb-10 max-w-2xl mx-auto">
                            Join hundreds of Australian businesses already using FINMAR to streamline 
                            their operations, stay compliant, and grow faster.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/pricing">
                                <Button 
                                    size="lg" 
                                    className="bg-finmar-navy hover:bg-finmar-navy/90 text-white rounded-full px-10 h-14 text-lg"
                                    data-testid="cta-get-started-btn"
                                >
                                    View Pricing
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button 
                                    size="lg" 
                                    variant="outline"
                                    className="border-finmar-navy text-finmar-navy hover:bg-finmar-navy/10 rounded-full px-10 h-14 text-lg"
                                    data-testid="cta-contact-btn"
                                >
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
