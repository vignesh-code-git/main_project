'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import './Testimonials.css';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/testimonials`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        } else {
          console.error('API did not return an array:', data);
          setReviews([]);
        }
      })
      .catch(err => {
        console.error('Error fetching testimonials:', err);
        setReviews([]);
      });
  }, []);

  const handleShowMore = () => {
    setVisibleCount(reviews.length);
  };

  return (
    <section className="testimonials container">
      <div className="testimonials-header">
        <h2>OUR HAPPY CUSTOMERS</h2>
        <div className="scroll-arrows">
          <span>←</span> <span>→</span>
        </div>
      </div>
      <div className="reviews-grid">
        {reviews.slice(0, visibleCount).map((review) => (
          <div key={review.id} className="review-card">
            <div className="stars">{"★".repeat(Math.floor(review.rating))}</div>
            <div className="reviewer-name">
              {review.User?.name || 'Customer'} <span className="verified-check">✓</span>
            </div>
            <p className="review-text">"{review.content}"</p>
          </div>
        ))}
      </div>
      {visibleCount < reviews.length && (
        <div className="view-more-container">
          <button className="view-more-reviews-btn" onClick={handleShowMore}>
            VIEW MORE
          </button>
        </div>
      )}
    </section>
  );
}
