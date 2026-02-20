import { createContext, useState, useContext, useEffect } from "react";
import useAxiosPrivate from "../api/useAxiosPrivate";

const SellerContext = createContext();

export const useSellerContext = () => {
    return useContext(SellerContext);
};

export const SellerProvider = ({ children }) => {
    const axiosPrivate = useAxiosPrivate();
    const [sellers, setSellers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getSellers = async () => {
            setIsLoading(true);
            try {
                const response = await axiosPrivate.get('/api/sellers');
                setSellers(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        getSellers();
        const controller = new AbortController();
        return () => controller.abort();
    }, [axiosPrivate]);

    return (
        <SellerContext.Provider value={{ sellers, setSellers, isLoading }}>
            {children}
        </SellerContext.Provider>
    );
};

export default SellerProvider;