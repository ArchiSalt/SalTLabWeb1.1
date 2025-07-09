import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import UserProfile from './UserProfile';
import LoginModal from './auth/LoginModal';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();
  
  // Close profile when user changes (including sign out)
  useEffect(() => {
    setShowProfile(false);
  }, [user]);
  
  const isAdmin = user?.email === 'srymniak@gmail.com';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
    { name: 'Style Match', href: '/style-match' },
    { name: 'Site Planner', href: '/site-planner' },
    { name: 'Plan Generator', href: '/plan-generator' },
    { name: 'Codebot', href: '/codebot' },
    { name: 'Estimated Cost', href: '/estimated-cost' },
    { name: 'Contact', href: '/contact' },
  ];

  // Logo component using your provided image
  const Logo = () => (
    <Link to="/" className="flex items-center">
      <img 
        src="/image copy.png" 
        alt="SalT Lab Logo" 
        className="w-8 h-8 mr-3 object-contain"
      />
      <h1 className="text-2xl font-bold text-white">SalT Lab</h1>
    </Link>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-300 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Authentication */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors duration-200"
                >
                  <User size={20} />
                  <span className="text-sm">{user.email?.split('@')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <LogIn size={16} />
                  Sign In
                </button>
              )}

              {/* Profile Dropdown */}
              {showProfile && user && (
                <div className="absolute right-0 mt-2 w-80 z-50">
                  <UserProfile onClose={() => setShowProfile(false)} />
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user ? (
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="text-gray-300 hover:text-orange-500 transition-colors duration-200"
              >
                <User size={20} />
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-300 hover:text-orange-500 transition-colors duration-200"
              >
                <LogIn size={20} />
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-orange-500 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-300 hover:text-orange-500 block px-3 py-2 text-base font-medium transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Profile Dropdown */}
      {showProfile && user && (
        <div className="md:hidden fixed top-20 left-4 right-4 z-50">
          <UserProfile onClose={() => setShowProfile(false)} />
        </div>
      )}

      {/* Backdrop for mobile profile */}
      {showProfile && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowProfile(false)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="absolute top-0 left-0 right-0 z-[60]">
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
          />
        </div>
      )}
    </nav>
  );
};

export default Navigation;