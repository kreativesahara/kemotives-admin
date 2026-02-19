import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAxiosPrivate from '../../api/useAxiosPrivate';
import { toast } from 'react-toastify';
import { useSeoContext } from '../../context/SeoProvider';
import Layout from '../Layout';
import RichTextEditor from './RichTextEditor';

export default function EditBlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { updateSeo } = useSeoContext();

  const [blog, setBlog] = useState({
    title: '',
    content: '',
    description: '',
    metaDescription: '',
    metaKeywords: '',
    backlinks: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axiosPrivate.put(`/api/blogs/${id}`);
        setBlog(response.data);
        setExistingImage(response.data.imageUrl || '');
        setImagePreview(response.data.imageUrl || '');
        setLoading(false);
        setRemoveImage(false);

      } catch (error) {
        toast.error('Failed to fetch blog post');
        navigate('/blogs');
      }
    };

    fetchBlog();
  }, [axiosPrivate, id, updateSeo, navigate]);

  const handleContentChange = (newContent) => {
    setBlog(prev => ({
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

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setRemoveImage(false);
  };

  const removeSelectedImage = () => {
    setImageFile(null);
    setImagePreview(existingImage || '');
    setRemoveImage(false);
  };

  const clearExistingImage = () => {
    setExistingImage('');
    setImagePreview('');
    setRemoveImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', blog.title);
      form.append('description', blog.description);
      form.append('content', blog.content);
      form.append('metaDescription', blog.metaDescription);
      form.append('metaKeywords', blog.metaKeywords);
      form.append('backlinks', blog.backlinks);
      if (existingImage) {
        form.append('existingImage', existingImage);
      }
      if (removeImage) {
        form.append('removeImage', 'true');
      }
      if (imageFile) {
        form.append('image', imageFile);
      }

      await axiosPrivate.put(`/api/blogs/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Blog post updated successfully');
      navigate('/blogs');
    } catch (error) {
      console.error('Failed to update blog post', error);
      toast.error(error.response?.data?.message || 'Failed to update blog post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>    
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
        <div className="max-w-[1100px] mx-auto bg-white rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Edit Blog Post</h1>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/blogs')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  {submitting ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={blog.title}
                    onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                    placeholder="Enter blog title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={blog.description}
                    onChange={(e) => setBlog({ ...blog, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                    placeholder="Short teaser for the article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    value={blog.metaDescription}
                    onChange={(e) => setBlog({ ...blog, metaDescription: e.target.value })}
                    rows={2}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="SEO meta description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                  <input
                    type="text"
                    value={blog.metaKeywords}
                    onChange={(e) => setBlog({ ...blog, metaKeywords: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Comma-separated keywords"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Links</label>
                  <textarea
                    value={blog.backlinks}
                    onChange={(e) => setBlog({ ...blog, backlinks: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Comma-separated URLs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Image (1 image, max 1MB)
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

                  {(imagePreview || existingImage) && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {existingImage && !imageFile && (
                        <div className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm group">
                          <img
                            title="Existing feature"
                            src={existingImage}
                            alt="Existing feature"
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={clearExistingImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      )}
                      {imagePreview && (
                        <div className="relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm group">
                          <img
                            title={`Viewing ${blog.title}`}
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded"
                          />
                          {imageFile && (
                            <button
                              type="button"
                              onClick={removeSelectedImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <RichTextEditor
                content={blog.content}
                onChange={handleContentChange}
                placeholder="Write your blog post content here..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/blogs')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-red-50 text-gray-700 font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-red-700 hover:shadow-md flex items-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined">save</span>
                {submitting ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 