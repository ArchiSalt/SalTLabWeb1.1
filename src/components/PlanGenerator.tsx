import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Layers,
  Move,
  Square,
  Circle,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Plus,
  Minus,
  RotateCw,
  Palette,
  Lightbulb,
  Wind,
  Thermometer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HorizontalBannerAd from './HorizontalBannerAd';
import Footer from './Footer';

interface Room {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
}

interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  type: 'exterior' | 'interior' | 'load-bearing';
}

interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  type: 'entry' | 'interior' | 'sliding' | 'french';
}

interface Window {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  type: 'standard' | 'bay' | 'picture' | 'sliding';
}

interface FloorPlan {
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  dimensions: { width: number; height: number };
  scale: number;
}

interface RoomType {
  id: string;
  name: string;
  icon: React.ReactNode;
  minSize: number;
  color: string;
  defaultDimensions: { width: number; height: number };
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
  
  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  
  // Floor plan data
  const [floorPlan, setFloorPlan] = useState<FloorPlan>({
    rooms: [],
    walls: [],
    doors: [],
    windows: [],
    dimensions: { width: 800, height: 600 },
    scale: 1 // 1 pixel = 1 foot
  });

  const roomTypes: RoomType[] = [
    { 
      id: 'living', 
      name: 'Living Room', 
      icon: <Home size={16} />, 
      minSize: 200, 
      color: '#3B82F6',
      defaultDimensions: { width: 160, height: 120 }
    },
    { 
      id: 'kitchen', 
      name: 'Kitchen', 
      icon: <Grid size={16} />, 
      minSize: 120, 
      color: '#10B981',
      defaultDimensions: { width: 120, height: 100 }
    },
    { 
      id: 'bedroom', 
      name: 'Bedroom', 
      icon: <Bed size={16} />, 
      minSize: 100, 
      color: '#8B5CF6',
      defaultDimensions: { width: 120, height: 100 }
    },
    { 
      id: 'bathroom', 
      name: 'Bathroom', 
      icon: <Bath size={16} />, 
      minSize: 40, 
      color: '#06B6D4',
      defaultDimensions: { width: 80, height: 60 }
    },
    { 
      id: 'garage', 
      name: 'Garage', 
      icon: <Car size={16} />, 
      minSize: 240, 
      color: '#6B7280',
      defaultDimensions: { width: 200, height: 120 }
    },
    { 
      id: 'dining', 
      name: 'Dining Room', 
      icon: <Users size={16} />, 
      minSize: 120, 
      color: '#F59E0B',
      defaultDimensions: { width: 120, height: 100 }
    },
    { 
      id: 'office', 
      name: 'Office', 
      icon: <FileText size={16} />, 
      minSize: 80, 
      color: '#EF4444',
      defaultDimensions: { width: 100, height: 80 }
    },
    { 
      id: 'closet', 
      name: 'Closet', 
      icon: <Square size={16} />, 
      minSize: 20, 
      color: '#84CC16',
      defaultDimensions: { width: 60, height: 40 }
    }
  ];

  const drawingTools = [
    { id: 'select', name: 'Select', icon: <MousePointer size={20} />, color: 'text-gray-400' },
    { id: 'room', name: 'Add Room', icon: <Square size={20} />, color: 'text-blue-400' },
    { id: 'wall', name: 'Draw Wall', icon: <Ruler size={20} />, color: 'text-gray-400' },
    { id: 'door', name: 'Add Door', icon: <Square size={20} />, color: 'text-green-400' },
    { id: 'window', name: 'Add Window', icon: <Square size={20} />, color: 'text-cyan-400' },
    { id: 'move', name: 'Move', icon: <Move size={20} />, color: 'text-purple-400' },
    { id: 'delete', name: 'Delete', icon: <Trash2 size={20} />, color: 'text-red-400' }
  ];

  const architecturalStyles = [
    { id: 'traditional', name: 'Traditional', description: 'Classic layouts with formal rooms' },
    { id: 'modern', name: 'Modern', description: 'Open concept with clean lines' },
    { id: 'ranch', name: 'Ranch', description: 'Single-story with long, low profile' },
    { id: 'colonial', name: 'Colonial', description: 'Symmetrical design with center hall' },
    { id: 'craftsman', name: 'Craftsman', description: 'Cozy with built-in features' },
    { id: 'contemporary', name: 'Contemporary', description: 'Current trends with flexible spaces' }
  ];

  // Canvas drawing functions
  const drawFloorPlan = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x, panOffset.y);

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);
    }

    // Draw rooms
    floorPlan.rooms.forEach(room => drawRoom(ctx, room));
    
    // Draw walls
    floorPlan.walls.forEach(wall => drawWall(ctx, wall));
    
    // Draw doors
    floorPlan.doors.forEach(door => drawDoor(ctx, door));
    
    // Draw windows
    floorPlan.windows.forEach(window => drawWindow(ctx, window));

    // Highlight selected room
    if (selectedRoom) {
      drawRoomHighlight(ctx, selectedRoom);
    }

    ctx.restore();
  }, [floorPlan, zoom, panOffset, showGrid, selectedRoom]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    const gridSize = 20; // 20 pixels = 20 feet at 1:1 scale
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawRoom = (ctx: CanvasRenderingContext2D, room: Room) => {
    ctx.save();
    
    // Draw room rectangle
    ctx.fillStyle = room.color + '40'; // Semi-transparent
    ctx.strokeStyle = room.color;
    ctx.lineWidth = 2;
    
    ctx.fillRect(room.x, room.y, room.width, room.height);
    ctx.strokeRect(room.x, room.y, room.width, room.height);
    
    // Draw room label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = room.x + room.width / 2;
    const centerY = room.y + room.height / 2;
    
    ctx.fillText(room.name, centerX, centerY - 6);
    
    // Draw dimensions if enabled
    if (showDimensions) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px Inter, sans-serif';
      const widthFt = Math.round(room.width / floorPlan.scale);
      const heightFt = Math.round(room.height / floorPlan.scale);
      ctx.fillText(`${widthFt}' × ${heightFt}'`, centerX, centerY + 8);
    }
    
    ctx.restore();
  };

  const drawWall = (ctx: CanvasRenderingContext2D, wall: Wall) => {
    ctx.strokeStyle = wall.type === 'exterior' ? '#1F2937' : '#374151';
    ctx.lineWidth = wall.thickness;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(wall.x1, wall.y1);
    ctx.lineTo(wall.x2, wall.y2);
    ctx.stroke();
  };

  const drawDoor = (ctx: CanvasRenderingContext2D, door: Door) => {
    ctx.save();
    ctx.translate(door.x, door.y);
    ctx.rotate((door.rotation * Math.PI) / 180);
    
    // Draw door opening
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(door.width, 0);
    ctx.stroke();
    
    // Draw door swing arc
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, door.width, 0, Math.PI / 2);
    ctx.stroke();
    
    ctx.restore();
  };

  const drawWindow = (ctx: CanvasRenderingContext2D, window: Window) => {
    ctx.save();
    ctx.translate(window.x, window.y);
    ctx.rotate((window.rotation * Math.PI) / 180);
    
    // Draw window
    ctx.fillStyle = '#06B6D4';
    ctx.strokeStyle = '#0891B2';
    ctx.lineWidth = 2;
    
    ctx.fillRect(0, 0, window.width, window.height);
    ctx.strokeRect(0, 0, window.width, window.height);
    
    // Draw window mullions
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(window.width / 2, 0);
    ctx.lineTo(window.width / 2, window.height);
    ctx.moveTo(0, window.height / 2);
    ctx.lineTo(window.width, window.height / 2);
    ctx.stroke();
    
    ctx.restore();
  };

  const drawRoomHighlight = (ctx: CanvasRenderingContext2D, room: Room) => {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(room.x - 2, room.y - 2, room.width + 4, room.height + 4);
    ctx.setLineDash([]);
  };

  // Event handlers
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - panOffset.x;
    const y = (e.clientY - rect.top) / zoom - panOffset.y;

    if (selectedTool === 'room') {
      addRoom(x, y);
    } else if (selectedTool === 'select') {
      selectRoomAt(x, y);
    } else if (selectedTool === 'door') {
      addDoor(x, y);
    } else if (selectedTool === 'window') {
      addWindow(x, y);
    }
  };

  const addRoom = (x: number, y: number) => {
    const roomType = roomTypes[0]; // Default to living room
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      type: roomType.id,
      name: roomType.name,
      x: x - roomType.defaultDimensions.width / 2,
      y: y - roomType.defaultDimensions.height / 2,
      width: roomType.defaultDimensions.width,
      height: roomType.defaultDimensions.height,
      color: roomType.color,
      rotation: 0
    };

    setFloorPlan(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
    
    setSelectedRoom(newRoom);
  };

  const addDoor = (x: number, y: number) => {
    const newDoor: Door = {
      id: `door_${Date.now()}`,
      x,
      y,
      width: 30,
      rotation: 0,
      type: 'interior'
    };

    setFloorPlan(prev => ({
      ...prev,
      doors: [...prev.doors, newDoor]
    }));
  };

  const addWindow = (x: number, y: number) => {
    const newWindow: Window = {
      id: `window_${Date.now()}`,
      x,
      y,
      width: 40,
      height: 8,
      rotation: 0,
      type: 'standard'
    };

    setFloorPlan(prev => ({
      ...prev,
      windows: [...prev.windows, newWindow]
    }));
  };

  const selectRoomAt = (x: number, y: number) => {
    const room = floorPlan.rooms.find(r => 
      x >= r.x && x <= r.x + r.width && 
      y >= r.y && y <= r.y + r.height
    );
    setSelectedRoom(room || null);
  };

  const deleteSelectedRoom = () => {
    if (selectedRoom) {
      setFloorPlan(prev => ({
        ...prev,
        rooms: prev.rooms.filter(r => r.id !== selectedRoom.id)
      }));
      setSelectedRoom(null);
    }
  };

  const updateSelectedRoom = (updates: Partial<Room>) => {
    if (!selectedRoom) return;
    
    setFloorPlan(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => 
        r.id === selectedRoom.id ? { ...r, ...updates } : r
      )
    }));
    
    setSelectedRoom(prev => prev ? { ...prev, ...updates } : null);
  };

  // AI Generation
  const generatePlan = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI plan generation with realistic timing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a sample floor plan based on requirements
      const generatedRooms = generateRoomsFromRequirements();
      
      setFloorPlan(prev => ({
        ...prev,
        rooms: generatedRooms
      }));
      
      setGeneratedPlan(true);
    } catch (error) {
      console.error('Plan generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRoomsFromRequirements = (): Room[] => {
    const rooms: Room[] = [];
    let currentX = 50;
    let currentY = 50;
    let rowHeight = 0;
    
    // Add living room
    const living = roomTypes.find(r => r.id === 'living')!;
    rooms.push({
      id: 'living_1',
      type: living.id,
      name: living.name,
      x: currentX,
      y: currentY,
      width: living.defaultDimensions.width,
      height: living.defaultDimensions.height,
      color: living.color,
      rotation: 0
    });
    currentX += living.defaultDimensions.width + 20;
    rowHeight = Math.max(rowHeight, living.defaultDimensions.height);
    
    // Add kitchen
    const kitchen = roomTypes.find(r => r.id === 'kitchen')!;
    rooms.push({
      id: 'kitchen_1',
      type: kitchen.id,
      name: kitchen.name,
      x: currentX,
      y: currentY,
      width: kitchen.defaultDimensions.width,
      height: kitchen.defaultDimensions.height,
      color: kitchen.color,
      rotation: 0
    });
    
    // Move to next row
    currentX = 50;
    currentY += rowHeight + 20;
    rowHeight = 0;
    
    // Add bedrooms
    const bedroom = roomTypes.find(r => r.id === 'bedroom')!;
    for (let i = 0; i < bedrooms; i++) {
      rooms.push({
        id: `bedroom_${i + 1}`,
        type: bedroom.id,
        name: `Bedroom ${i + 1}`,
        x: currentX,
        y: currentY,
        width: bedroom.defaultDimensions.width,
        height: bedroom.defaultDimensions.height,
        color: bedroom.color,
        rotation: 0
      });
      currentX += bedroom.defaultDimensions.width + 20;
      rowHeight = Math.max(rowHeight, bedroom.defaultDimensions.height);
    }
    
    // Add bathrooms
    const bathroom = roomTypes.find(r => r.id === 'bathroom')!;
    for (let i = 0; i < bathrooms; i++) {
      if (currentX > 400) {
        currentX = 50;
        currentY += rowHeight + 20;
        rowHeight = 0;
      }
      
      rooms.push({
        id: `bathroom_${i + 1}`,
        type: bathroom.id,
        name: `Bathroom ${i + 1}`,
        x: currentX,
        y: currentY,
        width: bathroom.defaultDimensions.width,
        height: bathroom.defaultDimensions.height,
        color: bathroom.color,
        rotation: 0
      });
      currentX += bathroom.defaultDimensions.width + 20;
      rowHeight = Math.max(rowHeight, bathroom.defaultDimensions.height);
    }
    
    // Add garage if requested
    if (garage) {
      const garageRoom = roomTypes.find(r => r.id === 'garage')!;
      currentY += rowHeight + 20;
      rooms.push({
        id: 'garage_1',
        type: garageRoom.id,
        name: garageRoom.name,
        x: 50,
        y: currentY,
        width: garageRoom.defaultDimensions.width,
        height: garageRoom.defaultDimensions.height,
        color: garageRoom.color,
        rotation: 0
      });
    }
    
    return rooms;
  };

  // Canvas effects
  useEffect(() => {
    drawFloorPlan();
  }, [drawFloorPlan]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const clearPlan = () => {
    setFloorPlan({
      rooms: [],
      walls: [],
      doors: [],
      windows: [],
      dimensions: { width: 800, height: 600 },
      scale: 1
    });
    setSelectedRoom(null);
    setGeneratedPlan(false);
  };

  const calculateTotalArea = () => {
    return floorPlan.rooms.reduce((total, room) => {
      const areaInPixels = room.width * room.height;
      const areaInFeet = areaInPixels / (floorPlan.scale * floorPlan.scale);
      return total + areaInFeet;
    }, 0);
  };

  const exportPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a high-resolution export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * 2;
    exportCanvas.height = canvas.height * 2;
    
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;
    
    exportCtx.scale(2, 2);
    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw everything on export canvas
    exportCtx.scale(zoom, zoom);
    exportCtx.translate(panOffset.x, panOffset.y);
    
    floorPlan.rooms.forEach(room => drawRoom(exportCtx, room));
    floorPlan.walls.forEach(wall => drawWall(exportCtx, wall));
    floorPlan.doors.forEach(door => drawDoor(exportCtx, door));
    floorPlan.windows.forEach(window => drawWindow(exportCtx, window));
    
    // Download the image
    const link = document.createElement('a');
    link.download = `${projectName.replace(/\s+/g, '_')}_floor_plan.png`;
    link.href = exportCanvas.toDataURL();
    link.click();
  };

  const savePlan = () => {
    const planData = {
      projectName,
      totalArea,
      bedrooms,
      bathrooms,
      stories,
      garage,
      style,
      floorPlan,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('saved_floor_plan', JSON.stringify(planData));
    alert('Floor plan saved locally!');
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
              <button
                onClick={exportPlan}
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
        {/* Left Sidebar - Configuration */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 p-6 overflow-y-auto">
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
                <label className="block text-sm text-gray-400 mb-2">Target Area (sq ft)</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => setTotalArea(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {Math.round(calculateTotalArea())} sq ft
                </p>
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

          {/* Drawing Tools */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4">Drawing Tools</h4>
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

          {/* Room Types */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4">Room Types</h4>
            <div className="space-y-2">
              {roomTypes.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: room.color }}
                    ></div>
                    <span className="text-sm text-gray-300">{room.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{room.minSize}+ sq ft</span>
                </div>
              ))}
            </div>
          </div>

          {/* View Controls */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-white mb-4">View Controls</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleZoomIn}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <ZoomIn size={16} />
                </button>
                <span className="text-sm text-gray-300">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={handleZoomOut}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={handleResetView}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <Grid size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">Show Grid</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <Ruler size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">Show Dimensions</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePlan}
            disabled={isGenerating}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mb-4"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Plan...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate AI Floor Plan
              </>
            )}
          </button>

          <button
            onClick={clearPlan}
            className="w-full border border-gray-600 hover:border-red-500 text-gray-300 hover:text-red-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear Plan
          </button>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-gray-800 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onClick={handleCanvasClick}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            style={{ 
              cursor: selectedTool === 'select' ? 'default' : 
                     selectedTool === 'move' ? 'move' : 'crosshair'
            }}
          />
          
          {/* Canvas Controls */}
          <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-800 rounded text-white"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-800 rounded text-white"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={handleResetView}
                className="p-2 hover:bg-gray-800 rounded text-white"
                title="Reset View"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Instructions Overlay */}
          {floorPlan.rooms.length === 0 && !isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
                <FileText size={64} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Interactive Floor Plan Designer</h3>
                <p className="text-gray-400 max-w-md">
                  Click "Generate AI Floor Plan" to create an automatic layout, or use the drawing tools to manually design your floor plan.
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>• Select tools from the sidebar</p>
                  <p>• Click on the canvas to add rooms</p>
                  <p>• Use zoom controls to navigate</p>
                </div>
              </div>
            </div>
          )}

          {/* Generation Loading Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Generating Your Floor Plan</h3>
                <p className="text-gray-400">
                  AI is creating a custom layout based on your specifications...
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Analyzing room requirements...</p>
                  <p>Optimizing traffic flow...</p>
                  <p>Applying {style} style principles...</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm text-gray-300">
              <div className="flex items-center gap-4">
                <span>Tool: <span className="text-orange-400">{drawingTools.find(t => t.id === selectedTool)?.name}</span></span>
                <span>Rooms: <span className="text-orange-400">{floorPlan.rooms.length}</span></span>
                <span>Area: <span className="text-orange-400">{Math.round(calculateTotalArea())} sq ft</span></span>
              </div>
              <div className="flex items-center gap-4">
                <span>Zoom: {Math.round(zoom * 100)}%</span>
                <span>Grid: 20ft</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Room Properties */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-l border-gray-800 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
          
          {selectedRoom ? (
            <div className="space-y-6">
              {/* Selected Room Properties */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Square size={16} style={{ color: selectedRoom.color }} />
                  {selectedRoom.name}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Room Name</label>
                    <input
                      type="text"
                      value={selectedRoom.name}
                      onChange={(e) => updateSelectedRoom({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Room Type</label>
                    <select
                      value={selectedRoom.type}
                      onChange={(e) => {
                        const roomType = roomTypes.find(r => r.id === e.target.value);
                        if (roomType) {
                          updateSelectedRoom({ 
                            type: roomType.id, 
                            color: roomType.color,
                            name: roomType.name 
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Width (ft)</label>
                      <input
                        type="number"
                        value={Math.round(selectedRoom.width / floorPlan.scale)}
                        onChange={(e) => updateSelectedRoom({ width: Number(e.target.value) * floorPlan.scale })}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Height (ft)</label>
                      <input
                        type="number"
                        value={Math.round(selectedRoom.height / floorPlan.scale)}
                        onChange={(e) => updateSelectedRoom({ height: Number(e.target.value) * floorPlan.scale })}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Area</label>
                    <div className="text-white font-medium">
                      {Math.round((selectedRoom.width * selectedRoom.height) / (floorPlan.scale * floorPlan.scale))} sq ft
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => updateSelectedRoom({ 
                      x: selectedRoom.x, 
                      y: selectedRoom.y,
                      width: selectedRoom.width,
                      height: selectedRoom.height 
                    })}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    <Copy size={12} />
                    Duplicate
                  </button>
                  <button
                    onClick={deleteSelectedRoom}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MousePointer size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a room to edit its properties</p>
            </div>
          )}

          {/* Plan Summary */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-white mb-3">Plan Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Rooms:</span>
                <span className="text-white">{floorPlan.rooms.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Area:</span>
                <span className="text-white">{Math.round(calculateTotalArea())} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Area:</span>
                <span className="text-white">{totalArea.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Efficiency:</span>
                <span className={`font-medium ${
                  calculateTotalArea() / totalArea > 0.9 ? 'text-green-400' : 
                  calculateTotalArea() / totalArea > 0.7 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {Math.round((calculateTotalArea() / totalArea) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Room Breakdown */}
          {floorPlan.rooms.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-white mb-3">Room Breakdown</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {floorPlan.rooms.map((room) => (
                  <div 
                    key={room.id} 
                    onClick={() => setSelectedRoom(room)}
                    className={`flex items-center justify-between text-sm p-2 rounded cursor-pointer transition-colors ${
                      selectedRoom?.id === room.id ? 'bg-orange-500/20 border border-orange-500/30' : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: room.color }}
                      ></div>
                      <span className="text-gray-300">{room.name}</span>
                    </div>
                    <span className="text-gray-400">
                      {Math.round((room.width * room.height) / (floorPlan.scale * floorPlan.scale))} sq ft
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Options */}
          {generatedPlan && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-white mb-3">Export Options</h4>
              <div className="space-y-2">
                <button 
                  onClick={exportPlan}
                  className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300 flex items-center gap-2"
                >
                  <Download size={14} />
                  High-Res PNG
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300 flex items-center gap-2">
                  <FileText size={14} />
                  PDF Floor Plan
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300 flex items-center gap-2">
                  <Grid size={14} />
                  CAD File (DWG)
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-700/50 text-sm text-gray-300 flex items-center gap-2">
                  <Ruler size={14} />
                  Room Schedule
                </button>
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

export default PlanGenerator;