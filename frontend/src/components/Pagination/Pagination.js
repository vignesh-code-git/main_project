import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const current = parseInt(currentPage) || 1;
  const total = parseInt(totalPages) || 1;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    const safeTotal = Math.max(1, total);

    if (safeTotal <= showMax) {
      for (let i = 1; i <= safeTotal; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(safeTotal - 1, current + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (current < safeTotal - 2) pages.push('...');
      pages.push(safeTotal);
    }
    return pages;
  };

  return (
    <div className="pg-main-container">
      <button 
        className="pg-nav-button" 
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
      >
        <ChevronLeft size={18} />
        <span>Previous</span>
      </button>

      <div className="pg-number-group">
        {getPageNumbers().map((num, index) => (
          num === '...' ? (
            <span key={`dots-${index}`} className="pg-dots-item">...</span>
          ) : (
            <button
              key={num}
              className={`pg-number-item ${current === parseInt(num) ? 'pg-active' : ''}`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          )
        ))}
      </div>

      <button 
        className="pg-nav-button" 
        onClick={() => onPageChange(current + 1)}
        disabled={current >= total}
      >
        <span>Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
