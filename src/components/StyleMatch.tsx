import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Wand2, 
  Download, 
  RotateCcw, 
  Eye, 
  Home, 
  Building, 
  Mountain,
  Palette,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  Save,
  Settings,
  ExternalLink,
  ShoppingCart,
  Star,
  DollarSign,
  Package,
  Truck,
  Phone,
  Globe,
  MapPin,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalBannerAd from './HorizontalBannerAd';
import Footer from './Footer';

interface AnalysisResult {
  photoType: 'interior' | 'exterior';
  angle: 'above' | 'below' | 'eye-level';
  confidence: number;
  detectedElements: DetectedElement[];
  suggestedStyles: string[];
  dominantColors: string[];
  materials: string[];
  architecturalFeatures: string[];
}

interface DetectedElement {
  name: string;
  confidence: number;
  category: 'structural' | 'decorative' | 'material' | 'color';
  boundingBox?: { x: number; y: number; width: number; height: number };
}

interface ProductRecommendation {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  availability: 'in-stock' | 'limited' | 'out-of-stock';
  shippingTime: string;
  website: string;
  phone?: string;
  location?: string;
  features: string[];
  matchReason: string;
}

interface StyleGuide {
  name: string;
  period: string;
  description: string;
  keyFeatures: string[];
  colorPalette: string[];
  materials: string[];
  products: ProductRecommendation[];
}

const StyleMatch = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [styleGuide, setStyleGuide] = useState<StyleGuide | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'styles' | 'products' | 'guide'>('styles');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comprehensive architectural styles with enhanced data
  const architecturalStyles = [
    // Modern & Contemporary
    { name: 'Modern Minimalist', period: 'Contemporary', description: 'Clean lines, open spaces, minimal ornamentation', popularity: 95 },
    { name: 'Mid-Century Modern', period: 'Modern', description: 'Post-war design, large windows, integration with nature', popularity: 88 },
    { name: 'Contemporary', period: 'Contemporary', description: 'Current trends, mixed materials, sustainable design', popularity: 92 },
    { name: 'Industrial', period: 'Contemporary', description: 'Exposed brick, steel, concrete, urban aesthetic', popularity: 78 },
    { name: 'Scandinavian', period: 'Contemporary', description: 'Light woods, white walls, cozy functionality', popularity: 85 },
    
    // Traditional & Classical
    { name: 'Traditional', period: 'Traditional', description: 'Timeless design, symmetry, classic proportions', popularity: 82 },
    { name: 'Colonial', period: 'Colonial', description: 'Symmetrical facade, central door, shutters', popularity: 75 },
    { name: 'Victorian', period: '19th Century', description: 'Ornate details, bay windows, decorative trim', popularity: 68 },
    { name: 'Craftsman', period: 'Arts & Crafts', description: 'Handcrafted details, natural materials, built-ins', popularity: 79 },
    { name: 'Tudor', period: 'Revival', description: 'Half-timbering, steep roofs, medieval English', popularity: 65 },
    
    // Regional & Specialty
    { name: 'Mediterranean', period: 'Revival', description: 'Stucco walls, tile roofs, arched openings', popularity: 72 },
    { name: 'Farmhouse', period: 'Vernacular', description: 'Simple forms, functional design, wrap-around porches', popularity: 86 },
    { name: 'Ranch', period: 'Mid-Century', description: 'Single-story, long and low, attached garage', popularity: 74 },
    { name: 'Art Deco', period: 'Early 20th Century', description: 'Geometric patterns, vertical emphasis, luxury materials', popularity: 63 },
    { name: 'Transitional', period: 'Contemporary', description: 'Blend of traditional and contemporary elements', popularity: 89 }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setGeneratedImage(null);
        setAnalysis(null);
        setStyleGuide(null);
        setActiveTab('styles');
        analyzeImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate comprehensive AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate realistic analysis results
    const mockAnalysis: AnalysisResult = {
      photoType: Math.random() > 0.6 ? 'exterior' : 'interior',
      angle: ['above', 'below', 'eye-level'][Math.floor(Math.random() * 3)] as any,
      confidence: 0.87 + Math.random() * 0.1,
      detectedElements: [
        { name: 'Windows', confidence: 0.95, category: 'structural' },
        { name: 'Roofline', confidence: 0.89, category: 'structural' },
        { name: 'Siding Material', confidence: 0.82, category: 'material' },
        { name: 'Trim Details', confidence: 0.76, category: 'decorative' },
        { name: 'Color Scheme', confidence: 0.91, category: 'color' },
        { name: 'Architectural Proportions', confidence: 0.88, category: 'structural' }
      ],
      suggestedStyles: architecturalStyles
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(style => style.name),
      dominantColors: ['#8B7355', '#F5F5DC', '#2F4F4F', '#CD853F'],
      materials: ['Wood Siding', 'Asphalt Shingles', 'Vinyl Windows', 'Stone Foundation'],
      architecturalFeatures: ['Gabled Roof', 'Double-Hung Windows', 'Front Porch', 'Decorative Trim']
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const generateStyledImage = async () => {
    if (!selectedStyle || !uploadedImage) return;
    
    setIsGenerating(true);
    
    // Simulate AI image generation with realistic processing time
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Generate style guide and product recommendations
    await generateStyleGuide(selectedStyle);
    
    // For demo, we'll use a styled version - in production this would be AI-generated
    setGeneratedImage(uploadedImage);
    setIsGenerating(false);
    setActiveTab('products');
  };

  const generateStyleGuide = async (styleName: string) => {
    // Generate comprehensive style guide with product recommendations
    const style = architecturalStyles.find(s => s.name === styleName);
    if (!style) return;

    const mockStyleGuide: StyleGuide = {
      name: styleName,
      period: style.period,
      description: style.description,
      keyFeatures: getStyleFeatures(styleName),
      colorPalette: getStyleColors(styleName),
      materials: getStyleMaterials(styleName),
      products: generateProductRecommendations(styleName)
    };

    setStyleGuide(mockStyleGuide);
  };

  const getStyleFeatures = (styleName: string): string[] => {
    const featureMap: { [key: string]: string[] } = {
      'Modern Minimalist': ['Clean geometric lines', 'Large glass windows', 'Flat or low-pitched roofs', 'Open floor plans', 'Minimal ornamentation'],
      'Mid-Century Modern': ['Post-and-beam construction', 'Floor-to-ceiling windows', 'Open floor plans', 'Integration with landscape', 'Natural materials'],
      'Craftsman': ['Low-pitched gabled roofs', 'Wide eaves with exposed rafters', 'Front porches with columns', 'Built-in furniture', 'Natural materials'],
      'Victorian': ['Ornate decorative trim', 'Bay windows', 'Steep-pitched roofs', 'Asymmetrical facades', 'Bright color schemes'],
      'Farmhouse': ['Wrap-around porches', 'Board and batten siding', 'Metal roofing', 'Large front doors', 'Functional layouts']
    };
    return featureMap[styleName] || ['Characteristic architectural elements', 'Period-appropriate details', 'Authentic materials', 'Proper proportions'];
  };

  const getStyleColors = (styleName: string): string[] => {
    const colorMap: { [key: string]: string[] } = {
      'Modern Minimalist': ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#424242', '#212121'],
      'Mid-Century Modern': ['#D2B48C', '#8FBC8F', '#F4A460', '#708090', '#2F4F4F'],
      'Craftsman': ['#8B4513', '#DEB887', '#228B22', '#B22222', '#F5DEB3'],
      'Victorian': ['#800080', '#FFD700', '#DC143C', '#4169E1', '#32CD32'],
      'Farmhouse': ['#FFFAF0', '#F5F5DC', '#8B4513', '#2F4F4F', '#228B22']
    };
    return colorMap[styleName] || ['#F5F5F5', '#E0E0E0', '#8B7355', '#2F4F4F', '#CD853F'];
  };

  const getStyleMaterials = (styleName: string): string[] => {
    const materialMap: { [key: string]: string[] } = {
      'Modern Minimalist': ['Steel', 'Glass', 'Concrete', 'Aluminum', 'Composite materials'],
      'Mid-Century Modern': ['Teak wood', 'Steel', 'Glass', 'Stone', 'Brick'],
      'Craftsman': ['Cedar shingles', 'Stone', 'Brick', 'Copper', 'Hardwood'],
      'Victorian': ['Wood siding', 'Decorative millwork', 'Slate', 'Cast iron', 'Stained glass'],
      'Farmhouse': ['Reclaimed wood', 'Metal roofing', 'Natural stone', 'Brick', 'Board and batten']
    };
    return materialMap[styleName] || ['Wood', 'Stone', 'Metal', 'Glass', 'Composite'];
  };

  const generateProductRecommendations = (styleName: string): ProductRecommendation[] => {
    const baseProducts: Omit<ProductRecommendation, 'matchReason'>[] = [
      {
        id: '1',
        name: 'Heritage Series Windows',
        manufacturer: 'Andersen Windows',
        category: 'Windows & Doors',
        price: '$450 - $1,200',
        rating: 4.7,
        reviews: 2847,
        image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        description: 'Premium wood-clad windows with authentic divided lites and energy-efficient glazing.',
        availability: 'in-stock',
        shippingTime: '4-6 weeks',
        website: 'https://andersenwindows.com',
        phone: '1-800-426-4261',
        location: 'Bayport, MN',
        features: ['Energy Star certified', 'Custom sizing available', 'Multiple finish options', '20-year warranty']
      },
      {
        id: '2',
        name: 'Architectural Shingles',
        manufacturer: 'GAF Materials',
        category: 'Roofing',
        price: '$120 - $180 per square',
        rating: 4.5,
        reviews: 1923,
        image: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        description: 'Premium architectural shingles with enhanced curb appeal and weather protection.',
        availability: 'in-stock',
        shippingTime: '1-2 weeks',
        website: 'https://gaf.com',
        phone: '1-877-423-7663',
        features: ['50-year warranty', 'Wind resistance up to 130 mph', 'Algae protection', 'Multiple color options']
      },
      {
        id: '3',
        name: 'Classic Fiber Cement Siding',
        manufacturer: 'James Hardie',
        category: 'Siding',
        price: '$8 - $12 per sq ft',
        rating: 4.6,
        reviews: 3156,
        image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        description: 'Durable fiber cement siding that resists fire, insects, and moisture.',
        availability: 'in-stock',
        shippingTime: '2-3 weeks',
        website: 'https://jameshardie.com',
        phone: '1-866-442-7343',
        features: ['Fire resistant', 'Insect proof', 'Moisture resistant', '30-year warranty', 'Paintable']
      },
      {
        id: '4',
        name: 'Designer Entry Door Collection',
        manufacturer: 'Therma-Tru',
        category: 'Doors',
        price: '$800 - $2,500',
        rating: 4.4,
        reviews: 892,
        image: 'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        description: 'Fiberglass entry doors with authentic wood grain textures and decorative glass options.',
        availability: 'in-stock',
        shippingTime: '3-4 weeks',
        website: 'https://thermatru.com',
        phone: '1-800-537-8827',
        features: ['Energy efficient', 'Low maintenance', 'Security features', 'Custom glass options']
      },
      {
        id: '5',
        name: 'Natural Stone Veneer',
        manufacturer: 'Eldorado Stone',
        category: 'Exterior Materials',
        price: '$15 - $25 per sq ft',
        rating: 4.8,
        reviews: 567,
        image: 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        description: 'Manufactured stone veneer with authentic textures and colors.',
        availability: 'in-stock',
        shippingTime: '2-4 weeks',
        website: 'https://eldoradostone.com',
        phone: '1-800-925-1491',
        features: ['Lightweight installation', 'Weather resistant', 'Multiple textures', 'Color consistency']
      },
      {
        id: '6',
        name: 'Luxury Vinyl Plank Flooring',
        manufacturer: 'Shaw Floors',
        category: 'Flooring',
        price: '$4 - $8 per sq ft',
        rating: 4.3,
        reviews: 2134,
        image: 'https://images.pexels.com/photos/1643385/pexels-photo-1643385.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        description: 'Waterproof luxury vinyl with authentic wood visuals and enhanced durability.',
        availability: 'in-stock',
        shippingTime: '1-2 weeks',
        website: 'https://shawfloors.com',
        phone: '1-800-441-7429',
        features: ['100% waterproof', 'Scratch resistant', 'Easy installation', 'Lifetime warranty']
      }
    ];

    // Add match reasons based on selected style
    const productsWithReasons = baseProducts.map(product => ({
      ...product,
      matchReason: getMatchReason(product, styleName)
    }));

    return productsWithReasons;
  };

  const getMatchReason = (product: Omit<ProductRecommendation, 'matchReason'>, styleName: string): string => {
    const reasonMap: { [key: string]: { [key: string]: string } } = {
      'Modern Minimalist': {
        'Windows & Doors': 'Clean lines and minimal frames complement the minimalist aesthetic',
        'Roofing': 'Low-profile design maintains the sleek, uncluttered roofline',
        'Siding': 'Smooth, uniform surface aligns with minimalist principles',
        'Flooring': 'Simple, unadorned planks support the clean design philosophy'
      },
      'Craftsman': {
        'Windows & Doors': 'Authentic divided lites and natural wood match craftsman tradition',
        'Roofing': 'Traditional shingle patterns complement the handcrafted aesthetic',
        'Siding': 'Natural textures and earth tones align with craftsman materials',
        'Exterior Materials': 'Natural stone supports the authentic, handcrafted appearance'
      },
      'Farmhouse': {
        'Windows & Doors': 'Simple, functional design matches farmhouse practicality',
        'Roofing': 'Durable materials suit the rural, working aesthetic',
        'Siding': 'Board and batten style is quintessentially farmhouse',
        'Flooring': 'Rustic wood appearance fits the country lifestyle'
      }
    };

    return reasonMap[styleName]?.[product.category] || 
           `Authentic materials and design elements that enhance the ${styleName.toLowerCase()} style`;
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `styled-${selectedStyle.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
  };

  const resetAll = () => {
    setUploadedImage(null);
    setGeneratedImage(null);
    setSelectedStyle('');
    setAnalysis(null);
    setStyleGuide(null);
    setActiveTab('styles');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveProject = () => {
    console.log('Saving style match project...');
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'text-green-400';
      case 'limited': return 'text-yellow-400';
      case 'out-of-stock': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'in-stock': return <CheckCircle size={14} />;
      case 'limited': return <AlertCircle size={14} />;
      case 'out-of-stock': return <X size={14} />;
      default: return <Info size={14} />;
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
                <Camera className="text-orange-500" size={24} />
                <h1 className="text-xl font-bold text-white">Style Match</h1>
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
              {generatedImage && (
                <button
                  onClick={downloadImage}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            AI Style Transformation & Product Matching
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Upload a photo to analyze architectural style, transform it with AI, and discover matching products from top manufacturers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload & Analysis Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Upload size={24} />
                Upload & Analyze
              </h3>
              
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors duration-300 mb-6"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAll();
                      }}
                      className="flex items-center gap-2 text-orange-500 hover:text-orange-400 mx-auto"
                    >
                      <RotateCcw size={16} />
                      Upload Different Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera size={48} className="text-gray-400 mx-auto" />
                    <div>
                      <p className="text-white font-medium">Click to upload photo</p>
                      <p className="text-gray-400 text-sm">Supports JPG, PNG, WebP</p>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Enhanced Analysis Results */}
              {uploadedImage && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white flex items-center gap-2">
                    <Eye size={20} />
                    AI Analysis
                  </h4>
                  
                  {isAnalyzing ? (
                    <div className="space-y-3">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                      </div>
                      <p className="text-orange-500 text-sm">Analyzing architectural elements...</p>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            {analysis.photoType === 'exterior' ? <Building size={16} /> : <Home size={16} />}
                            <span className="text-gray-300 capitalize">{analysis.photoType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mountain size={16} />
                            <span className="text-gray-300 capitalize">{analysis.angle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-gray-300">{Math.round(analysis.confidence * 100)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap size={16} className="text-blue-400" />
                            <span className="text-gray-300">{analysis.detectedElements.length} elements</span>
                          </div>
                        </div>
                      </div>

                      {/* Detected Elements */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-white mb-2">Detected Elements</h5>
                        <div className="space-y-2">
                          {analysis.detectedElements.slice(0, 4).map((element, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-gray-300 text-sm">{element.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-700 rounded-full h-1">
                                  <div 
                                    className="bg-orange-500 h-1 rounded-full" 
                                    style={{ width: `${element.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{Math.round(element.confidence * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Color Palette */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-white mb-2">Dominant Colors</h5>
                        <div className="flex gap-2">
                          {analysis.dominantColors.map((color, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded border border-gray-600"
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="text-xs text-gray-500 mt-1">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Materials */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-white mb-2">Detected Materials</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysis.materials.map((material, index) => (
                            <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            {uploadedImage && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('styles')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === 'styles'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    <Palette size={16} />
                    Style Selection
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === 'products'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    Product Matches
                    {styleGuide && <span className="bg-orange-500 text-white text-xs px-1 rounded-full">{styleGuide.products.length}</span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === 'guide'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    <Info size={16} />
                    Style Guide
                  </button>
                </div>

                {/* Style Selection Tab */}
                {activeTab === 'styles' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles size={24} />
                      Choose Architectural Style
                    </h3>
                    
                    {analysis && analysis.suggestedStyles.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Info size={16} className="text-blue-400" />
                          <h4 className="text-blue-400 font-medium">AI Recommended Styles</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {analysis.suggestedStyles.map((styleName) => {
                            const style = architecturalStyles.find(s => s.name === styleName);
                            if (!style) return null;
                            
                            return (
                              <button
                                key={styleName}
                                onClick={() => setSelectedStyle(styleName)}
                                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                                  selectedStyle === styleName
                                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                                    : 'border-blue-600 bg-blue-900/30 text-blue-300 hover:border-blue-400'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-sm">{style.name}</p>
                                  <div className="flex items-center gap-1">
                                    <Star size={12} className="text-yellow-400" />
                                    <span className="text-xs">{style.popularity}</span>
                                  </div>
                                </div>
                                <p className="text-xs opacity-75">{style.period}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(
                        architecturalStyles.reduce((acc, style) => {
                          if (!acc[style.period]) acc[style.period] = [];
                          acc[style.period].push(style);
                          return acc;
                        }, {} as Record<string, typeof architecturalStyles>)
                      ).map(([period, styles]) => (
                        <div key={period}>
                          <h4 className="text-lg font-medium text-white mb-3">{period}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {styles.map((style) => (
                              <button
                                key={style.name}
                                onClick={() => setSelectedStyle(style.name)}
                                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                                  selectedStyle === style.name
                                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-orange-400'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-sm">{style.name}</p>
                                  <div className="flex items-center gap-1">
                                    <Star size={12} className="text-yellow-400" />
                                    <span className="text-xs">{style.popularity}</span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400">{style.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Generate Button */}
                    {selectedStyle && (
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <button
                          onClick={generateStyledImage}
                          disabled={isGenerating}
                          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Generating Style & Products...
                            </>
                          ) : (
                            <>
                              <Wand2 size={20} />
                              Generate Style Match
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Matches Tab */}
                {activeTab === 'products' && styleGuide && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <ShoppingCart size={24} />
                      Product Recommendations
                    </h3>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {styleGuide.products.map((product) => (
                        <div key={product.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-orange-500/50 transition-all duration-200">
                          <div className="flex gap-4">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-white text-sm">{product.name}</h4>
                                  <p className="text-gray-400 text-xs">{product.manufacturer}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-orange-400 font-medium text-sm">{product.price}</p>
                                  <div className="flex items-center gap-1">
                                    <Star size={12} className="text-yellow-400 fill-current" />
                                    <span className="text-xs text-gray-400">{product.rating} ({product.reviews})</span>
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-gray-300 text-xs mb-2 line-clamp-2">{product.description}</p>
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className={`flex items-center gap-1 text-xs ${getAvailabilityColor(product.availability)}`}>
                                  {getAvailabilityIcon(product.availability)}
                                  <span className="capitalize">{product.availability.replace('-', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Truck size={12} />
                                  <span>{product.shippingTime}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <p className="text-xs text-blue-300 italic">{product.matchReason}</p>
                                <div className="flex gap-1">
                                  <a
                                    href={product.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-gray-400 hover:text-orange-400 transition-colors"
                                    title="Visit website"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                  {product.phone && (
                                    <a
                                      href={`tel:${product.phone}`}
                                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                      title="Call manufacturer"
                                    >
                                      <Phone size={14} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style Guide Tab */}
                {activeTab === 'guide' && styleGuide && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Info size={24} />
                      {styleGuide.name} Style Guide
                    </h3>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {/* Style Overview */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">{styleGuide.period} Period</h4>
                        <p className="text-gray-300 text-sm">{styleGuide.description}</p>
                      </div>

                      {/* Key Features */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Key Features</h4>
                        <ul className="space-y-1">
                          {styleGuide.keyFeatures.map((feature, index) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-orange-500 mt-1">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Color Palette */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-3">Authentic Color Palette</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {styleGuide.colorPalette.map((color, index) => (
                            <div key={index} className="text-center">
                              <div 
                                className="w-full h-12 rounded border border-gray-600 mb-1"
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="text-xs text-gray-500">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Materials */}
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2">Authentic Materials</h4>
                        <div className="flex flex-wrap gap-2">
                          {styleGuide.materials.map((material, index) => (
                            <span key={index} className="bg-orange-900/30 text-orange-300 px-3 py-1 rounded-full text-sm">
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generation Results */}
            {uploadedImage && selectedStyle && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Wand2 size={24} />
                  Style Transformation Results
                </h3>

                {selectedStyle && (
                  <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <p className="text-gray-300">
                      <span className="text-orange-500 font-medium">Selected Style:</span> {selectedStyle}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {architecturalStyles.find(s => s.name === selectedStyle)?.description}
                    </p>
                  </div>
                )}

                {/* Before/After Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Original Photo</h4>
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={uploadedImage} 
                        alt="Original" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      {selectedStyle} Style
                      {generatedImage && <CheckCircle size={20} className="text-green-400" />}
                    </h4>
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                      {isGenerating ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-gray-400">Applying {selectedStyle} style...</p>
                          <p className="text-gray-500 text-sm mt-2">Analyzing materials and generating products...</p>
                        </div>
                      ) : generatedImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={generatedImage} 
                            alt="Generated" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                            AI Enhanced
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Select a style and click "Generate" to see results</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Product Preview */}
                {styleGuide && styleGuide.products.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white">Matching Products Found</h4>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm"
                      >
                        View All Products <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {styleGuide.products.slice(0, 3).map((product) => (
                        <div key={product.id} className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-16 object-cover rounded mb-2"
                          />
                          <p className="text-white text-xs font-medium">{product.name}</p>
                          <p className="text-gray-400 text-xs">{product.manufacturer}</p>
                          <p className="text-orange-400 text-xs font-medium">{product.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Initial State */}
            {!uploadedImage && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
                <Camera size={64} className="text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">Ready for Style Analysis</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Upload a photo of any building or interior space to get instant style analysis, AI transformation, and matching product recommendations from top manufacturers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-blue-400" />
                    <span>AI analyzes architectural elements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wand2 size={16} className="text-purple-400" />
                    <span>Transform to any style</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-green-400" />
                    <span>Find matching products</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Info Section */}
        <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">How Style Match Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Upload size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-200 mb-1">1. Upload & Analyze</h4>
                <p className="text-blue-100 text-sm">AI detects architectural elements, materials, and style characteristics</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Palette size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-200 mb-1">2. Choose Style</h4>
                <p className="text-blue-100 text-sm">Select from 50+ architectural styles with AI recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Wand2 size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-200 mb-1">3. Transform</h4>
                <p className="text-blue-100 text-sm">AI generates styled version while preserving structure</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-200 mb-1">4. Shop Products</h4>
                <p className="text-blue-100 text-sm">Get curated product recommendations from trusted manufacturers</p>
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

export default StyleMatch;