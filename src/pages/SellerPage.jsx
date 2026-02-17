import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useProductContext } from '../context/ProductProvider';
import { useSellerContext } from '../context/SellerProvider';
import { useSeoContext } from '../context/SeoProvider';
import defaultProfile from '../assets/admin.jpg';
import defaultVehicle from '../assets/default-vehicle.png';
import { axiosPrivate } from '../api/axios';

const SellerPage = () => {
  const { sellerSlug } = useParams();
  const { products } = useProductContext();
  const { sellers, isLoading: sellersLoading } = useSellerContext();
  const { updateSeo } = useSeoContext();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);

  // Find seller once context is ready
  useEffect(() => {
    if (!sellersLoading && sellerSlug) {
      // Extract userId from the slug (format: username-123)
      const userId = Number(sellerSlug.split('-').pop());
      const username = sellerSlug.slice(0, sellerSlug.lastIndexOf('-'));

      const found = sellers.find(s => s.userId === userId && s.username === username);
      if (found) {
        setSeller(found);
        // Once we have the seller, fetch their KYC status
        fetchSellerKycStatus(found.userId);
      } else {
        setError('Seller not found');
      }
      setIsLoading(false);
    }
  }, [sellers, sellersLoading, sellerSlug]);

  // Fetch KYC status for the seller
  const fetchSellerKycStatus = async (userId) => {
    try {
      const response = await axiosPrivate.get(`/api/kyc/user/${userId}`);
      if (response.data && response.data.status) {
        setKycStatus(response.data.status);
      }
    } catch (err) {
      // 404 is expected if no KYC has been submitted yet
      console.log('KYC status not found or not verified');
    }
  };

  // Filter products and update SEO
  useEffect(() => {
    if (seller) {
      // Filter products that belong to this seller and are active
      const items = products.filter(p =>
        p.sellerId === seller.userId &&
        p.isActive === "true"
      );
      setSellerProducts(items);

      const sellerUrlSlug = `${seller.username}-${seller.userId}`;
      updateSeo({
        title: `${seller.username} | Diksx Cars`,
        description: `Browse vehicles listed by ${seller.username} on Diksx Cars. ${seller.accountType || 'Car dealer'} in ${seller.place || 'Kenya'}.`,
        canonical: `/seller/${sellerUrlSlug}`,
        image: seller.imageUrl || seller.image_url || defaultProfile,
        type: 'profile',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": seller.username,
          "image": seller.imageUrl || seller.image_url || defaultProfile,
          "telephone": seller.contact,
          "url": `https://www.diksxcars.co.ke/seller/${sellerUrlSlug}`,
          "jobTitle": seller.accountType || "Car Seller",
          "worksFor": {
            "@type": "Organization",
            "name": "Diksx Cars"
          }
        }
      });
    }
  }, [seller, products, updateSeo]);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#3DC2EC]"></div>
    </div>
  );

  if (isLoading || sellersLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-red-500 mr-2">error</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Back
        </button>

        {/* Profile Header - Centered */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col items-center justify-center max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-6 w-full">
            <img
              title={`View details of ${seller.username}`}
              src={seller.imageUrl || defaultProfile}
              alt={seller.username}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-[#3DC2EC]"
              loading="eager"
              height="100"
              width="100"
            />
            <div className="flex-1 text-center w-full">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center">
                {seller.username} | Diksx Cars
                {kycStatus === 'verified' && (
                  <span className="material-symbols-outlined text-[#3DC2EC] ml-2" title="KYC Verified Seller">
                    verified
                  </span>
                )}
              </h1>
              <p className="text-gray-600 flex items-center justify-center mt-1">
                <span className="material-symbols-outlined mr-2">store</span>
                {seller.accountType || 'Car Seller'} {seller.place && `• ${seller.place}`}
              </p>
              <div className="mt-4 flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{sellerProducts.length}</p>
                  <p className="text-gray-600">Listings</p>
                </div>

                <div>
                  <a
                    href={seller.contact ? `tel:${seller.contact}` : 'tel:254757088427'}
                    className="mt-4 sm:mt-0 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center"
                    aria-label="Contact Seller"
                  >
                    <span className="material-symbols-outlined">phone</span>
                  </a>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 justify-center">
                {(seller.hasFinancing?.toLowerCase() === 'yes' || seller.hasFinancing === true) && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="material-symbols-outlined text-[#3DC2EC]">payments</span>
                    <span>Financing Available</span>
                  </div>
                )}
                {(seller.acceptsTradeIn?.toLowerCase() === 'yes' || seller.acceptsTradeIn === true) && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="material-symbols-outlined text-[#3DC2EC]">swap_horiz</span>
                    <span>Accepts Trade-in</span>
                  </div>
                )}
                {seller.hasSubscription && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="material-symbols-outlined text-[#3DC2EC]">verified</span>
                    <span>Premium Seller</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instagram-style Grid of Listings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Vehicles ({sellerProducts.length})</h2>

          {sellerProducts.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-400">directions_car</span>
              <p className="mt-2 text-gray-600">This seller doesn't have any available listings at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sellerProducts.map(product => (
                <Link
                  title={`View details of ${product.make} ${product.model}`}
                  key={product.id}
                  to={`/vehicle/${product.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-12 relative">
                    {product.images?.length > 0 ? (
                      <img
                        title={`View details of ${product.make} ${product.model}`}
                        src={product.images[0].image_url || product.images[0]}
                        alt={`${product.make} ${product.model}`}
                        className="w-full h-48 object-cover"
                        loading="eager"
                        height="100"
                        width="100"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <img
                          title={`View details of ${product.make} ${product.model}`}
                          src={defaultVehicle}
                          alt={`${product.make} ${product.model}`}
                          className="w-1/2 h-auto opacity-50"
                        />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                        {product.year}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {product.make} {product.model}
                    </h3>
                    <p className="text-[#3DC2EC] font-bold truncate">
                      KSH {Number(product.price).toLocaleString()}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="inline-flex items-center text-xs text-gray-600">
                        <span className="material-symbols-outlined text-xs mr-1">speed</span>
                        {Number(product.mileage).toLocaleString()} KM
                      </span>
                      <span className="inline-flex items-center text-xs text-gray-600">
                        <span className="material-symbols-outlined text-xs mr-1">settings</span>
                        {product.transmission}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellerPage; 