import React, { useState, useEffect } from 'react';

const CookieConsent = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    if (cookieChoice) {
      setIsVisible(false);
      if (cookieChoice === 'accepted') {
        onAccept();
      }
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg"
         style={{ zIndex: 1000, position: 'fixed' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Mobile Layout (default) */}
        <div className="flex flex-col items-center md:hidden ">
          <div className="w-full text-center mb-4">
            <p className="font-medium text-gray-700 mb-2">
              Accept or decline cookies to continue
            </p>
            <p className="text-sm text-gray-500">
              Please make a choice about cookies to continue
            </p>
          </div>
          <div className="w-full flex flex-col space-y-3">
            <button
              onClick={handleAccept}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Decline
            </button>
          </div>
        </div>
        
        {/* Desktop Layout (md and above) */}
        <div className="hidden md:flex md:items-center md:justify-between md:flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <p className="ml-3 font-medium text-gray-700">
              <span className="inline">
                We use cookies to remember your preferences and provide a better experience.
                This includes remembering your login status.
              </span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="flex space-x-4">
              <button
                onClick={handleAccept}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 