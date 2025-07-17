// Yancy Dennis
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

//Declare the global grecaptcha object
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (element: string | HTMLElement, options: any) => number;
      getResponse: (widgetId: number) => string;
      reset: (widgetId: number) => void;
    };
  }
}

const Contact: React.FC = () => {
  const { trackEngagement } = useAnalytics();
  const [selectedMessageType, setSelectedMessageType] = useState('Question');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('reCAPTCHA script loaded');
      if (window.grecaptcha && recaptchaRef.current) {
        window.grecaptcha.ready(() => {
          console.log('reCAPTCHA ready, rendering widget');
          try {
            const widgetId = window.grecaptcha.render(recaptchaRef.current!, {
              sitekey: '6LdY7IUrAAAAALwwExeqGYYAgjIaOfzlAE4nnyUx',
              theme: 'light',
              size: 'normal',
              callback: () => {
                console.log('reCAPTCHA completed');
              }
            });
            console.log('reCAPTCHA widget rendered with ID:', widgetId);
            setRecaptchaWidgetId(widgetId);
          } catch (error) {
            console.error('Error rendering reCAPTCHA:', error);
          }
        });
      } else {
        console.error('reCAPTCHA not available or ref not ready');
      }
    };

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      trackEngagement('contact_form_email_entered');
    }
  };

  const handleRadioChange = (value: string) => {
    setSelectedMessageType(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    console.log('Form submission started');
    console.log('reCAPTCHA widget ID:', recaptchaWidgetId);
    console.log('window.grecaptcha available:', !!window.grecaptcha);

    // Check if reCAPTCHA is completed
    if (!recaptchaWidgetId || !window.grecaptcha) {
      console.error('reCAPTCHA not initialized');
      alert('reCAPTCHA is not loaded. Please refresh the page and try again.');
      return;
    }

    const recaptchaResponse = window.grecaptcha.getResponse(recaptchaWidgetId);
    console.log('reCAPTCHA response:', recaptchaResponse ? 'Present' : 'Missing');
    
    if (!recaptchaResponse) {
      alert('Please complete the reCAPTCHA verification before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const formObject = {
        name: formData.get('name'),
        email: formData.get('email'),
        messageType: formData.get('messageType'),
        message: formData.get('message'),
        recaptchaResponse: recaptchaResponse
      };

      console.log('Sending form data to server');

      // Send to your PHP handler instead of FormSubmit.co
      const response = await fetch('/server/contact-form-handler.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject)
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to thank you page
        window.location.href = '/thank-you';
      } else {
        alert(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      // Reset reCAPTCHA
      if (recaptchaWidgetId && window.grecaptcha) {
        window.grecaptcha.reset(recaptchaWidgetId);
      }
    }
  };


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
            action="https://formsubmit.co/contact@toolsjockey.com"
            method="POST"
            className="space-y-6"
            id="contactForm"
            onSubmit={handleSubmit}
          >
            {/* Hidden fields for FormSubmit.co configuration */}
            <input type="hidden" name="_next" value="https://toolsjockey.com/thank-you" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
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
            <fieldset className="space-y-3">
              <legend className="block text-sm font-semibold text-gray-700 mb-4">
                Message Type *
              </legend>
              
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:transform hover:-translate-y-1 ${
                  selectedMessageType === 'Question' 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg' 
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
                      ? 'border-blue-500 bg-blue-500 scale-110' 
                      : 'border-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Question</div>
                    <div className="text-sm text-gray-600">Ask us anything about our tools or services</div>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:transform hover:-translate-y-1 ${
                  selectedMessageType === 'Testimonial' 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg' 
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
                      ? 'border-blue-500 bg-blue-500 scale-110' 
                      : 'border-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Testimonial</div>
                    <div className="text-sm text-gray-600">Share your experience with our tools</div>
                  </div>
                </label>
              </div>
            </fieldset>

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

            {/* reCAPTCHA */}
            <div ref={recaptchaRef} className="g-recaptcha" data-sitekey="6LdY7IUrAAAAALwwExeqGYYAgjIaOfzlAE4nnyUx"></div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl text-lg relative overflow-hidden transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:transform hover:-translate-y-2 hover:shadow-lg"
              disabled={isSubmitting}
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