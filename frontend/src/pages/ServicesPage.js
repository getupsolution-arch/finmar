import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { 
    Calculator, Megaphone, Sparkles, CheckCircle2, ArrowRight,
    FileText, DollarSign, Users, TrendingUp, BarChart3, Globe,
    Smartphone, Mail, Search, Palette, Bot, Brain, Zap, Shield
} from 'lucide-react';

const ServicesPage = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const accountingServices = [
        { icon: FileText, title: 'Monthly Bookkeeping', desc: 'Accurate financial records maintained every month' },
        { icon: DollarSign, title: 'BAS & GST Reporting', desc: 'Timely lodgement and compliance with ATO requirements' },
        { icon: Users, title: 'Payroll Processing', desc: 'Employee payments, super, and STP compliance' },
        { icon: TrendingUp, title: 'Financial Statements', desc: 'P&L, Balance Sheet, and Cash Flow reports' },
        { icon: Shield, title: 'ATO Compliance', desc: 'Stay compliant with all Australian tax obligations' },
        { icon: BarChart3, title: 'Xero/QuickBooks Support', desc: 'Full setup and ongoing support for cloud accounting' }
    ];

    const marketingServices = [
        { icon: Smartphone, title: 'Social Media Management', desc: 'Content creation and posting across all platforms' },
        { icon: Globe, title: 'Google & Meta Ads', desc: 'Paid advertising campaigns that drive results' },
        { icon: Search, title: 'SEO Optimization', desc: 'Improve your search rankings and visibility' },
        { icon: Palette, title: 'Branding & Design', desc: 'Logo design, brand guidelines, and visual identity' },
        { icon: Mail, title: 'Email Marketing', desc: 'Automated campaigns that nurture and convert' },
        { icon: FileText, title: 'Content Creation', desc: 'Blog posts, videos, and engaging social content' }
    ];

    const aiServices = [
        { icon: BarChart3, title: 'AI Financial Dashboard', desc: 'Real-time insights and automated reporting' },
        { icon: FileText, title: 'Document OCR', desc: 'Automated invoice and receipt processing' },
        { icon: Bot, title: 'AI CRM', desc: 'Smart customer management with email/SMS sequences' },
        { icon: Zap, title: 'Marketing Automation', desc: 'AI-powered workflows for lead nurturing' },
        { icon: Brain, title: 'Business Insights', desc: 'Predictive analytics and recommendations' },
        { icon: TrendingUp, title: 'Performance Tracking', desc: 'KPI monitoring and growth forecasting' }
    ];

    const ServiceSection = ({ id, icon: Icon, title, subtitle, description, services, bgColor, iconColor }) => (
        <section id={id} className={`py-24 ${bgColor}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                >
                    <div>
                        <div className={`w-16 h-16 ${iconColor} rounded-2xl flex items-center justify-center mb-6`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <span className="text-finmar-gold font-semibold text-sm uppercase tracking-wider">{subtitle}</span>
                        <h2 className="font-heading text-4xl font-bold text-finmar-navy mt-2 mb-6">{title}</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">{description}</p>
                        <Link to="/pricing">
                            <Button className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy rounded-full px-8" data-testid={`${id}-cta`}>
                                View Pricing
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {services.map((service, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all border border-slate-100"
                            >
                                <service.icon className="w-8 h-8 text-finmar-gold mb-4" />
                                <h4 className="font-semibold text-finmar-navy mb-2">{service.title}</h4>
                                <p className="text-sm text-slate-500">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );

    return (
        <div className="overflow-hidden" data-testid="services-page">
            {/* Hero */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-slate-900 to-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-6">
                            <Sparkles className="w-4 h-4 text-finmar-gold" />
                            Complete Business Solutions
                        </span>
                        <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">
                            Our Services
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            Everything your business needs to stay compliant, grow online, 
                            and operate more efficiently—all in one platform.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Service Sections */}
            <ServiceSection
                id="accounting"
                icon={Calculator}
                title="Accounting & Bookkeeping"
                subtitle="Financial Management"
                description="Professional bookkeeping and accounting services to keep your finances in order. From daily transactions to annual reporting, we ensure your business stays compliant with ATO requirements while providing you with clear financial insights."
                services={accountingServices}
                bgColor="bg-white"
                iconColor="bg-blue-100 text-blue-600"
            />

            <ServiceSection
                id="marketing"
                icon={Megaphone}
                title="Digital Marketing"
                subtitle="Growth & Visibility"
                description="Comprehensive digital marketing services to grow your online presence and attract more customers. From social media management to paid advertising, we help your business stand out in the digital landscape."
                services={marketingServices}
                bgColor="bg-slate-50"
                iconColor="bg-amber-100 text-amber-600"
            />

            <ServiceSection
                id="ai"
                icon={Sparkles}
                title="AI Tools & Automation"
                subtitle="Smart Business Operations"
                description="Leverage cutting-edge AI technology to automate repetitive tasks, gain deeper insights, and make data-driven decisions. Our AI-powered tools help you work smarter, not harder."
                services={aiServices}
                bgColor="bg-white"
                iconColor="bg-purple-100 text-purple-600"
            />

            {/* Industries Section */}
            <section className="py-24 bg-finmar-navy">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-finmar-gold font-semibold text-sm uppercase tracking-wider">Industries We Serve</span>
                        <h2 className="font-heading text-4xl font-bold text-white mt-4">
                            Built for Australian Businesses
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            'Small Businesses', 'Startups', 'Trades & Services', 'Retail & Hospitality',
                            'Medical & Healthcare', 'NDIS Providers', 'E-commerce', 'Consultants'
                        ].map((industry, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:bg-slate-800 transition-colors"
                            >
                                <CheckCircle2 className="w-6 h-6 text-finmar-gold mx-auto mb-3" />
                                <p className="text-white font-medium">{industry}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-finmar-gold to-amber-400">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-finmar-navy mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-finmar-navy/80 text-lg mb-8">
                        Choose your plan and start transforming your business today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/pricing">
                            <Button size="lg" className="bg-finmar-navy hover:bg-finmar-navy/90 text-white rounded-full px-10" data-testid="services-pricing-btn">
                                View Pricing
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button size="lg" variant="outline" className="border-finmar-navy text-finmar-navy hover:bg-finmar-navy/10 rounded-full px-10" data-testid="services-contact-btn">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServicesPage;
