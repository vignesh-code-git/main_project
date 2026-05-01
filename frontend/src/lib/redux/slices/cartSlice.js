import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (item, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cart`, item, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ id, quantity, size, color }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/cart/${id}`, { quantity, size, color }, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/${id}`, { withCredentials: true });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const clearUserCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart`, { withCredentials: true });
      return null;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
        state.items = action.payload.map(item => ({
          cartItemId: item.id,
          id: item.productId,
          name: item.Product.name,
          price: item.Product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.Product.images?.[0]?.url || ''
        }));
        state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        state.loading = false;
      })
      // Add Item
      .addCase(addItemToCart.fulfilled, (state, action) => {
        // After adding, we re-fetch to keep it simple and accurate
        state.loading = false;
      })
      // Remove Item
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.cartItemId !== action.payload);
        state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
