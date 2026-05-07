'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronLeft, Phone, ShieldCheck, Box } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders, resolveImageUrl } from '@/config/api';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import './track-order.css';

export default function TrackOrder() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleCancelOrder = () => {
    setIsSuccessModal(false);
    setIsModalOpen(true);
  };

  const executeCancel = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${order.id}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setIsSuccessModal(true);
        // We will reload on success modal close
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel order');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('An error occurred while cancelling the order');
      setIsModalOpen(false);
    }
  };


  if (loading) return <div className="track-loading-overlay">Locating your package...</div>;
  if (!order) return <div className="track-error-container">Order not found</div>;

  const steps = [
    { label: 'Order Placed', status: 'Pending', icon: <Box size={20} />, date: new Date(order.createdAt).toLocaleString() },
    { label: 'Processing', status: 'Processing', icon: <Clock size={20} />, date: 'In progress' },
    { label: 'Shipped', status: 'Shipped', icon: <Truck size={20} />, date: 'Expected soon' },
    { label: 'Delivered', status: 'Delivered', icon: <CheckCircle2 size={20} />, date: 'Final destination' }
  ];

  // Logic to determine current step index
  const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStatusIndex = statusOrder.indexOf(order.status);
  const finalIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;

  return (
    <div className="track-page-wrapper">
      <div className="container track-container">
        <button className="back-to-profile" onClick={() => router.push('/orders')}>
          <ChevronLeft size={18} /> Back to My Orders
        </button>

        <div className="track-header-premium">
          <div className="header-main">
            <h1>Track Your Order</h1>
            <div className="order-badges">
              <span className="badge-id">#{order.id.toString().slice(-8).toUpperCase()}</span>
              <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
          </div>
          <div className="tracking-meta">
            <div className="meta-item">
              <label>Tracking Number</label>
              <strong>{order.trackingNumber || 'TCK-' + order.id.toString().slice(-6).toUpperCase()}</strong>
            </div>
            <div className="meta-item">
              <label>Courier Partner</label>
              <strong>BlueDart Express</strong>
            </div>
          </div>
        </div>

        <div className="track-grid">
          {/* Left Column: Progress Timeline */}
          <div className="track-timeline-card">
            <div className="card-inner-header">
              <h3>Shipment Status</h3>
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="timeline-v2">
              {steps.map((step, index) => {
                const isCompleted = index <= finalIndex;
                const isCurrent = index === finalIndex;

                return (
                  <div key={index} className={`timeline-step-v2 ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-marker-v2">
                      <div className="icon-circle-v2">
                        {isCompleted && !isCurrent ? <CheckCircle2 size={24} fill="#22C55E" color="#FFF" /> : step.icon}
                      </div>
                      {index < steps.length - 1 && <div className="step-line-v2" />}
                    </div>
                    <div className="step-info-v2">
                      <h4>{step.label}</h4>
                      <p>{isCompleted ? (step.date) : 'Pending'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shipment-footer-desc">
              <div className="desc-content-v3">
                <CheckCircle2 size={20} className="desc-icon" />
                <p>Our courier partner is currently processing your shipment. You will receive a notification once the status changes to "Shipped". For any queries, please contact our support team.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="track-details-sidebar">
            <div className="delivery-address-card">
              <div className="sidebar-section-title">
                <MapPin size={18} /> Shipping Address
              </div>
              <div className="address-content-v2">
                <strong>{order.User?.name || 'Customer'}</strong>
                <p>{order.shippingAddress}</p>
                <p>Zipcode: {order.zipcode}</p>
                {order.User?.phoneNumber && (
                  <div className="phone-verified">
                    <Phone size={14} /> {order.User.phoneNumber} <span className="verified-tag">VERIFIED</span>
                  </div>
                )}
              </div>
            </div>

            <div className="order-summary-mini">
              <div className="sidebar-section-title">
                <Package size={18} /> Order Items
              </div>
              <div className="mini-item-list">
                {order.OrderItems?.map((item, idx) => (
                  <div key={idx} className="mini-item">
                    <div className="item-img-small">
                      {(() => {
                        const allImages = [...(item.Product?.images || [])].sort((a, b) => a.id - b.id);
                        const colorImage = allImages.find(img =>
                          img.color && item.color &&
                          img.color.trim().toLowerCase() === item.color.trim().toLowerCase()
                        ) || allImages.find(img => !img.color);
                        const imgUrl = colorImage ? colorImage.url : (allImages[0]?.url || '/placeholder.png');
                        return (
                          <img
                            src={resolveImageUrl(imgUrl)}
                            alt={item.Product?.name}
                          />
                        );
                      })()}
                    </div>
                    <div className="item-txt">
                      <div className="item-name">{item.Product?.name}</div>
                      <div className="item-meta">Qty: {item.quantity} | Size: {item.size}</div>
                      {item.color && (
                        <div className="item-color-preview">
                          <span className="color-label-mini">Color:</span>
                          <span className="color-swatch-mini" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                          <span className="color-value-mini">{item.color}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mini-footer">
                <div className="footer-meta">
                  <span className="meta-label">Payment Method</span>
                  <div className="payment-method-info">
                    {order.Payments?.[0]?.method === 'cod' ? (
                      <span className="cod-badge-mini">Cash on Delivery</span>
                    ) : (
                      <>
                        <ShieldCheck size={14} color="#2D6CFF" />
                        <span>{order.Payments?.[0]?.method || 'Credit/Debit Card'}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="footer-amount">
                  <span>Total Amount</span>
                  <strong>₹{order.totalAmount}</strong>
                </div>
              </div>

              {['Pending', 'Processing', 'Placed'].includes(order.status) && (
                <button className="track-cancel-btn" onClick={handleCancelOrder}>
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={isSuccessModal ? () => window.location.reload() : executeCancel}
        title={isSuccessModal ? "Order Cancelled" : "Cancel Order?"}
        message={isSuccessModal
          ? "Your order has been successfully cancelled. The stock has been restored."
          : "Are you sure you want to cancel this order? This action will restore stock and cannot be undone."}
        confirmText={isSuccessModal ? "Close" : "Yes, Cancel Order"}
        cancelText={isSuccessModal ? "" : "No, Keep Order"}
      />
    </div>
  );
}
