import React, { useState } from 'react';
import { Heart, CreditCard, ArrowLeft, AlertCircle, CheckCircle, Shield, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import Footer from '../Footer';

const DonationPage = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  // Preset donation amounts
  const presetAmounts = [1, 5, 10, 25, 50, 100];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getCurrentAmount = (): number => {
    if (selectedAmount !== null) return selectedAmount;
    return parseFloat(customAmount) || 0;
  };

  const handleDonate = async () => {
    const donationAmount = getCurrentAmount();
    
    if (!donationAmount || donationAmount < 1) {
      setError('Minimum donation amount is $1');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      // Create Stripe checkout session using our edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          amount: Math.round(donationAmount * 100), // Convert to cents
          success_url: `${window.location.origin}/success`,
          cancel_url: window.location.href,
          mode: 'payment',
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Donation error:', err);
      setError('Unable to process donation at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <Heart className="mx-auto mb-4 text-orange-500" size={48} />
            <h1 className="text-2xl font-bold text-white mb-4">Support Our Developers</h1>
            <p className="text-gray-400 mb-6">Please sign in to make a donation</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Sign In to Donate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <Heart className="mx-auto mb-4 text-orange-500" size={64} />
            <h1 className="text-4xl font-bold text-white mb-4">Support Our Developers</h1>
            <p className="text-xl text-gray-400">
              Help us continue building amazing tools for the community
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3 text-red-300">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-start gap-3 text-green-300">
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Success</p>
                <p className="text-sm mt-1">{message}</p>
              </div>
            </div>
          )}

          {/* Amount Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Choose Your Donation Amount</h3>
            
            {/* Preset Amounts Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    selectedAmount === amount
                      ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-orange-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{formatCurrency(amount)}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Or enter a custom amount (minimum $1):</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 ${
                    selectedAmount === null && customAmount ? 'border-orange-500' : 'border-gray-700'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Why Donate Section */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Why Donate?</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Support ongoing development of new features and tools</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Help maintain and improve existing functionality</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Enable us to provide better support and documentation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Keep SalT Lab free and accessible for everyone</span>
              </li>
            </ul>
          </div>

          {/* Donation Button */}
          <div className="text-center">
            <button
              onClick={handleDonate}
              disabled={loading || getCurrentAmount() < 1}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-3 mx-auto min-w-[200px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  {getCurrentAmount() >= 1 ? `Donate ${formatCurrency(getCurrentAmount())}` : 'Select Amount'}
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <Shield size={16} />
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              Donating as: <span className="text-orange-400 font-medium">{user.email}</span>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DonationPage;