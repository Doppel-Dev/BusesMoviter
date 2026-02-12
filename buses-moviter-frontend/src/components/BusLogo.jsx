import React from 'react';
import { motion } from 'framer-motion';

export const BusLogo = ({ size = 60, className = "" }) => {
  const brandColor = "#004080"; 

  return (
    <motion.div 
      className={`bus-logo-container ${className}`} 
      style={{ width: size * 1.5, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      whileHover="hover"
    >
      <svg
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '100%', width: 'auto' }}
      >
        {/* Animated Road Lines - Creating a "fast" feel */}
        <motion.path
          d="M10 70 L110 70"
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray="10 5"
          animate={{ strokeDashoffset: [0, -15] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Dynamic Shadow */}
        <motion.ellipse 
          cx="60" cy="72" rx="35" ry="4" 
          fill="black" 
          fillOpacity="0.1"
          animate={{ scaleX: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bus Group with "Engine Rumble" and "Speed Lean" */}
        <motion.g
          variants={{
            hover: { x: 5, transition: { duration: 0.3 } }
          }}
          animate={{ 
            y: [0, -2, 0],
            rotate: [0, 0.5, 0]
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Main Body */}
          <motion.rect 
            x="25" y="15" width="70" height="50" rx="10" 
            fill={brandColor} 
            stroke="#002D5A"
            strokeWidth="0.5"
          />
          
          {/* Windows with Dynamic Reflections */}
          <rect x="30" y="20" width="60" height="20" rx="4" fill="#EDF2F7" />
          <motion.path
            d="M35 20 L55 20 L45 40 L25 40 Z"
            fill="white"
            fillOpacity="0.3"
            animate={{ x: [-20, 80] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Internal Divider */}
          <rect x="58" y="20" width="2" height="20" fill={brandColor} fillOpacity="0.5" />

          {/* Lights - High Quality Glow */}
          <g>
            {/* Left Light */}
            <circle cx="38" cy="55" r="5" fill="#FEEBC8" />
            <motion.circle 
              cx="38" cy="55" r="8" 
              fill="#FEEBC8" 
              fillOpacity="0.3"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {/* Right Light */}
            <circle cx="82" cy="55" r="5" fill="#FEEBC8" />
            <motion.circle 
              cx="82" cy="55" r="8" 
              fill="#FEEBC8" 
              fillOpacity="0.3"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
            />
          </g>

          {/* Grille */}
          <rect x="45" y="52" width="30" height="12" rx="2" fill="#1A202C" />
          <path d="M48 55 H72 M48 58 H72 M48 61 H72" stroke="#4A5568" strokeWidth="1" />

          {/* Mirror Details */}
          <rect x="20" y="30" width="5" height="12" rx="2" fill={brandColor} />
          <rect x="95" y="30" width="5" height="12" rx="2" fill={brandColor} />
        </motion.g>

        {/* Speed Sparks/Particles */}
        <motion.circle 
          cx="20" cy="70" r="1" fill={brandColor} 
          animate={{ x: [-10, -30], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.circle 
          cx="20" cy="65" r="1" fill={brandColor} 
          animate={{ x: [-5, -25], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
    </motion.div>
  );
};

export default BusLogo;
