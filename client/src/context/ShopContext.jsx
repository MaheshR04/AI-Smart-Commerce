import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ToastContext } from './ToastContext';
import API from '../services/api';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: false,
    sort: 'newest',
    page: 1,
    limit: 24,
  });
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  // Fetch product list with filters
  const fetchProducts = async (overrideFilters = {}) => {
    setLoading(true);
    try {
      const activeFilters = { ...filters, ...overrideFilters };
      // Delete empty keys to keep query clean
      Object.keys(activeFilters).forEach((key) => {
        if (activeFilters[key] === '' || activeFilters[key] === null) {
          delete activeFilters[key];
        }
      });

      const response = await API.get('/products', { params: activeFilters });
      setProducts(response.data.data);
      setPaginationInfo({
        total: response.data.total,
        pages: response.data.pages,
        currentPage: response.data.currentPage,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to load products:', error.message);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories:', error.message);
    }
  };

  // Fetch user wishlist
  const fetchWishlist = async () => {
    if (!token) {
      setWishlist({ products: [] });
      return;
    }
    try {
      const response = await API.get('/wishlist');
      setWishlist(response.data.data || { products: [] });
    } catch (error) {
      console.error('Failed to load wishlist:', error.message);
    }
  };

  // Toggle items in wishlist
  const toggleWishlist = async (productId) => {
    if (!token) {
      addToast('Please log in to manage your wishlist.', 'error');
      throw new Error('Please log in to add items to your wishlist.');
    }

    const previousWishlist = { ...wishlist };
    const isIn = wishlist.products.some(
      (item) => item && (item._id || item).toString() === productId.toString()
    );

    let updatedProducts;
    if (isIn) {
      updatedProducts = wishlist.products.filter(
        (item) => item && (item._id || item).toString() !== productId.toString()
      );
    } else {
      const productDetail = products.find(p => p && p._id && p._id.toString() === productId.toString()) || { _id: productId };
      updatedProducts = [...wishlist.products, productDetail];
    }
    setWishlist({ ...wishlist, products: updatedProducts });

    try {
      const response = await API.post('/wishlist/toggle', { productId });
      setWishlist(response.data.data);
      
      const isAdded = response.data.data.products.some(
        (item) => item && (item._id || item).toString() === productId.toString()
      );
      if (isAdded) {
        addToast('Product added to wishlist.', 'success');
      } else {
        addToast('Product removed from wishlist.', 'info');
      }
      return response.data;
    } catch (error) {
      setWishlist(previousWishlist);
      const errMsg = error.response?.data?.message || 'Wishlist operation failed';
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!productId || !wishlist || !wishlist.products) return false;
    return wishlist.products.some((item) => {
      const itemId = item ? (item._id || item) : null;
      if (!itemId) return false;
      return itemId.toString() === productId.toString();
    });
  };

  // Load categories and wishlist on startup
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  // Trigger product fetch when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      inStock: false,
      sort: 'newest',
      page: 1,
      limit: 24,
    });
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        wishlist,
        loading,
        filters,
        paginationInfo,
        fetchProducts,
        fetchCategories,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
        updateFilters,
        resetFilters,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
