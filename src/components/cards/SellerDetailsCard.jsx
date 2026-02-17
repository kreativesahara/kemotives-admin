import { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { useSellerContext } from '../../context/SellerProvider';
import defaultProfileImage from '../../assets/admin.jpg';

export default function SellerDetailsCard() {
    const [sellerDetails, setSellerDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [kycStatus, setKycStatus] = useState(null);
    const { auth } = useAuth();
    const { sellers } = useSellerContext();

    useEffect(() => {
        const fetchSellerDetails = async () => {
            if (!auth?.id) {
                setLoading(false);
                return;
            }
            // First check if we have this seller in our context
            const contextSeller = sellers.find(seller => seller.userId === auth.id);
            if (contextSeller) {
                setSellerDetails(contextSeller);
                // Fetch KYC status separately
                await fetchKycStatus(auth.id);
                setLoading(false);
                return;
            }
            // If not found in context, fetch directly from API
            try {
                const { data } = await axiosPrivate.get(`/api/sellers/${auth.id}`);
                setSellerDetails(data);
                // Fetch KYC status separately
                await fetchKycStatus(auth.id);
                console.log('Seller details fetched successfully:', data);
            } catch (err) {
                console.error('Error fetching seller details:', err);                
                // If 404, it means the seller profile doesn't exist yet
                if (err.response && err.response.status === 404) {
                    setSellerDetails(null);
                } else {
                    setError('Failed to load seller details');
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchKycStatus = async (userId) => {
            try {
                const { data } = await axiosPrivate.get(`/api/kyc/user/${userId}`);
                setKycStatus(data?.status || null);
                // Update auth context with KYC status if needed
                if (data?.status) {
                    // This would require extending auth context to store KYC status
                    // For now, we'll just keep it local to this component
                }
            } catch (err) {
                console.error('Error fetching KYC status:', err);
                // 404 is expected if no KYC has been submitted yet
                if (err.response && err.response.status !== 404) {
                    console.error('Failed to load KYC status');
                }
            }
        };

        if (auth?.roles === 3) {
            fetchSellerDetails();
        } else {
            setLoading(false);
        }
    }, [auth?.id, auth?.roles, sellers]);

    const getSellerFeature = (icon, text) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="material-symbols-outlined text-[#3DC2EC]">{icon}</span>
            <span>{text}</span>
        </div>
    );
    
    const renderKycStatus = () => {
        if (!kycStatus) return null;        
        const statusStyles = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            verified: 'bg-green-100 text-green-700 border-green-300',
            rejected: 'bg-red-100 text-red-700 border-red-300'
        };        
        const iconMap = {
            pending: 'hourglass_top',
            verified: 'verified',
            rejected: 'cancel'
        };        
        return (
            <div className={`mt-4 p-2 rounded border ${statusStyles[kycStatus]}`}>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">{iconMap[kycStatus]}</span>
                    <span className="font-medium">
                        KYC Verification: {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                    </span>
                </div>
            </div>
        );
    };

    // Only render the component if the user is a seller
    if (!loading && (!auth?.roles || auth.roles !== 3 && auth.roles !== 5)) {
        return null;
    }

    return (
        <div className='p-4 bg-neutral-50 rounded-md flex flex-col gap-2'>                        
            {loading ? (
                <p className='text-sm text-neutral-600'>Loading seller details...</p>
            ) : error ? (
                <p className='text-sm text-red-600'>{error}</p>
            ) : !sellerDetails ? (
                <div>
                    <p className='text-sm text-amber-600 mb-2'>
                        No seller profile found. Please complete your seller registration.
                    </p>
                    <a 
                        href="/become-seller" 
                        className="text-sm bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 transition"
                    >
                        Complete Registration
                    </a>
                </div>
            ) : (
                <div className='grid grid-cols-2 gap-2'>
                    <div className="flex items-center gap-3 mb-2">
                        <img 
                            title={`View details of ${sellerDetails.username}`}
                            src={sellerDetails.imageUrl || defaultProfileImage} 
                            alt={sellerDetails.username || 'Seller'} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#3DC2EC]"
                        />
                        <div>
                            <p className="font-medium">{sellerDetails.username}</p>
                            <p className="text-sm text-gray-600">
                                {sellerDetails.accountType || 'Car Seller'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                        <p className='text-sm text-gray-600'>
                            <span className="font-medium">Location:</span> {sellerDetails.place}
                        </p>
                        <p className='text-sm text-gray-600'>
                            <span className="font-medium">Contact:</span> {sellerDetails.contact}
                        </p>
                        
                        {/* KYC Status Display */}
                        {renderKycStatus()}
                        
                        <div className="mt-2 space-y-2">
                            {sellerDetails.hasFinancing === 'yes' && 
                                getSellerFeature("payments", "Financing Available")}
                            {sellerDetails.acceptsTradeIn === 'yes' && 
                                getSellerFeature("swap_horiz", "Accepts Trade-in")}
                            {sellerDetails.hasSubscription && 
                                getSellerFeature("verified", "Premium Seller")}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 