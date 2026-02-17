import { axiosPrivate } from "./axios";
import { useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { showInfo } from "../utils/sweetAlert";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                // Attach the access token if it exists and the header isn't already set
                if (auth?.accessToken && !config.headers["authorization"]) {
                    config.headers["authorization"] = `Bearer ${auth.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;

                if (
                    error?.response?.status === 403 &&
                    auth?.refreshToken &&
                    !prevRequest?.sent
                ) {
                    prevRequest.sent = true;
                    try {
                        const newAccessToken = await refresh();
                        showInfo(newAccessToken)
                        if (newAccessToken) {
                            prevRequest.headers["authorization"] = `Bearer ${newAccessToken}`;
                            return axiosPrivate(prevRequest);
                        }
                    } catch (refreshError) {
                        console.error("Token refresh failed:", refreshError);
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [auth, refresh]);
    return axiosPrivate;
};
export default useAxiosPrivate;
