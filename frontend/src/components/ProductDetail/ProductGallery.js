'use client';

import { useState } from 'react';
import './ProductGallery.css';

export default function ProductGallery({ images }) {
  const [activeImage, setActiveImage] = useState(images[0] || null);

  return (
    <div className="product-gallery">
      <div className="thumbnails">
        {images.map((img, index) => (
          <div
            key={index}
            className={`thumb-item ${activeImage === img ? 'active' : ''}`}
            onClick={() => setActiveImage(img)}
          >
            <img src={img.url} alt={`Thumbnail ${index + 1}`} />
          </div>
        ))}
        {/* Fallback if no images */}
        {images.length === 0 && (
          <div className="thumb-item active">
            <div className="thumb-placeholder"></div>
          </div>
        )}
      </div>
      <div className="main-image">
        {activeImage ? (
          <img src={activeImage.url} alt="Product" className="main-img" />
        ) : (
          <div className="main-img-placeholder"></div>
        )}
      </div>
    </div>
  );
}
