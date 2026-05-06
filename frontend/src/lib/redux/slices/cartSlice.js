import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (item, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/cart`, item, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ id, quantity, size, color }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/cart/${id}`, { quantity, size, color }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const clearUserCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.map(item => {
          // Prioritize exact color match, then generic images (matching Gallery logic)
          const colorMatches = item.Product.images?.filter(img => 
            img.color && item.color && img.color.trim().toLowerCase() === item.color.trim().toLowerCase()
          ) || [];
          const genericImages = item.Product.images?.filter(img => !img.color) || [];
          const colorImage = colorMatches[0] || genericImages[0];
          
          return {
            cartItemId: item.id,
            id: item.productId,
            name: item.Product.name,
            price: item.Product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: (() => {
              const url = colorImage ? colorImage.url : (item.Product.images?.[0]?.url || '');
              if (!url) return '';
              return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            })()
          };
        });
        state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        state.loading = false;
      })
      // Add Item
      .addCase(addItemToCart.fulfilled, (state, action) => {
        // Find if item exists and update it, otherwise add new
        const newItem = action.payload;
        const existingItem = state.items.find(item => 
          item.id === newItem.productId && 
          item.size === newItem.size && 
          item.color === newItem.color
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          // Note: Full object details might be missing, so fetchCart is still good, 
          // but we increment totalQuantity for instant feedback
          state.totalQuantity += newItem.quantity;
        }
        state.loading = false;
      })
      // Remove Item
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.cartItemId !== action.payload);
        state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      })
      // Update Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const itemIndex = state.items.findIndex(item => item.cartItemId === updatedItem.id);
        if (itemIndex !== -1) {
          state.items[itemIndex].quantity = updatedItem.quantity;
          state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
      })
      // Clear Cart
      .addCase(clearUserCart.fulfilled, (state) => {
        state.items = [];
        state.totalAmount = 0;
        state.totalQuantity = 0;
      });
  }
});

export default cartSlice.reducer;
