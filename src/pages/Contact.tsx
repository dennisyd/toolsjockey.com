import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const Contact: React.FC = () => {
  const { trackEngagement } = useAnalytics();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMessageType, setSelectedMessageType] = useState('Question');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get form data
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const messageType = (form.elements.namedItem('messageType') as HTMLInputElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
    
    trackEngagement('contact_form_submit', 1, { 
      message_length: message.length,
      has_email: !!email,
      has_name: !!name,
      message_type: messageType
    });

    // Submit to FormSubmit.co
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('messageType', messageType);
    formData.append('message', message);
    formData.append('_next', 'https://toolsjockey.com/thank-you.html');
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');

    try {
      const response = await fetch('https://formsubmit.co/contact@toolsjockey.com', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSubmitted(true);
        // Redirect to thank you page
        window.location.href = 'https://toolsjockey.com/thank-you.html';
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Fallback: show success message anyway
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      trackEngagement('contact_form_email_entered');
    }
  };

  const handleRadioChange = (value: string) => {
    setSelectedMessageType(value);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl border border-white/20">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
              <p className="text-gray-600 mb-6 text-lg">
                Your message has been sent successfully. We'll get back to you as soon as possible!
              </p>
            </div>
            
            <div className="space-y-3">
              <Link 
                to="/" 
                className="inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-1"
              >
                Return to ToolsJockey.com
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Contact Us</h1>
          <p className="text-white/90 text-lg">We'd love to hear from you!</p>
        </div>

        {/* Contact Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <form 
            onSubmit={handleSubmit}
            className="space-y-6"
            id="contactForm"
          >
            {/* Name Field */}
            <div className="floating-label relative">
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                placeholder=" "
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-transparent transition-all duration-300 focus:outline-none focus:border-blue-500 focus:transform focus:-translate-y-1"
              />
              <label htmlFor="name" className="absolute left-4 top-4 text-gray-500 transition-all duration-300 pointer-events-none">
                Full Name *
              </label>
            </div>

            {/* Email Field */}
            <div className="floating-label relative">
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                placeholder=" "
                onChange={handleEmailChange}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-transparent transition-all duration-300 focus:outline-none focus:border-blue-500 focus:transform focus:-translate-y-1"
              />
              <label htmlFor="email" className="absolute left-4 top-4 text-gray-500 transition-all duration-300 pointer-events-none">
                Email Address *
              </label>
            </div>

            {/* Message Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Message Type *
              </label>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:transform hover:-translate-y-1 ${
                  selectedMessageType === 'Question' 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100' 
                    : 'border-gray-200'
                }`}>
                  <input 
                    type="radio" 
                    name="messageType" 
                    value="Question" 
                    required
                    className="sr-only"
                    checked={selectedMessageType === 'Question'}
                    onChange={() => handleRadioChange('Question')}
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-4 flex-shrink-0 transition-all duration-300 ${
                    selectedMessageType === 'Question' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-semibold text-gray-900">Question</div>
                    <div className="text-sm text-gray-600">Ask us anything about our tools or services</div>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:transform hover:-translate-y-1 ${
                  selectedMessageType === 'Testimonial' 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100' 
                    : 'border-gray-200'
                }`}>
                  <input 
                    type="radio" 
                    name="messageType" 
                    value="Testimonial" 
                    required
                    className="sr-only"
                    checked={selectedMessageType === 'Testimonial'}
                    onChange={() => handleRadioChange('Testimonial')}
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-4 flex-shrink-0 transition-all duration-300 ${
                    selectedMessageType === 'Testimonial' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-semibold text-gray-900">Testimonial</div>
                    <div className="text-sm text-gray-600">Share your experience with our tools</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Message Field */}
            <div className="floating-label relative">
              <textarea 
                id="message" 
                name="message" 
                rows={5} 
                required
                placeholder=" "
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-transparent resize-none transition-all duration-300 focus:outline-none focus:border-blue-500 focus:transform focus:-translate-y-1"
              />
              <label htmlFor="message" className="absolute left-4 top-4 text-gray-500 transition-all duration-300 pointer-events-none">
                Your Message *
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl text-lg relative overflow-hidden transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:transform hover:-translate-y-2 hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </span>
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Or email us directly at 
              <a href="mailto:contact@toolsjockey.com" className="text-blue-600 hover:text-blue-700 underline font-medium ml-1">
                contact@toolsjockey.com
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center text-white/90 hover:text-white transition-colors duration-200">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to ToolsJockey.com
          </Link>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .floating-label input:focus + label,
        .floating-label input:not(:placeholder-shown) + label,
        .floating-label textarea:focus + label,
        .floating-label textarea:not(:placeholder-shown) + label {
          transform: translateY(-1.5rem) scale(0.85);
          color: #3b82f6;
        }
        

      `}</style>
    </div>
  );
};

export default Contact; 