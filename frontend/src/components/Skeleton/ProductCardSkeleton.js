import Skeleton from './Skeleton';
import './ProductCardSkeleton.css';

export default function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <Skeleton className="skeleton-image" height="295px" borderRadius="20px" />
      <div className="skeleton-info">
        <Skeleton width="80%" height="20px" style={{ marginBottom: '10px' }} />
        <Skeleton width="40%" height="15px" style={{ marginBottom: '10px' }} />
        <Skeleton width="30%" height="24px" />
      </div>
    </div>
  );
}
