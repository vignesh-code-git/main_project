'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Package, Clock, CheckCircle, Truck, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './orders-page.css';

export default function OrdersPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/user/${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle size={18} className="status-icon delivered" />;
      case 'shipped': return <Truck size={18} className="status-icon shipped" />;
      default: return <Clock size={18} className="status-icon processing" />;
    }
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
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Manage and track your recent orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <Package size={64} />
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see them here!</p>
          <a href="/shop" className="start-shopping-btn">Start Shopping</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-main-info">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id.toString().padStart(6, '0')}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className={`order-status ${order.status.toLowerCase()}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              <div className="order-details-summary">
                <div className="order-items-preview">
                  {order.OrderItems?.map((item, idx) => (
                    <div key={idx} className="preview-item">
                      <img src={`http://localhost:5000${item.Product?.images?.[0]?.url || '/placeholder.png'}`} alt={item.Product?.name} />
                      <div className="item-info">
                        <p className="item-name">{item.Product?.name}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-actions">
                  <div className="order-total">
                    <span>Total Amount</span>
                    <p>₹{order.totalAmount}</p>
                  </div>
                  <button className="view-details-btn">
                    Order Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
