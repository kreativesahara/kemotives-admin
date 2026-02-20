import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function NotFound() {
    return (
        <div className="max-w-[2000px] min-w-[400px] mx-auto bg-white font-sans">
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="flex justify-center">
                        <svg
                            className="w-32 h-32 text-[#3DC2EC] animate-pulse"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <h1 className="mt-6 text-9xl font-extrabold text-[#3DC2EC] transition-all duration-300 hover:text-blue-600 hover:scale-105">
                        404
                    </h1>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900 transition-all duration-300 hover:text-blue-600 hover:scale-105">
                        Page Not Found
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        The page you are looking for might have been removed, had its name changed, or is
                        temporarily unavailable.
                    </p>
                    <div className="mt-8 flex justify-center items-center"></div>
                    <div className="mt-8">
                        <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#3DC2EC] hover:bg-[#4607d0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7341ff] transition-all duration-300 hover:shadow-lg hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Return Home
                        </Link>
                    </div>
                    <div className="mt-6 text-sm text-gray-500">
                        <p>If you believe this is an error, please contact our support team.</p>
                        <a
                            href="mailto:support@diksxcars.co.ke"
                            className="mt-2 hover:text-[#631bff] transition-all duration-300 cursor-pointer"
                        >
                            support@diksxcars.co.ke
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;