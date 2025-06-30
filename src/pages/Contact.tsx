import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement)?.value;
    
    // If honeypot field is filled, silently "succeed" but don't actually send
    if (honeypot) {
      setSubmitted(true);
      return;
    }
    
    // Create mailto URL with form data
    const subject = `Contact Form: ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:support@toolsjockey.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open the user's email client with the pre-filled email
    window.location.href = mailtoUrl;
    
    // Set submitted state to show thank you message when they return
    setSubmitted(true);
  };

  return (
    <div className="container-app max-w-xl mx-auto px-2 sm:px-4 py-10 sm:py-16">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 p-6 sm:p-10">
        <h1 className="text-4xl font-bold mb-6 text-center text-accent">Contact Us</h1>
        <p className="mb-6 text-center text-slate-600 dark:text-slate-300">Have a question, suggestion, or just want to say hi? Fill out the form below or email us directly at <a href="mailto:support@toolsjockey.com" className="text-accent underline">support@toolsjockey.com</a>.</p>
        {submitted ? (
          <div className="text-center text-green-600 text-lg font-semibold py-10">Thank you for reaching out! We'll get back to you soon.</div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="name" className="block font-medium mb-1">Name</label>
              <input id="name" name="name" type="text" required className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label htmlFor="email" className="block font-medium mb-1">Email</label>
              <input id="email" name="email" type="email" required className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label htmlFor="message" className="block font-medium mb-1">Message</label>
              <textarea id="message" name="message" rows={5} required className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            
            {/* Honeypot field - hidden from users but bots will fill it out */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website (Leave this empty)</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
            >
              Send Message
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              This will open your email client with a pre-filled message
            </p>
          </form>
        )}
        <div className="mt-10 text-center">
          <Link to="/" className="text-accent underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Contact; 