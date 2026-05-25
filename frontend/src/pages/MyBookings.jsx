import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, Users, IndianRupee, Ban, MapPin, ExternalLink, Compass } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/user');
      setBookings(res.data);
    } catch (err) {
      console.error("Error loading user bookings:", err);
      toast.error("Failed to load your bookings! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking? This action is irreversible.");
    if (!confirmCancel) return;

    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      if (res.status === 200) {
        toast.success("Booking cancelled successfully.");
        // Refresh listings
        fetchUserBookings();
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error(err.response?.data?.message || "Failed to cancel booking! Try again.");
    }
  };

  const getStatusBadge = (status) => {
    const normalized = status.toLowerCase();
    if (normalized === 'confirmed') {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase rounded-full">
          Confirmed
        </span>
      );
    } else if (normalized === 'cancelled') {
      return (
        <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-semibold uppercase rounded-full">
          Cancelled
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold uppercase rounded-full animate-pulse">
          Pending Approval
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 justify-center sm:justify-start">
          <Briefcase className="w-8 h-8 text-brand-500" />
          My Bookings
        </h1>
        <p className="text-slate-500 text-sm">Review your booked tour packages, check approval states, and manage trips.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 max-w-md mx-auto">
          <div className="bg-slate-50 text-slate-400 p-4 rounded-full w-fit mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Bookings Found</h3>
          <p className="text-sm text-slate-500 leading-relaxed px-6">
            You haven't placed any travel bookings yet. Explore our stunning destinations and start your adventure today!
          </p>
          <Link
            to="/packages"
            className="inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors"
          >
            Explore Tour Packages
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row justify-between items-stretch transition-all hover:shadow-premium"
            >
              
              {/* Left Column: Image Thumbnail */}
              <div className="md:w-72 shrink-0 relative h-48 md:h-auto overflow-hidden">
                <img
                  src={booking.package_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"}
                  alt={booking.package_title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Middle Column: Details */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-4">
                
                {/* Header title */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {booking.payment_status === 'paid' ? (
                      <span className="px-2 py-0.5 bg-teal-500 text-white text-[10px] font-extrabold uppercase rounded shadow-sm">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded">
                        Unpaid
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-medium ml-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {booking.package_location}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 line-clamp-1">
                    {booking.package_title}
                  </h2>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Travel Date</span>
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <Calendar className="w-4 h-4 text-brand-500" />
                      {booking.travel_date}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Total Guests</span>
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <Users className="w-4 h-4 text-brand-500" />
                      {booking.guests} {booking.guests === 1 ? 'Person' : 'People'}
                    </span>
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Pricing Paid</span>
                    <span className="flex items-center gap-1 text-brand-600 font-extrabold text-sm sm:text-base">
                      <IndianRupee className="w-4 h-4" />
                      {booking.total_price.toLocaleString('en-IN')}
                    </span>
                    {booking.transaction_id && (
                      <span className="block text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                        ID: {booking.transaction_id}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Actions */}
              <div className="p-6 md:p-8 md:border-l border-slate-100 flex md:flex-col justify-center items-stretch gap-3 shrink-0 bg-slate-50/50">
                <Link
                  to={`/packages/${booking.package_id}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  View Tour
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {booking.status.toLowerCase() !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel Booking
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
