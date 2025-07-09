import React from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import Mission from './Mission';
import Tools from './Tools';
import Footer from './Footer';
import HorizontalBannerAd from './HorizontalBannerAd';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white font-sans">
      <Navigation />
      <Hero />
      <Mission />
      <Tools />
      
      {/* Horizontal Banner Ad - Below Contact, Above Footer (Both Desktop & Mobile) */}
      <HorizontalBannerAd adSlot="2081431874" className="py-8" />
      
      <Footer />
    </div>
  );
};

export default HomePage;