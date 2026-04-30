import './Skeleton.css';

const Skeleton = ({ className, width, height, borderRadius, style }) => {
  const styles = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: borderRadius || '4px',
    ...style
  };

  return (
    <div 
      className={`skeleton-base ${className || ''}`} 
      style={styles}
    >
      <div className="skeleton-shimmer"></div>
    </div>
  );
};

export default Skeleton;
