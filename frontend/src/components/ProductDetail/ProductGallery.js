'use client';

import { useState } from 'react';
import './ProductGallery.css';

export default function ProductGallery({ images }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="product-gallery">
      <div className="thumbnails">
        {images.map((img, index) => (
          <div
            key={index}
            className={`thumb-item ${activeImage === img ? 'active' : ''}`}
            onClick={() => setActiveImage(img)}
          >
            {/* img placeholder */}
            <div className="thumb-placeholder"></div>
          </div>
        ))}
      </div>
      <div className="main-image">
        {/* main img placeholder */}
        <div className="main-img-placeholder"></div>
      </div>
    </div>
  );
}
