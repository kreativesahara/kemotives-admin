import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { axiosPrivate } from "../api/axios";

const BlogContext = createContext();

export const useBlogContext = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [votesMap, setVotesMap] = useState({});

  // Fetch all published blogs (admin will manage them from dashboard)
  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosPrivate.get("/api/blogs");
      console.log('data:', response.data)
      const fetchedBlogs = Array.isArray(response.data) ? response.data : [];
      setBlogs(fetchedBlogs);
      return fetchedBlogs;
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blog posts");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch total votes for each blog and store in a map
  const fetchVotesForBlogs = useCallback(
    async (blogList) => {
      const list = Array.isArray(blogList) ? blogList : [];
      if (!list.length) return;

      try {
        const results = await Promise.all(
          list.map(async (blog) => {
            try {
              const res = await axiosPrivate.get(`/api/blogs/${blog.id}/votes/total`);
              return { id: blog.id, total: res.data?.totalVotes ?? 0 };
            } catch (err) {
              console.error(`Failed to fetch votes for blog ${blog.id}:`, err);
              return { id: blog.id, total: 0 };
            }
          })
        );

        setVotesMap((prev) => {
          const updated = { ...prev };
          results.forEach(({ id, total }) => {
            updated[id] = total;
          });
          return updated;
        });
      } catch (err) {
        console.error("Error fetching blog votes:", err);
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    const load = async () => {
      const list = await fetchBlogs();
      await fetchVotesForBlogs(list);
    };
    load();
  }, [fetchBlogs, fetchVotesForBlogs]);

  const createBlog = useCallback(
    async (formData) => {
      try {
        const response = await axiosPrivate.post("/api/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const created = response.data;

        // Refetch all blogs to get complete data including the new blog
        await fetchBlogs();

        return created;
      } catch (err) {
        console.error("Error creating blog:", err);
        throw err;
      }
    },
    [fetchBlogs]
  );

  const updateBlog = useCallback(async (id, formData) => {
    try {
      const response = await axiosPrivate.put(`/api/blogs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = response.data;
      setBlogs((prev) =>
        (Array.isArray(prev) ? prev : []).map((blog) =>
          blog.id === id ? { ...blog, ...updated } : blog
        )
      );
      return updated;
    } catch (err) {
      console.error("Error updating blog:", err);
      throw err;
    }
  }, []);

  const deleteBlog = useCallback(async (id) => {
    try {
      await axiosPrivate.delete(`/api/blogs/${id}`);
      setBlogs((prev) => (Array.isArray(prev) ? prev.filter((b) => b.id !== id) : []));
    } catch (err) {
      console.error("Error deleting blog:", err);
      throw err;
    }
  }, []);

  const publishBlog = useCallback(async (id) => {
    try {
      const response = await axiosPrivate.patch(`/api/blogs/publish/${id}`);
      const updated = response.data;
      setBlogs((prev) =>
        (Array.isArray(prev) ? prev : []).map((blog) =>
          blog.id === id ? { ...blog, ...updated } : blog
        )
      );
      return updated;
    } catch (err) {
      console.error("Error publishing blog:", err);
      throw err;
    }
  }, []);

  const value = {
    blogs,
    setBlogs,
    isLoading,
    error,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
    votesMap,
    fetchVotesForBlogs,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

