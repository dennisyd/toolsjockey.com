import React from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const Terms: React.FC = () => {
  const { trackButtonClick } = useAnalytics();

  return (
    <div className="container-app max-w-4xl mx-auto px-4 pt-8 pb-16">
      <nav className="text-slate-500 dark:text-slate-400 text-sm mb-8">
        <Link 
          to="/" 
          className="hover:underline"
          onClick={() => trackButtonClick('terms_to_home', 'Terms')}
        >
          Home
        </Link> 
        <span className="mx-1">/</span> 
        <span>Terms of Service</span>
      </nav>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 p-6 sm:p-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-slate-900 dark:text-white">Terms of Service</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">1. Acceptance of Terms</h2>
            <p>By using ToolsJockey.com, you agree to these Terms of Service. If you do not agree, please do not use the site.</p>
          </section>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">2. Use of Tools</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All tools are provided for lawful, personal, and professional use only.</li>
              <li>You are responsible for your use and any data you process.</li>
              <li>Do not use the tools for illegal or harmful purposes.</li>
            </ul>
          </section>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">3. Privacy</h2>
            <p>We value your privacy. See our <Link to="/privacy" className="text-accent underline">Privacy Policy</Link> for details.</p>
          </section>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">4. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All site content, branding, and tool code are the property of ToolsJockey.com or its licensors.</li>
              <li>You may not copy, resell, or redistribute the tools or site content.</li>
            </ul>
          </section>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">5. Disclaimers</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All tools are provided "as is" without warranties of any kind.</li>
              <li>We do not guarantee accuracy, availability, or fitness for a particular purpose.</li>
            </ul>
          </section>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">6. Limitation of Liability</h2>
            <p>ToolsJockey.com is not liable for any damages or losses resulting from your use of the site or tools.</p>
          </section>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">7. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the site means you accept the new Terms.</p>
          </section>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-accent">8. Contact</h2>
            <p>Questions? Email us at <a href="mailto:support@toolsjockey.com" className="text-accent underline">support@toolsjockey.com</a>.</p>
          </section>
        </div>
        <div className="mt-10 text-center">
          <Link to="/" className="text-accent underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Terms; 