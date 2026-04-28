'use client';

import { useState } from 'react';
import './ProductGallery.css';

export default function ProductGallery({ images, selectedColor }) {
  // Filter images based on selected color
  const filteredImages = images.filter(img => img.color === selectedColor || !img.color);
  
  // Use a fallback if no images match the selected color
  const displayImages = filteredImages.length > 0 ? filteredImages : images.slice(0, 3);
  
  const [activeImage, setActiveImage] = useState(null);

  // Update active image when filtered list or selected color changes
  const currentActive = activeImage && displayImages.includes(activeImage) ? activeImage : displayImages[0];

  return (
    <div className="product-gallery">
      <div className="thumbnails">
        {displayImages.map((img, index) => (
          <div
            key={index}
            className={`thumb-item ${currentActive === img ? 'active' : ''}`}
            onClick={() => setActiveImage(img)}
          >
            <img src={img.url} alt={`Thumbnail ${index + 1}`} />
          </div>
        ))}
        {/* Fallback if no images */}
        {displayImages.length === 0 && (
          <div className="thumb-item active">
            <div className="thumb-placeholder"></div>
          </div>
        )}
      </div>
      <div className="main-image">
        {currentActive ? (
          <img 
            src={currentActive.url} 
            alt="Product" 
            className="main-img" 
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <div className="main-img-placeholder"></div>
        )}
      </div>
    </div>
  );
}
