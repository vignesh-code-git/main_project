'use client';

import { useState } from 'react';
import Image from 'next/image';
import './ProductGallery.css';

export default function ProductGallery({ images, selectedColor }) {
  // Filter and sort images: exact color matches FIRST, then generic images
  const colorMatches = images.filter(img => img.color && selectedColor && img.color.toLowerCase() === selectedColor.toLowerCase());
  const genericImages = images.filter(img => !img.color);
  
  const displayImages = colorMatches.length > 0 ? [...colorMatches, ...genericImages] : images.slice(0, 5);
  
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
          <Image 
            src={currentActive.url} 
            alt="Product" 
            className="main-img" 
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="main-img-placeholder"></div>
        )}
      </div>
    </div>
  );
}
