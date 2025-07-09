import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Mail,
  Calendar,
  Activity,
  Ban,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Clock,
  DollarSign,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import Footer from '../Footer';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_admin: boolean;
  is_banned: boolean;
  display_name: string | null;
  subscription_status: string;
  total_orders: number;
  total_spent: number;
  last_activity: string | null;
  login_count: number;
  last_login_ip: string | null;
}

interface UserStats {
  total: number;
  active: number;
  subscribers: number;
  banned: number;
  admins: number;
  unconfirmed: number;
}

const UserManagement = () => {
  const { signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    subscribers: 0,
    banned: 0,
    admins: 0,
    unconfirmed: 0
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Failed to get session: ' + sessionError.message);
      }
      
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-get-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          console.log('Authentication token invalid, signing out...');
          await signOut();
          return;
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const result = await response.json();
      const users = result.users;
      
      setUsers(users || []);
      
      // Calculate statistics from the fetched data
      const stats = {
        total: users?.length || 0,
        active: users?.filter(u => {
          if (!u.last_activity) return false;
          const lastActivity = new Date(u.last_activity);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return lastActivity > weekAgo;
        }).length || 0,
        subscribers: users?.filter(u => u.subscription_status === 'active').length || 0,
        banned: users?.filter(u => u.is_banned).length || 0,
        admins: users?.filter(u => u.is_admin).length || 0,
        unconfirmed: users?.filter(u => !u.email_confirmed_at).length || 0,
      };
      
      setUserStats(stats);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    switch (filterStatus) {
      case 'admin':
        filtered = filtered.filter(user => user.is_admin);
        break;
      case 'subscribers':
        filtered = filtered.filter(user => user.subscription_status === 'active');
        break;
      case 'banned':
        filtered = filtered.filter(user => user.is_banned);
        break;
      case 'unconfirmed':
        filtered = filtered.filter(user => !user.email_confirmed_at);
        break;
      case 'active':
        filtered = filtered.filter(user => {
          if (!user.last_activity) return false;
          const lastActivity = new Date(user.last_activity);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return lastActivity > weekAgo;
        });
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'make_admin' | 'remove_admin' | 'delete', reason?: string) => {
    try {
      setActionLoading(userId);
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      // Confirm destructive actions
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          return;
        }
      } else if (action === 'ban') {
        if (!confirm('Are you sure you want to ban this user?')) {
          return;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-update-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          reason: reason || `Admin action: ${action}`,
        }),
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          console.log('Authentication token invalid, signing out...');
          await signOut();
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      // Refresh users list
      await fetchUsers();
      
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getStatusBadge = (user: User) => {
    if (user.is_banned) {
      return <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs flex items-center gap-1">
        <Ban size={12} />
        Banned
      </span>;
    }
    if (user.is_admin) {
      return <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs flex items-center gap-1">
        <Crown size={12} />
        Admin
      </span>;
    }
    if (user.subscription_status === 'active') {
      return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs flex items-center gap-1">
        <CheckCircle size={12} />
        Subscriber
      </span>;
    }
    if (!user.email_confirmed_at) {
      return <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs flex items-center gap-1">
        <AlertCircle size={12} />
        Unconfirmed
      </span>;
    }
    return <span className="px-2 py-1 bg-gray-900/30 text-gray-400 rounded text-xs flex items-center gap-1">
      <UserCheck size={12} />
      User
    </span>;
  };

  const getActivityStatus = (user: User) => {
    if (!user.last_activity) return 'Never';
    
    const lastActivity = new Date(user.last_activity);
    const now = new Date();
    const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Online';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return formatDate(user.last_activity);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <div>
            <p className="text-red-300 font-medium">Error</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-blue-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Total</h3>
          </div>
          <p className="text-xl font-bold text-white">{userStats.total}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-green-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Active</h3>
          </div>
          <p className="text-xl font-bold text-white">{userStats.active}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-orange-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Subscribers</h3>
          </div>
          <p className="text-xl font-bold text-white">{userStats.subscribers}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="text-purple-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Admins</h3>
          </div>
          <p className="text-xl font-bold text-white">{userStats.admins}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="text-red-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Banned</h3>
          </div>
          <p className="text-xl font-bold text-white">{userStats.banned}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-yellow-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Unconfirmed</h3>
          </div>
          <p className="text-xl font-bold text-white">{userStats.unconfirmed}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active (7 days)</option>
              <option value="admin">Admins</option>
              <option value="subscribers">Subscribers</option>
              <option value="banned">Banned</option>
              <option value="unconfirmed">Unconfirmed</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">User</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Activity</th>
                <th className="text-left p-4 text-gray-400 font-medium">Subscription</th>
                <th className="text-left p-4 text-gray-400 font-medium">Orders</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    {searchTerm || filterStatus !== 'all' ? 'No users match your filters' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(user.display_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.display_name || user.email.split('@')[0]}
                          </p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-gray-500 text-xs">
                            Joined {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-300">{getActivityStatus(user)}</p>
                        <p className="text-gray-500">
                          {user.login_count} logins
                        </p>
                        {user.last_login_ip && (
                          <p className="text-gray-500 text-xs">
                            IP: {user.last_login_ip}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-300 capitalize">
                          {user.subscription_status.replace('_', ' ')}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-300">{user.total_orders} orders</p>
                        {user.total_spent > 0 && (
                          <p className="text-gray-500">
                            {formatCurrency(user.total_spent)} total
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {!user.is_banned ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'ban')}
                            disabled={actionLoading === user.id}
                            className="p-1 text-gray-400 hover:text-red-400 disabled:opacity-50"
                            title="Ban user"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'unban')}
                            disabled={actionLoading === user.id}
                            className="p-1 text-gray-400 hover:text-green-400 disabled:opacity-50"
                            title="Unban user"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleUserAction(user.id, user.is_admin ? 'remove_admin' : 'make_admin')}
                          disabled={actionLoading === user.id}
                          className="p-1 text-gray-400 hover:text-purple-400 disabled:opacity-50"
                          title={user.is_admin ? 'Remove admin' : 'Make admin'}
                        >
                          {user.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                        </button>
                        
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          disabled={actionLoading === user.id}
                          className="p-1 text-gray-400 hover:text-red-400 disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                        
                        {actionLoading === user.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserManagement;