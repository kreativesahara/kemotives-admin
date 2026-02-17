import React, { useState } from 'react';

const WhatsAppFloat = ({ phoneNumber = "254700000000", defaultMessage = "Hello, I have a question about Diksx Cars & Spares" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  
  const handleWhatsAppClick = () => {
    // Format the phone number (remove any non-numeric characters)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isExpanded && (
        <div className="mb-3 p-4 bg-white rounded-lg shadow-lg max-w-xs animate-fade-in-up">
          <p className="text-gray-700 mb-3 font-medium">Need help? Contact our support team via WhatsApp!</p>
          <textarea 
            className="w-full p-2 border border-gray-300 rounded mb-2 text-sm" 
            rows="2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button 
            onClick={handleWhatsAppClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.494 0-2.924-.279-4.241-.788l-4.757 1.238 1.255-4.616C3.365 16.698 1.5 14.479 1.5 12 1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5z"/>
            </svg>
            Chat on WhatsApp
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center p-4 rounded-full shadow-lg transition-all duration-300 ${isExpanded ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {isExpanded ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default WhatsAppFloat; 