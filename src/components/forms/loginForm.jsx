import React from 'react'
import { axiosPrivate } from '../../api/axios'
import useAuth from '../../hooks/useAuth'
import { Link, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert';
import Swal from 'sweetalert2';
import CookieConsent from './CookieConsent';

const LoginForm = () => {
    const { setAuth, persist, setPersist } = useAuth();
    const location = useLocation();
    const userRef = useRef();
    const errRef = useRef();
    window.scrollTo({ top: 0, behavior: 'instant' });
    const [errMsg, setErrMsg] = useState('');
    const from = location.state?.from?.pathname || "/vehicles";
    const [isLoading, setIsLoading] = useState(false);
    const [showCookieConsent, setShowCookieConsent] = useState(true);
    const [cookieStatus, setCookieStatus] = useState(localStorage.getItem('cookieConsent') || 'pending');

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        userRef.current.focus();
        // Only check for persisted login if cookie consent was previously accepted
        const cookieChoice = localStorage.getItem('cookieConsent');
        if (cookieChoice === 'accepted') {
            const persisted = JSON.parse(localStorage.getItem("persist") || false);
            if (persisted) setPersist(persisted);
        } else {
            setPersist(false); // Ensure persist is false if cookies not accepted
        }
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev, [e.target.name]: e.target.value
        }));
        setErrMsg('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (cookieStatus === 'pending') {
            showInfo('Please make a choice about cookies before signing in');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axiosPrivate.post('/api/auth/login', formData);
            const { accessToken, roles, userId } = response?.data;
            
            if (!userId) {
                setErrMsg('Login successful but user data incomplete. Please contact support.');
                return;
            }
            
            setAuth({
                email: formData.email,
                roles: roles,
                accessToken: accessToken,
                userId: userId
            });

            setFormData({ email: "", password: "" });
            
            showSuccess("Login successful").then((result) => {
                if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
                    window.location.href = from;
                }
            });
        } catch (error) {
            if (!error?.response) {
                setErrMsg('No Server Response');
            } else if (error.response?.status === 400) {
                setErrMsg('Missing Email or Password');
            } else if (error.response?.status === 401) {
                setErrMsg('Email Not Found');
            } else if (error.response?.status === 406) {
                setErrMsg('Invalid Password');
            } else {
                setErrMsg('Login Failed');
            }
            showError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }

    const handleCookieAccept = () => {
        setShowCookieConsent(false);
        setCookieStatus('accepted');
        // Only enable persist if cookies are accepted
        setPersist(true);
        localStorage.setItem("persist", JSON.stringify(true));
    };

    const handleCookieDecline = () => {
        setShowCookieConsent(false);
        setCookieStatus('declined');
        // Disable persist if cookies are declined
        setPersist(false);
        localStorage.removeItem("persist");
    };

    const togglePersist = () => {
        // Only allow toggling persist if cookies are accepted
        const cookieChoice = localStorage.getItem('cookieConsent');
        if (cookieChoice === 'accepted') {
            setPersist(prev => !prev);
        } else {
            showInfo('Please accept cookies to enable "Remember me" to stay Logged in');
        }
    };

    useEffect(() => {
        if (persist) {
            localStorage.setItem("persist", JSON.stringify(persist));
        } else {
            localStorage.removeItem("persist");
        }
    }, [persist]);
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Account Login | Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Please sign in to your account
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
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    ref={userRef}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    <FontAwesomeIcon 
                                        icon={showPassword ? faEyeSlash : faEye}
                                        className="text-gray-400 hover:text-gray-600" 
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="persist"
                                    onChange={togglePersist}
                                    checked={persist}
                                    className={`h-4 w-4 focus:ring-black border-gray-300 rounded ${
                                        localStorage.getItem('cookieConsent') !== 'accepted' 
                                        ? 'cursor-not-allowed opacity-50' 
                                        : 'cursor-pointer'
                                    }`}
                                />
                                <label 
                                    htmlFor="persist" 
                                    className={`ml-2 block text-sm text-gray-700 ${
                                        localStorage.getItem('cookieConsent') !== 'accepted' 
                                        ? 'cursor-not-allowed opacity-50' 
                                        : 'cursor-pointer'
                                    }`}
                                >
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-black hover:text-gray-800">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading || cookieStatus === 'pending'}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${isLoading || cookieStatus === 'pending' 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-black hover:bg-gray-800'} 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
                            >
                                {isLoading ? 'Signing in...' : 
                                 cookieStatus === 'pending' ? 'Accept or decline cookies to continue' : 
                                 'Sign in'}
                            </button>
                            {cookieStatus === 'pending' && (
                                <p className="text-sm text-center text-gray-500">
                                    Please make a choice about cookies to continue
                                </p>
                            )}
                        </div>
                    </form>                   
                </div>
            </div>
            {showCookieConsent && (
                <CookieConsent 
                    onAccept={handleCookieAccept}
                    onDecline={handleCookieDecline}
                />
            )}
        </div>
    )
}

export default LoginForm
