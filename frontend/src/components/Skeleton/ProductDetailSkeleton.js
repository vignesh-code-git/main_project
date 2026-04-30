import Skeleton from './Skeleton';
import './ProductDetailSkeleton.css';

export default function ProductDetailSkeleton() {
  return (
    <div className="product-detail-skeleton container">
      <div className="skeleton-gallery-section">
        <div className="skeleton-thumbnails">
          {[...Array(3)].map((_, i) => <Skeleton key={i} width="100px" height="100px" borderRadius="10px" />)}
        </div>
        <Skeleton className="skeleton-main-image" height="500px" borderRadius="20px" />
      </div>
      <div className="skeleton-info-section">
        <Skeleton width="70%" height="40px" style={{ marginBottom: '20px' }} />
        <Skeleton width="30%" height="30px" style={{ marginBottom: '20px' }} />
        <div className="skeleton-price-row">
          <Skeleton width="100px" height="35px" />
          <Skeleton width="80px" height="25px" />
        </div>
        <Skeleton width="100%" height="100px" style={{ marginTop: '30px', marginBottom: '30px' }} />
        <div className="skeleton-options">
          <Skeleton width="150px" height="25px" style={{ marginBottom: '10px' }} />
          <div className="skeleton-circles">
            {[...Array(3)].map((_, i) => <Skeleton key={i} width="40px" height="40px" className="skeleton-circle" />)}
          </div>
        </div>
        <div className="skeleton-actions" style={{ marginTop: '40px' }}>
          <Skeleton width="200px" height="50px" className="skeleton-button" />
          <Skeleton width="300px" height="50px" className="skeleton-button" />
        </div>
      </div>
    </div>
  );
}
