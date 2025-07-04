import React from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const About: React.FC = () => {
  const { trackButtonClick } = useAnalytics();

  return (
    <div className="container-app max-w-2xl mx-auto px-2 sm:px-4 py-10 sm:py-16">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 p-6 sm:p-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-accent">About ToolsJockey.com</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-accent">Our Mission</h2>
          <p className="text-lg mb-2">We believe everyone deserves access to powerful, privacy-first productivity tools—without barriers, paywalls, or data risks.</p>
          <p>ToolsJockey.com was born from a simple idea: <b>empower people to get things done—faster, safer, and for free</b>. Whether you're a student, developer, freelancer, or business, you deserve tools that respect your privacy and just work.</p>
        </section>
        <hr className="my-4 border-slate-200 dark:border-slate-700" />
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-accent">Why Privacy Matters</h2>
          <p className="mb-2">Most online tools require you to upload your files, risking your sensitive data. <b>We do things differently.</b></p>
          <ul className="list-disc pl-6 space-y-1 mb-2">
            <li>All processing happens <b>100% in your browser</b>. Your files never leave your device.</li>
            <li>No uploads, no tracking, no snooping—ever.</li>
            <li>Perfect for confidential, regulated, or personal work.</li>
          </ul>
          <p>We built ToolsJockey.com for people who value privacy as much as productivity.</p>
        </section>
        <hr className="my-4 border-slate-200 dark:border-slate-700" />
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-accent">Why Free?</h2>
          <p className="mb-2">We believe essential tools should be accessible to everyone, regardless of budget or background.</p>
          <ul className="list-disc pl-6 space-y-1 mb-2">
            <li><b>No sign-ups, no paywalls, no ads that track you.</b></li>
            <li>Supported by a passion for open access and a privacy-first web.</li>
            <li>We may offer optional pro features in the future, but the core tools will always be free.</li>
          </ul>
          <p>Our goal is to help you work smarter, not to monetize your data.</p>
        </section>
        <hr className="my-4 border-slate-200 dark:border-slate-700" />
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-accent">Who We Are</h2>
          <p>We're a small, passionate team of developers, designers, and privacy advocates. We use these tools ourselves, and we're committed to making them the best on the web.</p>
          <p className="mt-2">We love feedback! If you have ideas, requests, or just want to say hi, <a href="mailto:support@toolsjockey.com" className="text-accent underline">email us</a>.</p>
        </section>
        <hr className="my-4 border-slate-200 dark:border-slate-700" />
        <section className="mb-8 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-accent">Join the Privacy-First Movement</h2>
          <p className="mb-2">Bookmark ToolsJockey.com, share it with friends, and help us build a better, safer web for everyone.</p>
          <Link 
            to="/" 
            className="btn btn-primary mt-4"
            onClick={() => trackButtonClick('about_to_home', 'About')}
          >
            &larr; Back to Home
          </Link>
        </section>
      </div>
    </div>
  );
};

export default About; 