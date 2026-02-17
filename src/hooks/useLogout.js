import { useLocation } from 'react-router-dom'
import useAuth from "./useAuth";
import useAxiosPrivate from "../api/useAxiosPrivate";
import { showSuccess } from '../utils/sweetAlert';

const useLogout = () => {
    const axiosPrivate = useAxiosPrivate();
    const location = useLocation();    
    const { setAuth, persist } = useAuth();
    const from = location.state?.from?.pathname || "/";

    const logout = async () => {
        // Set logout flag to prevent PersistLogin from trying to refresh
        localStorage.setItem("logoutInProgress", "true");
        
        // Clear auth state immediately (set to null, not empty object)
        setAuth(null);
        
        // Clear localStorage immediately to prevent reloading auth
        if (persist) {
            localStorage.removeItem("auth");
        }
        
        try {
            await axiosPrivate('/api/logout');
            // Clear logout flag after successful logout
            localStorage.removeItem("logoutInProgress");
            showSuccess("You Are Logged Out").then((result) => {
                if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
                    window.location.href = "/login";
                }
            });          
        } catch (err) {
            console.error(err);
            // Even if API call fails, ensure auth is cleared and flag is removed
            setAuth(null);
            if (persist) {
                localStorage.removeItem("auth");
            }
            localStorage.removeItem("logoutInProgress");
        }
    }

    return logout;
}

export default useLogout