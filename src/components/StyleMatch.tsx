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
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalBannerAd from './HorizontalBannerAd';
import Footer from './Footer';

interface AnalysisResult {
  photoType: 'interior' | 'exterior';
  angle: 'above' | 'below' | 'eye-level';
  confidence: number;
  detectedElements: string[];
  suggestedStyles: string[];
}

const StyleMatch = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comprehensive architectural styles
  const architecturalStyles = [
    // Classical & Ancient
    { name: 'Classical Greek', period: 'Ancient', description: 'Columns, pediments, symmetry' },
    { name: 'Roman', period: 'Ancient', description: 'Arches, domes, concrete construction' },
    { name: 'Byzantine', period: 'Medieval', description: 'Domes, mosaics, religious motifs' },
    
    // Medieval
    { name: 'Romanesque', period: 'Medieval', description: 'Thick walls, round arches, small windows' },
    { name: 'Gothic', period: 'Medieval', description: 'Pointed arches, flying buttresses, tall spires' },
    { name: 'Norman', period: 'Medieval', description: 'Massive construction, round arches' },
    
    // Renaissance & Baroque
    { name: 'Renaissance', period: 'Renaissance', description: 'Classical proportions, symmetry, humanism' },
    { name: 'Baroque', period: 'Baroque', description: 'Ornate decoration, dramatic curves, grandeur' },
    { name: 'Rococo', period: 'Baroque', description: 'Delicate ornamentation, pastel colors, asymmetry' },
    { name: 'Neoclassical', period: 'Neoclassical', description: 'Greek and Roman revival, clean lines' },
    
    // 19th Century
    { name: 'Victorian', period: '19th Century', description: 'Ornate details, bay windows, turrets' },
    { name: 'Gothic Revival', period: '19th Century', description: 'Medieval Gothic elements, pointed arches' },
    { name: 'Second Empire', period: '19th Century', description: 'Mansard roofs, dormer windows' },
    { name: 'Queen Anne', period: '19th Century', description: 'Asymmetrical facades, decorative elements' },
    { name: 'Shingle Style', period: '19th Century', description: 'Wood shingles, informal massing' },
    { name: 'Richardsonian Romanesque', period: '19th Century', description: 'Heavy stone, round arches' },
    
    // Early 20th Century
    { name: 'Art Nouveau', period: 'Early 20th Century', description: 'Organic forms, flowing lines, nature motifs' },
    { name: 'Arts and Crafts', period: 'Early 20th Century', description: 'Handcrafted details, natural materials' },
    { name: 'Prairie School', period: 'Early 20th Century', description: 'Horizontal lines, flat roofs, Frank Lloyd Wright' },
    { name: 'Art Deco', period: 'Early 20th Century', description: 'Geometric patterns, vertical emphasis, luxury' },
    { name: 'Bauhaus', period: 'Early 20th Century', description: 'Functional design, minimal ornamentation' },
    
    // Modern
    { name: 'International Style', period: 'Modern', description: 'Glass curtain walls, minimal decoration' },
    { name: 'Mid-Century Modern', period: 'Modern', description: 'Clean lines, large windows, integration with nature' },
    { name: 'Brutalist', period: 'Modern', description: 'Raw concrete, massive forms, fortress-like' },
    { name: 'Postmodern', period: 'Postmodern', description: 'Eclectic mix, historical references, irony' },
    
    // Contemporary
    { name: 'Deconstructivism', period: 'Contemporary', description: 'Fragmented forms, non-rectilinear shapes' },
    { name: 'High-Tech', period: 'Contemporary', description: 'Exposed structure, industrial materials' },
    { name: 'Minimalist', period: 'Contemporary', description: 'Simple forms, clean lines, minimal elements' },
    { name: 'Sustainable/Green', period: 'Contemporary', description: 'Eco-friendly materials, energy efficiency' },
    { name: 'Parametric', period: 'Contemporary', description: 'Computer-generated forms, complex geometry' },
    
    // Regional & Cultural
    { name: 'Colonial American', period: 'Colonial', description: 'Symmetrical facade, central door, shutters' },
    { name: 'Federal', period: 'Colonial', description: 'Refined proportions, decorative elements' },
    { name: 'Georgian', period: 'Colonial', description: 'Formal symmetry, classical details' },
    { name: 'Spanish Colonial', period: 'Colonial', description: 'Stucco walls, red tile roofs, courtyards' },
    { name: 'Mission Revival', period: 'Revival', description: 'Spanish mission influence, bell towers' },
    { name: 'Mediterranean Revival', period: 'Revival', description: 'Stucco, tile roofs, arched openings' },
    { name: 'Tudor Revival', period: 'Revival', description: 'Half-timbering, steep roofs, medieval English' },
    { name: 'Colonial Revival', period: 'Revival', description: 'American colonial elements, symmetry' },
    
    // Asian Styles
    { name: 'Traditional Japanese', period: 'Traditional', description: 'Wood construction, sliding doors, gardens' },
    { name: 'Chinese Traditional', period: 'Traditional', description: 'Curved roofs, bright colors, feng shui' },
    { name: 'Islamic', period: 'Traditional', description: 'Geometric patterns, arches, minarets' },
    { name: 'Indian Traditional', period: 'Traditional', description: 'Intricate carvings, courtyards, domes' },
    
    // Vernacular
    { name: 'Craftsman Bungalow', period: 'Vernacular', description: 'Low-pitched roofs, exposed rafters, porches' },
    { name: 'Ranch Style', period: 'Vernacular', description: 'Single-story, long and low, attached garage' },
    { name: 'Cape Cod', period: 'Vernacular', description: 'Steep roofs, central chimney, dormers' },
    { name: 'Farmhouse', period: 'Vernacular', description: 'Simple forms, functional design, porches' },
    { name: 'Log Cabin', period: 'Vernacular', description: 'Log construction, rustic appearance' },
    { name: 'Adobe', period: 'Vernacular', description: 'Thick walls, flat roofs, southwestern US' }
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
        analyzeImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis results - in real implementation, this would call an AI service
    const mockAnalysis: AnalysisResult = {
      photoType: Math.random() > 0.5 ? 'exterior' : 'interior',
      angle: ['above', 'below', 'eye-level'][Math.floor(Math.random() * 3)] as 'above' | 'below' | 'eye-level',
      confidence: 0.85 + Math.random() * 0.1,
      detectedElements: [
        'Windows', 'Roofline', 'Facade', 'Architectural details', 'Materials', 'Proportions'
      ].slice(0, 3 + Math.floor(Math.random() * 3)),
      suggestedStyles: architecturalStyles
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(style => style.name)
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const generateStyledImage = async () => {
    if (!selectedStyle || !uploadedImage) return;
    
    setIsGenerating(true);
    
    // Simulate AI image generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In real implementation, this would call an AI image generation service
    // For demo, we'll use a placeholder that shows the style was applied
    setGeneratedImage(uploadedImage); // Placeholder - would be the AI-generated result
    setIsGenerating(false);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveProject = () => {
    console.log('Saving style match project...');
  };

  const groupedStyles = architecturalStyles.reduce((acc, style) => {
    if (!acc[style.period]) {
      acc[style.period] = [];
    }
    acc[style.period].push(style);
    return acc;
  }, {} as Record<string, typeof architecturalStyles>);

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
            AI Style Transformation
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Upload a photo and transform it into any architectural style. Our AI detects photo type, angle, and suggests the best style matches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Upload size={24} />
                Upload Photo
              </h3>
              
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors duration-300"
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

              {/* Analysis Results */}
              {uploadedImage && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
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
                      <p className="text-orange-500 text-sm">Analyzing image...</p>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {analysis.photoType === 'exterior' ? <Building size={16} /> : <Home size={16} />}
                        <span className="text-gray-300 capitalize">{analysis.photoType} Photo</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mountain size={16} />
                        <span className="text-gray-300 capitalize">{analysis.angle} Angle</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-gray-300">{Math.round(analysis.confidence * 100)}% Confidence</span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Detected Elements:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.detectedElements.map((element, index) => (
                            <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                              {element}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Quick Actions */}
              {uploadedImage && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Settings size={16} />
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={resetAll}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 text-sm text-gray-300"
                    >
                      <RotateCcw size={14} />
                      Reset All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Style Selection */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                          <p className="font-medium text-sm">{style.name}</p>
                          <p className="text-xs opacity-75">{style.period}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(groupedStyles).map(([period, styles]) => (
                  <div key={period}>
                    <h4 className="text-lg font-medium text-white mb-3">{period}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                          <p className="font-medium text-sm">{style.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{style.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generation Section */}
        {uploadedImage && selectedStyle && (
          <div className="mt-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Wand2 size={24} />
                  Generate Styled Image
                </h3>
                
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    onClick={generateStyledImage}
                    disabled={isGenerating}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={20} />
                        Generate Style
                      </>
                    )}
                  </button>
                </div>
              </div>

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

              {/* Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Original</h4>
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
                    Styled Result
                    {generatedImage && <CheckCircle size={20} className="text-green-400" />}
                  </h4>
                  <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {isGenerating ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Applying {selectedStyle} style...</p>
                      </div>
                    ) : generatedImage ? (
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Click "Generate Style" to see results</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">How Style Match Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Upload size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-200 mb-1">1. Upload & Analyze</h4>
                <p className="text-blue-100 text-sm">AI detects photo type, angle, and architectural elements</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Palette size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-200 mb-1">2. Choose Style</h4>
                <p className="text-blue-100 text-sm">Select from 50+ historical and contemporary architectural styles</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Wand2 size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-200 mb-1">3. Generate</h4>
                <p className="text-blue-100 text-sm">AI transforms your photo while preserving structure and proportions</p>
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