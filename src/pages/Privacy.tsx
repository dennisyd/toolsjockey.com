import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => (
  <div className="container-app max-w-2xl mx-auto px-2 sm:px-4 py-10 sm:py-16">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 p-6 sm:p-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-slate-900 dark:text-white">Privacy Policy</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-accent">1. Data Processing</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All tools on ToolsJockey.com process your data 100% in your browser.</li>
            <li>We do not store, view, or transmit your files or input data to any server.</li>
          </ul>
        </section>
        <hr className="my-2 border-slate-200 dark:border-slate-700" />
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-accent">2. No File Uploads</h2>
          <p>Your files never leave your device. All processing is local and private.</p>
        </section>
        <hr className="my-2 border-slate-200 dark:border-slate-700" />
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-accent">3. Cookies</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>We use only essential cookies for site functionality (such as dark mode preference).</li>
            <li>No tracking or advertising cookies are used.</li>
          </ul>
        </section>
        <hr className="my-2 border-slate-200 dark:border-slate-700" />
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-accent">4. Analytics</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>We may use privacy-friendly analytics (such as Plausible or Fathom) to understand site usage.</li>
            <li>No personal or file data is ever collected.</li>
          </ul>
        </section>
        <hr className="my-2 border-slate-200 dark:border-slate-700" />
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-accent">5. Third-Party Links</h2>
          <p>ToolsJockey.com may link to third-party sites. We are not responsible for their privacy practices.</p>
        </section>
        <hr className="my-2 border-slate-200 dark:border-slate-700" />
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-accent">6. Changes to Policy</h2>
          <p>We may update this Privacy Policy at any time. Continued use of the site means you accept the new policy.</p>
        </section>
        <hr className="my-2 border-slate-200 dark:border-slate-700" />
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-accent">7. Contact</h2>
          <p>Questions? Email us at <a href="mailto:support@toolsjockey.com" className="text-accent underline">support@toolsjockey.com</a>.</p>
        </section>
      </div>
      <div className="mt-10 text-center">
        <Link to="/" className="text-accent underline">&larr; Back to Home</Link>
      </div>
    </div>
  </div>
);

export default Privacy; 