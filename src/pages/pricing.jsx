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
                </div>
            </div>
        </Layout>
    );
}

export default Pricing;
