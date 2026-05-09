import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { CheckCircle, Zap, Tag, ShieldCheck, TrendingUp, XCircle, PartyPopper } from 'lucide-react';
import { FREE_TIER_POST_LIMIT, PRO_TIER_POST_LIMIT, FREE_TIER_LIMIT } from '../config';
import { processPayment } from '../services/stripeService';
import { usePromoCodes } from '../contexts/PromoCodeContext';

const benefits = [
    {
        icon: <Zap size={24} className="text-primary-500" />,
        title: `Unlimited Generations`,
        description: `Go beyond the free limit of ${FREE_TIER_LIMIT} prompts per month and generate as much as you need.`
    },
    {
        icon: <TrendingUp size={24} className="text-primary-500" />,
        title: `More Community Submissions`,
        description: `Share more of your creations with the community, with a limit of ${PRO_TIER_POST_LIMIT} per day instead of just ${FREE_TIER_POST_LIMIT}.`
    },
    {
        icon: <ShieldCheck size={24} className="text-primary-500" />,
        title: `Ad-Free Experience`,
        description: `Enjoy a seamless and uninterrupted workflow without any advertisements.`
    },
    {
        icon: <CheckCircle size={24} className="text-primary-500" />,
        title: `Priority Access & Support`,
        description: `Get early access to new features and receive premium customer support.`
    }
];

type PaymentState = 'idle' | 'processing' | 'success';

const UpgradePage: React.FC = () => {
    const { user, upgradeToPro } = useAuth();
    const { validatePromoCode, incrementPromoCodeUsage } = usePromoCodes();
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');
    const [appliedCode, setAppliedCode] = useState<{ code: string; discount: number } | null>(null);
    const [promoError, setPromoError] = useState('');
    const [promoSuccess, setPromoSuccess] = useState('');
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [isApplying, setIsApplying] = useState(false);

    const basePrice = 9.90;
    const finalPrice = basePrice * (1 - (appliedCode?.discount || 0));

    const handleApplyPromo = async () => {
        setPromoError('');
        setPromoSuccess('');
        setAppliedCode(null);
        if (!promoCode.trim()) {
            setPromoError('Please enter a code.');
            return;
        }
        
        setIsApplying(true);
        const result = await validatePromoCode(promoCode);
        setIsApplying(false);

        if (result.success) {
            setPromoSuccess(result.message);
            setAppliedCode({ code: promoCode.toUpperCase(), discount: result.discount });
        } else {
            setPromoError(result.message);
        }
    };
    
    const handleUpgrade = async () => {
        if (!user) return;
        setPaymentState('processing');
        try {
            // Simulate calling backend to create Stripe session and process payment
            await processPayment(user, finalPrice);
            
            // If a promo code was used, finalize its use after successful payment
            if (appliedCode) {
                await incrementPromoCodeUsage(appliedCode.code);
            }

            // On successful payment, update user state
            upgradeToPro();
            
            // Show success screen
            setPaymentState('success');
        } catch (error) {
            console.error("Payment failed:", error);
            // In a real app, show an error message to the user
            setPaymentState('idle');
        }
    };

    const PaymentSuccessView: React.FC = () => (
        <div className="text-center p-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <PartyPopper size={56} className="text-green-500 animate-pop-in" />
            <h2 className="text-3xl font-bold">Welcome to Pro!</h2>
            <p className="text-gray-600 dark:text-gray-300">
                Your upgrade was successful. You now have access to all Pro features.
            </p>
            <Button onClick={() => navigate('/profile')} className="mt-4">
                Go to Your Profile
            </Button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Unlock Your Full Potential with <span className="text-primary-500">Prompter Pro</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Supercharge your creativity and productivity. Join Pro today.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">What you get with Pro:</h2>
                    {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-4 animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
                            <div>
                                <h3 className="font-semibold text-lg">{benefit.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col">
                    {paymentState === 'success' ? <PaymentSuccessView /> : (
                         <div className="flex flex-col space-y-6 h-full">
                            <h2 className="text-2xl font-bold text-center">Your Pro Subscription</h2>
                            
                            <div className="space-y-4">
                                <label htmlFor="promo-code" className="font-semibold">Promotional Code</label>
                                <div className="flex items-center space-x-2">
                                   <div className="relative flex-grow">
                                        <Tag size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            id="promo-code"
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Enter promo code"
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                            disabled={paymentState === 'processing'}
                                        />
                                   </div>
                                   <Button variant="secondary" onClick={handleApplyPromo} disabled={paymentState === 'processing'} isLoading={isApplying}>Apply</Button>
                                </div>
                                {promoError && <p className="text-sm text-red-500 flex items-center"><XCircle size={14} className="mr-1.5" />{promoError}</p>}
                                {promoSuccess && <p className="text-sm text-green-500 flex items-center"><CheckCircle size={14} className="mr-1.5" />{promoSuccess}</p>}
                            </div>

                            <div className="flex-grow"></div>
                            
                            <div className="text-center pt-6 border-t dark:border-gray-700">
                                {appliedCode && (
                                    <p className="text-xl text-gray-500 dark:text-gray-400 line-through">
                                        ${basePrice.toFixed(2)}
                                    </p>
                                )}
                                <p className="text-5xl font-extrabold text-gray-900 dark:text-white">
                                    ${finalPrice.toFixed(2)}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400">per month</p>
                            </div>

                            <Button 
                                onClick={handleUpgrade} 
                                className="w-full !py-3 !text-base" 
                                icon={<Zap size={20}/>}
                                isLoading={paymentState === 'processing'}
                                disabled={paymentState === 'processing'}
                            >
                                {paymentState === 'processing' ? 'Processing Payment...' : 'Upgrade and Get Pro Access'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;