import React, { useState } from 'react';
import { 
  Bot, 
  ArrowLeft, 
  Search, 
  MapPin, 
  Building, 
  Ruler, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  MessageCircle,
  FileText,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalBannerAd from './HorizontalBannerAd';
import Footer from './Footer';

interface CodeResult {
  category: string;
  requirement: string;
  value: string;
  status: 'compliant' | 'warning' | 'violation';
  description: string;
  reference: string;
}

const Codebot = () => {
  const [location, setLocation] = useState('');
  const [projectType, setProjectType] = useState('residential');
  const [buildingHeight, setBuildingHeight] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<CodeResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const projectTypes = [
    { id: 'residential', name: 'Residential (Single Family)', icon: <Building size={16} /> },
    { id: 'multi-family', name: 'Multi-Family Residential', icon: <Building size={16} /> },
    { id: 'commercial', name: 'Commercial', icon: <Building size={16} /> },
    { id: 'industrial', name: 'Industrial', icon: <Building size={16} /> },
    { id: 'mixed-use', name: 'Mixed Use', icon: <Building size={16} /> },
    { id: 'accessory', name: 'Accessory Dwelling Unit', icon: <Building size={16} /> }
  ];

  const searchCodes = async () => {
    if (!location.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Simulate API call to building code database
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results based on common building codes
    const mockResults: CodeResult[] = [
      {
        category: 'Setbacks',
        requirement: 'Front Setback',
        value: '25 feet minimum',
        status: 'compliant',
        description: 'Minimum distance from front property line to building',
        reference: 'Zoning Code Section 12.04.050'
      },
      {
        category: 'Setbacks',
        requirement: 'Side Setback',
        value: '5 feet minimum',
        status: 'compliant',
        description: 'Minimum distance from side property lines',
        reference: 'Zoning Code Section 12.04.050'
      },
      {
        category: 'Height Limits',
        requirement: 'Maximum Building Height',
        value: '35 feet / 2.5 stories',
        status: buildingHeight && parseInt(buildingHeight) > 35 ? 'violation' : 'compliant',
        description: 'Maximum allowed height for residential structures',
        reference: 'Building Code Section 503.1'
      },
      {
        category: 'Coverage',
        requirement: 'Maximum Lot Coverage',
        value: '40% of lot area',
        status: 'warning',
        description: 'Maximum percentage of lot that can be covered by structures',
        reference: 'Zoning Code Section 12.04.060'
      },
      {
        category: 'Parking',
        requirement: 'Required Parking Spaces',
        value: '2 spaces minimum',
        status: 'compliant',
        description: 'Minimum parking spaces required for single-family residence',
        reference: 'Zoning Code Section 12.20.030'
      },
      {
        category: 'Fire Safety',
        requirement: 'Fire Department Access',
        value: '20 feet minimum width',
        status: 'compliant',
        description: 'Minimum width for fire department vehicle access',
        reference: 'Fire Code Section 503.2.1'
      }
    ];
    
    setResults(mockResults);
    setHasSearched(true);
    setIsSearching(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'violation':
        return <AlertTriangle size={16} className="text-red-400" />;
      default:
        return <Info size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'border-green-500 bg-green-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'violation':
        return 'border-red-500 bg-red-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
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
                <Bot className="text-orange-500" size={24} />
                <h1 className="text-xl font-bold text-white">Codebot</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Building Code Assistant</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Get instant access to building codes, zoning requirements, and permit information for your location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Search size={20} />
                Project Information
              </h3>

              <div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city, state or zip code"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Building size={16} />
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {projectTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Building Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Height (ft)</label>
                    <input
                      type="number"
                      value={buildingHeight}
                      onChange={(e) => setBuildingHeight(e.target.value)}
                      placeholder="25"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Lot Size (sq ft)</label>
                    <input
                      type="number"
                      value={lotSize}
                      onChange={(e) => setLotSize(e.target.value)}
                      placeholder="7500"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={searchCodes}
                  disabled={isSearching || !location.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Searching Codes...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Search Building Codes
                    </>
                  )}
                </button>

                {/* Quick Links */}
                <div className="pt-6 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3">Quick Resources</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 rounded hover:bg-gray-800/50 text-sm text-gray-300 flex items-center gap-2">
                      <FileText size={14} />
                      Permit Application Guide
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-gray-800/50 text-sm text-gray-300 flex items-center gap-2">
                      <Calculator size={14} />
                      Fee Calculator
                    </button>
                    <button className="w-full text-left p-2 rounded hover:bg-gray-800/50 text-sm text-gray-300 flex items-center gap-2">
                      <MessageCircle size={14} />
                      Contact Building Dept
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!hasSearched && !isSearching ? (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
                <Bot size={64} className="text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">Ready to Check Building Codes</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Enter your project location and details to get instant access to relevant building codes and zoning requirements.
                </p>
              </div>
            ) : isSearching ? (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-6"></div>
                <h3 className="text-2xl font-semibold text-white mb-4">Searching Building Codes</h3>
                <p className="text-gray-400">
                  Analyzing local building codes and zoning requirements for {location}...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Building Code Results for {location}
                  </h3>
                  <p className="text-gray-400">
                    {projectTypes.find(t => t.id === projectType)?.name} project requirements
                  </p>
                </div>

                {/* Code Requirements */}
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`bg-gray-900/50 backdrop-blur-sm border rounded-2xl p-6 ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h4 className="text-lg font-semibold text-white">{result.requirement}</h4>
                            <p className="text-sm text-gray-400">{result.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-white">{result.value}</div>
                          <div className={`text-sm capitalize ${
                            result.status === 'compliant' ? 'text-green-400' :
                            result.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {result.status}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{result.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{result.reference}</span>
                        <button className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300">
                          View Details <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Compliance Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {results.filter(r => r.status === 'compliant').length}
                      </div>
                      <div className="text-sm text-gray-400">Compliant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {results.filter(r => r.status === 'warning').length}
                      </div>
                      <div className="text-sm text-gray-400">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {results.filter(r => r.status === 'violation').length}
                      </div>
                      <div className="text-sm text-gray-400">Violations</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Banner Ad */}
      <HorizontalBannerAd adSlot="2081431874" className="py-8" />
      
      <Footer />
    </div>
  );
};

export default Codebot;