import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const Blog: React.FC = () => {
  const mainArticle = blogPosts.find(post => post.pinned);
  const otherPosts = blogPosts.filter(post => !post.pinned);
  const [mainImgError, setMainImgError] = useState(false);
  const [imgErrors, setImgErrors] = useState<{ [id: string]: boolean }>({});

  return (
    <div className="container-app max-w-5xl mx-auto px-4 pt-8 pb-16">
      {/* Page Title & Intro (not a hero, just styled heading) */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-primary dark:text-white">ToolsJockey Blog</h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">Insights, tutorials, and tips to help you get the most out of our privacy-first web tools.</p>
        <nav className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          <Link to="/" className="hover:underline">Home</Link> <span className="mx-1">/</span> <span>Blog</span>
        </nav>
      </div>

      {/* Top Ad Placeholder */}
      <div className="w-full h-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 mb-8">
        [Ad Slot: Blog Header]
      </div>

      {/* Main Article (teaser) */}
      {mainArticle && (
        <div className="mb-12">
          <div className="bg-white dark:bg-primary-light rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
            {mainImgError ? (
              <div className="w-full md:w-2/5 h-56 md:h-auto bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl text-gray-400">
                <span role="img" aria-label="No image">🖼️</span>
              </div>
            ) : (
              <img
                src={mainArticle.image}
                alt={mainArticle.title}
                className="w-full md:w-2/5 h-56 md:h-auto object-cover"
                onError={() => setMainImgError(true)}
              />
            )}
            <div className="flex-1 p-6 flex flex-col justify-center">
              <span className="uppercase text-xs font-bold text-accent tracking-wider mb-2">{mainArticle.category}</span>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{mainArticle.title}</h2>
              <div className="text-slate-600 dark:text-slate-300 mb-3">{mainArticle.excerpt}</div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span>{mainArticle.author}</span>
                <span>·</span>
                <span>{mainArticle.date}</span>
                <span>·</span>
                <span>{mainArticle.readTime}</span>
              </div>
              <Link to={`/blog/${mainArticle.id}`} className="inline-block px-5 py-2 rounded-lg border border-accent text-accent font-semibold hover:bg-accent hover:text-white transition-colors">Read Full Article</Link>
            </div>
          </div>
        </div>
      )}

      {/* Middle Ad Placeholder */}
      <div className="w-full h-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 mb-8">
        [Ad Slot: Blog Middle]
      </div>

      {/* Other Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {otherPosts.map(post => (
          <div key={post.id} className="bg-white dark:bg-primary-light rounded-xl shadow-md overflow-hidden flex flex-col">
            {imgErrors[post.id] ? (
              <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl text-gray-400">
                <span role="img" aria-label="No image">🖼️</span>
              </div>
            ) : (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 object-cover"
                onError={() => setImgErrors(errors => ({ ...errors, [post.id]: true }))}
              />
            )}
            <div className="p-5 flex flex-col flex-1">
              <span className="uppercase text-xs font-bold text-accent tracking-wider mb-1">{post.category}</span>
              <h3 className="text-lg font-bold mb-1">{post.title}</h3>
              <div className="text-slate-600 dark:text-slate-300 mb-2 flex-1">{post.excerpt}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <Link to={`/blog/${post.id}`} className="mt-3 inline-block text-accent font-semibold hover:underline text-sm">Read More</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Ad Placeholder */}
      <div className="w-full h-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 mt-12">
        [Ad Slot: Blog Footer]
      </div>
    </div>
  );
};

export default Blog; 