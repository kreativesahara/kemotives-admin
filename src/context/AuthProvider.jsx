import { createContext, useState, useEffect, useRef } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    // Initialize persist from localStorage
    const [persist, setPersist] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("persist") || "false");
        } catch {
            return false;
        }
    });
    
    // Initialize auth state (will be loaded from localStorage in useEffect)
    const [auth, setAuth] = useState(null);
    const hasLoadedFromStorage = useRef(false);

    // Load auth from localStorage on mount if persist is enabled (only once)
    useEffect(() => {
        if (!hasLoadedFromStorage.current && persist) {
            hasLoadedFromStorage.current = true;
            try {
                const storedAuth = localStorage.getItem("auth");
                if (storedAuth) {
                    const parsedAuth = JSON.parse(storedAuth);
                    setAuth(parsedAuth);
                }
            } catch (error) {
                console.error("Error loading auth from localStorage:", error);
                localStorage.removeItem("auth");
            }
        }
    }, [persist]);

    // Persist auth to localStorage whenever it changes (if persist is enabled)
    useEffect(() => {
        if (!persist) {
            // Don't persist if persist is disabled
            return;
        }

        if (auth && typeof auth === 'object' && Object.keys(auth).length > 0 && auth.accessToken) {
            // Save auth if it has content and an accessToken
            try {
                localStorage.setItem("auth", JSON.stringify(auth));
            } catch (error) {
                console.error("Error saving auth to localStorage:", error);
            }
        } else {
            // Clear auth from localStorage if auth is null, undefined, or empty object
            localStorage.removeItem("auth");
        }
    }, [auth, persist]);

    // Update persist in localStorage when it changes
    useEffect(() => {
        if (persist) {
            localStorage.setItem("persist", JSON.stringify(true));
        } else {
            localStorage.removeItem("persist");
            // Also clear auth when persist is disabled
            localStorage.removeItem("auth");
            setAuth(null);
        }
    }, [persist]);

    return (
        <AuthContext.Provider value={{ 
            auth, 
            setAuth, 
            persist, 
            setPersist
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;