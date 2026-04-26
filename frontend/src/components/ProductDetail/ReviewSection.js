'use client';

import { useState } from 'react';
import './ReviewSection.css';

export default function ReviewSection({ reviews = [] }) {
  const [activeTab, setActiveTab] = useState('reviews');

  return (
    <div className="review-section container">
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Product Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Rating & Reviews
        </button>
        <button 
          className={`tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >
          FAQs
        </button>
      </div>

      <div className="review-header-controls">
        <div className="review-count">
          <h3>All Reviews <span>({reviews.length})</span></h3>
        </div>
        <div className="controls">
          <button className="filter-btn">⚙️</button>
          <select className="sort-dropdown">
            <option>Latest</option>
            <option>Most Helpful</option>
          </select>
          <button className="write-review-btn">Write a Review</button>
        </div>
      </div>

      <div className="reviews-grid-detail">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-card-detail">
              <div className="review-card-header">
                <div className="stars">{"★".repeat(Math.floor(review.rating))}</div>
                <span className="dots">...</span>
              </div>
              <div className="reviewer">
                {review.User?.name || 'Anonymous'} <span className="check">✓</span>
              </div>
              <p className="review-text">{review.content}</p>
              <div className="review-date">
                Posted on {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))
        ) : (
          <div className="no-reviews" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            No reviews yet for this product.
          </div>
        )}
      </div>

      {reviews.length > 6 && (
        <div className="load-more">
          <button className="load-more-btn">Load More Reviews</button>
        </div>
      )}
    </div>
  );
}
