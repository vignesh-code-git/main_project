'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, Settings2, Star, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import './ReviewSection.css';

export default function ReviewSection({ productId }) {
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all unworn and unwashed items. Simply visit our returns portal to start the process."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout."
    },
    {
      question: "Are your sizes true to fit?",
      answer: "Yes, our clothes generally follow standard sizing. We recommend checking our size guide for detailed measurements."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and times vary by location."
    },
    {
      question: "How should I care for my garments?",
      answer: "Most of our items are machine washable. We recommend washing in cold water and air drying to maintain quality."
    }
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/product/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Form state
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to write a review');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          rating,
          content,
          productId,
          userId: user.id
        })
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setShowModal(false);
        setRating(5);
        setContent('');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

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

      {activeTab === 'reviews' && (
        <>
          <div className="review-header-controls">
            <div className="review-count">
              <h3>All Reviews <span>({reviews.length})</span></h3>
            </div>
            <div className="controls">
              <button className="filter-btn"><Settings2 size={20} /></button>
              <select className="sort-dropdown desktop-only">
                <option>Latest</option>
                <option>Most Helpful</option>
              </select>
              <button 
                className="write-review-btn"
                onClick={() => {
                  if (!isAuthenticated) {
                    alert('Please login to write a review');
                    return;
                  }
                  setShowModal(true);
                }}
              >
                Write a Review
              </button>
            </div>
          </div>

          <div className="reviews-grid-detail">
            {loadingReviews ? (
              <div className="loading-reviews" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto' }} />
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="review-card-detail">
                  <div className="review-card-header">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          fill={i < Math.floor(review.rating) ? "#FFC633" : "transparent"} 
                          color="#FFC633" 
                        />
                      ))}
                    </div>
                    <span className="dots">...</span>
                  </div>
                  <div className="reviewer">
                    {review.User?.name || 'Anonymous'} <CheckCircle2 size={18} fill="#01AB31" color="white" />
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
        </>
      )}

      {activeTab === 'faqs' && (
        <div className="faq-container">
          <div className="faq-header">
            <h3>Frequently Asked Questions</h3>
            <p>Everything you need to know about our products and services.</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="product-details-tab">
          <div className="details-header">
            <h3>Product Information</h3>
          </div>
          <div className="details-content">
            <p>This premium quality garment is crafted with meticulous attention to detail. Designed for both style and comfort, it features high-grade materials that ensure durability and a perfect fit.</p>
            <ul className="details-specs">
              <li><strong>Material:</strong> 100% Premium Cotton</li>
              <li><strong>Origin:</strong> Sustainably sourced and manufactured</li>
              <li><strong>Fit:</strong> Contemporary classic fit</li>
              <li><strong>Care:</strong> Machine wash cold, tumble dry low</li>
            </ul>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="review-modal">
            <div className="modal-header">
              <h3>Write a Review</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={32}
                      onClick={() => setRating(star)}
                      fill={star <= rating ? "#FFC633" : "transparent"}
                      color="#FFC633"
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us about your experience..."
                  required
                  rows={5}
                ></textarea>
              </div>
              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? <><Loader2 className="animate-spin" size={20} /> Submitting...</> : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
