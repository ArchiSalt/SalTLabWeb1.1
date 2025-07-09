import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Square, 
  Circle, 
  Triangle, 
  Pencil, 
  Eraser, 
  RotateCcw, 
  Download, 
  Upload,
  Layers,
  Grid,
  Ruler,
  Home,
  Trees,
  Car,
  Zap,
  Droplets,
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Search,
  Navigation,
  Mountain,
  Building2,
  AlertTriangle,
  CheckCircle,
  Info,
  MapIcon,
  Satellite,
  Globe,
  Wind,
  Flame,
  Thermometer,
  CloudRain,
  Sun,
  Snowflake,
  Activity,
  Shield,
  Waves,
  TreePine,
  Truck,
  Radio,
  Wifi,
  Phone,
  Gauge
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalBannerAd from './HorizontalBannerAd';
import Footer from './Footer';

interface DrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface Zone {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

interface MapLayer {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
  category: 'base' | 'infrastructure' | 'environmental' | 'regulatory';
}

interface EnvironmentalData {
  windData: {
    averageSpeed: number;
    prevailingDirection: string;
    seasonalVariation: string;
    extremeEvents: string;
  };
  fireRisk: {
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
    factors: string[];
    mitigationRequired: boolean;
    defensibleSpace: number;
  };
  floodData: {
    zone: string;
    baseFloodElevation: number;
    floodInsuranceRequired: boolean;
    historicalFloods: string[];
  };
  climate: {
    averageTemp: { summer: number; winter: number };
    precipitation: { annual: number; seasonal: string };
    humidity: { summer: number; winter: number };
    snowLoad: number;
  };
  seismic: {
    zone: string;
    riskLevel: 'Low' | 'Moderate' | 'High';
    designRequirements: string[];
  };
  soil: {
    type: string;
    bearingCapacity: number;
    drainageClass: string;
    expansionPotential: 'Low' | 'Moderate' | 'High';
  };
}

interface LocationConstraint {
  type: 'setback' | 'height' | 'coverage' | 'zoning' | 'environmental' | 'utility' | 'safety';
  title: string;
  value: string;
  status: 'compliant' | 'warning' | 'violation' | 'info';
  description: string;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface LocationData {
  address: string;
  coordinates: { lat: number; lng: number };
  lotSize: number;
  zoning: string;
  constraints: LocationConstraint[];
  topography: string;
  floodZone: string;
  utilities: string[];
  environmentalData: EnvironmentalData;
}

const SitePlanner = () => {
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedZone, setSelectedZone] = useState<string>('building');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [selectedMapType, setSelectedMapType] = useState<'satellite' | 'roadmap' | 'terrain' | 'hybrid'>('satellite');
  const [activeLayerCategory, setActiveLayerCategory] = useState<string>('base');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    // Base Layers
    { id: 'satellite', name: 'Satellite', icon: <Satellite size={16} />, enabled: true, description: 'High-resolution satellite imagery', category: 'base' },
    { id: 'terrain', name: 'Topography', icon: <Mountain size={16} />, enabled: false, description: 'Elevation and terrain data', category: 'base' },
    
    // Infrastructure Layers
    { id: 'zoning', name: 'Zoning', icon: <Building2 size={16} />, enabled: false, description: 'Zoning districts and regulations', category: 'infrastructure' },
    { id: 'parcels', name: 'Lot Lines', icon: <Grid size={16} />, enabled: false, description: 'Property boundaries and lot lines', category: 'infrastructure' },
    { id: 'utilities', name: 'Utilities', icon: <Zap size={16} />, enabled: false, description: 'Electric, gas, water, sewer lines', category: 'infrastructure' },
    { id: 'roads', name: 'Transportation', icon: <Truck size={16} />, enabled: false, description: 'Roads, highways, and traffic patterns', category: 'infrastructure' },
    { id: 'communications', name: 'Communications', icon: <Radio size={16} />, enabled: false, description: 'Cell towers, internet, cable infrastructure', category: 'infrastructure' },
    
    // Environmental Layers
    { id: 'flood', name: 'Flood Zones', icon: <Droplets size={16} />, enabled: false, description: 'FEMA flood zone data and base flood elevations', category: 'environmental' },
    { id: 'wind', name: 'Wind Patterns', icon: <Wind size={16} />, enabled: false, description: 'Average wind speeds and prevailing directions', category: 'environmental' },
    { id: 'fire', name: 'Fire Risk', icon: <Flame size={16} />, enabled: false, description: 'Wildfire risk zones and defensible space requirements', category: 'environmental' },
    { id: 'climate', name: 'Climate Data', icon: <Thermometer size={16} />, enabled: false, description: 'Temperature, precipitation, and seasonal patterns', category: 'environmental' },
    { id: 'seismic', name: 'Seismic Zones', icon: <Activity size={16} />, enabled: false, description: 'Earthquake risk and seismic design requirements', category: 'environmental' },
    { id: 'soil', name: 'Soil Conditions', icon: <Mountain size={16} />, enabled: false, description: 'Soil type, bearing capacity, and drainage', category: 'environmental' },
    { id: 'wetlands', name: 'Wetlands', icon: <Waves size={16} />, enabled: false, description: 'Protected wetlands and buffer zones', category: 'environmental' },
    { id: 'vegetation', name: 'Vegetation', icon: <TreePine size={16} />, enabled: false, description: 'Protected trees, endangered species habitat', category: 'environmental' },
    
    // Regulatory Layers
    { id: 'building_codes', name: 'Building Codes', icon: <Shield size={16} />, enabled: false, description: 'Local building code requirements and restrictions', category: 'regulatory' },
    { id: 'easements', name: 'Easements', icon: <Ruler size={16} />, enabled: false, description: 'Utility easements and right-of-way restrictions', category: 'regulatory' },
    { id: 'historic', name: 'Historic Districts', icon: <Building2 size={16} />, enabled: false, description: 'Historic preservation districts and requirements', category: 'regulatory' }
  ]);

  const drawingTools: DrawingTool[] = [
    { id: 'select', name: 'Select', icon: <Navigation size={20} />, color: 'text-gray-400' },
    { id: 'rectangle', name: 'Rectangle', icon: <Square size={20} />, color: 'text-blue-400' },
    { id: 'circle', name: 'Circle', icon: <Circle size={20} />, color: 'text-green-400' },
    { id: 'polygon', name: 'Polygon', icon: <Triangle size={20} />, color: 'text-purple-400' },
    { id: 'pencil', name: 'Draw', icon: <Pencil size={20} />, color: 'text-orange-400' },
    { id: 'eraser', name: 'Erase', icon: <Eraser size={20} />, color: 'text-red-400' }
  ];

  const zones: Zone[] = [
    { id: 'building', name: 'Building', color: 'bg-blue-500', icon: <Home size={16} /> },
    { id: 'driveway', name: 'Driveway', color: 'bg-gray-500', icon: <Car size={16} /> },
    { id: 'garden', name: 'Garden', color: 'bg-green-500', icon: <Trees size={16} /> },
    { id: 'utilities', name: 'Utilities', color: 'bg-yellow-500', icon: <Zap size={16} /> },
    { id: 'water', name: 'Water Features', color: 'bg-cyan-500', icon: <Droplets size={16} /> },
    { id: 'setback', name: 'Setback Lines', color: 'bg-red-500', icon: <Ruler size={16} /> },
    { id: 'defensible', name: 'Defensible Space', color: 'bg-orange-500', icon: <Flame size={16} /> }
  ];

  const mapTypes = [
    { id: 'satellite', name: 'Satellite', icon: <Satellite size={16} /> },
    { id: 'roadmap', name: 'Street Map', icon: <MapIcon size={16} /> },
    { id: 'terrain', name: 'Terrain', icon: <Mountain size={16} /> },
    { id: 'hybrid', name: 'Hybrid', icon: <Globe size={16} /> }
  ];

  const layerCategories = [
    { id: 'base', name: 'Base Maps', icon: <MapIcon size={16} /> },
    { id: 'infrastructure', name: 'Infrastructure', icon: <Zap size={16} /> },
    { id: 'environmental', name: 'Environmental', icon: <TreePine size={16} /> },
    { id: 'regulatory', name: 'Regulatory', icon: <Shield size={16} /> }
  ];

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = () => {
    console.log('Initializing Google Maps with environmental data layers...');
  };

  const searchLocation = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    
    // Simulate comprehensive API calls to multiple data sources
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock comprehensive location data with environmental factors
    const mockLocationData: LocationData = {
      address: searchAddress,
      coordinates: { lat: 40.7128, lng: -74.0060 },
      lotSize: 7500,
      zoning: 'R-1 Single Family Residential',
      topography: 'Gentle slope (2-5% grade)',
      floodZone: 'Zone X (Minimal Risk)',
      utilities: ['Electric', 'Water', 'Sewer', 'Natural Gas', 'Cable/Internet', 'Fiber Optic'],
      environmentalData: {
        windData: {
          averageSpeed: 12.5,
          prevailingDirection: 'Southwest',
          seasonalVariation: 'Higher in winter (15-20 mph), calmer in summer (8-12 mph)',
          extremeEvents: 'Occasional gusts up to 60 mph during storms'
        },
        fireRisk: {
          riskLevel: 'Moderate',
          factors: ['Nearby vegetation', 'Seasonal drought conditions', 'Historical fire activity within 5 miles'],
          mitigationRequired: true,
          defensibleSpace: 100
        },
        floodData: {
          zone: 'Zone X',
          baseFloodElevation: 0,
          floodInsuranceRequired: false,
          historicalFloods: ['Minor flooding in 1998', 'Flash flood risk during heavy rainfall']
        },
        climate: {
          averageTemp: { summer: 78, winter: 42 },
          precipitation: { annual: 42.5, seasonal: 'Wet winters, dry summers' },
          humidity: { summer: 65, winter: 45 },
          snowLoad: 25
        },
        seismic: {
          zone: 'Zone 2A',
          riskLevel: 'Low',
          designRequirements: ['Standard seismic design provisions', 'No special foundation requirements']
        },
        soil: {
          type: 'Sandy loam with clay subsoil',
          bearingCapacity: 2500,
          drainageClass: 'Well-drained',
          expansionPotential: 'Low'
        }
      },
      constraints: [
        {
          type: 'setback',
          title: 'Front Setback',
          value: '25 feet minimum',
          status: 'info',
          description: 'Minimum distance from front property line to building',
          source: 'Local Zoning Code 12.04.050',
          priority: 'high'
        },
        {
          type: 'setback',
          title: 'Side Setback',
          value: '5 feet minimum',
          status: 'info',
          description: 'Minimum distance from side property lines',
          source: 'Local Zoning Code 12.04.050',
          priority: 'high'
        },
        {
          type: 'height',
          title: 'Maximum Building Height',
          value: '35 feet / 2.5 stories',
          status: 'info',
          description: 'Maximum allowed height for residential structures',
          source: 'Building Code Section 503.1',
          priority: 'high'
        },
        {
          type: 'coverage',
          title: 'Maximum Lot Coverage',
          value: '40% of lot area',
          status: 'warning',
          description: 'Maximum percentage of lot that can be covered by structures',
          source: 'Zoning Code Section 12.04.060',
          priority: 'medium'
        },
        {
          type: 'environmental',
          title: 'Fire Defensible Space',
          value: '100 feet clearance required',
          status: 'warning',
          description: 'Vegetation management required within 100 feet of structures',
          source: 'Fire Department Wildfire Prevention Code',
          priority: 'critical'
        },
        {
          type: 'environmental',
          title: 'Wind Load Design',
          value: '90 mph design wind speed',
          status: 'info',
          description: 'Structures must be designed for 90 mph wind loads',
          source: 'Building Code Section 1609',
          priority: 'high'
        },
        {
          type: 'environmental',
          title: 'Soil Bearing Capacity',
          value: '2,500 psf allowable',
          status: 'info',
          description: 'Foundation design based on soil bearing capacity',
          source: 'Geotechnical Report',
          priority: 'high'
        },
        {
          type: 'safety',
          title: 'Emergency Access',
          value: '20-foot minimum access width',
          status: 'info',
          description: 'Fire department access road requirements',
          source: 'Fire Code Section 503.2.1',
          priority: 'critical'
        },
        {
          type: 'utility',
          title: 'Utility Easement',
          value: '10-foot easement along north boundary',
          status: 'info',
          description: 'Utility easement restricts building placement',
          source: 'Property Deed & Survey',
          priority: 'medium'
        },
        {
          type: 'environmental',
          title: 'Protected Tree',
          value: '24-inch oak tree - 15-foot protection zone',
          status: 'warning',
          description: 'Existing mature oak tree requires protection during construction',
          source: 'Tree Preservation Ordinance',
          priority: 'high'
        }
      ]
    };
    
    setLocationData(mockLocationData);
    setIsSearching(false);
  };

  const toggleMapLayer = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
    ));
  };

  const getFilteredLayers = () => {
    return mapLayers.filter(layer => layer.category === activeLayerCategory);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveProject = () => {
    console.log('Saving project...');
  };

  const exportProject = () => {
    console.log('Exporting project...');
  };

  const getConstraintIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'violation':
        return <AlertTriangle size={16} className="text-red-400" />;
      default:
        return <Info size={16} className="text-blue-400" />;
    }
  };

  const getConstraintColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'border-green-500 bg-green-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'violation':
        return 'border-red-500 bg-red-900/20';
      default:
        return 'border-blue-500 bg-blue-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'high':
        return 'text-orange-400';
      case 'extreme':
        return 'text-red-400';
      default:
        return 'text-gray-400';
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
                <MapPin className="text-orange-500" size={24} />
                <h1 className="text-xl font-bold text-white">Site Planner</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={saveProject}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={exportProject}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Tools & Location Search */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 p-6 overflow-y-auto">
          {/* Location Search */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search size={20} />
              Location Search
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Enter address or coordinates..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                />
                <button
                  onClick={searchLocation}
                  disabled={isSearching || !searchAddress.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search size={16} />
                  )}
                </button>
              </div>
              
              {locationData && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">{locationData.address}</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>Lot Size: {locationData.lotSize.toLocaleString()} sq ft</p>
                    <p>Zoning: {locationData.zoning}</p>
                    <p>Topography: {locationData.topography}</p>
                    <p>Flood Zone: {locationData.floodZone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Layers */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layers size={20} />
              Map Layers
            </h3>
            
            {/* Map Type Selection */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Base Map</label>
              <div className="grid grid-cols-2 gap-2">
                {mapTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedMapType(type.id as any)}
                    className={`flex items-center gap-2 p-2 rounded border text-sm transition-all duration-200 ${
                      selectedMapType === type.id
                        ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {type.icon}
                    <span>{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Categories */}
            <div className="mb-4">
              <div className="flex gap-1 mb-3">
                {layerCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveLayerCategory(category.id)}
                    className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-xs transition-all duration-200 ${
                      activeLayerCategory === category.id
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getFilteredLayers().map((layer) => (
                <label key={layer.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-800/50">
                  <input
                    type="checkbox"
                    checked={layer.enabled}
                    onChange={() => toggleMapLayer(layer.id)}
                    className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <div className="text-gray-400">{layer.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">{layer.name}</div>
                    <div className="text-xs text-gray-500">{layer.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Drawing Tools */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Pencil size={20} />
              Drawing Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {drawingTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                    selectedTool === tool.id
                      ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-orange-400'
                  }`}
                >
                  <span className={tool.color}>{tool.icon}</span>
                  <span className="text-xs">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Zone Types */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Zone Types
            </h3>
            <div className="space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    selectedZone === zone.id
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-orange-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded ${zone.color} flex items-center justify-center text-white`}>
                    {zone.icon}
                  </div>
                  <span className="text-sm text-gray-300">{zone.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={20} />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={clearCanvas}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-600 bg-gray-800/50 hover:border-red-400 hover:bg-red-900/20 text-gray-300 hover:text-red-300 transition-all duration-200"
              >
                <RotateCcw size={16} />
                <span className="text-sm">Clear All</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-600 bg-gray-800/50 hover:border-blue-400 hover:bg-blue-900/20 text-gray-300 hover:text-blue-300 transition-all duration-200">
                <Upload size={16} />
                <span className="text-sm">Import Survey</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative bg-gray-800">
          {/* Map Container */}
          <div 
            ref={mapRef}
            className="absolute inset-0 w-full h-full"
            style={{ 
              backgroundImage: `url('https://images.pexels.com/photos/1546166/pexels-photo-1546166.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay Canvas for Drawing */}
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
            
            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-20">
                  <defs>
                    <pattern
                      id="grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#ffa500"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
              <div className="flex flex-col gap-2">
                <button className="p-2 hover:bg-gray-800 rounded text-white">+</button>
                <button className="p-2 hover:bg-gray-800 rounded text-white">-</button>
                <button className="p-2 hover:bg-gray-800 rounded text-white">
                  <Navigation size={16} />
                </button>
              </div>
            </div>

            {/* Layer Legend */}
            {mapLayers.some(layer => layer.enabled) && (
              <div className="absolute bottom-20 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-w-xs">
                <h4 className="text-white font-medium mb-2">Active Layers</h4>
                <div className="space-y-1">
                  {mapLayers.filter(layer => layer.enabled).map((layer) => (
                    <div key={layer.id} className="flex items-center gap-2 text-sm text-gray-300">
                      {layer.icon}
                      <span>{layer.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm text-gray-300">
              <div className="flex items-center gap-4">
                <span>Tool: <span className="text-orange-400">{drawingTools.find(t => t.id === selectedTool)?.name}</span></span>
                <span>Zone: <span className="text-orange-400">{zones.find(z => z.id === selectedZone)?.name}</span></span>
                {locationData && <span>Location: <span className="text-orange-400">{locationData.address}</span></span>}
              </div>
              <div className="flex items-center gap-4">
                <span>Coordinates: (0, 0)</span>
                <span>Scale: 1:500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Environmental Data & Analysis */}
        <div className="w-96 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Environmental Analysis</h3>
          
          {!locationData ? (
            <div className="text-center py-8">
              <Search size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Search for a location to view comprehensive environmental data and site constraints</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Environmental Risk Summary */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Environmental Risk Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getRiskLevelColor(locationData.environmentalData.fireRisk.riskLevel)}`}>
                      {locationData.environmentalData.fireRisk.riskLevel}
                    </div>
                    <div className="text-xs text-gray-400">Fire Risk</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getRiskLevelColor(locationData.environmentalData.seismic.riskLevel)}`}>
                      {locationData.environmentalData.seismic.riskLevel}
                    </div>
                    <div className="text-xs text-gray-400">Seismic Risk</div>
                  </div>
                </div>
              </div>

              {/* Wind Data */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Wind className="text-blue-400" size={16} />
                  Wind Data
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Speed:</span>
                    <span className="text-white">{locationData.environmentalData.windData.averageSpeed} mph</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prevailing Direction:</span>
                    <span className="text-white">{locationData.environmentalData.windData.prevailingDirection}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs">Seasonal Variation:</p>
                    <p className="text-gray-300 text-xs">{locationData.environmentalData.windData.seasonalVariation}</p>
                  </div>
                </div>
              </div>

              {/* Fire Risk */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Flame className="text-orange-400" size={16} />
                  Fire Risk Assessment
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level:</span>
                    <span className={`font-medium ${getRiskLevelColor(locationData.environmentalData.fireRisk.riskLevel)}`}>
                      {locationData.environmentalData.fireRisk.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Defensible Space:</span>
                    <span className="text-white">{locationData.environmentalData.fireRisk.defensibleSpace} feet</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs mb-1">Risk Factors:</p>
                    {locationData.environmentalData.fireRisk.factors.map((factor, index) => (
                      <p key={index} className="text-gray-300 text-xs">• {factor}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flood Data */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Droplets className="text-cyan-400" size={16} />
                  Flood Risk
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">FEMA Zone:</span>
                    <span className="text-white">{locationData.environmentalData.floodData.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Insurance Required:</span>
                    <span className={locationData.environmentalData.floodData.floodInsuranceRequired ? 'text-yellow-400' : 'text-green-400'}>
                      {locationData.environmentalData.floodData.floodInsuranceRequired ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {locationData.environmentalData.floodData.historicalFloods.length > 0 && (
                    <div className="mt-2">
                      <p className="text-gray-400 text-xs mb-1">Historical Events:</p>
                      {locationData.environmentalData.floodData.historicalFloods.map((event, index) => (
                        <p key={index} className="text-gray-300 text-xs">• {event}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Climate Data */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Thermometer className="text-green-400" size={16} />
                  Climate Data
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Summer Avg:</span>
                    <span className="text-white">{locationData.environmentalData.climate.averageTemp.summer}°F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Winter Avg:</span>
                    <span className="text-white">{locationData.environmentalData.climate.averageTemp.winter}°F</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annual Precipitation:</span>
                    <span className="text-white">{locationData.environmentalData.climate.precipitation.annual}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Snow Load:</span>
                    <span className="text-white">{locationData.environmentalData.climate.snowLoad} psf</span>
                  </div>
                </div>
              </div>

              {/* Soil Conditions */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Mountain className="text-amber-400" size={16} />
                  Soil Conditions
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Soil Type:</span>
                    <span className="text-white">{locationData.environmentalData.soil.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bearing Capacity:</span>
                    <span className="text-white">{locationData.environmentalData.soil.bearingCapacity.toLocaleString()} psf</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Drainage:</span>
                    <span className="text-white">{locationData.environmentalData.soil.drainageClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expansion Risk:</span>
                    <span className={`font-medium ${getRiskLevelColor(locationData.environmentalData.soil.expansionPotential)}`}>
                      {locationData.environmentalData.soil.expansionPotential}
                    </span>
                  </div>
                </div>
              </div>

              {/* Site Constraints */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Site Constraints</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {locationData.constraints
                    .sort((a, b) => {
                      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((constraint, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getConstraintColor(constraint.status)}`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {getConstraintIcon(constraint.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-white text-sm">{constraint.title}</h5>
                            <span className={`text-xs px-1 py-0.5 rounded ${getPriorityColor(constraint.priority)}`}>
                              {constraint.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-orange-400 text-sm font-medium">{constraint.value}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs mb-2">{constraint.description}</p>
                      <p className="text-gray-500 text-xs">{constraint.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Design Recommendations */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-3">Environmental Design Recommendations</h4>
                <div className="space-y-2 text-sm text-blue-100">
                  <p>• Orient building to minimize wind exposure from prevailing southwest winds</p>
                  <p>• Implement fire-resistant landscaping within 100-foot defensible space</p>
                  <p>• Design foundation for 2,500 psf soil bearing capacity</p>
                  <p>• Consider elevated design if flood risk increases due to climate change</p>
                  <p>• Install proper drainage systems for well-drained soil conditions</p>
                  <p>• Design for 90 mph wind loads and 25 psf snow loads</p>
                  <p>• Preserve existing mature vegetation where possible for erosion control</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Banner Ad */}
      <HorizontalBannerAd adSlot="2081431874" className="py-8" />
      
      <Footer />
    </div>
  );
};

export default SitePlanner;