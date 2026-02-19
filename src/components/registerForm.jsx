import { useRef, useState, useEffect } from "react";
import { axiosPrivate } from "../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { faCheck, faTimes, faInfoCircle, faEye, faEyeSlash, faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showSuccess, showError } from "../utils/sweetAlert";

const MAIL_REGEX = /^(?=[a-z0-9@.]+$)(?=.*@)(?=.*\.)[a-z0-9]+(?:\.[a-z0-9]+)*@[a-z0-9]+(?:\.[a-z0-9]+)*\.[a-z]{2,}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const RegisterForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/login";

    const userRef = useRef();
    const errRef = useRef();
    window.scrollTo({ top: 0, behavior: 'instant' });

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [validMail, setValidMail] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        matchPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showMatchPassword, setShowMatchPassword] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setValidMail(MAIL_REGEX.test(formData.email));
    }, [formData.email]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(formData.password));
        setValidMatch(formData.password === formData.matchPassword);
    }, [formData.password, formData.matchPassword]);

    useEffect(() => {
        setErrMsg("");
    }, [formData]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v1 = MAIL_REGEX.test(formData.email);
        const v2 = PWD_REGEX.test(formData.password);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        setIsLoading(true);
        try {
            await axiosPrivate.post("/api/auth", formData);
            setSuccess(true);
            showSuccess("Registration successful");
            setFormData({
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                matchPassword: ""
            });
            setTimeout(() => {
                window.location.href = from;
            }, 2000);
        } catch (error) {
            if (!error?.response) {
                setErrMsg("No Server Response");
            } else if (error.response?.status === 409) {
                setErrMsg("Email Address Already Taken");
            } else {
                setErrMsg("Registration Failed");
            }
            showError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {success ? (
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <FontAwesomeIcon icon={faCheck} className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
                        <p className="text-gray-600">
                            Your account has been created successfully.
                        </p>
                        <p className="text-gray-600">
                            Redirecting to login page...
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Create your Diksx Cars account
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Join Diksx Cars today and start exploring
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                                        First Name
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="firstname"
                                            name="firstname"
                                            ref={userRef}
                                            value={formData.firstname}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                            placeholder="First name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                                        Last Name
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="lastname"
                                            name="lastname"
                                            value={formData.lastname}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                            placeholder="Last name"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                                    Email address
                                    {validMail && (
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                                    )}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setUserFocus(true)}
                                        onBlur={() => setUserFocus(false)}
                                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                                            formData.email ? (validMail ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <p
                                    className={
                                        userFocus && formData.email && !validMail
                                            ? "mt-1 text-xs text-red-600"
                                            : "hidden"
                                    }
                                >
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                    Please enter a valid email address
                                </p>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                                    Password
                                    {validPwd && (
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                                    )}
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
                                        onFocus={() => setPwdFocus(true)}
                                        onBlur={() => setPwdFocus(false)}
                                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                                            formData.password ? (validPwd ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                                        placeholder="Create a password"
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
                                <p
                                    className={pwdFocus && !validPwd ? "mt-1 text-xs text-gray-600" : "hidden"}
                                >
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                    8-24 characters<br />
                                    Must include uppercase and lowercase letters, a number and a special character<br />
                                    Allowed special characters: ! @ # $ %
                                </p>
                            </div>

                            <div>
                                <label htmlFor="matchPassword" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                                    Confirm Password
                                    {validMatch && formData.matchPassword && (
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                                    )}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showMatchPassword ? "text" : "password"}
                                        id="matchPassword"
                                        name="matchPassword"
                                        value={formData.matchPassword}
                                        onChange={handleChange}
                                        onFocus={() => setMatchFocus(true)}
                                        onBlur={() => setMatchFocus(false)}
                                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                                            formData.matchPassword ? (validMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                                        placeholder="Confirm your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowMatchPassword(prev => !prev)}
                                    >
                                        <FontAwesomeIcon 
                                            icon={showMatchPassword ? faEyeSlash : faEye}
                                            className="text-gray-400 hover:text-gray-600" 
                                        />
                                    </button>
                                </div>
                                <p
                                    className={matchFocus && !validMatch ? "mt-1 text-xs text-red-600" : "hidden"}
                                >
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                    Must match the first password
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={!validMail || !validPwd || !validMatch || isLoading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                                        (!validMail || !validPwd || !validMatch || isLoading) ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading ? 'Creating account...' : 'Create account'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    Sign in instead
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterForm;
