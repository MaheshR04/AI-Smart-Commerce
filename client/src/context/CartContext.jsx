import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ToastContext } from './ToastContext';
import API from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  // Fetch cart items from server
  const fetchCart = async () => {
    if (!token) {
      setCart({ products: [] });
      return;
    }
    setLoading(true);
    try {
      const response = await API.get('/cart');
      setCart(response.data.data || { products: [] });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to fetch cart:', error.message);
    }
  };

  // Sync cart when authentication changes
  useEffect(() => {
    fetchCart();
  }, [token]);

  // Add product to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      throw new Error('Please log in to add items to cart.');
    }
    try {
      const response = await API.post('/cart', { productId, quantity });
      setCart(response.data.data);
      addToast('Product successfully added to cart.', 'success');
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to add item to cart';
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  // Update item quantity
  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const response = await API.put('/cart', { productId, quantity });
      setCart(response.data.data);
      addToast('Cart item count updated.', 'success');
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update cart quantity';
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const response = await API.delete(`/cart/${productId}`);
      setCart(response.data.data);
      addToast('Item successfully removed from cart.', 'info');
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to remove item from cart';
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const response = await API.post('/cart/clear');
      setCart(response.data.data || { products: [] });
      addToast('Shopping cart cleared successfully.', 'info');
      return response.data;
    } catch (error) {
      console.error('Failed to clear cart:', error.message);
      addToast('Failed to clear cart.', 'error');
    }
  };

  // Calculated utilities
  const getCartCount = () => {
    if (!cart || !Array.isArray(cart.products)) return 0;
    return cart.products.reduce((acc, item) => acc + (item && typeof item.quantity === 'number' ? item.quantity : 0), 0);
  };

  const getCartTotal = () => {
    if (!cart || !Array.isArray(cart.products)) return 0;
    return cart.products.reduce((acc, item) => {
      if (!item || !item.productId) return acc;
      const price = typeof item.productId.discountPrice === 'number' && item.productId.discountPrice > 0 
        ? item.productId.discountPrice 
        : (typeof item.productId.price === 'number' ? item.productId.price : 0);
      const qty = typeof item.quantity === 'number' ? item.quantity : 0;
      return acc + price * qty;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
