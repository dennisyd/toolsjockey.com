import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Update this URL to your actual form handling endpoint on your other domain
const FORM_ENDPOINT = 'https://your-other-domain.com/api/contact';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [showCopyOption, setShowCopyOption] = useState(false);
  const [showDirectOption, setShowDirectOption] = useState(true); // Default to direct submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    if (showDirectOption) {
      // Direct form submission to server endpoint
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            name, 
            email, 
            message,
            subject: 'Contact Form Submission from ToolsJockey.com'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Server responded with an error');
        }
        
        setSubmitted(true);
      } catch (err) {
        console.error('Form submission error:', err);
        setError('Failed to send message. Please try another method or email us directly.');
      } finally {
        setLoading(false);
      }
    } else if (showCopyOption) {
      // Create formatted message for copying
      const formattedMessage = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(formattedMessage)
        .then(() => {
          setCopySuccess('Message copied to clipboard!');
          setTimeout(() => setCopySuccess(''), 3000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          setCopySuccess('Failed to copy. Please try again.');
        });
      
      setSubmitted(true);
    } else {
      // Create mailto URL with form data
      const subject = `Contact Form: ${name}`;
      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const mailtoUrl = `mailto:support@toolsjockey.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open the user's email client with the pre-filled email
      window.location.href = mailtoUrl;
      
      // Set submitted state to show thank you message when they return
      setSubmitted(true);
    }
  };

  return (
    <div className="container-app max-w-xl mx-auto px-2 sm:px-4 py-10 sm:py-16">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 p-6 sm:p-10">
        <h1 className="text-4xl font-bold mb-6 text-center text-accent">Contact Us</h1>
        <p className="mb-6 text-center text-slate-600 dark:text-slate-300">Have a question, suggestion, or just want to say hi? Fill out the form below or email us directly at <a href="mailto:support@toolsjockey.com" className="text-accent underline">support@toolsjockey.com</a>.</p>
        {submitted ? (
          <div className="text-center text-green-600 text-lg font-semibold py-10">
            <p>Thank you for reaching out! We'll get back to you soon.</p>
            {copySuccess && <p className="mt-2 text-sm">{copySuccess}</p>}
            {showCopyOption && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Please send your message to:</p>
                <p className="font-medium mt-1">support@toolsjockey.com</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-center flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDirectOption(true);
                    setShowCopyOption(false);
                  }}
                  className={`px-4 py-2 rounded-md ${showDirectOption ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  Submit Directly
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDirectOption(false);
                    setShowCopyOption(false);
                  }}
                  className={`px-4 py-2 rounded-md ${!showDirectOption && !showCopyOption ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  Use Email Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDirectOption(false);
                    setShowCopyOption(true);
                  }}
                  className={`px-4 py-2 rounded-md ${showCopyOption ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  Copy to Clipboard
                </button>
              </div>
              <p className="text-center text-sm mt-2 text-gray-500 dark:text-gray-400">
                {showDirectOption ? 
                  "Submit the form directly - no email client needed" : 
                  showCopyOption ? 
                    "Copy your message and send it manually from your preferred email app" : 
                    "This will open your default email client with a pre-filled message"}
              </p>
            </div>
            
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
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary w-full flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  showDirectOption ? 'Submit Message' : 
                  showCopyOption ? 'Copy Message' : 
                  'Send Message'
                )}
              </button>
            </form>
          </>
        )}
        <div className="mt-10 text-center">
          <Link to="/" className="text-accent underline">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Contact; 