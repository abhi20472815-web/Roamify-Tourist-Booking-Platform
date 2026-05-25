import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Calendar, Users, Award, ShieldCheck, Check, ChevronDown, ChevronUp, ArrowLeft, Heart } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { CheckoutModal } from '../components/CheckoutModal';

export const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Itinerary accordion state
  const [expandedDay, setExpandedDay] = useState(1);

  // Booking Form State
  const [travelDate, setTravelDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/packages/${id}`);
        setPackageData(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0]);
        }
      } catch (err) {
        console.error("Error fetching package details:", err);
        toast.error("Failed to load tour details! Re-routing back to packages.");
        navigate('/packages');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-100 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!packageData) return null;

  const { title, description, price, duration, rating, location, images, facilities, itinerary } = packageData;
  const totalPrice = price * guestsCount;

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Redirect to login if user is not authenticated
    if (!user) {
      toast.error("Please login to proceed with your booking!");
      navigate('/login', { state: { from: `/packages/${id}` } });
      return;
    }

    if (!travelDate) {
      toast.error("Please select a travel date!");
      return;
    }

    if (guestsCount <= 0) {
      toast.error("Please select at least 1 guest!");
      return;
    }

    // Intercept submit to open Checkout secure gateway modal
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = async (transactionId) => {
    try {
      setBookingLoading(true);
      
      const payload = {
        package_id: id,
        travel_date: travelDate,
        guests: guestsCount,
        payment_status: 'paid',
        transaction_id: transactionId
      };

      const res = await api.post('/bookings', payload);
      
      if (res.status === 201) {
        // Trigger elegant confetti burst
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        toast.success("Booking placed and paid successfully!");
        
        // Wait a small duration, then close modal and navigate to My Bookings
        setTimeout(() => {
          setCheckoutOpen(false);
          navigate('/my-bookings');
        }, 2000);
      }
    } catch (err) {
      console.error("Booking post-payment error:", err);
      toast.error(err.response?.data?.message || "Failed to submit booking after payment! Contact support.");
      setCheckoutOpen(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const toggleDayAccordion = (dayNum) => {
    setExpandedDay(expandedDay === dayNum ? null : dayNum);
  };

  // Get tomorrow's date string as minimum date for the calendar selection
  const getMinDateString = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum date is tomorrow
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Back to Browse */}
      <Link
        to="/packages"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Packages
      </Link>

      {/* Header Meta details */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 bg-brand-50 text-brand-600 font-semibold text-xs px-3 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </span>
          <span className="flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold text-xs px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {duration}
          </span>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-600 font-semibold text-xs px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)} / 5.0 Rating
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
          {title}
        </h1>
      </div>

      {/* 2. Image Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Left Image */}
        <div className="lg:col-span-2 h-[450px] rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative">
          <img
            src={activeImage}
            alt={title}
            className="w-full h-full object-cover animate-fade-in"
            onError={handleImageError}
          />
        </div>

        {/* Small Stack on the Right */}
        <div className="flex lg:flex-col gap-4 h-[450px] overflow-y-auto no-scrollbar lg:justify-between py-1">
          {images && images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative flex-1 lg:flex-none h-28 lg:h-32 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                activeImage === img ? 'border-brand-500 scale-[0.98]' : 'border-transparent hover:border-slate-300'
              }`}
            >
              <img
                src={img}
                alt={`${title} sub ${idx}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Split Grid (Details vs Booking) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Overview, Facilities, Itinerary */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Section: Overview */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800 pb-3 border-b border-slate-50">Tour Overview</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              {description}
            </p>
          </div>

          {/* Section: Facilities */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800 pb-3 border-b border-slate-50">What's Included</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {facilities && facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm font-medium">
                  <div className="bg-brand-50 text-brand-600 p-1 rounded-full">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Travel Plan / Itinerary Accordions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Day-by-Day Travel Plan</h2>
            
            <div className="space-y-4">
              {itinerary && itinerary.map((item, idx) => {
                const dayNum = item.day || (idx + 1);
                const isExpanded = expandedDay === dayNum;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleDayAccordion(dayNum)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center bg-brand-500 text-white font-bold text-sm w-12 h-12 rounded-xl">
                          Day {dayNum}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base sm:text-lg">{item.title}</h3>
                        </div>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 animate-fade-in">
                        <p className="text-slate-600 text-sm leading-relaxed font-light">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Booking Form Widget */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-premium space-y-6 sticky top-28">
          
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Pricing Details</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">₹{price.toLocaleString('en-IN')}</span>
              <span className="text-sm font-normal text-slate-500">/ person</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Form */}
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            
            {/* Travel Date */}
            <div className="space-y-2">
              <label htmlFor="date" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Travel Date
              </label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
                <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="date"
                  id="date"
                  required
                  min={getMinDateString()}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-700 font-medium focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Guest Selector */}
            <div className="space-y-2">
              <label htmlFor="guests" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Number of Guests
              </label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
                <Users className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="number"
                  id="guests"
                  required
                  min="1"
                  max="12"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-transparent text-sm text-slate-700 font-semibold focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Base Rate ({guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'})</span>
                <span>₹{price.toLocaleString('en-IN')} x {guestsCount}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Taxes & Service Fees</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px]">Free (Major Project Special)</span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-700">Total Price</span>
                <span className="text-xl font-extrabold text-brand-600">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-4 bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.98] transform transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Placing Booking...
                </>
              ) : user ? (
                'Book Now'
              ) : (
                'Login to Book'
              )}
            </button>

          </form>

          {/* Guarantee Badges */}
          <div className="space-y-3 pt-2 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Free full-refund cancellation up to 48 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>College Major project submission guarantee</span>
            </div>
          </div>

        </div>

      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        totalCost={totalPrice}
        packageName={title}
        travelDate={travelDate}
        guestsCount={guestsCount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
