import { useState, useEffect } from 'react';
import axios from '../../../../api/axios';
import useAxiosPrivate from '../../../../api/useAxiosPrivate';
import useAuth from '../../../../hooks/useAuth';
import { toast } from 'react-toastify';

export default function VoteButtons({ blogId, initialVotes = 0 }) {
    const [voteCount, setVoteCount] = useState(initialVotes);
    const [userVote, setUserVote] = useState(0);
    const [loading, setLoading] = useState(true);
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {    
        // Fetch both user's vote and total votes when component mounts
        const fetchVotes = async () => {
            setLoading(true);
            try {
                // Fetch both user vote and total votes in one request
                const response = await axios.get(`/api/blogs/${blogId}/vote`);
                setVoteCount(response.data.totalVotes || 0);
                
                // Set user vote if available (will be null for non-authenticated users)
                setUserVote(response.data.userVote || 0);
            } catch (error) {
                console.error('Error fetching votes:', error);
                setVoteCount(initialVotes);
                setUserVote(0); // Reset on error
            } finally {
                setLoading(false);
            }
        };
        
        fetchVotes();
    }, [blogId, auth?.id, initialVotes]); // Add auth?.id as dependency to re-run when auth state changes

    const handleVote = async (value) => {
        // Check if user is authenticated
        if (!auth?.id) {
            toast.info('Please log in to vote');
            return;
        }

        try {
            const response = await axiosPrivate.post(`/api/blogs/${blogId}/vote`, {
                vote: value === userVote ? 0 : value // Toggle vote if clicking same button
            });

            setVoteCount(response.data.totalVotes);
            setUserVote(response.data.vote);
            
            if (response.data.vote === 0) {
                toast.info('Vote removed');
            } else {
                toast.success(value === 1 ? 'Upvoted!' : 'Downvoted!');
            }
        } catch (error) {
            toast.error('Failed to vote. Please try again.');
            console.error('Error voting:', error);
        }
    };

    const getButtonStyle = (voteType) => {
        // If user is not authenticated, always show gray state
        if (!auth?.id) {
            return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
        }

        // For authenticated users, show active states based on their vote
        if (userVote === voteType) {
            if (voteType === 1) {
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            }
            if (voteType === -1) {
                return 'bg-red-100 text-red-700 hover:bg-red-200';
            }
        }

        // Default state (not voted or different vote type)
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
    };

    // Show loading skeleton while fetching votes
    if (loading) {
        return (
            <div className="flex items-center space-x-4 mt-8 mb-4">
                <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4 mt-8 mb-4">
            <button
                onClick={() => handleVote(1)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${getButtonStyle(1)}`}
                title={auth?.id ? 'Upvote this post' : 'Login to vote'}
            >
                <svg
                    className={`w-5 h-5 ${userVote === 1 ? 'fill-current' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                    />
                </svg>
                <span>Upvote</span>
            </button>

            <span className="text-lg font-semibold text-gray-700">{voteCount}</span>

            <button
                onClick={() => handleVote(-1)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${getButtonStyle(-1)}`}
                title={auth?.id ? 'Downvote this post' : 'Login to vote'}
            >
                <svg
                    className={`w-5 h-5 ${userVote === -1 ? 'fill-current' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
                <span>Downvote</span>
            </button>
        </div>
    );
} 