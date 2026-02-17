import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth, persist } = useAuth();

    useEffect(() => {
        let mounted = true; // Improved naming for clarity

        const verifyRefreshToken = async () => {
            // Check if logout is in progress - don't refresh if we're logging out
            const logoutInProgress = localStorage.getItem("logoutInProgress");
            if (logoutInProgress === "true") {
                setIsLoading(false);
                return;
            }

            if (!persist) {
                setIsLoading(false); // Skip token verification if persistence is off
                return;
            }
            try {
                await refresh(); // Refresh token and update auth state
            } catch (err) {
                console.error("Error verifying refresh token:", err.message);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        if (!auth?.accessToken) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }

        return () => {
            mounted = false; // Cleanup
        };
    }, [auth?.accessToken, persist, refresh]); // Include dependencies to avoid stale closures

    return !persist ? (
        <Outlet />
    ) : isLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="flex flex-col items-center p-8 rounded-lg">
                <img 
                    title="Preview"
                    src="/diksx.png" 
                    alt="Diksx Cars & Spares" 
                    className="w-45 h-40 mb-4"
                />
                <div className="mb-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-l-4 border-r-4 border-transparent border-opacity-50 animate-pulse"></div>
                    </div>
                </div>
                <p className="text-lg font-medium text-gray-700">Loading your experience...</p>
                <p className="text-sm text-gray-500 mt-2">Connecting to Diksx Cars & Spares</p>
            </div>
        </div>
    ) : (
        <Outlet />
    );
};

export default PersistLogin;
