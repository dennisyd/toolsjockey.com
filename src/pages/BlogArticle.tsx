import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const BlogArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = blogPosts.find(post => post.id === id);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <h1 className="text-3xl font-bold mb-4 text-accent">404 - Article Not Found</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-300">Sorry, we couldn't find that article.</p>
        <Link to="/blog" className="px-4 py-2 rounded-lg border border-accent text-accent font-semibold hover:bg-accent hover:text-white transition-colors">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="container-app max-w-3xl mx-auto px-4 pb-16 pt-8">
      <div className="bg-white dark:bg-primary-light rounded-xl shadow-lg overflow-hidden mb-8">
        <img src={article.image} alt={article.title} className="w-full h-56 object-cover" />
        <div className="p-6">
          <span className="uppercase text-xs font-bold text-accent tracking-wider mb-2 block">{article.category}</span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{article.title}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span>{article.author}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none text-base">
            {article.content}
          </div>
        </div>
      </div>
      <Link to="/blog" className="inline-block px-4 py-2 rounded-lg border border-accent text-accent font-semibold hover:bg-accent hover:text-white transition-colors">← Back to Blog</Link>
    </div>
  );
};

export default BlogArticle; 