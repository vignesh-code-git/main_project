import Skeleton from "@/components/Skeleton/Skeleton";

export default function Loading() {
  return (
    <div className="container" style={{ padding: '100px 20px' }}>
      <Skeleton width="50%" height="40px" style={{ marginBottom: '40px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '30px' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Skeleton height="300px" borderRadius="20px" />
            <Skeleton width="80%" height="20px" />
            <Skeleton width="40%" height="15px" />
          </div>
        ))}
      </div>
    </div>
  );
}
