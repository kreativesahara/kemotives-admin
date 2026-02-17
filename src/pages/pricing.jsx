import React, { useState, useEffect } from "react";
import { axiosPrivate } from "../api/axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";
import { subscriptionPlans } from "../data/subscriptionPlans";
import { SubscriptionCard } from "../components/cards/subscriptionCard";
import { handleSubscriptionSelection } from "../utils/subscriptionHandler";
import { showWarning, showInfo, showError } from "../utils/sweetAlert";
import { useSeoContext } from "../context/SeoProvider";

// Define the Pricing component
function Pricing() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const { updateSeo } = useSeoContext();
    const [loading, setLoading] = useState(false);
    const [userSubscription, setUserSubscription] = useState(null);
    const buildSeoTitle = () => {
        const base = 'Subscription Plans & Pricing | Diksx Cars & Spares';
        return base.length > 65 ? `${base.slice(0, 62)}...` : base;
    };
    const buildHeading = () => {
        const base = 'Pricing Plans & Subscriptions';
        const normalized = base.length < 20 ? `${base} | Diksx Cars` : base;
        return normalized.length > 70 ? `${normalized.slice(0, 67)}...` : normalized;
    };

    // Update SEO metadata for pricing page
    useEffect(() => {
        const canonicalUrl = typeof window !== 'undefined'
            ? window.location.href
            : 'https://www.diksxcars.co.ke/pricing';
        updateSeo({
            title: buildSeoTitle(),
            description: 'Choose from our flexible subscription plans for sellers. Post your vehicles and automotive parts with our affordable pricing options.',
            canonical: canonicalUrl,
            type: 'website',
            additionalMetaTags: [
                { name: 'robots', content: 'index, follow' },
            ]
        });
    }, [updateSeo]);

    // Check for existing subscription on component mount
    useEffect(() => {
        const checkSubscription = async () => {
            if (!auth?.id) return;

            setLoading(true);
            try {
                const { data } = await axiosPrivate.get(`/api/subscriptions/${auth.id}`);
                if (data.hasActiveSubscription) {
                    setUserSubscription(data.activeSubscription);
                }
            } catch (error) {
                // 404 is expected if user has no subscription
                if (error.response?.status !== 404) {
                    console.error("Error checking subscription:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, [auth?.id]);

    const handleSubscribe = async (plan) => {
        // Ensure the user is logged in
        if (!auth?.id) {
            showInfo("Welcome! To explore and subscribe to our premium seller plans, please log in first. This ensures you get access to all features and can manage your subscription effectively.");
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            // If user already has an active subscription, redirect to dashboard
            if (userSubscription) {
                showInfo("You already have an active subscription. Please visit your dashboard to manage it.");
                navigate('/dashboard');
                return;
            }

            // Use the subscription handler utility to select plan and navigate
            handleSubscriptionSelection(plan, navigate, auth);

        } catch (error) {
            console.error("Error processing subscription:", error);
            showError("Subscription process failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Layout>
            {/* Remove PageCanonical - canonical is set in updateSeo */}
            <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-center mb-2">{buildHeading()}</h1>
                    <p className="text-center mb-12 text-gray-600">Choose the perfect plan for your needs</p>

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                    ) : userSubscription ? (
                        <div className="bg-green-50 p-6 rounded-lg shadow-md mb-12 max-w-xl mx-auto">
                            <h2 className="text-2xl font-semibold mb-4">You Have an Active Subscription</h2>
                            <p className="mb-4">
                                Plan: <span className="font-medium">{userSubscription.planName}</span>
                            </p>
                            <p className="mb-4">
                                Status: <span className="font-medium">{userSubscription.status}</span>
                            </p>
                            {userSubscription.endDate && (
                                <p className="mb-6">
                                    Expires: <span className="font-medium">
                                        {new Date(userSubscription.endDate).toLocaleDateString()}
                                    </span>
                                    <span className="text-sm text-gray-600 block mt-1">
                                        (All subscriptions have a 30-day lifecycle)
                                    </span>
                                </p>
                            )}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    ) : (
                        <section className="mt-8">
                            <h2 className="text-2xl font-semibold mb-8">Sellers Tier</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subscriptionPlans.sellers.map((plan, index) => (
                                    <SubscriptionCard
                                        key={index}
                                        plan={plan}
                                        onSubscribe={handleSubscribe}
                                        loading={loading}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default Pricing;
