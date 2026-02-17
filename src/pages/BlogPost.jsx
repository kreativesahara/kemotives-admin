import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import useAxiosPrivate from "../api/useAxiosPrivate";
import { useSeoContext, BreadcrumbSchema } from "../context/SeoProvider";
import Layout from "../components/Layout";
import VoteButtons from "../components/button/VoteButtons";
export default function BlogPost() {
  const axiosPrivate = useAxiosPrivate();
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateSeo } = useSeoContext();
  const buildSeoTitle = (rawTitle) => {
    const base = rawTitle ? `${rawTitle.trim()} | Diksx Cars Blog` : 'Diksx Cars Blog';
    return base.length > 65 ? `${base.slice(0, 62)}...` : base;
  };
  const buildHeading = (rawTitle) => {
    const clean = rawTitle ? rawTitle.trim().replace(/\s+/g, ' ') : 'Latest insights';
    const withSuffix = clean.length < 20 ? `${clean} | Diksx Cars` : clean;
    return withSuffix.length > 70 ? `${withSuffix.slice(0, 67)}...` : withSuffix;
  };

  // Function to detect if content has bullet lists and apply indentation
  const hasBulletLists = useMemo(() => {
    if (!post?.content) return false;
    // Check if content contains ul or ol elements using regex
    const hasUnorderedLists = /<ul[^>]*>/i.test(post.content);
    const hasOrderedLists = /<ol[^>]*>/i.test(post.content);
    return hasUnorderedLists || hasOrderedLists;
  }, [post?.content]);

  // Function to get content classes with conditional bullet indentation
  const getContentClasses = () => {
    const baseClasses = "prose !text-[20px] !leading-6 max-w-7xl prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:mb-4 prose-p:!text-[12px] prose-p:!leading-6 prose-p:pl-0 prose-p:pr-0 prose-a:text-red-600 prose-a:no-underline hover:prose-a:text-red-700 prose-strong:text-gray-900 prose-strong:font-semibold prose-blockquote:text-gray-700 prose-blockquote:border-red-600 prose-hr:border-gray-200";

    // Apply bullet indentation styles only if bullets are detected
    const bulletClasses = hasBulletLists
      ? "prose-ul:text-gray-600 prose-ul:pl-0 prose-ul:pr-0 prose-ul:my-4 prose-ul:ml-0 prose-ul:list-outside prose-ol:text-gray-600 prose-ol:pl-0 prose-ol:pr-0 prose-ol:my-4 prose-ol:ml-0 prose-ol:list-outside prose-li:pl-0 prose-li:pr-0 prose-li:ml-6 prose-li:my-2 prose-li:text-gray-600"
      : "";

    return `${baseClasses} ${bulletClasses}`.trim();
  };

  useEffect(() => {
    // Scroll to top when navigating to a new blog post
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fetchPost = async () => {
      try {
        const response = await axiosPrivate.get(`/api/blogs/${slug}`);
        const blog = response.data;
        setPost(blog);
        setLoading(false);
        const canonical = `https://www.diksxcars.co.ke/blog/${blog.slug}`;
        // Update SEO metadata when post is loaded
        updateSeo({
          title: buildSeoTitle(blog.title),
          description: blog.metaDescription || blog.description,
          type: 'article',
          canonical: canonical,
          structuredData: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": blog.description,
            "author": {
              "@type": "Organization",
              "name": "Diksx Cars"
            },
            "datePublished": blog.publishedAt || blog.createdAt,
            "dateModified": blog.updatedAt || blog.createdAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonical
            }
          },
          additionalMetaTags: [
            {
              name: 'robots',
              content: blog.metaKeywords && 'index, follow' || "cars, automotive, blog",
            }
          ]
        });
      } catch (err) {
        setError("Failed to load blog post");
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, updateSeo]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2 text-gray-800">Oops! Something went wrong</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/blogs" className="text-red-600 hover:text-red-700 font-medium">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </Layout>
  );

  if (!post) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2 text-gray-800">Blog post not found</p>
          <Link to="/blogs" className="text-red-600 hover:text-red-700 font-medium">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Breadcrumb structured data */}
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://diksxcars.co.ke' },
        { name: 'Blog', url: 'https://www.diksxcars.co.ke/blog' },
        { name: post.title, url: `https://www.diksxcars.co.ke/blogs/${post.slug}` }
      ]} />

      <div className="min-h-screen bg-white">
        <article className="max-w-4xl mx-auto px-4 py-8">
          <nav className="mb-8">
            <Link
              to="/blogs"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </nav>

          <div className="mb-12">
            <img
              title={`Viewing ${post.title}`}
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto mb-4"
              width="160"
              height="120"
              loading="eager"
            />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 leading-tight">
              {buildHeading(post.title)}
            </h1>
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <time dateTime={post.publishedAt || post.createdAt} className="font-medium">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span className="mx-2">•</span>
              <span>5 min read</span>
            </div>
            <h2 className="text-xl text-gray-600 leading-relaxed">
              {post.description}
            </h2>
          </div>

          <div className="relative">
            {hasBulletLists && (
              <style>{`
                .blog-content ul,
                .blog-content ol {
                  padding-left: 0 !important;
                  margin-left: 0 !important;
                  margin-right: 0 !important;
                  list-style-position: outside !important;
                }
                .blog-content ul li,
                .blog-content ol li {
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                  margin-left: 1.5rem !important;
                  margin-right: 0 !important;
                  list-style-position: outside !important;
                }
                .blog-content p {
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                  margin-left: 0 !important;
                  margin-right: 0 !important;
                }
                .blog-content ul li::marker,
                .blog-content ol li::marker {
                  margin-left: 0 !important;
                }
              `}</style>
            )}
            <div
              className={`blog-content ${getContentClasses()}`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Add voting buttons */}
          <VoteButtons blogId={post.id} initialVotes={post.votes || 0} />

          {post.backlinks && (
            <footer className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Resources</h2>
              <ul className="space-y-3">
                {post.backlinks.split(',').map((url, index) => (
                  <li key={index}>
                    <a
                      href={url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                    >
                      <span className="mr-2">{url.trim()}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </article>
      </div>
    </Layout>
  );
} 