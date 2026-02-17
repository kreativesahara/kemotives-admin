import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { showSuccess, showError, showConfirm } from "../../utils/sweetAlert";
import { useBlogContext } from "../../context/BlogProvider";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const BlogTable = () => {
  const {
    blogs,
    isLoading,
    error,
    deleteBlog,
    publishBlog,
    votesMap,
  } = useBlogContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [itemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const sortedAndPaginatedBlogs = useMemo(() => {
    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    if (!safeBlogs.length) return { paginatedBlogs: [], totalPages: 0 };

    const sorted = [...safeBlogs].sort((a, b) => {
      const aDateCreated = a.createdAt ? new Date(a.createdAt) : null;
      const bDateCreated = b.createdAt ? new Date(b.createdAt) : null;
      const aDatePublished = a.publishedAt ? new Date(a.publishedAt) : null;
      const bDatePublished = b.publishedAt ? new Date(b.publishedAt) : null;

      switch (sortConfig.key) {
        case "createdAt":
          if (!aDateCreated || !bDateCreated) return 0;
          return sortConfig.direction === "desc"
            ? bDateCreated - aDateCreated
            : aDateCreated - bDateCreated;
        case "publishedAt":
          if (!aDatePublished || !bDatePublished) return 0;
          return sortConfig.direction === "desc"
            ? bDatePublished - aDatePublished
            : aDatePublished - bDatePublished;
        case "title":
          return sortConfig.direction === "desc"
            ? String(b.title || "").localeCompare(String(a.title || ""))
            : String(a.title || "").localeCompare(String(b.title || ""));
        case "votes":
          const aVotes = votesMap?.[a.id] ?? 0;
          const bVotes = votesMap?.[b.id] ?? 0;
          return sortConfig.direction === "desc" ? bVotes - aVotes : aVotes - bVotes;
        default:
          return 0;
      }
    });

    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBlogs = sorted.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedBlogs, totalPages };
  }, [blogs, sortConfig, currentPage, itemsPerPage, votesMap]);

  const { paginatedBlogs, totalPages } = sortedAndPaginatedBlogs;

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const handlePublish = async (blog) => {
    if (blog.isPublished) {
      showError("This blog post is already published.");
      return;
    }

    const confirmed = await showConfirm(
      "Publish Blog Post",
      `Are you sure you want to publish "${blog.title}"?`,
      "Yes, Publish",
      "Cancel"
    );

    if (!confirmed) return;

    try {
      await publishBlog(blog.id);
      showSuccess("Blog post published successfully.");
    } catch (err) {
      console.error("Failed to publish blog:", err);
      showError("Failed to publish blog post. Please try again.");
    }
  };

  // Handle blog deletion
  const handleDelete = async () => {
    if (!blogToDelete) return;

    try {
      await deleteBlog(blogToDelete.id);
      showSuccess("Blog post deleted successfully.");
    } catch (err) {
      console.error("Failed to delete blog:", err);
      const message = err?.response?.data?.message || "Failed to delete blog post. Please try again.";
      showError(message);
    } finally {
      closeDeleteModal();
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (blog) => {
    setBlogToDelete(blog);
    setIsModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setBlogToDelete(null);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split("-");
                setSortConfig({ key, direction });
                setCurrentPage(1);
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2"
            >
              <option value="createdAt-desc">Created: Newest First</option>
              <option value="createdAt-asc">Created: Oldest First</option>
              <option value="publishedAt-desc">Published: Newest First</option>
              <option value="publishedAt-asc">Published: Oldest First</option>
              <option value="title-asc">Title: A-Z</option>
              <option value="title-desc">Title: Z-A</option>
              <option value="votes-desc">Votes: High to Low</option>
              <option value="votes-asc">Votes: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-md bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-[#3DC2EC] text-white whitespace-nowrap">
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Blogs</th>
                <th className="px-4 py-3 text-left font-medium">Votes</th>
                <th className="px-4 py-3 text-left font-medium">Published At</th>
                <th className="px-4 py-3 text-left font-medium">Created At</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : !paginatedBlogs?.length ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <p className="text-gray-600 mb-4">No blog posts found</p>
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((blog, index) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {blog.imageUrl && (
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            title="Preview"
                            className="h-12 w-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{blog.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-gray-400 text-sm">
                          thumb_up
                        </span>
                        <span>{votesMap?.[blog.id] ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{formatDate(blog.publishedAt)}</td>
                    <td className="px-4 py-4">{formatDate(blog.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="p-1.5 rounded-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </Link>
                        <Link
                          to={`/blog/editpost/${blog.id}`}
                          className="p-1.5 rounded-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </Link>
                        <button
                          onClick={() => handlePublish(blog)}
                          className="p-1.5 rounded-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                          disabled={blog.isPublished}
                          title={blog.isPublished ? "Already published" : "Publish"}
                        >
                          <span className="material-symbols-outlined text-xl">
                            campaign
                          </span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(blog)}
                          className="p-1.5 rounded-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center px-4">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, blogs?.length || 0)}
            </span>{" "}
            of <span className="font-medium">{blogs?.length || 0}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete "<strong>{blogToDelete?.title}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogTable;

