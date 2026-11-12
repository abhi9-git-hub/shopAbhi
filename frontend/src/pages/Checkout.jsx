import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePayment = async () => {
    try {
      if (cartItems.length === 0 || !Number.isFinite(totalPrice) || totalPrice <= 0) {
        alert('Your cart is empty or has an invalid total.');
        navigate('/cart');
        return;
      }

      if (!window.Razorpay) {
        throw new Error('Payment checkout could not be loaded. Please refresh and try again.');
      }

      const orderRes = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice })
      });
      const orderData = await orderRes.json().catch(() => null);

      if (!orderRes.ok) {
        throw new Error(orderData?.message || `Payment failed to initialize (HTTP ${orderRes.status}).`);
      }

      if (!orderData?.id || !orderData.keyId) {
        throw new Error('The server did not return valid payment order details.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopAbhi',
        description: 'Test Transaction',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json().catch(() => null);
            if (!verifyRes.ok) {
              throw new Error(verifyData?.message || 'Payment verification failed.');
            }

            const saveOrderRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                items: cartItems,
                totalAmount: totalPrice,
                address,
                paymentId: response.razorpay_payment_id
              })
            });
            const savedOrder = await saveOrderRes.json().catch(() => null);

            if (!saveOrderRes.ok) {
              throw new Error(savedOrder?.message || 'Payment succeeded, but saving the order failed. Please contact support.');
            }

            if (savedOrder?.emailSent === false) {
              alert('Your order was confirmed, but we could not send the confirmation email.');
            }

            dispatch(clearCart());
            navigate('/ordersuccess');
          } catch (error) {
            console.error(error);
            alert(error.message || 'Unable to complete your order. Please contact support.');
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#f97316'
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', (response) => {
        alert(response.error?.description || 'Payment was not completed. Please try again.');
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Unable to start payment. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first");
      navigate('/login');
      return;
    }
    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn">Pay Now</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
