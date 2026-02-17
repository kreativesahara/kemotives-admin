import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useRef, useEffect } from 'react';
import './navbar.css';
import useAuth from "../../hooks/useAuth";
import Logout from "../button/btnLogout";
import { useSearch as useVehicleSearch } from "../../context/SearchProvider";
import { useSearch as useAccessorySearch } from "../../context/SearchAccesoriesProvider";
import useAxiosPrivate from "../../api/useAxiosPrivate";

function Navbar() {
    const { auth } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ vehicles: [], accessories: [] });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const productsDropdownTimeout = useRef(null);
    const userDropdownTimeout = useRef(null);
    const searchTimeout = useRef(null);
    const searchResultsRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate();

    // Get search context setters - wrapped in try-catch to handle cases where providers aren't available
    let vehicleSearchContext, accessorySearchContext;
    try {
        vehicleSearchContext = useVehicleSearch();
    } catch (e) {
        vehicleSearchContext = null;
    }
    try {
        accessorySearchContext = useAccessorySearch();
    } catch (e) {
        accessorySearchContext = null;
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 800);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setUserDropdownOpen(false);
                setProductsDropdownOpen(false);
            }
            if (!event.target.closest('.search-results-container') && !event.target.closest('.search-input-container')) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen, isMobile]);

    // Perform unified search for both vehicles and accessories
    const performSearch = React.useCallback(async (query) => {
        if (!query || query.length < 2) return;

        setIsSearching(true);
        setShowSearchResults(true);

        try {
            const queryParts = query.trim().split(/\s+/);
            const vehicleParams = {};

            if (queryParts.length === 1) {
                vehicleParams.make = queryParts[0];
            } else {
                vehicleParams.make = queryParts[0];
                vehicleParams.model = queryParts.slice(1).join(' ');
            }

            const accessoryParams = { name: query };

            const [vehicleResponse, accessoryResponse] = await Promise.allSettled([
                axiosPrivate.get('/api/search', { params: vehicleParams }),
                axiosPrivate.get('/api/filter/accessories', { params: accessoryParams })
            ]);

            let vehicles = [];
            if (vehicleResponse.status === 'fulfilled') {
                const vehicleData = vehicleResponse.value.data || [];
                if (vehicleParams.make && vehicleParams.model) {
                    const makeLower = vehicleParams.make.toLowerCase();
                    const modelLower = vehicleParams.model.toLowerCase();
                    vehicles = vehicleData
                        .filter(v =>
                            (v.make && v.make.toLowerCase().includes(makeLower)) &&
                            (v.model && v.model.toLowerCase().includes(modelLower))
                        )
                        .slice(0, 5);
                } else {
                    const makeLower = vehicleParams.make.toLowerCase();
                    vehicles = vehicleData
                        .filter(v =>
                            (v.make && v.make.toLowerCase().includes(makeLower)) ||
                            (v.model && v.model.toLowerCase().includes(makeLower))
                        )
                        .slice(0, 5);
                }
            }

            let accessories = [];
            if (accessoryResponse.status === 'fulfilled') {
                const accessoryData = accessoryResponse.value.data || [];
                const queryLower = query.toLowerCase();
                accessories = accessoryData
                    .filter(a =>
                        (a.name && a.name.toLowerCase().includes(queryLower)) ||
                        (a.category && a.category.toLowerCase().includes(queryLower))
                    )
                    .slice(0, 5);
            }

            setSearchResults({ vehicles, accessories });
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults({ vehicles: [], accessories: [] });
        } finally {
            setIsSearching(false);
        }
    }, [axiosPrivate]);

    // Perform search as user types (debounced)
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
            searchTimeout.current = setTimeout(() => {
                performSearch(searchQuery.trim());
            }, 300);
        } else {
            setSearchResults({ vehicles: [], accessories: [] });
            setShowSearchResults(false);
        }
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchQuery, performSearch]);

    const dashBoard = () => {
        navigate('/dashboard', { replace: true });
        setMenuOpen(false);
    };

    const handleProductsMouseEnter = () => {
        if (productsDropdownTimeout.current) {
            clearTimeout(productsDropdownTimeout.current);
        }
        setProductsDropdownOpen(true);
    };

    const handleProductsMouseLeave = () => {
        productsDropdownTimeout.current = setTimeout(() => {
            setProductsDropdownOpen(false);
        }, 300);
    };

    const handleUserMouseEnter = () => {
        if (userDropdownTimeout.current) {
            clearTimeout(userDropdownTimeout.current);
        }
        setUserDropdownOpen(true);
    };

    const handleUserMouseLeave = () => {
        userDropdownTimeout.current = setTimeout(() => {
            setUserDropdownOpen(false);
        }, 300);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            const queryParts = query.split(/\s+/);
            let makeParam = query;
            let modelParam = '';

            if (queryParts.length > 1) {
                makeParam = queryParts[0];
                modelParam = queryParts.slice(1).join(' ');
            }

            if (vehicleSearchContext) {
                vehicleSearchContext.setMake(makeParam);
                if (modelParam) {
                    vehicleSearchContext.setModel(modelParam);
                } else {
                    vehicleSearchContext.setModel(makeParam);
                }
            }
            if (accessorySearchContext) {
                accessorySearchContext.setName(query);
            }

            const searchParams = new URLSearchParams();
            searchParams.set('make', makeParam);
            if (modelParam) {
                searchParams.set('model', modelParam);
            }
            navigate(`/vehicles?${searchParams.toString()}`);
            setSearchQuery('');
            setShowSearchResults(false);
            setMenuOpen(false);
            setMobileSearchOpen(false);
        }
    };

    const handleResultClick = (type, item) => {
        if (type === 'vehicle') {
            navigate(`/vehicle/${item.slug}`);
        } else if (type === 'accessory') {
            navigate(`/accessory/${item.slug}`);
        }
        setSearchQuery('');
        setShowSearchResults(false);
        setMenuOpen(false);
        setMobileSearchOpen(false);
    };

    const handleViewAllResults = (type) => {
        const query = searchQuery.trim();
        if (query) {
            if (type === 'vehicles') {
                if (vehicleSearchContext) {
                    vehicleSearchContext.setMake(query);
                    vehicleSearchContext.setModel(query);
                }
                navigate(`/vehicles?search=${encodeURIComponent(query)}`);
            } else {
                if (accessorySearchContext) {
                    accessorySearchContext.setName(query);
                }
                navigate(`/accessories?search=${encodeURIComponent(query)}`);
            }
        }
        setSearchQuery('');
        setShowSearchResults(false);
        setMenuOpen(false);
        setMobileSearchOpen(false);
    };

    const closeMobileMenu = () => {
        setMenuOpen(false);
        setMobileSearchOpen(false);
    };

    return (
        <>
            <header className="header min-w-[320px] bg-gray-900" data-header>
                {/* Top Bar - Trust Signals & Quick Links - Desktop Only */}
                <div className="bg-gray-800 border-b border-gray-700 hidden md:block">
                    <div className="max-w-[2000px] mx-auto px-4 py-2 flex justify-between items-center text-sm">
                        <div className="flex items-center gap-4 text-gray-300">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">phone</span>
                                <a href="tel:+254757088427" className="hover:text-white transition">+254 757 088 427</a>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                <span>Verified Sellers</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">local_shipping</span>
                                <span>Free Inspection</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300">
                            <Link to="/support" className="hover:text-white transition">Help Center</Link>
                            <Link to="/blogs" className="hover:text-white transition">Blog</Link>
                            {auth?.accessToken ? (
                                <Link to="/dashboard" className="hover:text-white transition">My Account</Link>
                            ) : (
                                <>
                                    <Link to="/register" className="hover:text-white transition">Sign Up</Link>
                                    <Link to="/login" className="hover:text-white transition">Login</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex justify-between items-center max-w-[2000px] mx-auto px-2 sm:px-4 py-3 z-10">
                    {/* Logo */}
                    <Link to="/home" className="logo flex items-center gap-2 min-w-[140px]">
                        <div className="flex flex-col">
                            <p className="text-lg md:text-xl whitespace-nowrap font-bold hover:text-[#3DC2EC] transition">
                                Diksx Cars
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">Automotive & Spares</span>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    {!isMobile && (
                        <div className="flex-1 max-w-2xl mx-4 search-input-container relative">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                if (e.target.value.trim().length >= 2) {
                                                    setShowSearchResults(true);
                                                }
                                            }}
                                            onFocus={() => {
                                                if (searchQuery.trim().length >= 2) {
                                                    setShowSearchResults(true);
                                                }
                                            }}
                                            placeholder="Search vehicles, accessories, parts..."
                                            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3DC2EC] focus:border-transparent"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            search
                                        </span>
                                        {isSearching && (
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin">
                                                sync
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-[#3DC2EC]/90 to-[#0ea5e9]/90 backdrop-blur-md hover:from-[#3DC2EC] hover:to-[#0ea5e9] text-white px-6 py-1.5 rounded-lg font-medium tracking-wide shadow-[0_0_15px_rgba(61,194,236,0.3)] hover:shadow-[0_0_25px_rgba(61,194,236,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300 border border-white/20"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>

                            {/* Search Results Dropdown */}
                            {showSearchResults && (searchResults.vehicles.length > 0 || searchResults.accessories.length > 0) && (
                                <div className="search-results-container absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-1000 max-h-96 overflow-y-auto">
                                    {/* Vehicle Results */}
                                    {searchResults.vehicles.length > 0 && (
                                        <div className="p-2">
                                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-base">directions_car</span>
                                                    Vehicles ({searchResults.vehicles.length})
                                                </h3>
                                                <button
                                                    onClick={() => handleViewAllResults('vehicles')}
                                                    className="text-xs text-[#3DC2EC] hover:underline"
                                                >
                                                    View All
                                                </button>
                                            </div>
                                            <div className="py-1">
                                                {searchResults.vehicles.map((vehicle) => (
                                                    <button
                                                        key={vehicle.id}
                                                        onClick={() => handleResultClick('vehicle', vehicle)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition flex items-center gap-3"
                                                    >
                                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                                            {vehicle.images && vehicle.images[0] ? (
                                                                <img
                                                                    src={vehicle.images[0].image_url || vehicle.images[0]}
                                                                    alt={vehicle.make}
                                                                    title="Preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-gray-400">directions_car</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {vehicle.year} {vehicle.make} {vehicle.model}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {vehicle.price ? `KSH ${Number(vehicle.price).toLocaleString()}` : 'Price on request'}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Accessory Results */}
                                    {searchResults.accessories.length > 0 && (
                                        <div className="p-2">
                                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-base">inventory_2</span>
                                                    Accessories ({searchResults.accessories.length})
                                                </h3>
                                                <button
                                                    onClick={() => handleViewAllResults('accessories')}
                                                    className="text-xs text-[#3DC2EC] hover:underline"
                                                >
                                                    View All
                                                </button>
                                            </div>
                                            <div className="py-1">
                                                {searchResults.accessories.map((accessory) => (
                                                    <button
                                                        key={accessory.id}
                                                        onClick={() => handleResultClick('accessory', accessory)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition flex items-center gap-3"
                                                    >
                                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                                            {accessory.imageUrls && accessory.imageUrls[0] ? (
                                                                <img
                                                                    src={accessory.imageUrls[0]}
                                                                    title="Preview"
                                                                    alt={accessory.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-gray-400">inventory_2</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {accessory.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {accessory.category} • {accessory.price ? `KSH ${Number(accessory.price).toLocaleString()}` : 'Price on request'}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* No Results Message */}
                            {showSearchResults && !isSearching && searchQuery.trim().length >= 2 &&
                                searchResults.vehicles.length === 0 && searchResults.accessories.length === 0 && (
                                    <div className="search-results-container absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-50 p-4">
                                        <p className="text-sm text-gray-500 text-center">No results found for "{searchQuery}"</p>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Mobile Search Icon */}
                        {isMobile && (
                            <button
                                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                className="p-2 text-white hover:bg-gray-700 rounded-lg transition"
                                aria-label="Search"
                            >
                                <span className="material-symbols-outlined text-2xl">search</span>
                            </button>
                        )}

                        {/* Browse Accessories - Desktop */}
                        {!isMobile && (
                            <Link
                                to="/accessories"
                                className="flex items-center gap-2 px-5 py-1.5 bg-gradient-to-r from-[#3DC2EC]/90 to-[#0ea5e9]/90 backdrop-blur-md hover:from-[#3DC2EC] hover:to-[#0ea5e9] text-white rounded-lg font-medium tracking-wide shadow-[0_0_15px_rgba(61,194,236,0.3)] hover:shadow-[0_0_25px_rgba(61,194,236,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300 border border-white/20"
                            >
                                <span className="material-symbols-outlined text-sm">inventory_2</span>
                                <span>Accessories</span>
                            </Link>
                        )}

                        {/* User Account Icon - Mobile */}
                        {isMobile && (
                            <button
                                onClick={() => auth?.accessToken ? navigate('/dashboard') : navigate('/login')}
                                className="p-2 text-white hover:bg-gray-700 rounded-lg transition relative"
                                aria-label="Account"
                            >
                                <span className="material-symbols-outlined text-2xl">account_circle</span>
                            </button>
                        )}

                        {/* User Account Dropdown - Desktop */}
                        {!isMobile && auth?.accessToken && (
                            <div
                                className="dropdown-container relative"
                                onMouseEnter={handleUserMouseEnter}
                                onMouseLeave={handleUserMouseLeave}
                            >
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition"
                                >
                                    <span className="material-symbols-outlined">account_circle</span>
                                    <span className="text-sm font-medium">{auth?.firstname || 'Account'}</span>
                                    <span className="material-symbols-outlined text-sm">
                                        {userDropdownOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {/* User Dropdown Menu - Desktop */}
                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-[1000]">
                                        <div className="py-2 border-b border-gray-200">
                                            <div className="px-4 py-2 text-gray-700">
                                                <p className="font-semibold">{auth?.firstname} {auth?.lastname}</p>
                                                <p className="text-sm text-gray-500">{auth?.email}</p>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                <span className="material-symbols-outlined align-middle mr-2 text-sm">dashboard</span>
                                                Dashboard
                                            </Link>
                                            {(auth?.roles === 2 || auth?.roles === 3 || auth?.roles === 5) && (
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                                                >
                                                    <span className="material-symbols-outlined align-middle mr-2 text-sm">inventory</span>
                                                    My Listings
                                                </Link>
                                            )}
                                            <Link
                                                to="/pricing"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                <span className="material-symbols-outlined align-middle mr-2 text-sm">sell</span>
                                                Start Selling
                                            </Link>
                                        </div>
                                        <div className="py-1 border-t border-gray-200">
                                            <Logout isInDropdown={true} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Login/Signup - Desktop */}
                        {!isMobile && !auth?.accessToken && (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-[#3DC2EC]/90 to-[#0ea5e9]/90 backdrop-blur-md hover:from-[#3DC2EC] hover:to-[#0ea5e9] text-white px-6 py-1.5 rounded-lg font-medium tracking-wide shadow-[0_0_15px_rgba(61,194,236,0.3)] hover:shadow-[0_0_25px_rgba(61,194,236,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300 border border-white/20"
                                >Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle - Hamburger */}
                        {isMobile && (
                            <button
                                className="mobile-menu-toggle p-2 hover:bg-gray-700 rounded-lg transition flex flex-col justify-center items-center gap-1"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"
                            >
                                <span className={`hamburger-line ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                <span className={`hamburger-line ${menuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`hamburger-line ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                            </button>
                        )}

                        {/* Desktop Menu Toggle */}
                        {!isMobile && (
                            <button
                                className="menu p-2 hover:bg-gray-700 rounded-lg transition"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        )}
                    </div>
                </nav>

                {/* Mobile Search Bar - Expandable */}
                {isMobile && mobileSearchOpen && (
                    <div className="mobile-search-bar px-4 py-3 bg-gray-800 border-t border-gray-700 search-input-container">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.trim().length >= 2) {
                                            setShowSearchResults(true);
                                        }
                                    }}
                                    placeholder="Search vehicles, accessories..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3DC2EC]"
                                    autoFocus
                                />
                                {isSearching && (
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin">
                                        sync
                                    </span>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="bg-[#3DC2EC] hover:bg-[#2BA1C9] text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                            >
                                Search
                            </button>
                        </form>

                        {/* Mobile Search Results */}
                        {showSearchResults && (searchResults.vehicles.length > 0 || searchResults.accessories.length > 0) && (
                            <div className="search-results-container mt-2 bg-white rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                {searchResults.vehicles.length > 0 && (
                                    <div className="p-2">
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">directions_car</span>
                                                Vehicles
                                            </h3>
                                            <button
                                                onClick={() => handleViewAllResults('vehicles')}
                                                className="text-xs text-[#3DC2EC] hover:underline"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        <div className="py-1">
                                            {searchResults.vehicles.map((vehicle) => (
                                                <button
                                                    key={vehicle.id}
                                                    onClick={() => handleResultClick('vehicle', vehicle)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
                                                >
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {vehicle.price ? `KSH ${Number(vehicle.price).toLocaleString()}` : 'Price on request'}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {searchResults.accessories.length > 0 && (
                                    <div className="p-2">
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">inventory_2</span>
                                                Accessories
                                            </h3>
                                            <button
                                                onClick={() => handleViewAllResults('accessories')}
                                                className="text-xs text-[#3DC2EC] hover:underline"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        <div className="py-1">
                                            {searchResults.accessories.map((accessory) => (
                                                <button
                                                    key={accessory.id}
                                                    onClick={() => handleResultClick('accessory', accessory)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
                                                >
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {accessory.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {accessory.category} • {accessory.price ? `KSH ${Number(accessory.price).toLocaleString()}` : 'Price on request'}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {showSearchResults && !isSearching && searchQuery.trim().length >= 2 &&
                            searchResults.vehicles.length === 0 && searchResults.accessories.length === 0 && (
                                <div className="search-results-container mt-2 bg-white rounded-lg shadow-xl p-4">
                                    <p className="text-sm text-gray-500 text-center">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                    </div>
                )}

                {/* Mobile Slide-Out Menu Overlay */}
                {isMobile && menuOpen && (
                    <div
                        className="mobile-menu-overlay fixed inset-0 bg-black/60 z-40"
                        onClick={closeMobileMenu}
                    />
                )}

                {/* Mobile Slide-Out Menu Panel */}
                {isMobile && (
                    <div className={`mobile-menu-panel fixed top-0 right-0 h-full w-[280px] bg-gray-900 z-50 transform transition-transform duration-300 ease-out flex flex-col ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Close Button */}
                        <div className="flex justify-end p-4 border-b border-gray-700 flex-shrink-0">
                            <button
                                onClick={closeMobileMenu}
                                className="p-2 hover:bg-gray-700 rounded-lg transition"
                            >
                                <span className="material-symbols-outlined text-white text-2xl">close</span>
                            </button>
                        </div>

                        {/* Top Action Icons - Dashboard, Sell, Logout (authenticated) or Sign Up, Login, Sell (guest) */}
                        <div className="mobile-action-icons flex justify-center items-stretch gap-6 py-4 px-4 border-b border-gray-700 flex-shrink-0">
                            {auth?.accessToken ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={closeMobileMenu}
                                        className="mobile-action-icon flex flex-col items-center justify-center gap-1.5 text-white hover:text-[#3DC2EC] transition px-3 py-2 rounded-lg hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-2xl">dashboard</span>
                                        <span className="text-xs font-medium">Dashboard</span>
                                    </Link>
                                    <Link
                                        to="/pricing"
                                        onClick={closeMobileMenu}
                                        className="mobile-action-icon flex flex-col items-center justify-center gap-1.5 text-white hover:text-[#3DC2EC] transition px-3 py-2 rounded-lg hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-2xl">sell</span>
                                        <span className="text-xs font-medium">Sell</span>
                                    </Link>
                                    <Logout
                                        isInDropdown={false}
                                        isMobileIcon={true}
                                        onLogout={closeMobileMenu}
                                    />
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        onClick={closeMobileMenu}
                                        className="mobile-action-icon flex flex-col items-center justify-center gap-1.5 text-white hover:text-[#3DC2EC] transition px-3 py-2 rounded-lg hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-2xl">person_add</span>
                                        <span className="text-xs font-medium">Sign up</span>
                                    </Link>
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="mobile-action-icon flex flex-col items-center justify-center gap-1.5 text-white hover:text-[#3DC2EC] transition px-3 py-2 rounded-lg hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-2xl">login</span>
                                        <span className="text-xs font-medium">Login</span>
                                    </Link>
                                    <Link
                                        to="/pricing"
                                        onClick={closeMobileMenu}
                                        className="mobile-action-icon flex flex-col items-center justify-center gap-1.5 text-white hover:text-[#3DC2EC] transition px-3 py-2 rounded-lg hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-2xl">sell</span>
                                        <span className="text-xs font-medium">Sell</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Menu Items */}
                        <nav className="mobile-menu-nav flex-1 overflow-y-auto">
                            <ul className="mt-20">
                                <li>
                                    <NavLink
                                        to="/home"
                                        className="mobile-menu-item flex items-center gap-3 px-4 py-3 text-gray-100 hover:bg-gray-800 hover:text-white transition font-medium"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined">home</span>
                                        <span>Home</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/vehicles"
                                        className="mobile-menu-item flex items-center gap-3 px-4 py-3 text-gray-100 hover:bg-gray-800 hover:text-white transition font-medium"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined">directions_car</span>
                                        <span>Vehicles</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/accessories"
                                        className="mobile-menu-item flex items-center gap-3 px-4 py-3 text-gray-100 hover:bg-gray-800 hover:text-white transition font-medium"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined">inventory_2</span>
                                        <span>Accessories</span>
                                    </NavLink>
                                </li>

                                {/* Divider */}
                                <li className="border-t border-gray-700 my-2"></li>

                                <li>
                                    <NavLink
                                        to="/pricing"
                                        className="mobile-menu-item flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined text-red-500">sell</span>
                                        <span>Start Selling</span>
                                        <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">Hot</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/blogs"
                                        className="mobile-menu-item flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined">article</span>
                                        <span>News Feeds</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/support"
                                        className="mobile-menu-item flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined">support_agent</span>
                                        <span>Support</span>
                                    </NavLink>
                                </li>

                                {/* Divider */}
                                <li className="border-t border-gray-700 my-2"></li>

                                {/* Categories Section */}
                                <li className="px-4 py-2">
                                    <span className="text-gray-400 text-sm font-medium">Categories</span>
                                </li>
                                <li>
                                    <NavLink
                                        to="/vehicles?type=sedan"
                                        className={() => {
                                            const isActive = location.pathname === '/vehicles' && new URLSearchParams(location.search).get('type') === 'sedan';
                                            return `mobile-menu-item flex items-center gap-3 px-4 py-3 hover:bg-gray-800 hover:text-white transition ${isActive ? 'active text-[#3DC2EC] bg-[rgba(61,194,236,0.2)]' : 'text-gray-300'}`;
                                        }}
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined text-xl">directions_car</span>
                                        <span>Sedans</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/vehicles?type=suv"
                                        className={() => {
                                            const isActive = location.pathname === '/vehicles' && new URLSearchParams(location.search).get('type') === 'suv';
                                            return `mobile-menu-item flex items-center gap-3 px-4 py-3 hover:bg-gray-800 hover:text-white transition ${isActive ? 'active text-[#3DC2EC] bg-[rgba(61,194,236,0.2)]' : 'text-gray-300'}`;
                                        }}
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined text-xl">local_shipping</span>
                                        <span>SUVs</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/vehicles?type=truck"
                                        className={() => {
                                            const isActive = location.pathname === '/vehicles' && new URLSearchParams(location.search).get('type') === 'truck';
                                            return `mobile-menu-item flex items-center gap-3 px-4 py-3 hover:bg-gray-800 hover:text-white transition ${isActive ? 'active text-[#3DC2EC] bg-[rgba(61,194,236,0.2)]' : 'text-gray-300'}`;
                                        }}
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined text-xl">fire_truck</span>
                                        <span>Trucks</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/accessories"
                                        className="mobile-menu-item flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition"
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="material-symbols-outlined text-xl">build</span>
                                        <span>Spare Parts</span>
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}

            </header>

            {/* Main Navigation Links - Desktop Only - Outside header for sticky to work */}
            {!isMobile && (
                <nav className={`desktop-nav-sticky   px-4 ${menuOpen ? 'block' : 'hidden'} md:block border-t border-gray-700`}>
                    <ul className={`pl-24 max-w-[1920px] mx-auto navbar-list ${menuOpen ? "open" : ""}`}>
                        <li>
                            <NavLink to="/home" className="navbar-link" onClick={() => setMenuOpen(false)}>
                                <span className="material-symbols-outlined">home</span>
                                <span>Home</span>
                            </NavLink>
                        </li>
                        <li
                            className="dropdown-container relative"
                            onMouseEnter={handleProductsMouseEnter}
                            onMouseLeave={handleProductsMouseLeave}
                        >
                            <NavLink className="navbar-link products-dropdown-trigger group relative z-index">
                                <span className="material-symbols-outlined">category</span>
                                <span>Products</span>
                                <span className="material-symbols-outlined dropdown-arrow text-sm">
                                    {productsDropdownOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            </NavLink>
                            <div
                                className={`products-dropdown absolute left-0 mt-1 rounded-lg shadow-xl z-50 overflow-hidden ${productsDropdownOpen ? 'open' : ''}`}
                                onMouseEnter={handleProductsMouseEnter}
                                onMouseLeave={handleProductsMouseLeave}
                            >
                                <NavLink
                                    to="/vehicles"
                                    className="products-dropdown-item flex items-center gap-2 px-4 py-2 transition-all"
                                    onClick={() => { setMenuOpen(false); setProductsDropdownOpen(false); }}
                                >
                                    <span className="material-symbols-outlined text-base">directions_car</span>
                                    <span>Vehicles</span>
                                </NavLink>
                                <NavLink
                                    to="/accessories"
                                    className="products-dropdown-item flex items-center gap-2 px-4 py-2 transition-all"
                                    onClick={() => { setMenuOpen(false); setProductsDropdownOpen(false); }}
                                >
                                    <span className="material-symbols-outlined text-base">inventory_2</span>
                                    <span>Accessories</span>
                                </NavLink>
                            </div>
                        </li>
                        <li>
                            <NavLink to="/pricing" className="navbar-link navbar-link-cta whitespace-nowrap" onClick={() => setMenuOpen(false)}>
                                <span className="material-symbols-outlined">sell</span>
                                <span>Start Selling</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/blogs" className="navbar-link whitespace-nowrap" onClick={() => setMenuOpen(false)}>
                                <span className="material-symbols-outlined">article</span>
                                <span>News Feeds</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/support" className="navbar-link" onClick={() => setMenuOpen(false)}>
                                <span className="material-symbols-outlined">support_agent</span>
                                <span>Support</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            )}
        </>
    )
}

export default Navbar;