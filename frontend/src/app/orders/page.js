'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Package, Clock, CheckCircle, Truck, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/redux/slices/cartSlice';
import './orders-page.css';

export default function OrdersPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      fetchOrders();
    } else if (mounted && !isAuthenticated) {
      setLoading(false);
    }
  }, [mounted, isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/user/${user.id}`);
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

  const handleBuyAgain = (item) => {
    const productToAdd = {
      id: item.Product.id,
      name: item.Product.name,
      price: item.price,
      quantity: 1,
      images: item.Product.images,
      size: item.size || 'M',
      color: item.color || 'Black'
    };
    dispatch(addItem(productToAdd));
    alert(`${item.Product.name} added to cart!`);
  };

  const handleInvoice = (order) => {
    window.open(`${API_BASE_URL}/api/orders/${order.id}/invoice`, '_blank');
  };

  const handleGenericAction = (action) => {
    alert(`${action} feature coming soon!`);
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
            <div key={order.id} className="order-card-premium">
              <div className="order-card-header">
                <div className="header-left">
                  <div className="info-group">
                    <span className="label">ORDER PLACED</span>
                    <span className="value">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">TOTAL</span>
                    <span className="value">₹{order.totalAmount}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">SHIP TO</span>
                    <span className="value user-name">{user.name}</span>
                  </div>
                </div>
                <div className="header-right">
                  <div className="info-group align-right">
                    <span className="label">ORDER # {order.id.toString().slice(-8).toUpperCase()}</span>
                    <div className="header-links">
                      <button className="text-link" onClick={() => handleGenericAction('Order Details')}>Order Details</button>
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

                  <div className="items-list">
                    {order.OrderItems?.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <div className="item-image-wrapper">
                          <img 
                            src={item.Product?.images?.[0]?.url?.startsWith('http') 
                              ? item.Product.images[0].url 
                              : `${API_BASE_URL}${item.Product?.images?.[0]?.url || '/placeholder.png'}`} 
                            alt={item.Product?.name} 
                          />
                        </div>
                        <div className="item-details">
                          <a href={`/product/${item.Product?.id}`} className="item-title">{item.Product?.name}</a>
                          <p className="item-meta">Quantity: {item.quantity}</p>
                          <button className="buy-again-btn" onClick={() => handleBuyAgain(item)}>Buy it again</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="body-right">
                  <div className="action-buttons">
                    <button className="primary-action-btn" onClick={() => window.location.href=`/track-order/${order.id}`}>Track package</button>
                    <button className="secondary-action-btn" onClick={() => handleGenericAction('Returns')}>Return or replace items</button>
                    <button className="secondary-action-btn" onClick={() => handleGenericAction('Feedback')}>Leave delivery feedback</button>
                    <button className="secondary-action-btn" onClick={() => handleGenericAction('Reviews')}>Write a product review</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
