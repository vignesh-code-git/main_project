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
    <>
      <Breadcrumbs paths={breadcrumbPaths} />
      <div className="container cart-main">
        <h1>YOUR CART</h1>
        
        <div className="cart-content-wrapper">
          <div className="cart-items-list">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))
            ) : (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
              </div>
            )}
          </div>
          
          <OrderSummary />
        </div>
      </div>
    </>
  );
}
