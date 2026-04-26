import './Pagination.css';

export default function Pagination() {
  return (
    <div className="pagination">
      <button className="nav-btn prev">← Previous</button>
      <div className="page-numbers">
        <span className="page-num active">1</span>
        <span className="page-num">2</span>
        <span className="page-num">3</span>
        <span className="dots">...</span>
        <span className="page-num">8</span>
        <span className="page-num">9</span>
        <span className="page-num">10</span>
      </div>
      <button className="nav-btn next">Next →</button>
    </div>
  );
}
