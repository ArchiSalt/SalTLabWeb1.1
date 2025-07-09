import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Upload, 
  Download,
  TestTube,
  Rocket,
  Settings,
  Code,
  Globe,
  Lock,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import Footer from '../Footer';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  status: 'development' | 'testing' | 'ready' | 'live';
  is_public: boolean;
  category: 'planning' | 'analysis' | 'estimation' | 'design';
  version: string;
  usage_count: number;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ToolStats {
  total: number;
  live: number;
  development: number;
  testing: number;
  ready: number;
  custom: number;
  public: number;
}

const ToolsManagement = () => {
  const { signOut } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolStats, setToolStats] = useState<ToolStats>({
    total: 0,
    live: 0,
    development: 0,
    testing: 0,
    ready: 0,
    custom: 0,
    public: 0
  });

  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    icon: 'Wrench',
    route: '',
    status: 'development' as const,
    is_public: false,
    category: 'planning' as const,
    version: '1.0.0'
  });

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, filterCategory, filterStatus, searchTerm]);

  const fetchTools = async () => {
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
        throw new Error(errorData.error || 'Failed to fetch tools');
      }

      const result = await response.json();
      setTools(result.tools);
      setToolStats(result.stats);
      
    } catch (error: any) {
      console.error('Error fetching tools:', error);
      setError(error.message || 'Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.route.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tool => tool.status === filterStatus);
    }

    setFilteredTools(filtered);
  };

  const handleToolAction = async (action: string, tool?: Tool, toolId?: string) => {
    try {
      setActionLoading(toolId || tool?.id || 'new');
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-tool`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          tool,
          toolId,
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
        throw new Error(errorData.error || 'Failed to perform action');
      }

      const result = await response.json();
      
      // Refresh tools list
      await fetchTools();
      
      // Reset forms
      if (action === 'add') {
        setNewTool({
          name: '',
          description: '',
          icon: 'Wrench',
          route: '',
          status: 'development',
          is_public: false,
          category: 'planning',
          version: '1.0.0'
        });
        setIsAddingTool(false);
      } else if (action === 'update') {
        setEditingTool(null);
      }
      
    } catch (error: any) {
      console.error('Error performing tool action:', error);
      setError(error.message || 'Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddTool = () => {
    if (!newTool.name || !newTool.description || !newTool.route) {
      setError('Please fill in all required fields');
      return;
    }
    handleToolAction('add', newTool);
  };

  const handleUpdateTool = (updatedTool: Tool) => {
    handleToolAction('update', updatedTool);
  };

  const handleDeleteTool = (id: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      handleToolAction('delete', undefined, id);
    }
  };

  const handleTogglePublic = (id: string) => {
    handleToolAction('toggle_public', undefined, id);
  };

  const handlePromoteStatus = (id: string) => {
    handleToolAction('promote_status', undefined, id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'development': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
      case 'testing': return 'text-blue-400 bg-blue-900/30 border-blue-500/30';
      case 'ready': return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'live': return 'text-purple-400 bg-purple-900/30 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'development': return <Wrench size={16} />;
      case 'testing': return <TestTube size={16} />;
      case 'ready': return <Rocket size={16} />;
      case 'live': return <Globe size={16} />;
      default: return <Settings size={16} />;
    }
  };

  const canPromote = (status: string) => {
    return status !== 'live';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tools...</p>
        </div>
        <Footer />
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
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="text-blue-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Total</h3>
          </div>
          <p className="text-xl font-bold text-white">{toolStats.total}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="text-purple-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Live</h3>
          </div>
          <p className="text-xl font-bold text-white">{toolStats.live}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="text-green-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Ready</h3>
          </div>
          <p className="text-xl font-bold text-white">{toolStats.ready}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TestTube className="text-blue-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Testing</h3>
          </div>
          <p className="text-xl font-bold text-white">{toolStats.testing}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="text-yellow-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Development</h3>
          </div>
          <p className="text-xl font-bold text-white">{toolStats.development}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="text-orange-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Custom</h3>
          </div>
          <p className="text-xl font-bold text-white">{toolStats.custom}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="text-cyan-500" size={16} />
            <h3 className="text-xs font-medium text-gray-400">Public</h3>
          </div>
          <p className="text-xl font-bold text-white">{toolStats.public}</p>
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
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="planning">Planning</option>
              <option value="analysis">Analysis</option>
              <option value="estimation">Estimation</option>
              <option value="design">Design</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="ready">Ready</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchTools}
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
            <button
              onClick={() => setIsAddingTool(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={16} />
              Add Tool
            </button>
          </div>
        </div>
      </div>

      {/* Add New Tool Form */}
      {isAddingTool && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Add New Tool</h3>
            <button
              onClick={() => setIsAddingTool(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tool Name *</label>
              <input
                type="text"
                value={newTool.name}
                onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter tool name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Route *</label>
              <input
                type="text"
                value={newTool.route}
                onChange={(e) => setNewTool({...newTool, route: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="/my-tool"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={newTool.category}
                onChange={(e) => setNewTool({...newTool, category: e.target.value as any})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="planning">Planning</option>
                <option value="analysis">Analysis</option>
                <option value="estimation">Estimation</option>
                <option value="design">Design</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={newTool.status}
                onChange={(e) => setNewTool({...newTool, status: e.target.value as any})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="ready">Ready</option>
                <option value="live">Live</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Icon</label>
              <input
                type="text"
                value={newTool.icon}
                onChange={(e) => setNewTool({...newTool, icon: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Lucide icon name (e.g., Wrench)"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Version</label>
              <input
                type="text"
                value={newTool.version}
                onChange={(e) => setNewTool({...newTool, version: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1.0.0"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Description *</label>
            <textarea
              value={newTool.description}
              onChange={(e) => setNewTool({...newTool, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              placeholder="Enter tool description"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newTool.is_public}
                onChange={(e) => setNewTool({...newTool, is_public: e.target.checked})}
                className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-300">Make tool publicly visible</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAddingTool(false)}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTool}
              disabled={actionLoading === 'new'}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
            >
              {actionLoading === 'new' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Add Tool
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                  <p className="text-gray-500 text-sm">v{tool.version}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded border ${getStatusColor(tool.status)}`}>
                  {getStatusIcon(tool.status)}
                  <span className="text-xs font-medium capitalize">{tool.status}</span>
                </div>
                
                <button
                  onClick={() => handleTogglePublic(tool.id)}
                  disabled={actionLoading === tool.id}
                  className={`p-1 rounded ${
                    tool.is_public 
                      ? 'text-green-400 hover:bg-green-900/20' 
                      : 'text-gray-400 hover:bg-gray-800/50'
                  } disabled:opacity-50`}
                >
                  {tool.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{tool.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Category: {tool.category}</span>
              <span>Uses: {tool.usage_count}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">
                Route: <code className="bg-gray-800 px-1 rounded">{tool.route}</code>
              </span>
              {tool.is_custom && (
                <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-1 rounded">Custom</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Updated: {new Date(tool.updated_at).toLocaleDateString()}</span>
              
              <div className="flex items-center gap-1">
                {canPromote(tool.status) && (
                  <button
                    onClick={() => handlePromoteStatus(tool.id)}
                    disabled={actionLoading === tool.id}
                    className="p-1 text-gray-400 hover:text-green-400 disabled:opacity-50"
                    title="Promote to next stage"
                  >
                    <Rocket size={14} />
                  </button>
                )}
                <button
                  onClick={() => setEditingTool(tool)}
                  disabled={actionLoading === tool.id}
                  className="p-1 text-gray-400 hover:text-blue-400 disabled:opacity-50"
                >
                  <Edit size={14} />
                </button>
                {tool.is_custom && (
                  <button
                    onClick={() => handleDeleteTool(tool.id)}
                    disabled={actionLoading === tool.id}
                    className="p-1 text-gray-400 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {actionLoading === tool.id && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Tool Modal */}
      {editingTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Tool</h3>
              <button
                onClick={() => setEditingTool(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tool Name *</label>
                <input
                  type="text"
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({...editingTool, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Route *</label>
                <input
                  type="text"
                  value={editingTool.route}
                  onChange={(e) => setEditingTool({...editingTool, route: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={editingTool.category}
                  onChange={(e) => setEditingTool({...editingTool, category: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="planning">Planning</option>
                  <option value="analysis">Analysis</option>
                  <option value="estimation">Estimation</option>
                  <option value="design">Design</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={editingTool.status}
                  onChange={(e) => setEditingTool({...editingTool, status: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="ready">Ready</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Icon</label>
                <input
                  type="text"
                  value={editingTool.icon}
                  onChange={(e) => setEditingTool({...editingTool, icon: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Version</label>
                <input
                  type="text"
                  value={editingTool.version}
                  onChange={(e) => setEditingTool({...editingTool, version: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Description *</label>
              <textarea
                value={editingTool.description}
                onChange={(e) => setEditingTool({...editingTool, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingTool.is_public}
                  onChange={(e) => setEditingTool({...editingTool, is_public: e.target.checked})}
                  className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Make tool publicly visible</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingTool(null)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateTool(editingTool)}
                disabled={actionLoading === editingTool.id}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
              >
                {actionLoading === editingTool.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Tool
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    
      <Footer />
    </div>
  );
};

export default ToolsManagement;