import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import { useSeoContext } from '../../context/SeoProvider';
import { useBlogContext } from '../../context/BlogProvider';
import Layout from '../Layout';
import RichTextEditor from './RichTextEditor';
import { toast } from 'react-toastify';
import { showSuccess } from '../../utils/sweetAlert';

export default function AddBlogPost() {
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { updateSeo } = useSeoContext();
    const { createBlog, fetchBlogs } = useBlogContext();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        metaDescription: '',
        metaKeywords: '',
        backlinks: '',
        userId: auth?.id,
        isPublished: 'true'
    });

    // Keep userId in sync when auth loads/changes
    useEffect(() => {
        if (auth?.id) {
            setFormData(prev => ({ ...prev, userId: auth.id }));
        }
    }, [auth?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = (newContent) => {
        setFormData(prev => ({
            ...prev,
            content: newContent
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.warning('Please select a valid image file.');
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            toast.warning('Image must be 1MB or less.');
            return;
        }

        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const clearSelectedImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.userId) {
                toast.error('User not identified. Please re-login and try again.');
                setLoading(false);
                return;
            }

            if (!imageFile) {
                toast.warning('Please select a feature image (max 1MB).');
                setLoading(false);
                return;
            }

            const form = new FormData();
            Object.keys(formData).forEach((key) => {
                const value = formData[key];
                if (value !== undefined && value !== null) {
                    form.append(key, value);
                }
            });
            form.append('image', imageFile);

            // Use createBlog from context to automatically update the blog table state
            await createBlog(form);

            // Show success modal and wait for user acknowledgment before navigating
            await showSuccess('Your blog post has been created successfully!');
            navigate('/dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create blog post';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Create New Blog Post</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter post title"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Brief description of the post"
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Content *
                        </label>
                        <RichTextEditor
                            content={formData.content}
                            onChange={handleContentChange}
                            placeholder="Write your blog post content here..."
                        />
                    </div>

                    <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Meta Description
                        </label>
                        <textarea
                            id="metaDescription"
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="SEO meta description"
                        />
                    </div>

                    <div>
                        <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                            Meta Keywords
                        </label>
                        <input
                            type="text"
                            id="metaKeywords"
                            name="metaKeywords"
                            value={formData.metaKeywords}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Comma-separated keywords"
                        />
                    </div>

                    <div>
                        <label htmlFor="backlinks" className="block text-sm font-medium text-gray-700 mb-1">
                            Related Links
                        </label>
                        <textarea
                            id="backlinks"
                            name="backlinks"
                            value={formData.backlinks}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Comma-separated URLs"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feature Image (Max: 1MB)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center hover:border-red-400 transition-all duration-300">
                            <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">
                                add_photo_alternate
                            </span>
                            <p className="text-sm text-gray-500 mb-4 text-center">
                                Drag & drop or click to select a feature image
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="blog-image-upload"
                            />
                            <label
                                htmlFor="blog-image-upload"
                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-red-700 transition-all duration-200"
                            >
                                Select Image
                            </label>
                            <p className="text-xs text-gray-400 mt-2">Images are auto-compressed by the server</p>
                        </div>

                        {imagePreview && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm group">
                                    <img
                                        title={`Viewing ${formData.title}`}
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={clearSelectedImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
} 