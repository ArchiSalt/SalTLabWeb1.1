import React, { useEffect } from 'react';

interface HorizontalBannerAdProps {
  adSlot: string;
  className?: string;
}

const HorizontalBannerAd: React.FC<HorizontalBannerAdProps> = ({ adSlot, className = '' }) => {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`w-full bg-[#0c0c0c] ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
          
          {/* Horizontal Banner Ad - Works for both Desktop & Mobile */}
          <ins className="adsbygoogle"
               style={{display:'block'}}
               data-ad-client="ca-pub-8485953979790358"
               data-ad-slot={adSlot}
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      </div>
    </div>
  );
};

export default HorizontalBannerAd;