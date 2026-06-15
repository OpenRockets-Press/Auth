import React, { useState, useEffect } from 'react';

// Import assets
import libertyBg from '../assets/wp-content/statue_of_liberty_new_york_monument_manhattan_liberty_statue_skyline_usa-986669.png';
import museumBg from '../assets/wp-content/American_Museum_of_Natural_History_New_York_us_non-editorial_bpxph4.png';

// Background images and their extracted ambient colors + locations
const BACKGROUNDS = [
  {
    src: libertyBg,
    ambientColor: '#6b9eb5', 
    alt: 'Statue of Liberty New York',
    location: 'New York City'
  },
  {
    src: museumBg,
    ambientColor: '#8c7b6d', 
    alt: 'American Museum of Natural History',
    location: 'New York City'
  }
];

export const AmbientBackground: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgInfo, setBgInfo] = useState(BACKGROUNDS[0]);

  useEffect(() => {
    // Randomly select a background on mount
    const selectedBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    setBgInfo(selectedBg);

    const img = new Image();
    img.src = selectedBg.src;
    img.onload = () => {
      // Shorter timeout to make it feel snappier
      setTimeout(() => setIsLoaded(true), 50);
    };
  }, []);

  return (
    <div className="ambient-bg-container">
      {/* The ambient color layer blending out */}
      <div 
        className={`ambient-color-layer ${isLoaded ? 'fade-out' : ''}`}
        style={{ backgroundColor: bgInfo.ambientColor }}
      />
      {/* The high-res image layer blending in */}
      <img 
        src={bgInfo.src} 
        alt={bgInfo.alt} 
        className={`ambient-image-layer ${isLoaded ? 'fade-in' : ''}`}
      />
      
      {/* Location Badge */}
      <div className={`ms-location-badge ${isLoaded ? 'fade-in' : ''}`}>
        <svg className="ms-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        {bgInfo.location}
      </div>
    </div>
  );
};
