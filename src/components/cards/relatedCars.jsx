import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const RelatedCars = ({ currentCar, allCars }) => {
    const navigate = useNavigate();
    const [relatedCars, setRelatedCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getRelatedCars = () => {
            try {
                if (!currentCar || !allCars?.length) {
                    setRelatedCars([]);
                    return;
                }

                // Filter out the current car
                const otherCars = allCars.filter(car => car.id !== currentCar.id);

                // Apply relatedness criteria in order of relevance
                let results = [];
                const limit = 4; // Show 4 related cars max

                // 1. Same make and model
                let sameMakeModel = otherCars.filter(car =>
                    car.make === currentCar.make &&
                    car.model === currentCar.model
                );
                results = [...sameMakeModel];

                // 2. If not enough, add same make, different model
                if (results.length < limit) {
                    let sameMake = otherCars.filter(car =>
                        car.make === currentCar.make &&
                        car.model !== currentCar.model
                    );
                    results = [...results, ...sameMake];
                }

                // 3. If still not enough, add similar price range (±20%)
                if (results.length < limit && currentCar.price) {
                    const priceMin = currentCar.price * 0.8;
                    const priceMax = currentCar.price * 1.2;

                    let similarPrice = otherCars.filter(car =>
                        car.price &&
                        car.price >= priceMin &&
                        car.price <= priceMax &&
                        !results.some(r => r.id === car.id)
                    );
                    results = [...results, ...similarPrice];
                }

                // 4. If still not enough, add similar body type or transmission
                if (results.length < limit) {
                    let similarFeatures = otherCars.filter(car =>
                        (currentCar.bodyType && car.bodyType === currentCar.bodyType) ||
                        (currentCar.transmission && car.transmission === currentCar.transmission) ||
                        (currentCar.fuelType && car.fuelType === currentCar.fuelType)
                    );

                    // Filter out any duplicates already in results
                    similarFeatures = similarFeatures.filter(car =>
                        !results.some(r => r.id === car.id)
                    );

                    results = [...results, ...similarFeatures];
                }

                // Limit results to desired count
                setRelatedCars(results.slice(0, limit));

            } catch (err) {
                setError("Failed to process related cars.");
                console.error("Error processing related cars:", err);
            } finally {
                setLoading(false);
            }
        };

        getRelatedCars();
    }, [currentCar, allCars]);

    if (!currentCar) return null;

    return (
        <div className="border shadow-lg p-2">
            <h3 className="p-3 uppercase tracking-wider text-sm font-bold">Related Cars</h3>
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
            ) : relatedCars.length > 0 ? (
                <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-1 pt-2">
                    {relatedCars.map((car) => (
                        <li key={car.id} className="cursor-pointer">
                            <Link to={`/vehicle/${car.slug}`}>
                                <img
                                    title={`View details of ${car.make} ${car.model}`}
                                    className=" w-[160px] h-[120px] mx-auto md:mx-0 sm:p-3 hover:border-2 hover:border-blue-600 rounded object-cover w-full h-24 sm:h-28 md:h-32 lg:h-36"
                                    src={car.images?.[0]?.image_url || car.images?.[0] || "/placeholder.jpg"}
                                    alt={`${car.make} ${car.model}`}
                                    loading="eager"
                                    width="160"
                                    height="120"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center p-3">No related cars found.</p>
            )}
        </div>
    );
};

export default RelatedCars;
