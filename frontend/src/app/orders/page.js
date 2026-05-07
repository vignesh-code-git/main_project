'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Package, Clock, CheckCircle, Truck, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '@/lib/redux/slices/cartSlice';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import OrderActionModal from '@/components/OrderActionModal/OrderActionModal';
import './orders-page.css';

export default function OrdersPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isAuthenticated && user?.id) {
        fetchOrders();
      } else if (!isAuthenticated) {
        setLoading(false);
      }
    }
  }, [mounted, isAuthenticated, user?.id]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/user/${user.id}`, {
        headers: getAuthHeaders()
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Success Modal State
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '' });

  // Action Modal State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);

  const handleBuyAgain = async (item) => {
    try {
      await dispatch(addItemToCart({
        productId: item.Product.id,
        quantity: 1,
        size: item.size || 'M',
        color: item.color || 'Black'
      })).unwrap();

      setSuccessData({
        title: 'Added to Cart',
        message: `${item.Product.name} has been successfully added to your shopping cart.`
      });
      setIsSuccessOpen(true);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    }
  };

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsSuccessModal(false);
    setIsModalOpen(true);
  };

  const executeCancel = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/orders/${selectedOrderId}/cancel`, {}, {
        headers: getAuthHeaders()
      });

      if (res.status === 200) {
        setIsSuccessModal(true);
        fetchOrders();
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'An error occurred while cancelling the order');
      setIsModalOpen(false);
    }
  };

  const handleInvoice = async (order) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/invoice`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Unauthorized or failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order.id.toString().slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Invoice error:', err);
      alert('Could not download invoice. Please try again.');
    }
  };

  const handleAction = (type, order) => {
    setActionModalType(type);
    setActiveOrder(order);
    setIsActionModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container orders-page loading">
        <div className="skeleton-title"></div>
        <div className="skeleton-order"></div>
        <div className="skeleton-order"></div>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <header className="orders-header">
        <h1 className="orders-title">MY ORDERS</h1>
        <p className="orders-subtitle">Manage and track your recent orders</p>
      </header>

      {orders.length === 0 ? (
        <div className="no-orders">
          <Package size={64} />
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see them here!</p>
          <a href="/shop" className="start-shopping-btn">Start Shopping</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.filter(order => order.status !== 'Cancelled').map((order) => (
            <div key={order.id} className="order-card-premium">
              <div className="order-card-header">
                <div className="header-left">
                  <div className="info-group">
                    <span className="label">ORDER PLACED</span>
                    <span className="value">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      <span style={{ marginLeft: '8px', color: 'rgba(0,0,0,0.4)', fontWeight: '500' }}>
                        at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                  </div>
                  <div className="info-group">
                    <span className="label">TOTAL</span>
                    <span className="value">₹{order.totalAmount}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">SHIP TO</span>
                    <span className="value user-name">{user.name}</span>
                    <span className="shipping-address" title={`${order.shippingAddress} - ${order.zipcode}`}>
                      {order.shippingAddress} - {order.zipcode}
                    </span>
                  </div>
                </div>
                <div className="header-right">
                  <div className="info-group align-right">
                    <span className="label">ORDER # {order.id.toString().slice(-8).toUpperCase()}</span>
                    <div className="header-links">
                      <button className="text-link" onClick={() => handleAction('Order Details', order)}>Order Details</button>
                      <span className="divider">|</span>
                      <button className="text-link" onClick={() => handleInvoice(order)}>Invoice</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-card-body">
                <div className="body-left">
                  <div className="status-container">
                    <h3 className={`status-text ${order.status.toLowerCase()}`}>
                      {order.status === 'Delivered' ? 'Delivered' : `Arriving soon`}
                    </h3>
                    <p className="status-subtext">
                      {order.status === 'Delivered'
                        ? `Package was delivered on ${new Date(order.updatedAt || order.createdAt).toLocaleDateString()}`
                        : `Your order is ${order.status.toLowerCase()}`}
                    </p>
                  </div>
                  <div className="items-details-list">
                    {order.OrderItems?.map((item, idx) => {
                      const allImages = [...(item.Product?.images || [])].sort((a, b) => a.id - b.id);
                      const colorImage = allImages.find(img =>
                        img.color && item.color &&
                        img.color.trim().toLowerCase() === item.color.trim().toLowerCase()
                      ) || allImages.find(img => !img.color);
                      const imgUrl = colorImage ? colorImage.url : (allImages[0]?.url || '/placeholder.png');

                      return (
                        <div key={idx} className="item-detail-entry row-layout">
                          <div className="item-image-col">
                            <div className="order-item-thumb">
                              <img
                                src={imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`}
                                alt={item.Product?.name}
                              />
                            </div>
                          </div>
                          <div className="detail-main">
                            <div className="detail-header-row">
                              <a href={`/product/${item.Product?.id}`} className="item-title">{item.Product?.name}</a>
                              <button className="buy-again-btn-lite" onClick={() => handleBuyAgain(item)}>Buy it again</button>
                            </div>
                            <div className="item-variant-info">
                              {item.color && (
                                <span className="variant-tag color-prop-history">
                                  <span className="color-label-mini">Color:</span>
                                  <span className="color-swatch-mini" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                                  <strong>{item.color}</strong>
                                </span>
                              )}
                              {item.size && <span className="variant-tag size">Size: <strong>{item.size}</strong></span>}
                              <span className="variant-tag qty">Qty: <strong>{item.quantity}</strong></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="body-right">
                  <div className="action-buttons">
                    <button className="primary-action-btn" onClick={() => router.push(`/track-order/${order.id}`)}>Track package</button>
                    {['Pending', 'Processing', 'Placed'].includes(order.status) && (
                      <button className="secondary-action-btn cancel-btn-red" onClick={() => handleCancelOrder(order.id)}>Cancel order</button>
                    )}
                    {order.status === 'Delivered' && (
                      <>
                        <button className="secondary-action-btn" onClick={() => handleAction('Return', order)}>Return or replace items</button>
                        <button className="secondary-action-btn" onClick={() => handleAction('Feedback', order)}>Leave delivery feedback</button>
                        <button className="secondary-action-btn" onClick={() => handleAction('Reviews', order)}>Write a product review</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      <OrderActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        type={actionModalType}
        order={activeOrder}
      />

      {/* Professional Cancellation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={isSuccessModal ? () => setIsModalOpen(false) : executeCancel}
        title={isSuccessModal ? "Order Cancelled" : "Cancel Order?"}
        message={isSuccessModal
          ? "Your order has been successfully cancelled. The stock has been restored to the inventory."
          : "Are you sure you want to cancel this order? This action will restore the product stock and cannot be undone."}
        confirmText={isSuccessModal ? "Close" : "Yes, Cancel Order"}
        cancelText={isSuccessModal ? "" : "No, Keep Order"}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successData.title}
        message={successData.message}
        onAction={() => router.push('/cart')}
      />
    </div>
  );
}
