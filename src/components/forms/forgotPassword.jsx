import Layout from "../Layout"
import { Link } from "react-router-dom"
import { axiosPrivate } from '../../api/axios';
import { useState, useRef, useEffect } from "react"
import { showSuccess, showError } from "../../utils/sweetAlert";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useSeoContext } from "../../providers/SeoProvider";

function ForgotPassword() {
    const { updateSeo } = useSeoContext();
    const [formData, setFormData] = useState({ email: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        const canonicalUrl = typeof window !== 'undefined'
            ? window.location.href
            : '/forgot-password';

        updateSeo({
            title: 'Reset your Diksx Cars password',
            description: 'Enter your email address to receive secure instructions to reset your Diksx Cars account password.',
            canonical: canonicalUrl,
            type: 'website',
        });
    }, [updateSeo]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev, [e.target.name]: e.target.value
        }));
        setErrMsg("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setErrMsg("Please enter your email address");
            return;
        }
        setIsLoading(true);
        try {
            await axiosPrivate.post('/api/forgot-password', formData);
            setEmailSent(true);
            showSuccess("Reset instructions sent to your email");
            setFormData({ email: "" });
        } catch (error) {
            console.error(error);
            if (!error?.response) {
                setErrMsg('No Server Response');
            } else if (error.response?.status === 404) {
                setErrMsg('Email not found');
            } else {
                setErrMsg('Failed to send reset instructions');
            }
            showError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {emailSent ? (
                        <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                            <p className="text-gray-600">
                                We've sent password reset instructions to your email address.
                            </p>
                            <div className="pt-4 space-y-3">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    Return to Login
                                </Link>
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    Try another email
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Reset your account password
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter your email address and we'll send you instructions to reset your Diksx Cars account password.
                                </p>
                            </div>

                            {errMsg && (
                                <div
                                    ref={errRef}
                                    className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md"
                                    role="alert"
                                >
                                    <p className="text-sm font-medium">{errMsg}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                                    </button>

                                    <Link
                                        to="/login"
                                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default ForgotPassword