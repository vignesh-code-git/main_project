'use client';

import { useSelector } from 'react-redux';
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import CartItem from "@/components/Cart/CartItem";
import OrderSummary from "@/components/Cart/OrderSummary";
import './cart-page.css';

export default function CartPage() {
  const cartItems = useSelector((state) => state.cart.items);

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: 'Cart', url: '/cart' },
  ];

  return (
    <main className="cart-page-main">
      <div className="container">
        <Breadcrumbs paths={breadcrumbPaths} />
        <h1 className="cart-page-title">YOUR CART</h1>
        
        <div className="cart-content-layout">
          <div className="cart-items-container">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))
            ) : (
              <div className="empty-cart-message">
                <p>Your cart is empty.</p>
              </div>
            )}
          </div>
          
          <div className="cart-summary-container">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  );
}
