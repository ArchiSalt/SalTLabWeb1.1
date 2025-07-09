import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  FileText, 
  Bot, 
  Camera, 
  Calculator,
  Wrench,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
}

const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicTools();
  }, []);

  const fetchPublicTools = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch public tools directly from Supabase
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'live')
        .order('usage_count', { ascending: false });

      if (error) {
        throw error;
      }

      setTools(data || []);
    } catch (error: any) {
      console.error('Error fetching tools:', error);
      setError('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'MapPin': <MapPin size={32} />,
      'FileText': <FileText size={32} />,
      'Bot': <Bot size={32} />,
      'Camera': <Camera size={32} />,
      'Calculator': <Calculator size={32} />,
      'Wrench': <Wrench size={32} />,
    };
    
    return iconMap[iconName] || <Wrench size={32} />;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'planning': 'from-blue-500 to-blue-600',
      'analysis': 'from-purple-500 to-purple-600',
      'estimation': 'from-orange-500 to-orange-600',
      'design': 'from-pink-500 to-pink-600',
    };
    
    return colorMap[category] || 'from-gray-500 to-gray-600';
  };

  const handleToolClick = async (tool: Tool) => {
    try {
      // Track tool usage
      await supabase.rpc('increment_tool_usage', { tool_route: tool.route });
      
      // Log usage if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        await supabase.from('tool_usage_log').insert({
          tool_id: tool.id,
          user_id: session.session.user.id,
          session_id: session.session.access_token.substring(0, 20), // Truncated for privacy
          ip_address: 'unknown', // Would need server-side implementation for real IP
          user_agent: navigator.userAgent,
        });
      }
    } catch (error) {
      console.error('Error tracking tool usage:', error);
      // Don't prevent navigation if tracking fails
    }
  };

  if (loading) {
    return (
      <section id="tools" className="py-20 bg-gradient-to-br from-[#0c0c0c] to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Toolkit
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore our comprehensive suite of tools designed to make building planning accessible to everyone.
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading tools...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="tools" className="py-20 bg-gradient-to-br from-[#0c0c0c] to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Toolkit
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore our comprehensive suite of tools designed to make building planning accessible to everyone.
            </p>
          </div>
          
          <div className="text-center py-12">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPublicTools}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg mx-auto"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tools" className="py-20 bg-gradient-to-br from-[#0c0c0c] to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Toolkit
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore our comprehensive suite of tools designed to make building planning accessible to everyone.
          </p>
        </div>

        {tools.length === 0 ? (
          <div className="text-center py-12">
            <Wrench size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No tools are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.route}
                onClick={() => handleToolClick(tool)}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 block"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${getCategoryColor(tool.category)} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {getIconComponent(tool.icon)}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-500 transition-colors duration-300">
                  {tool.name}
                </h3>
                
                <p className="text-gray-400 leading-relaxed mb-6">
                  {tool.description}
                </p>
                
                <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 hover:text-orange-400 font-semibold transition-colors duration-200 flex items-center gap-2">
                      Open Tool
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {tool.usage_count > 0 && (
                      <span>{tool.usage_count.toLocaleString()} uses</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Tools;