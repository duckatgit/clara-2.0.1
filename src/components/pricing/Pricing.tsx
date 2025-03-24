import React, { useEffect, useState, Suspense } from 'react';
import { Check, X, MessageSquare, Brain, Mic, Loader2 } from 'lucide-react';
import { api } from '@/lib/supabase';


const Pricing = () => {
    const [currentPlan, setCurrentPlan] = useState('')
    const [loading, setLoading] = useState(true);

    console.log('currentPlan', currentPlan)
    const plans = [
        {
            title: 'Free',
            price: 'Free',
            buttonVariant: 'secondary' as const,
            price_id: 'price_1R5kwZGzKQk7WiBaCgXj3Bnn',
            features: [
                { text: '20 text messages per day', included: true },
                { text: 'One-time personality test', included: true },
                { text: 'Voice chat', included: false },
            ],
        },
        {
            title: 'Premium',
            price: '$29',
            price_id: 'price_1R5kwZGzKQk7WiBaCgXj3Bnn',
            buttonVariant: 'primary' as const,
            isPopular: true,
            features: [
                { text: 'Unlimited text messages', included: true },
                { text: 'Personality test (unlimited)', included: true },
                { text: '60 minutes of voice chat with Clara per month', included: true },
            ],
        },
        {
            title: 'Professional',
            price: '$89',
            price_id: 'price_1R5kxMGzKQk7WiBaAg3PJHrA',
            buttonVariant: 'secondary' as const,
            features: [
                { text: 'Unlimited text messages', included: true },
                { text: 'Personality test (unlimited)', included: true },
                { text: '180 minutes of voice chat with Clara per month', included: true },
            ],
        },
    ];

    const loadPaymentLink = async (pricing_id: string) => {
        try {
            const data: any = await api.createSubscriptionPaymentLink(pricing_id)
            window.location.replace(data)
        } catch (error) {
            console.error('Failed to load pricing:', error);
        }
    };

    const getSubcription = async () => {
        try {

            const data: any = await api.updateSubscriptionFromStripe()
            if (!data) {
                const subscriptionData: any = await api.getSubscription()
                console.log('subscriptionData?.is_premium', subscriptionData)
                if (!subscriptionData?.data?.is_premium) {
                    setCurrentPlan('Free')
                }
                console.log('subscriptionData', subscriptionData?.data)
                setLoading(false);
                return;
            }
            else {
                const subscriptionData: any = await api.getSubscription()
                console.log('subscriptionData?.is_premium', subscriptionData?.is_premium)
                if (!subscriptionData?.data?.is_premium) {
                    setCurrentPlan('Free')
                }
                setLoading(false);
                return;
            }
        } catch (err) {
            const subscriptionData: any = await api.getSubscription()
            console.log('subscriptionData', subscriptionData?.data)
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getSubcription();
        
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading pricing...</span>
                </div>
            </div>
        );
    }

    const buttonStyles: any = {
        default: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        secondary: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300'
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                        Choose Your Plan
                    </h1>
                    <p className="mt-5 text-xl text-gray-500">
                        Select the perfect plan for your needs
                    </p>
                </div>

                <div className="mt-16">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {plans.map((plan: any, index) => (
                            // <PricingCard key={index} {...plan} loadPaymentLink={loadPaymentLink} />
                            <div className={`relative bg-white rounded-2xl shadow-xl p-8 ${plan?.isPopular ? 'border-2 border-indigo-600' : ''}`}>
                                {plan?.isPopular && (
                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-gray-900">{plan?.title}</h3>
                                    <div className="mt-4 flex items-baseline justify-center">
                                        <span className="text-5xl font-bold tracking-tight text-gray-900">{plan?.price}</span>
                                        {plan?.price !== 'Free' && <span className="text-lg text-gray-500">/month</span>}
                                    </div>
                                </div>
                                <ul className="mt-8 space-y-4">
                                    {plan?.features.map((feature: any, index: any) => (
                                        <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                {feature.included ? (
                                                    <Check className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <X className="h-6 w-6 text-red-500" />
                                                )}
                                            </div>
                                            <span className="ml-3 text-base text-gray-700">{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <button
                                        className={currentPlan === plan.title? `disabled w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 bg-white  text-gray-800 border border-gray-300 cursor-not-allowed
                                        ` : `w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${buttonStyles[plan?.buttonVariant]
                                            }`}
                                        onClick={() => loadPaymentLink(plan.price_id)}
                                    >
                                        {currentPlan === plan.title ? 'Current Plan' : 'Buy Plan'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
                    <div className="flex flex-col items-center">
                        <MessageSquare className="h-12 w-12 text-indigo-600" />
                        <h3 className="mt-4 text-lg font-semibold">Smart Conversations</h3>
                        <p className="mt-2 text-gray-500">
                            Engage in meaningful conversations with our AI companion
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Brain className="h-12 w-12 text-indigo-600" />
                        <h3 className="mt-4 text-lg font-semibold">Personality Analysis</h3>
                        <p className="mt-2 text-gray-500">
                            Get insights into your personality and communication style
                        </p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Mic className="h-12 w-12 text-indigo-600" />
                        <h3 className="mt-4 text-lg font-semibold">Voice Interaction</h3>
                        <p className="mt-2 text-gray-500">
                            Connect through natural voice conversations
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Pricing;