import { useRef, useState, useEffect } from "react";
import { axiosPrivate } from "../../api/axios";
import { Link, useLocation, Navigate } from "react-router-dom";
import { faCheck, faTimes, faInfoCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Layout from '../Layout'
import { showSuccess, showError } from "../../utils/sweetAlert";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const ResetPassword = () => {
    const location = useLocation();
    const from = location.state?.from?.pathname || "/login";

    const errRef = useRef();
    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState("");
    const [invalidToken, setInvalidToken] = useState(false);

    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showMatchPassword, setShowMatchPassword] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        matchPassword: ""
    });

    useEffect(() => {
        // Read token from URL query parameters on component mount
        const params = new URLSearchParams(location.search);
        const urlToken = params.get("token");
        if (urlToken) {
            setToken(urlToken);
        } else {
            setInvalidToken(true);
            setErrMsg("Invalid or missing reset token. Please request a new password reset link.");
        }
    }, [location.search]);

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
        const v1 = PWD_REGEX.test(formData.password);
        
        if (!token) {
            setErrMsg("Invalid password reset token");
            return;
        }
        if (!v1) {
            setErrMsg("Invalid Password Format");
            return;
        }
        try {
            await axiosPrivate.patch(`/api/reset-password/${token}`, { password: formData.password });
            setSuccess(true);
            showSuccess("Password reset successfully");
            setFormData({
                password: "",
                matchPassword: ""
            });
            // Redirect to the login page after a short delay
            setTimeout(() => {
                window.location.href = from;
            }, 2000);

        } catch (error) {
            if (!error?.response) {
                setErrMsg("No Server Response");
            } else if (error.response?.status === 404) {          
                setErrMsg("Reset Failed - Invalid or expired token");
            } else {
                setErrMsg("Password Reset Failed");
            }
            showError(errMsg);
            if (errRef.current) {
                errRef.current.focus();
            }
        }
    };

    // Redirect if token is invalid
    if (invalidToken) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
                        <p className="font-bold">Invalid Password Reset Link</p>
                        <p className="text-sm">{errMsg}</p>
                        <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 underline mt-2 block">
                            kindly Request for a New Reset Link
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {success ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative max-w-md">
                        <p className="font-bold">Success!</p>
                        <p>Your password has been reset successfully.</p>
                        <p>Redirecting to login page...</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col pt-8 items-center min-h-[60vh]">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col p-6 gap-4 w-[400px] md:border-2 md:rounded-lg md:shadow-2xl"
                    >
                        <div className="py-4 text-center">
                            <h1 className="text-2xl font-bold tracking-widest mb-2">Reset Your Password</h1>
                            <p className="text-gray-600 text-sm">Please enter your new password below</p>
                            {errMsg && (
                                <div
                                    ref={errRef}
                                    aria-live="assertive"
                                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mt-4 rounded"
                                >
                                    {errMsg}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="password" className="flex items-center gap-1 mb-1">
                                    New Password:
                                    {validPwd ? (
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                                    ) : (
                                        formData.password && (
                                            <>
                                                <FontAwesomeIcon icon={faTimes} className="text-red-500" />
                                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                                            </>
                                        )
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setPwdFocus(true)}
                                        onBlur={() => setPwdFocus(false)}
                                        autoComplete="new-password"
                                        placeholder="Enter new password"
                                        aria-invalid={validPwd ? "false" : "true"}
                                        aria-describedby="pwdnote"
                                        className="w-full py-2 px-3 border-2 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        onClick={() => setShowPassword(prev => !prev)}
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                                <p
                                    id="pwdnote"
                                    className={pwdFocus && !validPwd ? "text-sm text-gray-600 mt-1" : "hidden"}
                                >
                                    <FontAwesomeIcon icon={faInfoCircle} className="inline mr-1" />
                                    8 to 24 characters<br />
                                    Must include uppercase and lowercase letters, a number and a special character<br />
                                    Allowed special characters: ! @ # $ %
                                </p>
                            </div>

                            <div>
                                <label htmlFor="matchPassword" className="flex items-center gap-1 mb-1">
                                    Confirm Password:
                                    {validMatch && formData.matchPassword ? (
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                                    ) : (
                                        formData.matchPassword && (
                                            <>
                                                <FontAwesomeIcon icon={faTimes} className="text-red-500" />
                                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                                            </>
                                        )
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showMatchPassword ? "text" : "password"}
                                        id="matchPassword"
                                        name="matchPassword"
                                        value={formData.matchPassword}
                                        onChange={handleChange}
                                        onFocus={() => setMatchFocus(true)}
                                        onBlur={() => setMatchFocus(false)}
                                        autoComplete="new-password"
                                        placeholder="Confirm new password"
                                        className="w-full py-2 px-3 border-2 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        onClick={() => setShowMatchPassword(prev => !prev)}
                                    >
                                        <FontAwesomeIcon icon={showMatchPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                                <p
                                    id="confirmnote"
                                    className={matchFocus && !validMatch ? "text-sm text-gray-600 mt-1" : "hidden"}
                                >
                                    <FontAwesomeIcon icon={faInfoCircle} className="inline mr-1" />
                                    Must match the first password input field.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mt-4">
                            <button
                                type="submit"
                                disabled={!validPwd || !validMatch}
                                className={`w-full py-2 rounded-md text-white font-medium
                                    ${(!validPwd || !validMatch)
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-black hover:bg-gray-800'}`}
                            >
                                Reset Password
                            </button>
                            
                            <Link
                                to="/login"
                                className="block w-full py-2 text-center text-black border-2 border-black rounded-md hover:bg-gray-100"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            )}
        </Layout>
    );
};

export default ResetPassword;