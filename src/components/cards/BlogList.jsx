import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxiosPrivate from "../../api/useAxiosPrivate";
import { useSeoContext } from "../../context/SeoProvider";
import Layout from "../Layout";

export default function BlogList() {
  const axiosPrivate = useAxiosPrivate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateSeo } = useSeoContext();

  useEffect(() => {
    const canonicalUrl = 'https://www.diksxcars.co.ke/blogs';

    // Update SEO metadata for blog list page
    updateSeo({
      title: "Car Industry News & Updates | Diksx Cars Blog",
      description: "Stay updated with the latest automotive industry news, car maintenance tips, and market trends on the Diksx Cars blog.",
      type: "website",
      canonical: canonicalUrl,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Diksx Cars Blog",
        "description": "Latest automotive industry news, car maintenance tips, and market trends",
        "publisher": {
          "@type": "Organization",
          "name": "Diksx Cars",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.diksxcars.co.ke/blogs"
          }
        }
      },
      additionalMetaTags: [
        { name: 'robots', content: 'index, follow' },
      ]
    });

    const fetchBlogs = async () => {
      try {
        const response = await axiosPrivate.get("/api/blogs");
        setBlogs(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load blog posts");
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [updateSeo]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Oops! Something went wrong</p>
          <p>{error}</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Automotive News & Insights</h1>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl w-full transition-shadow duration-300"
            >
              <Link to={`/blog/${blog.slug}`}>
                <img
                  title={`View details of ${blog.title}`}
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-auto mb-4"
                  width="300"
                  height="200"
                  loading="eager"
                />
                <h2 className="text-xl px-3 font-semibold mb-2 hover:text-red-600 transition-colors">
                  {blog.title}
                </h2>
                <p className="text-gray-600 mb-4 px-3 line-clamp-2">
                  {blog.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 pb-3 px-3">
                  <span>
                    {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                  </span>
                  <span className="mx-2">•</span>
                  <span>5 min read</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
} 