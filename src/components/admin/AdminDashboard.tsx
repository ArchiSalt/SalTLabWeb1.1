import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowLeft, 
  Users, 
  Settings, 
  Database, 
  Activity,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Wrench,
  TestTube,
  Rocket,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import UserManagement from './UserManagement';
import ToolsManagement from './ToolsManagement';
import DatabaseManagement from './DatabaseManagement';
import { supabase } from '../../lib/supabase';
import Footer from '../Footer';

interface ToolStats {
  total: number;
  live: number;
  development: number;
  testing: number;
  ready: number;
  custom: number;
  public: number;
}

interface RecentActivity {
  id: string;
  type: 'tool_updated' | 'tool_created' | 'tool_status_changed';
  message: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning';
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [toolStats, setToolStats] = useState<ToolStats>({
    total: 0,
    live: 0,
    development: 0,
    testing: 0,
    ready: 0,
    custom: 0,
    public: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'tools', name: 'Custom Tools', icon: Wrench },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchToolStats();
    }
  }, [activeTab]);

  const fetchToolStats = async () => {
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

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-get-tools`, {
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
        throw new Error(errorData.error || 'Failed to fetch tool statistics');
      }

      const result = await response.json();
      setToolStats(result.stats);
      
      // Generate recent activity from tools data
      if (result.tools && result.tools.length > 0) {
        const activities: RecentActivity[] = result.tools
          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5)
          .map((tool: any) => {
            const updatedDate = new Date(tool.updated_at);
            const now = new Date();
            const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
            
            let timeAgo: string;
            if (diffHours < 1) {
              timeAgo = 'Just now';
            } else if (diffHours < 24) {
              timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
              const diffDays = Math.floor(diffHours / 24);
              if (diffDays < 7) {
                timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
              } else {
                timeAgo = updatedDate.toLocaleDateString();
              }
            }

            const getActivityType = (status: string): { type: RecentActivity['type'], message: string, status: RecentActivity['status'] } => {
              switch (status) {
                case 'live':
                  return {
                    type: 'tool_status_changed',
                    message: `${tool.name} went live`,
                    status: 'success'
                  };
                case 'ready':
                  return {
                    type: 'tool_status_changed',
                    message: `${tool.name} is ready for release`,
                    status: 'success'
                  };
                case 'testing':
                  return {
                    type: 'tool_status_changed',
                    message: `${tool.name} moved to testing`,
                    status: 'info'
                  };
                case 'development':
                  return {
                    type: 'tool_updated',
                    message: `${tool.name} updated in development`,
                    status: 'warning'
                  };
                default:
                  return {
                    type: 'tool_updated',
                    message: `${tool.name} was updated`,
                    status: 'info'
                  };
              }
            };

            const activityInfo = getActivityType(tool.status);
            
            return {
              id: tool.id,
              type: activityInfo.type,
              message: activityInfo.message,
              timestamp: timeAgo,
              status: activityInfo.status
            };
          });
        
        setRecentActivity(activities);
      }
      
    } catch (error: any) {
      console.error('Error fetching tool stats:', error);
      setError(error.message || 'Failed to fetch tool statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      {/* Navigation Header */}
      <nav className="bg-black/90 backdrop-blur-md border-b border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <Shield className="text-red-500" size={24} />
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                Welcome, <span className="text-orange-400">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Admin Panel</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'text-gray-300 hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                
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

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                          <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Wrench className="text-orange-500" size={24} />
                      <h3 className="text-lg font-semibold text-white">Development</h3>
                    </div>
                    <p className="text-3xl font-bold text-orange-400">{toolStats.development}</p>
                    <p className="text-gray-400 text-sm">Tools in development</p>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TestTube className="text-blue-500" size={24} />
                      <h3 className="text-lg font-semibold text-white">Testing</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{toolStats.testing}</p>
                    <p className="text-gray-400 text-sm">Tools in testing phase</p>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Rocket className="text-green-500" size={24} />
                      <h3 className="text-lg font-semibold text-white">Ready</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{toolStats.ready}</p>
                    <p className="text-gray-400 text-sm">Tools ready for release</p>
                  </div>
                </div>
                )}

                {!loading && !error && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Activity className="text-purple-500" size={24} />
                        <h3 className="text-lg font-semibold text-white">Live Tools</h3>
                      </div>
                      <p className="text-3xl font-bold text-purple-400">{toolStats.live}</p>
                      <p className="text-gray-400 text-sm">Currently live</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Wrench className="text-cyan-500" size={24} />
                        <h3 className="text-lg font-semibold text-white">Custom Tools</h3>
                      </div>
                      <p className="text-3xl font-bold text-cyan-400">{toolStats.custom}</p>
                      <p className="text-gray-400 text-sm">Custom developed</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="text-indigo-500" size={24} />
                        <h3 className="text-lg font-semibold text-white">Public Tools</h3>
                      </div>
                      <p className="text-3xl font-bold text-indigo-400">{toolStats.public}</p>
                      <p className="text-gray-400 text-sm">Publicly visible</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Settings className="text-gray-500" size={24} />
                        <h3 className="text-lg font-semibold text-white">Total Tools</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-400">{toolStats.total}</p>
                      <p className="text-gray-400 text-sm">All tools combined</p>
                    </div>
                  </div>
                )}
                {!loading && !error && (
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                      <button
                        onClick={fetchToolStats}
                        className="flex items-center gap-2 text-gray-400 hover:text-orange-400 text-sm"
                      >
                        <RefreshCw size={14} />
                        Refresh
                      </button>
                    </div>
                    
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity size={48} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map((activity) => {
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case 'success': return 'bg-green-400';
                              case 'warning': return 'bg-yellow-400';
                              case 'info': return 'bg-blue-400';
                              default: return 'bg-gray-400';
                            }
                          };

                          const getStatusIcon = (type: string) => {
                            switch (type) {
                              case 'tool_status_changed': return <Rocket size={14} className="text-gray-400" />;
                              case 'tool_created': return <Plus size={14} className="text-gray-400" />;
                              case 'tool_updated': return <Edit size={14} className="text-gray-400" />;
                              default: return <Activity size={14} className="text-gray-400" />;
                            }
                          };

                          return (
                            <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
                              <div className="flex items-center gap-2 flex-1">
                                {getStatusIcon(activity.type)}
                                <span className="text-gray-300">{activity.message}</span>
                              </div>
                              <span className="text-gray-500 text-sm">{activity.timestamp}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tools' && <ToolsManagement />}

            {activeTab === 'users' && <UserManagement />}

            {activeTab === 'database' && <DatabaseManagement />}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Admin Settings</h2>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                  <p className="text-gray-400">Admin configuration settings will be implemented here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;