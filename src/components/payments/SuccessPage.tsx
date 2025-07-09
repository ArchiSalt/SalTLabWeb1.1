import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, Heart, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../Footer';

const SuccessPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading period to show the success animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Processing your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          {/* Success Animation */}
          <div className="mb-6">
            <div className="relative">
              <CheckCircle className="mx-auto text-green-500 animate-pulse" size={64} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Heart className="text-orange-500" size={24} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">Thank You for Your Donation!</h1>
          
          <p className="text-gray-400 mb-6">
            Your donation has been processed successfully. We truly appreciate your support in helping us build better tools for the community.
          </p>

          {/* Impact Message */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Your Impact</h3>
            <p className="text-sm text-gray-300">
              Your contribution helps us continue developing SalT Lab and making building planning accessible to everyone. Thank you for being part of our mission!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Return to Home
            </Link>
            
            <Link
              to="/donate"
              className="w-full border border-gray-600 hover:border-orange-500 text-gray-300 hover:text-orange-500 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Heart size={20} />
              Make Another Donation
            </Link>
          </div>

          {/* Receipt Info */}
          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-sm">
              A receipt has been sent to your email address
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SuccessPage;