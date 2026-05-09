'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Package, MapPin, User, Settings, ShoppingBag, Truck, ChevronRight, X, Plus, Trash2, Edit3, Loader2, FileText, Star } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import './profile.css';

export default function UserProfile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('address');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
 
  // Review State
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isReviewEditModalOpen, setIsReviewEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
  const [isReviewDeleteModalOpen, setIsReviewDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  // Address Delete Modal State
  const [isAddressDeleteModalOpen, setIsAddressDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    country: 'India',
    isDefault: false
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    zipCode: ''
  });

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (mounted && user) {
      fetchOrders();
      fetchAddresses();
      fetchUserReviews();
      setProfileForm({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        zipCode: user.zipCode || ''
      });
    }
  }, [mounted, isAuthenticated, user, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/addresses`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/user`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setUserReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewDelete = (id) => {
    setReviewToDelete(id);
    setIsReviewDeleteModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${reviewToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchUserReviews();
        setIsReviewDeleteModalOpen(false);
        setReviewToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const openEditReviewModal = (rev) => {
    setEditingReview(rev);
    setReviewForm({ rating: rev.rating, content: rev.content });
    setIsReviewEditModalOpen(true);
  };

  const handleReviewUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        fetchUserReviews();
        setIsReviewEditModalOpen(false);
      }
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `${API_BASE_URL}/api/addresses/${currentAddressId}`
      : `${API_BASE_URL}/api/addresses`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(addressForm)
      });

      if (res.ok) {
        fetchAddresses();
        setIsAddressModalOpen(false);
        resetAddressForm();
      }
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleDeleteAddress = (id) => {
    setAddressToDelete(id);
    setIsAddressDeleteModalOpen(true);
  };

  const confirmDeleteAddress = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/addresses/${addressToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchAddresses();
        setIsAddressDeleteModalOpen(false);
        setAddressToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const openEditModal = (addr) => {
    setAddressForm({
      title: addr.title,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      phoneNumber: addr.phoneNumber || '',
      country: addr.country,
      isDefault: addr.isDefault
    });
    setCurrentAddressId(addr.id);
    setIsEditing(true);
    setIsAddressModalOpen(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      title: 'Home',
      addressLine: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: user?.phoneNumber || '',
      country: 'India',
      isDefault: false
    });
    setIsEditing(false);
    setCurrentAddressId(null);
  };

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsSuccessModal(false);
    setIsCancelModalOpen(true);
  };

  const executeCancel = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${selectedOrderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        setIsSuccessModal(true);
        fetchOrders(); // Refresh order list
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel order');
        setIsCancelModalOpen(false);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('An error occurred while cancelling the order');
      setIsCancelModalOpen(false);
    }
  };

  const handleTrackOrder = (order) => {
    router.push(`/track-order/${order.id}`);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setDeleteError('Please type the confirmation phrase exactly.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: deletePassword })
      });

      if (res.ok) {
        // Clear local storage and redirect to home
        localStorage.clear();
        window.location.href = '/';
      } else {
        const data = await res.json();
        setDeleteError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError('An error occurred. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!mounted || !user) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-page-container">
      <div className="container profile-layout">

        {/* Sidebar Navigation */}
        <aside className="profile-sidebar">
          <div className="user-info-brief">
            <div className="avatar-large">{user.name.charAt(0).toUpperCase()}</div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>

          <nav className="profile-nav">
            <button
              className={activeTab === 'address' ? 'active' : ''}
              onClick={() => setActiveTab('address')}
            >
              <MapPin size={20} /> Addresses
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={20} /> My Reviews
            </button>
            <button
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} /> Profile Settings
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="profile-main-content">


          {activeTab === 'address' && (
            <div className="address-view">
              <header className="view-header">
                <h2>Saved Addresses</h2>
                <p>Manage your shipping and billing locations.</p>
              </header>

              <div className="address-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                    <div className="card-header">
                      <h3>{addr.title}</h3>
                      {addr.isDefault && <span className="tag">DEFAULT</span>}
                    </div>
                    <p>{addr.addressLine}</p>
                    {addr.phoneNumber && <p style={{ fontWeight: '500', color: '#000', margin: '4px 0' }}>Phone: {addr.phoneNumber}</p>}
                    <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                    <p>{addr.country}</p>
                    <div className="card-actions">
                      <button onClick={() => openEditModal(addr)}>Edit</button>
                      <button onClick={() => handleDeleteAddress(addr.id)}>Remove</button>
                    </div>
                  </div>
                ))}

                <button className="add-address-card" onClick={() => { resetAddressForm(); setIsAddressModalOpen(true); }}>
                  <div className="add-circle">+</div>
                  <span>Add New Address</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view">
              <header className="view-header">
                <h2>Profile Settings</h2>
                <p>Update your personal information and preferences.</p>
              </header>

              <form className="settings-form" onSubmit={handleProfileSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" maxLength="10" pattern="\d{10}" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value.replace(/\D/g, '')})} placeholder="10-digit mobile number" />
                  </div>
                  <div className="form-group">
                    <label>Zipcode / Location</label>
                    <input type="text" value={profileForm.zipCode} onChange={(e) => setProfileForm({...profileForm, zipCode: e.target.value})} placeholder="400001" />
                  </div>
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>

              {/* DELETE ACCOUNT Section */}
              <div className="danger-zone-section">
                <div className="danger-header">
                  <h3>DELETE ACCOUNT</h3>
                  <p>Actions here are permanent and cannot be undone.</p>
                </div>

                <div className="danger-card">
                  <div className="danger-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data. This action is irreversible.</p>
                  </div>
                  <button 
                    className="delete-account-trigger" 
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-view">
              <header className="view-header">
                <h2>My Reviews</h2>
                <p>Manage the feedback you've shared with the community.</p>
              </header>

              <div className="user-reviews-list">
                {loadingReviews ? (
                  <div className="loading-state-box" style={{ padding: '40px', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" style={{ margin: '0 auto 12px' }} /> 
                    <p>Loading your reviews...</p>
                  </div>
                ) : userReviews.length > 0 ? (
                  userReviews.map((rev) => (
                    <div key={rev.id} className="user-review-card">
                      <div className="review-card-top">
                        <div className="product-info-mini">
                          <img 
                            src={rev.Product?.images?.[0]?.url || '/placeholder.png'} 
                            alt={rev.Product?.name} 
                            className="mini-p-img"
                          />
                          <div className="p-text-meta">
                            <h4>{rev.Product?.name}</h4>
                            <div className="user-stars">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  fill={i < rev.rating ? "#FFC633" : "transparent"} 
                                  color="#FFC633" 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="review-actions">
                          <button className="edit-rev-btn" title="Edit Review" onClick={() => openEditReviewModal(rev)}>
                            <Edit3 size={18} />
                          </button>
                          <button className="delete-rev-btn" title="Delete Review" onClick={() => handleReviewDelete(rev.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="review-body">"{rev.content}"</p>
                      <span className="review-date-stamp">
                        Published on {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-reviews">
                    <ShoppingBag size={48} />
                    <p>You haven't reviewed any products yet.</p>
                    <button onClick={() => router.push('/shop')} className="go-shop-btn">Go Shopping</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Account Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-account-modal">
            <div className="modal-header">
              <div className="warning-icon-wrapper">!</div>
              <h2>Delete Your Account?</h2>
              <button className="modal-close-btn" onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteError('');
                setDeletePassword('');
                setDeleteConfirmText('');
              }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="main-warning">
                This action is <strong>permanent</strong> and cannot be undone. 
                All your orders, addresses, and account history will be permanently removed.
              </p>

              <form onSubmit={handleDeleteAccount}>
                <div className="form-group">
                  <label>Confirm your password</label>
                  <input 
                    type="password" 
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>To confirm, type <strong>DELETE MY ACCOUNT</strong> in the box below</label>
                  <input 
                    type="text" 
                    placeholder="DELETE MY ACCOUNT"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    required
                    className="confirm-type-input"
                  />
                </div>

                {deleteError && <div className="delete-error-msg">{deleteError}</div>}

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="cancel-delete-btn" 
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="final-delete-btn"
                    disabled={isDeletingAccount || !deletePassword || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  >
                    {isDeletingAccount ? <Loader2 className="animate-spin" /> : 'Permanently Delete Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setIsAddressModalOpen(false);
        }}>
          <div className="address-modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
              <button className="modal-close-btn" onClick={() => setIsAddressModalOpen(false)}><X size={24} strokeWidth={2} /></button>
            </div>
            <form onSubmit={handleAddressSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Title (e.g. Home, Office)</label>
                  <input
                    type="text"
                    value={addressForm.title}
                    onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address Line</label>
                <input
                  type="text"
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  maxLength="10"
                  pattern="\d{10}"
                  placeholder="10-digit mobile number"
                  value={addressForm.phoneNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>
              <div className="form-row three-col">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', opacity: addresses.some(a => a.isDefault && a.id !== currentAddressId) ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    disabled={addresses.some(a => a.isDefault && a.id !== currentAddressId)}
                    style={{ margin: '0 10px 0 0', width: '20px', height: '20px' }}
                  />
                  Set as default address
                  {addresses.some(a => a.isDefault && a.id !== currentAddressId) && (
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>(Another address is already default)</span>
                  )}
                </label>
              </div>
              <button type="submit" className="submit-btn">
                {isEditing ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Professional Cancellation Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={isSuccessModal ? () => setIsCancelModalOpen(false) : executeCancel}
        title={isSuccessModal ? "Order Cancelled" : "Cancel Order?"}
        message={isSuccessModal
          ? "Your order has been successfully cancelled. The stock has been restored to the inventory."
          : "Are you sure you want to cancel this order? This action will restore the product stock and cannot be undone."}
        confirmText={isSuccessModal ? "Close" : "Yes, Cancel Order"}
        cancelText={isSuccessModal ? "" : "No, Keep Order"}
      />

      {/* Professional Address Deletion Modal */}
      <ConfirmModal
        isOpen={isAddressDeleteModalOpen}
        onClose={() => setIsAddressDeleteModalOpen(false)}
        onConfirm={confirmDeleteAddress}
        title="Remove Address"
        message="Are you sure you want to remove this address? This action cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Cancel"
      />

      {/* Review Delete Modal */}
      <ConfirmModal
        isOpen={isReviewDeleteModalOpen}
        onClose={() => setIsReviewDeleteModalOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Delete Review?"
        message="Are you sure you want to delete this review? This will also remove your rating from the product's average score."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      {/* Edit Review Modal */}
      {isReviewEditModalOpen && (
        <div className="modal-overlay">
          <div className="review-modal">
            <div className="modal-header">
              <h2>Edit Your Review</h2>
              <button className="modal-close-btn" onClick={() => setIsReviewEditModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleReviewUpdate}>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-stars-input">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s}
                      size={32}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      fill={s <= reviewForm.rating ? "#FFC633" : "transparent"}
                      color="#FFC633"
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Feedback</label>
                <textarea 
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className="save-btn">Update Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

