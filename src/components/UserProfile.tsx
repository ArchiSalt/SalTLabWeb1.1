import React, { useEffect, useState } from 'react';
import { User, LogOut, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

interface UserProfileProps {
  onClose?: () => void;
}

interface UserSubscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

interface UserOrder {
  order_id: number;
  amount_total: number;
  currency: string | null;
  payment_status: string;
  order_status: string;
  order_date: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch subscription data
      const { data: subData, error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        // Set default subscription data on error
        setSubscription({
          subscription_status: 'not_started',
          price_id: null,
          current_period_end: null,
          cancel_at_period_end: false
        });
      } else {
        // Ensure subscription_status is never null
        const processedSubData = subData ? {
          ...subData,
          subscription_status: subData.subscription_status || 'not_started'
        } : {
          subscription_status: 'not_started',
          price_id: null,
          current_period_end: null,
          cancel_at_period_end: false
        };
        
        setSubscription(processedSubData);
      }

      // Fetch order history
      const { data: orderData, error: orderError } = await supabase
        .from('stripe_user_orders')
        .select('order_id, amount_total, currency, payment_status, order_status, order_date')
        .order('order_date', { ascending: false })
        .limit(5);

      if (orderError) {
        console.error('Error fetching orders:', orderError);
        setOrders([]);
      } else {
        setOrders(orderData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default values on error to prevent infinite loading
      setSubscription({
        subscription_status: 'not_started',
        price_id: null,
        current_period_end: null,
        cancel_at_period_end: false
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number | string) => {
    // Handle null, undefined, empty string, or invalid values
    if (!timestamp || timestamp === '' || timestamp === '0') {
      return 'No date available';
    }
    
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    
    // Check if the date is invalid
    if (isNaN(date.getTime())) {
      return 'No date available';
    }
    
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string | null) => {
    const safeCurrency = currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency.toUpperCase(),
    }).format(amount / 100);
  };

  const getSubscriptionStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Active', color: 'text-green-400', icon: CheckCircle };
      case 'canceled':
        return { text: 'Canceled', color: 'text-red-400', icon: AlertCircle };
      case 'past_due':
        return { text: 'Past Due', color: 'text-yellow-400', icon: AlertCircle };
      case 'not_started':
        return { text: 'No Active Subscription', color: 'text-gray-400', icon: AlertCircle };
      default:
        return { text: status, color: 'text-gray-400', icon: AlertCircle };
    }
  };

  const getSubscriptionPlanName = (priceId: string | null) => {
    if (!priceId) return 'No Plan';
    
    // Use the stripe config to get product name
    const product = getProductByPriceId(priceId);
    return product ? product.name : 'Unknown Plan';
  };

  const handleSignOut = async () => {
    // Close the profile dropdown immediately for better UX
    if (onClose) {
      onClose();
    }
    
    // Then attempt sign out
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if sign out fails, the dropdown is already closed
      // and the AuthProvider will handle state cleanup
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <User className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Profile</h3>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Subscription Status */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-2">Account Status</h4>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : subscription ? (
            <div>
              {(() => {
                const status = getSubscriptionStatusDisplay(subscription.subscription_status);
                const StatusIcon = status.icon;
                return (
                  <div className="flex items-center gap-2">
                    <StatusIcon size={16} className={status.color} />
                    <p className={`font-medium ${status.color}`}>
                      {status.text}
                    </p>
                    {subscription.price_id && (
                      <span className="text-sm text-gray-400 ml-2">
                        ({getSubscriptionPlanName(subscription.price_id)})
                      </span>
                    )}
                  </div>
                );
              })()}
              {subscription.current_period_end && (
                <p className="text-sm text-gray-400 mt-1">
                  {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
                  {formatDate(subscription.current_period_end)}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-gray-400" />
              <p className="font-medium text-gray-400">No Active Subscription</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-3">Recent Donations</h4>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : orders && orders.filter(order => order.amount_total > 0).length > 0 ? (
            <div className="space-y-2">
              {orders
                .filter(order => order.amount_total > 0)
                .map((order) => (
                <div key={order.order_id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div>
                    <p className="text-sm text-gray-300">
                      {formatAmount(order.amount_total, order.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.order_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-xs text-green-400 capitalize">
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">No donations yet</p>
              <p className="text-gray-500 text-xs mt-1">Support the developers to see your donation history here</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/donate"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Heart size={18} />
            Support Developers
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 border border-gray-600 hover:border-red-500 text-gray-300 hover:text-red-400 font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;