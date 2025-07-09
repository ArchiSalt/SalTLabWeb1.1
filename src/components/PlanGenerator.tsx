import React, { useState } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Home, 
  Ruler, 
  Users, 
  Bed, 
  Bath, 
  Car, 
  Download, 
  Wand2,
  Settings,
  Grid,
  RotateCcw,
  Save,
  Eye,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalBannerAd from './HorizontalBannerAd';
import Footer from './Footer';

interface RoomType {
  id: string;
  name: string;
  icon: React.ReactNode;
  minSize: number;
  color: string;
}

const PlanGenerator = () => {
  const [projectName, setProjectName] = useState('My Floor Plan');
  const [totalArea, setTotalArea] = useState(2000);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [stories, setStories] = useState(1);
  const [garage, setGarage] = useState(true);
  const [style, setStyle] = useState('traditional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(false);

  const roomTypes: RoomType[] = [
    { id: 'living', name: 'Living Room', icon: <Home size={16} />, minSize: 200, color: 'bg-blue-500' },
    { id: 'kitchen', name: 'Kitchen', icon: <Grid size={16} />, minSize: 120, color: 'bg-green-500' },
    { id: 'bedroom', name: 'Bedroom', icon: <Bed size={16} />, minSize: 100, color: 'bg-purple-500' },
    { id: 'bathroom', name: 'Bathroom', icon: <Bath size={16} />, minSize: 40, color: 'bg-cyan-500' },
    { id: 'garage', name: 'Garage', icon: <Car size={16} />, minSize: 240, color: 'bg-gray-500' },
    { id: 'dining', name: 'Dining Room', icon: <Users size={16} />, minSize: 120, color: 'bg-orange-500' }
  ];

  const architecturalStyles = [
    { id: 'traditional', name: 'Traditional', description: 'Classic layouts with formal rooms' },
    { id: 'modern', name: 'Modern', description: 'Open concept with clean lines' },
    { id: 'ranch', name: 'Ranch', description: 'Single-story with long, low profile' },
    { id: 'colonial', name: 'Colonial', description: 'Symmetrical design with center hall' },
    { id: 'craftsman', name: 'Craftsman', description: 'Cozy with built-in features' },
    { id: 'contemporary', name: 'Contemporary', description: 'Current trends with flexible spaces' }
  ];

  const generatePlan = async () => {
    setIsGenerating(true);
    // Simulate AI plan generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratedPlan(true);
    setIsGenerating(false);
  };

  const downloadPlan = () => {
    // Download logic would go here
    console.log('Downloading plan...');
  };

  const savePlan = () => {
    // Save logic would go here
    console.log('Saving plan...');
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
                <FileText className="text-orange-500" size={24} />
                <h1 className="text-xl font-bold text-white">Plan Generator</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={savePlan}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Save size={16} />
                Save
              </button>
              {generatedPlan && (
                <button
                  onClick={downloadPlan}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Download size={16} />
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Configuration */}
        <div className="w-96 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 p-6 overflow-y-auto">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Settings size={20} />
            Plan Configuration
          </h3>

          {/* Basic Information */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Total Area (sq ft)</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => setTotalArea(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bathrooms</label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Stories</label>
                <select
                  value={stories}
                  onChange={(e) => setStories(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={1}>1 Story</option>
                  <option value={2}>2 Stories</option>
                  <option value={3}>3 Stories</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={garage}
                  onChange={(e) => setGarage(e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <Car size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">Include Garage</span>
              </label>
            </div>
          </div>

          {/* Architectural Style */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4">Architectural Style</h4>
            <div className="space-y-2">
              {architecturalStyles.map((styleOption) => (
                <label key={styleOption.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50">
                  <input
                    type="radio"
                    name="style"
                    value={styleOption.id}
                    checked={style === styleOption.id}
                    onChange={(e) => setStyle(e.target.value)}
                    className="mt-1 w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{styleOption.name}</div>
                    <div className="text-xs text-gray-400">{styleOption.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Room Requirements */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4">Room Requirements</h4>
            <div className="space-y-3">
              {roomTypes.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${room.color} flex items-center justify-center text-white`}>
                      {room.icon}
                    </div>
                    <span className="text-sm text-gray-300">{room.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{room.minSize}+ sq ft</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePlan}
            disabled={isGenerating}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Plan...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Floor Plan
              </>
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative bg-gray-800 flex items-center justify-center">
          {!generatedPlan && !isGenerating ? (
            <div className="text-center">
              <FileText size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate Your Floor Plan</h3>
              <p className="text-gray-400 max-w-md">
                Configure your requirements in the sidebar and click "Generate Floor Plan" to create a custom layout.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Generating Your Floor Plan</h3>
              <p className="text-gray-400">
                AI is creating a custom layout based on your specifications...
              </p>
            </div>
          ) : (
            <div className="w-full h-full p-8">
              <div className="bg-white rounded-lg shadow-lg w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-800">
                  <Grid size={48} className="mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Generated Floor Plan</h3>
                  <p className="text-gray-600 mb-4">
                    {bedrooms} bed, {bathrooms} bath • {totalArea} sq ft • {stories} story
                  </p>
                  <div className="text-sm text-gray-500">
                    Interactive floor plan would be displayed here
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Plan Details */}
        {generatedPlan && (
          <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Plan Details</h3>
            
            <div className="space-y-6">
              {/* Plan Summary */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Area:</span>
                    <span className="text-white">{totalArea.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bedrooms:</span>
                    <span className="text-white">{bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bathrooms:</span>
                    <span className="text-white">{bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stories:</span>
                    <span className="text-white">{stories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Style:</span>
                    <span className="text-white capitalize">{style}</span>
                  </div>
                </div>
              </div>

              {/* Room Breakdown */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Room Breakdown</h4>
                <div className="space-y-2">
                  {roomTypes.map((room) => (
                    <div key={room.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${room.color}`}></div>
                        <span className="text-gray-300">{room.name}</span>
                      </div>
                      <span className="text-gray-400">
                        {Math.floor(Math.random() * 200 + room.minSize)} sq ft
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Export Options</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300">
                    📄 PDF Floor Plan
                  </button>
                  <button className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300">
                    🖼️ High-Res Image
                  </button>
                  <button className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300">
                    📐 CAD File (DWG)
                  </button>
                  <button className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300">
                    📊 Room Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Banner Ad */}
      <HorizontalBannerAd adSlot="2081431874" className="py-8" />
      
      <Footer />
    </div>
  );
};

export default PlanGenerator;