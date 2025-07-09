import React, { useState } from 'react';
import { 
  TestTube, 
  ArrowLeft, 
  Wrench, 
  Zap, 
  Brain,
  Cpu,
  Database,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../Footer';

interface PrivateTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'development' | 'testing' | 'ready';
  lastUpdated: string;
  version: string;
}

const PrivateToolsPage = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const privateTools: PrivateTool[] = [
    {
      id: 'advanced-site-analyzer',
      name: 'Advanced Site Analyzer',
      description: 'AI-powered site analysis with topography detection, soil analysis, and environmental impact assessment.',
      icon: <Brain size={24} />,
      status: 'testing',
      lastUpdated: '2024-01-15',
      version: 'v0.8.2'
    },
    {
      id: 'material-cost-predictor',
      name: 'Material Cost Predictor',
      description: 'Machine learning based material cost predictions with real-time market data integration.',
      icon: <Cpu size={24} />,
      status: 'development',
      lastUpdated: '2024-01-10',
      version: 'v0.3.1'
    },
    {
      id: 'smart-code-assistant',
      name: 'Smart Code Assistant',
      description: 'Enhanced building code checker with AI interpretation and contextual recommendations.',
      icon: <Zap size={24} />,
      status: 'development',
      lastUpdated: '2024-01-08',
      version: 'v0.2.0'
    },
    {
      id: 'project-timeline-optimizer',
      name: 'Project Timeline Optimizer',
      description: 'AI-driven project scheduling with weather, resource, and permit considerations.',
      icon: <Database size={24} />,
      status: 'ready',
      lastUpdated: '2024-01-12',
      version: 'v1.0.0'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'development': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
      case 'testing': return 'text-blue-400 bg-blue-900/30 border-blue-500/30';
      case 'ready': return 'text-green-400 bg-green-900/30 border-green-500/30';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'development': return <Wrench size={16} />;
      case 'testing': return <TestTube size={16} />;
      case 'ready': return <Play size={16} />;
      default: return <Pause size={16} />;
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
                to="/admin" 
                className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                <span>Back to Admin</span>
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <TestTube className="text-orange-500" size={24} />
                <h1 className="text-xl font-bold text-white">Private Tools Lab</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
                ADMIN ONLY
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Private Development Lab
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experimental tools and features in development. Test new functionality before public release.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {privateTools.map((tool) => (
            <div 
              key={tool.id} 
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{tool.version}</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatusColor(tool.status)}`}>
                  {getStatusIcon(tool.status)}
                  <span className="text-sm font-medium capitalize">{tool.status}</span>
                </div>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed">
                {tool.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Updated: {tool.lastUpdated}
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-all duration-200">
                    <Settings size={16} />
                    Configure
                  </button>
                  
                  <button 
                    onClick={() => setSelectedTool(tool.id)}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <Eye size={16} />
                    Test Tool
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tool Testing Interface */}
        {selectedTool && (
          <div className="mt-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">
                Testing: {privateTools.find(t => t.id === selectedTool)?.name}
              </h3>
              <button
                onClick={() => setSelectedTool(null)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="text-center">
                <TestTube size={48} className="text-orange-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Tool Testing Environment</h4>
                <p className="text-gray-400 mb-6">
                  This is where the selected tool's testing interface would be loaded.
                </p>
                
                <div className="flex justify-center gap-4">
                  <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                    <Play size={16} />
                    Start Test
                  </button>
                  <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Development Notes */}
        <div className="mt-12 bg-blue-900/30 border border-blue-700 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">Development Notes</h3>
          <div className="space-y-3 text-blue-100">
            <p>• Tools in <span className="text-yellow-400">development</span> are actively being built and may have limited functionality</p>
            <p>• Tools in <span className="text-blue-400">testing</span> are feature-complete but need validation and bug fixes</p>
            <p>• Tools marked as <span className="text-green-400">ready</span> are approved for public release</p>
            <p>• All tools here are private and only accessible to admin users</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivateToolsPage;