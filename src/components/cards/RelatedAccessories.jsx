import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const RelatedAccessories = ({ currentAccessory, allAccessories }) => {
    const navigate = useNavigate();
    const [relatedAccessories, setRelatedAccessories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getRelatedAccessories = () => {
            try {
                if (!currentAccessory || !allAccessories?.length) {
                    setRelatedAccessories([]);
                    return;
                }

                // Filter out the current accessory
                const otherAccessories = allAccessories.filter(acc => acc.id !== currentAccessory.id);

                // Apply relatedness criteria in order of relevance
                let results = [];
                const limit = 4; // Show 4 related accessories max

                // 1. Same category
                let sameCategory = otherAccessories.filter(acc =>
                    acc.category === currentAccessory.category
                );
                results = [...sameCategory];

                // 2. If not enough, add similar price range (±20%)
                if (results.length < limit && currentAccessory.price) {
                    const priceMin = currentAccessory.price * 0.8;
                    const priceMax = currentAccessory.price * 1.2;

                    let similarPrice = otherAccessories.filter(acc =>
                        acc.price &&
                        acc.price >= priceMin &&
                        acc.price <= priceMax &&
                        !results.some(r => r.id === acc.id)
                    );
                    results = [...results, ...similarPrice];
                }

                // 3. If still not enough, add similar condition
                if (results.length < limit) {
                    let similarCondition = otherAccessories.filter(acc =>
                        acc.condition === currentAccessory.condition &&
                        !results.some(r => r.id === acc.id)
                    );

                    results = [...results, ...similarCondition];
                }

                // Limit results to desired count
                setRelatedAccessories(results.slice(0, limit));

            } catch (err) {
                setError("Failed to process related accessories.");
                console.error("Error processing related accessories:", err);
            } finally {
                setLoading(false);
            }
        };

        getRelatedAccessories();
    }, [currentAccessory, allAccessories]);

    if (!currentAccessory) return null;

    return (
        <div className="border shadow-lg p-2">
            <h3 className="p-3 uppercase tracking-wider text-sm font-bold">Similar Accessories</h3>
            <hr />
            {loading ? (
                // Shimmer effect while loading
                <ul className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 gap-1 pt-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <li key={index} className="animate-pulse">
                            <div className="bg-gray-300 rounded h-24 sm:h-28 md:h-32 lg:h-36"></div>
                        </li>
                    ))}
                </ul>
            ) : error ? (
                <p className="text-center text-red-500 p-3">{error}</p>
            ) : relatedAccessories.length > 0 ? (
                <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-1 pt-2">
                    {relatedAccessories.map((accessory) => (
                        <li key={accessory.id} className="cursor-pointer">
                            <Link to={`/accessory/${accessory.slug}`}>
                                <img
                                    title={`View details of ${accessory.name}`}
                                    className="w-[160px] h-[120px] mx-auto md:mx-0 sm:p-3 hover:border-2 hover:border-blue-600 rounded object-cover w-full h-24 sm:h-28 md:h-32 lg:h-36"
                                    src={accessory.imageUrls?.[0]?.image_urls || accessory.imageUrls?.[0] || "/placeholder.jpg"}
                                    alt={`${accessory.name} ${accessory.category}`}
                                    loading="eager"
                                    width="160"
                                    height="120"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center p-3">No similar accessories found.</p>
            )}
        </div>
    );
};

export default RelatedAccessories;
