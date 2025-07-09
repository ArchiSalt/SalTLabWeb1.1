import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowLeft, 
  DollarSign, 
  Home, 
  Hammer, 
  Zap, 
  Droplets, 
  Thermometer,
  Wifi,
  Shield,
  Plus,
  Minus,
  Download,
  Save,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalBannerAd from './HorizontalBannerAd';
import Footer from './Footer';

interface CostCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: CostItem[];
}

interface CostItem {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  quantity: number;
  description: string;
}

const EstimatedCost = () => {
  const [projectName, setProjectName] = useState('My Construction Project');
  const [totalArea, setTotalArea] = useState(2000);
  const [location, setLocation] = useState('');
  const [qualityLevel, setQualityLevel] = useState('standard');
  const [categories, setCategories] = useState<CostCategory[]>([
    {
      id: 'structure',
      name: 'Structure & Foundation',
      icon: <Home size={20} />,
      items: [
        { id: 'foundation', name: 'Foundation', unit: 'sq ft', costPerUnit: 8.50, quantity: 2000, description: 'Concrete slab foundation' },
        { id: 'framing', name: 'Framing', unit: 'sq ft', costPerUnit: 12.00, quantity: 2000, description: 'Wood frame construction' },
        { id: 'roofing', name: 'Roofing', unit: 'sq ft', costPerUnit: 15.00, quantity: 2200, description: 'Asphalt shingles' }
      ]
    },
    {
      id: 'exterior',
      name: 'Exterior Finishes',
      icon: <Shield size={20} />,
      items: [
        { id: 'siding', name: 'Siding', unit: 'sq ft', costPerUnit: 8.00, quantity: 1800, description: 'Vinyl siding' },
        { id: 'windows', name: 'Windows', unit: 'each', costPerUnit: 450.00, quantity: 15, description: 'Double-hung vinyl windows' },
        { id: 'doors', name: 'Exterior Doors', unit: 'each', costPerUnit: 800.00, quantity: 3, description: 'Fiberglass entry doors' }
      ]
    },
    {
      id: 'interior',
      name: 'Interior Finishes',
      icon: <Hammer size={20} />,
      items: [
        { id: 'flooring', name: 'Flooring', unit: 'sq ft', costPerUnit: 6.50, quantity: 1800, description: 'Laminate and tile' },
        { id: 'drywall', name: 'Drywall', unit: 'sq ft', costPerUnit: 2.50, quantity: 4000, description: 'Painted drywall' },
        { id: 'cabinets', name: 'Kitchen Cabinets', unit: 'linear ft', costPerUnit: 200.00, quantity: 25, description: 'Stock cabinets' }
      ]
    },
    {
      id: 'mechanical',
      name: 'Mechanical Systems',
      icon: <Zap size={20} />,
      items: [
        { id: 'electrical', name: 'Electrical', unit: 'sq ft', costPerUnit: 4.00, quantity: 2000, description: 'Complete electrical system' },
        { id: 'plumbing', name: 'Plumbing', unit: 'fixture', costPerUnit: 1200.00, quantity: 8, description: 'Rough and finish plumbing' },
        { id: 'hvac', name: 'HVAC', unit: 'sq ft', costPerUnit: 6.00, quantity: 2000, description: 'Central air and heating' }
      ]
    }
  ]);

  const qualityLevels = [
    { id: 'basic', name: 'Basic', multiplier: 0.8, description: 'Economy materials and finishes' },
    { id: 'standard', name: 'Standard', multiplier: 1.0, description: 'Mid-grade materials and finishes' },
    { id: 'premium', name: 'Premium', multiplier: 1.3, description: 'High-end materials and finishes' },
    { id: 'luxury', name: 'Luxury', multiplier: 1.6, description: 'Top-tier materials and custom finishes' }
  ];

  const updateQuantity = (categoryId: string, itemId: string, newQuantity: number) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            items: category.items.map(item =>
              item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
            )
          }
        : category
    ));
  };

  const calculateCategoryTotal = (category: CostCategory) => {
    const qualityMultiplier = qualityLevels.find(q => q.id === qualityLevel)?.multiplier || 1;
    return category.items.reduce((total, item) => 
      total + (item.costPerUnit * item.quantity * qualityMultiplier), 0
    );
  };

  const calculateGrandTotal = () => {
    return categories.reduce((total, category) => total + calculateCategoryTotal(category), 0);
  };

  const calculateCostPerSqFt = () => {
    return totalArea > 0 ? calculateGrandTotal() / totalArea : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportEstimate = () => {
    console.log('Exporting estimate...');
  };

  const saveEstimate = () => {
    console.log('Saving estimate...');
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
                <Calculator className="text-orange-500" size={24} />
                <h1 className="text-xl font-bold text-white">Cost Estimator</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={saveEstimate}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={exportEstimate}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Project Settings */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <DollarSign size={20} />
                Project Settings
              </h3>

              <div className="space-y-6">
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

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Quality Level</label>
                  <select
                    value={qualityLevel}
                    onChange={(e) => setQualityLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {qualityLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {qualityLevels.find(q => q.id === qualityLevel)?.description}
                  </p>
                </div>

                {/* Cost Summary */}
                <div className="pt-6 border-t border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Cost Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Cost:</span>
                      <span className="text-2xl font-bold text-orange-400">
                        {formatCurrency(calculateGrandTotal())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost per sq ft:</span>
                      <span className="text-lg font-semibold text-white">
                        {formatCurrency(calculateCostPerSqFt())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quality Level:</span>
                      <span className="text-white capitalize">{qualityLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Categories */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-400">
                        {formatCurrency(calculateCategoryTotal(category))}
                      </div>
                      <div className="text-sm text-gray-400">Category Total</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {category.items.map((item) => {
                      const qualityMultiplier = qualityLevels.find(q => q.id === qualityLevel)?.multiplier || 1;
                      const itemTotal = item.costPerUnit * item.quantity * qualityMultiplier;
                      
                      return (
                        <div key={item.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-medium text-white">{item.name}</h4>
                              <p className="text-sm text-gray-400">{item.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-white">
                                {formatCurrency(itemTotal)}
                              </div>
                              <div className="text-sm text-gray-400">
                                {formatCurrency(item.costPerUnit * qualityMultiplier)} per {item.unit}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-400">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(category.id, item.id, item.quantity - 1)}
                                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center text-white"
                                >
                                  <Minus size={14} />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(category.id, item.id, Number(e.target.value))}
                                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <button
                                  onClick={() => updateQuantity(category.id, item.id, item.quantity + 1)}
                                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center text-white"
                                >
                                  <Plus size={14} />
                                </button>
                                <span className="text-sm text-gray-400">{item.unit}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Market Insights */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-300 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Market Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-800/30 rounded-lg p-4">
                    <h4 className="font-medium text-blue-200 mb-2">Regional Average</h4>
                    <p className="text-2xl font-bold text-blue-100">$125/sq ft</p>
                    <p className="text-sm text-blue-300">Similar projects in your area</p>
                  </div>
                  <div className="bg-blue-800/30 rounded-lg p-4">
                    <h4 className="font-medium text-blue-200 mb-2">Market Trend</h4>
                    <p className="text-2xl font-bold text-green-400">+3.2%</p>
                    <p className="text-sm text-blue-300">Cost increase vs last year</p>
                  </div>
                  <div className="bg-blue-800/30 rounded-lg p-4">
                    <h4 className="font-medium text-blue-200 mb-2">Best Time to Build</h4>
                    <p className="text-2xl font-bold text-blue-100">Spring</p>
                    <p className="text-sm text-blue-300">Optimal pricing period</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Banner Ad */}
      <HorizontalBannerAd adSlot="2081431874" className="py-8" />
      
      <Footer />
    </div>
  );
};

export default EstimatedCost;