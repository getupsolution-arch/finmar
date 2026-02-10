import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Check, Calculator, Megaphone, Sparkles, ArrowRight, Star,
    Loader2, Building2, Phone, MapPin, FileText, Briefcase
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PricingPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('combined');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBusinessForm, setShowBusinessForm] = useState(false);
    const [businessDetails, setBusinessDetails] = useState({
        business_name: '',
        abn: '',
        industry: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        phone: ''
    });
    const [packages, setPackages] = useState({
        accounting: {},
        marketing: {},
        combined: {},
        addons: {}
    });
    const { isAuthenticated, user, token, updateUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const [acc, mkt, cmb, add] = await Promise.all([
                    axios.get(`${API}/packages/accounting`),
                    axios.get(`${API}/packages/marketing`),
                    axios.get(`${API}/packages/combined`),
                    axios.get(`${API}/packages/addons`)
                ]);
                setPackages({
                    accounting: acc.data,
                    marketing: mkt.data,
                    combined: cmb.data,
                    addons: add.data
                });
            } catch (error) {
                console.error('Failed to fetch packages:', error);
            }
        };
        fetchPackages();
    }, []);

    const accountingFeatures = {
        starter: ['Monthly bookkeeping', 'Bank reconciliation', 'BAS & GST reporting', '1 payroll employee', 'Monthly statements'],
        growth: ['All Starter features', 'Quarterly reviews', '2 payroll employees', 'Cash flow reporting', 'Xero support'],
        advanced: ['All Growth features', 'Monthly strategy call', '3 payroll employees', 'Budgeting assistance', 'Priority support'],
        premium: ['All Advanced features', 'CFO advisory', '5 payroll employees', 'Custom reporting', 'Dedicated accountant']
    };

    const marketingFeatures = {
        basic: ['8 social posts/month', 'Basic graphic design', 'Social media management', 'Monthly report'],
        growth: ['12 social posts/month', 'Google Business Profile', 'Ad creative design', 'Monthly strategy session'],
        pro: ['16 social posts/month', '1 video reel/month', 'Google + Meta Ads', 'SEO basics', 'Review management'],
        ultimate: ['20+ posts/month', '4 video reels/month', 'Website updates', 'Blog content', 'AI Dashboard', 'CRM setup']
    };

    const combinedFeatures = {
        essentials: ['Starter Accounting', 'Basic Marketing', 'Single invoice', 'Shared dashboard'],
        growth: ['Growth Accounting', 'Growth Marketing', '10% bundle savings', 'Integrated reporting'],
        pro: ['Advanced Accounting', 'Pro Marketing', '15% bundle savings', 'Priority support'],
        executive: ['Premium Accounting', 'Ultimate Marketing', 'AI Dashboard', 'AI CRM', 'Executive reporting']
    };

    const toggleAddon = (addonKey) => {
        setSelectedAddons(prev => 
            prev.includes(addonKey) 
                ? prev.filter(a => a !== addonKey)
                : [...prev, addonKey]
        );
    };

    const calculateTotal = () => {
        let total = 0;
        if (selectedPlan) {
            const category = packages[selectedCategory];
            if (category && category[selectedPlan]) {
                total = category[selectedPlan].price;
            }
        }
        selectedAddons.forEach(addon => {
            if (packages.addons[addon]) {
                total += packages.addons[addon].price;
            }
        });
        return total;
    };

    // Pre-fill business details from user profile
    useEffect(() => {
        if (user) {
            setBusinessDetails(prev => ({
                ...prev,
                business_name: user.business_name || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleSubscribeClick = () => {
        if (!selectedPlan) {
            toast.error('Please select a plan');
            return;
        }

        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/pricing' } });
            return;
        }

        // Show business details form
        setShowBusinessForm(true);
    };

    const handleBusinessDetailsSubmit = async () => {
        // Validate required fields
        if (!businessDetails.business_name || !businessDetails.abn || !businessDetails.industry || !businessDetails.phone) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // Save business details to user profile
            await axios.put(`${API}/profile/business`, businessDetails, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            // Proceed to checkout
            const response = await axios.post(`${API}/payments/checkout`, {
                plan_type: selectedCategory,
                plan_tier: selectedPlan,
                add_ons: selectedAddons,
                origin_url: window.location.origin
            }, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            window.location.href = response.data.checkout_url;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to start checkout');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!selectedPlan) {
            toast.error('Please select a plan');
            return;
        }

        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/pricing' } });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API}/payments/checkout`, {
                plan_type: selectedCategory,
                plan_tier: selectedPlan,
                add_ons: selectedAddons,
                origin_url: window.location.origin
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('finmar_token')}` },
                withCredentials: true
            });

            window.location.href = response.data.checkout_url;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to start checkout');
        } finally {
            setLoading(false);
        }
    };

    const renderPricingCard = (key, pkg, features, isPopular = false) => (
        <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative flex flex-col p-8 bg-white rounded-3xl border-2 transition-all cursor-pointer ${
                selectedPlan === key 
                    ? 'border-finmar-gold shadow-lg scale-[1.02]' 
                    : 'border-slate-200 hover:border-slate-300'
            } ${isPopular ? 'ring-2 ring-finmar-gold ring-offset-2' : ''}`}
            onClick={() => setSelectedPlan(key)}
            data-testid={`pricing-card-${key}`}
        >
            {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-finmar-gold text-finmar-navy">
                    <Star className="w-3 h-3 mr-1" /> Most Popular
                </Badge>
            )}
            
            <div className="mb-6">
                <h3 className="font-heading text-xl font-semibold text-finmar-navy">{pkg.name}</h3>
                {pkg.revenue_range && (
                    <p className="text-sm text-slate-500 mt-1">{pkg.revenue_range}</p>
                )}
            </div>
            
            <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-finmar-navy">
                    ${pkg.price}
                </span>
                <span className="text-slate-500">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-5 h-5 text-finmar-gold shrink-0 mt-0.5" />
                        {feature}
                    </li>
                ))}
            </ul>
            
            <Button 
                className={`w-full ${selectedPlan === key 
                    ? 'bg-finmar-navy hover:bg-finmar-navy/90 text-white' 
                    : 'bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy'}`}
            >
                {selectedPlan === key ? 'Selected' : 'Select Plan'}
            </Button>
        </motion.div>
    );

    return (
        <div className="min-h-screen pt-24 pb-20" data-testid="pricing-page">
            {/* Header */}
            <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-finmar-gold font-semibold text-sm uppercase tracking-wider">Pricing</span>
                        <h1 className="font-heading text-4xl md:text-5xl font-bold text-finmar-navy mt-4 mb-6">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Choose the plan that fits your business. All prices in AUD with no hidden fees.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Tables */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Tabs value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedPlan(null); }} className="w-full">
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
                            <TabsTrigger value="combined" className="gap-2" data-testid="tab-combined">
                                <Sparkles className="w-4 h-4" /> Combined
                            </TabsTrigger>
                            <TabsTrigger value="accounting" className="gap-2" data-testid="tab-accounting">
                                <Calculator className="w-4 h-4" /> Accounting
                            </TabsTrigger>
                            <TabsTrigger value="marketing" className="gap-2" data-testid="tab-marketing">
                                <Megaphone className="w-4 h-4" /> Marketing
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="combined">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.entries(packages.combined).map(([key, pkg], idx) => 
                                    renderPricingCard(key, pkg, combinedFeatures[key] || [], idx === 2)
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="accounting">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.entries(packages.accounting).map(([key, pkg], idx) => 
                                    renderPricingCard(key, pkg, accountingFeatures[key] || [], idx === 1)
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="marketing">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.entries(packages.marketing).map(([key, pkg], idx) => 
                                    renderPricingCard(key, pkg, marketingFeatures[key] || [], idx === 2)
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Add-ons */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-bold text-finmar-navy text-center mb-8">
                        Enhance Your Plan with Add-ons
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(packages.addons).map(([key, addon]) => (
                            <motion.div
                                key={key}
                                whileHover={{ scale: 1.02 }}
                                className={`p-4 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                                    selectedAddons.includes(key) 
                                        ? 'border-finmar-gold bg-finmar-gold/5' 
                                        : 'border-slate-200'
                                }`}
                                onClick={() => toggleAddon(key)}
                                data-testid={`addon-${key}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-finmar-navy text-sm">{addon.name}</h4>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedAddons.includes(key) 
                                            ? 'bg-finmar-gold border-finmar-gold' 
                                            : 'border-slate-300'
                                    }`}>
                                        {selectedAddons.includes(key) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-finmar-navy">${addon.price}/mo</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Checkout Summary */}
            {(selectedPlan || selectedAddons.length > 0) && (
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 bg-finmar-navy sticky bottom-0 z-40"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-white">
                                <p className="text-slate-400 text-sm">Your Selection</p>
                                <p className="font-heading text-2xl font-bold">
                                    ${calculateTotal().toFixed(2)} <span className="text-slate-400 text-lg font-normal">/month</span>
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleSubscribeClick}
                                disabled={loading || !selectedPlan}
                                className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy font-semibold rounded-full px-10 h-14"
                                data-testid="subscribe-btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {isAuthenticated ? 'Subscribe Now' : 'Sign In to Subscribe'}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Business Details Modal */}
            <Dialog open={showBusinessForm} onOpenChange={setShowBusinessForm}>
                <DialogContent className="sm:max-w-lg" data-testid="business-details-modal">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl text-finmar-navy flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-finmar-gold" />
                            Business Details
                        </DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            Please provide your business information to continue with your subscription.
                        </p>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="business_name" className="text-finmar-navy font-medium">
                                Business Name <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="business_name"
                                    placeholder="Enter your business name"
                                    value={businessDetails.business_name}
                                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, business_name: e.target.value }))}
                                    className="pl-10"
                                    data-testid="input-business-name"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="abn" className="text-finmar-navy font-medium">
                                ABN (Australian Business Number) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="abn"
                                    placeholder="XX XXX XXX XXX"
                                    value={businessDetails.abn}
                                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, abn: e.target.value }))}
                                    className="pl-10"
                                    maxLength={14}
                                    data-testid="input-abn"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="industry" className="text-finmar-navy font-medium">
                                Industry <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={businessDetails.industry}
                                onValueChange={(value) => setBusinessDetails(prev => ({ ...prev, industry: value }))}
                            >
                                <SelectTrigger data-testid="select-industry">
                                    <SelectValue placeholder="Select your industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                                    <SelectItem value="hospitality">Hospitality & Food</SelectItem>
                                    <SelectItem value="construction">Construction & Trades</SelectItem>
                                    <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                                    <SelectItem value="professional">Professional Services</SelectItem>
                                    <SelectItem value="technology">Technology & IT</SelectItem>
                                    <SelectItem value="ndis">NDIS Provider</SelectItem>
                                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="transport">Transport & Logistics</SelectItem>
                                    <SelectItem value="real_estate">Real Estate</SelectItem>
                                    <SelectItem value="education">Education & Training</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-finmar-navy font-medium">
                                Phone Number <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="04XX XXX XXX"
                                    value={businessDetails.phone}
                                    onChange={(e) => setBusinessDetails(prev => ({ ...prev, phone: e.target.value }))}
                                    className="pl-10"
                                    data-testid="input-phone"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowBusinessForm(false)}
                            className="border-slate-200"
                            data-testid="cancel-business-form"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBusinessDetailsSubmit}
                            disabled={loading}
                            className="bg-finmar-gold hover:bg-finmar-gold/90 text-finmar-navy font-semibold"
                            data-testid="submit-business-form"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Continue to Payment
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FAQ */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-bold text-finmar-navy text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    
                    <div className="space-y-4">
                        {[
                            { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.' },
                            { q: 'Is there a setup fee?', a: 'No setup fees for any of our subscription plans. Only the Website & Branding add-on has a one-time $249 setup fee.' },
                            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards through our secure Stripe payment processing.' },
                            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You\'ll have access until the end of your billing period.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-xl p-6">
                                <h4 className="font-semibold text-finmar-navy mb-2">{item.q}</h4>
                                <p className="text-slate-600">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
