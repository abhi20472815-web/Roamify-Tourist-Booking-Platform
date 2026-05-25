import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PackagePlus, FileText, Users, IndianRupee, Plus, Trash2, Edit3, CheckCircle, XCircle, RefreshCw, Layers } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, packages, bookings, users
  
  // Dashboard Analytics
  const [stats, setStats] = useState({
    total_packages: 0,
    total_bookings: 0,
    total_users: 0,
    total_revenue: 0,
    recent_bookings: []
  });
  
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Package Modal State (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // add, edit
  const [editingPackageId, setEditingPackageId] = useState(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formRating, setFormRating] = useState('5.0');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formFacilities, setFormFacilities] = useState('Free Wi-Fi, Hotel Resort, Meals, Tour Guide');
  const [formItinerary, setFormItinerary] = useState([
    { day: 1, title: 'Arrival & Leisure', description: 'Arrive at destination, check into hotel, and spend evening exploring local sights.' },
    { day: 2, title: 'Sightseeing Tour', description: 'Full day tour of major attractions and cultural heritage landmarks.' },
    { day: 3, title: 'Adventure & Departure', description: 'Morning outdoor activities, shopping, and checkout for departure.' }
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      // Fetch packages
      const pkgsRes = await api.get('/packages');
      setPackages(pkgsRes.data);

      // Fetch all bookings
      const bookingsRes = await api.get('/bookings');
      setBookings(bookingsRes.data);

      // Fetch all users
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
      
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      toast.error("Failed to load dashboard data! Verify database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Booking Status
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.status === 200) {
        toast.success(`Booking status updated to ${newStatus}!`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update booking status!");
    }
  };

  // Delete package
  const handleDeletePackage = async (packageId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this package? Associated bookings will also be cancelled.");
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/packages/${packageId}`);
      if (res.status === 200) {
        toast.success("Package deleted successfully!");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete package!");
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setModalType('add');
    setEditingPackageId(null);
    setFormTitle('');
    setFormLocation('');
    setFormDuration('');
    setFormPrice('');
    setFormRating('5.0');
    setFormDescription('');
    setFormImage('');
    setFormFacilities('Free Wi-Fi, Hotel Resort, Meals, Tour Guide');
    setFormItinerary([
      { day: 1, title: 'Arrival & Leisure', description: 'Arrive at destination, check into hotel, and spend evening exploring local sights.' },
      { day: 2, title: 'Sightseeing Tour', description: 'Full day tour of major attractions and cultural heritage landmarks.' },
      { day: 3, title: 'Adventure & Departure', description: 'Morning outdoor activities, shopping, and checkout for departure.' }
    ]);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (pkg) => {
    setModalType('edit');
    setEditingPackageId(pkg._id);
    setFormTitle(pkg.title);
    setFormLocation(pkg.location);
    setFormDuration(pkg.duration);
    setFormPrice(pkg.price);
    setFormRating(pkg.rating.toString());
    setFormDescription(pkg.description);
    setFormImage(pkg.images.join(', '));
    setFormFacilities(pkg.facilities.join(', '));
    setFormItinerary(pkg.itinerary || []);
    setModalOpen(true);
  };

  // Handle Itinerary Row Changes
  const handleItineraryChange = (idx, field, val) => {
    const updated = [...formItinerary];
    updated[idx][field] = val;
    setFormItinerary(updated);
  };

  // Add Day to Itinerary
  const handleAddItineraryDay = () => {
    const newDayNum = formItinerary.length + 1;
    setFormItinerary([
      ...formItinerary,
      { day: newDayNum, title: 'New Activity', description: 'Description of the daily plans.' }
    ]);
  };

  // Remove Day
  const handleRemoveItineraryDay = (idx) => {
    if (formItinerary.length <= 1) {
      toast.error("Itinerary must contain at least 1 day!");
      return;
    }
    const updated = formItinerary.filter((_, i) => i !== idx);
    // Reset day counts
    updated.forEach((day, index) => {
      day.day = index + 1;
    });
    setFormItinerary(updated);
  };

  // Submit Package Form
  const handlePackageSubmit = async (e) => {
    e.preventDefault();

    if (!formTitle || !formLocation || !formDuration || !formPrice || !formDescription) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const payload = {
      title: formTitle,
      location: formLocation,
      duration: formDuration,
      price: parseFloat(formPrice),
      rating: parseFloat(formRating) || 5.0,
      description: formDescription,
      images: formImage ? formImage.split(',').map(url => url.trim()) : [],
      facilities: formFacilities ? formFacilities.split(',').map(fac => fac.trim()) : [],
      itinerary: formItinerary
    };

    try {
      if (modalType === 'add') {
        const res = await api.post('/packages', payload);
        if (res.status === 201) {
          toast.success("Tour package created successfully!");
        }
      } else {
        const res = await api.put(`/packages/${editingPackageId}`, payload);
        if (res.status === 200) {
          toast.success("Tour package updated successfully!");
        }
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save package!");
    }
  };

  const getStatusBadge = (status) => {
    const normalized = status.toLowerCase();
    if (normalized === 'confirmed') {
      return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded">Confirmed</span>;
    } else if (normalized === 'cancelled') {
      return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase rounded">Cancelled</span>;
    } else {
      return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded">Pending</span>;
    }
  };

  if (loading && stats.total_packages === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-100 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-brand-500" />
            Admin Control Panel
          </h1>
          <p className="text-slate-500 text-sm">Review bookings ledger, orchestrate tour inventories, and check active users.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1 text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-xl shrink-0 transition-all ${
            activeTab === 'overview' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" /> Overview stats
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-xl shrink-0 transition-all ${
            activeTab === 'packages' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PackagePlus className="w-4 h-4" /> Manage Packages
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-xl shrink-0 transition-all ${
            activeTab === 'bookings' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" /> Platform Bookings
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-xl shrink-0 transition-all ${
            activeTab === 'users' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" /> User Base
        </button>
      </div>

      {/* TABS CONTENT */}
      
      {/* 1. Tab Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Card Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="bg-emerald-50 text-emerald-500 p-4 rounded-2xl w-fit">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Revenue</span>
                <span className="text-2xl font-black text-slate-800">₹{stats.total_revenue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="bg-brand-50 text-brand-500 p-4 rounded-2xl w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Active Packages</span>
                <span className="text-2xl font-black text-slate-800">{stats.total_packages}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="bg-amber-50 text-amber-500 p-4 rounded-2xl w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Bookings</span>
                <span className="text-2xl font-black text-slate-800">{stats.total_bookings}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="bg-indigo-50 text-indigo-500 p-4 rounded-2xl w-fit">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Users</span>
                <span className="text-2xl font-black text-slate-800">{stats.total_users}</span>
              </div>
            </div>

          </div>

          {/* Recent Bookings Feed Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4">
            <div className="px-6 py-5 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-800">5 Recent Placed Bookings</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Travel Date</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recent_bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{booking.user_name}</p>
                        <p className="text-xs text-slate-400">{booking.user_email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{booking.package_title}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{booking.travel_date}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">₹{booking.total_price.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(booking.status)}
                          {booking.payment_status === 'paid' ? (
                            <span className="px-1.5 py-0.5 bg-teal-500 text-white text-[8px] font-bold uppercase rounded shadow-sm">Paid</span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-bold uppercase rounded">Unpaid</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {stats.recent_bookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400">No bookings logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab Manage Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Tour Package Inventories</h2>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Tour Package
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Tour Name</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Base Cost</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {packages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : ''}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <span className="font-bold text-slate-800 line-clamp-1">{pkg.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{pkg.location}</td>
                      <td className="px-6 py-4 text-slate-500">{pkg.duration}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">₹{pkg.price.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-semibold text-amber-500">{pkg.rating}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(pkg)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg._id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {packages.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">No packages loaded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab Platform Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Review Booking Ledgers</h2>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Client Detail</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Guests</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Status Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{booking.user_name}</p>
                        <p className="text-xs text-slate-400">{booking.user_email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">{booking.package_title}</p>
                        <p className="text-xs text-slate-400 font-medium">Date: {booking.travel_date}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{booking.guests}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">₹{booking.total_price.toLocaleString('en-IN')}</p>
                        {booking.transaction_id && (
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{booking.transaction_id}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(booking.status)}
                          {booking.payment_status === 'paid' ? (
                            <span className="px-2 py-0.5 bg-teal-500 text-white text-[8px] font-bold uppercase rounded shadow-sm">Paid</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-bold uppercase rounded">Unpaid</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {booking.status.toLowerCase() !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg"
                              title="Approve & Confirm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {booking.status.toLowerCase() !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                              title="Cancel Book"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">No client bookings submitted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab User Base */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">System Users</h2>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Account Role</th>
                    <th className="px-6 py-4">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          u.role === 'admin' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{u.created_at ? u.created_at.split('T')[0] : 'N/A'}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ADD / EDIT TOUR PACKAGE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                {modalType === 'add' ? 'Add New Tour Package' : 'Edit Tour Package'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePackageSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Tour Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maldives Coral Lagoon Escape"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Male, Maldives"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Days / 4 Nights"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Base Cost per Person (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 19999"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Initial Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    placeholder="e.g. 4.8"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Image URLs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Scenic Thumbnail Images (comma-separated URLs)</label>
                  <input
                    type="text"
                    placeholder="http://domain/image1.jpg, http://domain/image2.jpg"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>

              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Detailed Overview Description *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide an enticing summary detailing highlights, attractions and accommodation guarantees..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500 resize-none"
                ></textarea>
              </div>

              {/* Facilities */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Included Facilities (comma-separated list)</label>
                <input
                  type="text"
                  placeholder="Free Wi-Fi, 5-Star Resort, Daily Lunches, Airport pickup"
                  value={formFacilities}
                  onChange={(e) => setFormFacilities(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Dynamic Day-by-day Itinerary builder */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Configure Itinerary Plan</h4>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    + Add Day
                  </button>
                </div>

                <div className="space-y-4">
                  {formItinerary.map((day, index) => (
                    <div key={index} className="bg-slate-50 rounded-2xl p-4 border border-slate-150 relative space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-brand-600 uppercase tracking-wider">Day {day.day}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItineraryDay(index)}
                          className="text-xs text-rose-600 hover:underline font-semibold"
                        >
                          Remove Day
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity Title</label>
                          <input
                            type="text"
                            required
                            placeholder="Welcome & Check-in"
                            value={day.title}
                            onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                          />
                        </div>
                        
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Details</label>
                          <input
                            type="text"
                            required
                            placeholder="Describe what guests will do..."
                            value={day.description}
                            onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow hover:shadow-md transition-all"
                >
                  Save Package
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
