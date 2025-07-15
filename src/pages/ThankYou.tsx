import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Thank You!</h1>
          <p className="text-white/90 text-lg">Your message has been sent successfully</p>
        </div>

        {/* Thank You Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Success Animation */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce-in">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600 text-lg">
              We'll get back to you as soon as possible.
            </p>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm font-semibold text-blue-800">What happens next?</span>
            </div>
            <p className="text-sm text-blue-700">
              We typically respond within 24 hours during business days. If you have an urgent matter, please email us directly at{' '}
              <a href="mailto:contact@toolsjockey.com" className="font-medium underline hover:text-blue-800">
                contact@toolsjockey.com
              </a>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 animate-slide-up">
            <Link 
              to="/" 
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl text-lg relative overflow-hidden transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:transform hover:-translate-y-2 hover:shadow-lg flex items-center justify-center"
            >
              <span className="relative z-10">Return to ToolsJockey.com</span>
            </Link>
            
            <Link 
              to="/contact" 
              className="w-full py-4 px-6 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:transform hover:-translate-y-1 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Send Another Message
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-slide-up">
          <p className="text-white/80 text-sm">
            Having trouble?{' '}
            <a href="mailto:contact@toolsjockey.com" className="text-white underline hover:text-white/90">
              Email us directly
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounceIn 1s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out 0.5s both;
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
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ThankYou; 