import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Search, MapPin, IndianRupee, Star, Quote, ArrowRight, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';
import api from '../services/api';
import { PackageCard } from '../components/PackageCard';

export const Home = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search form state
  const [searchLocation, setSearchLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch featured packages (top 3)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/packages');
        setPackages(res.data.slice(0, 3));
      } catch (err) {
        console.error("Error loading packages, showing fallback data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Redirect to packages page with search parameters
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (maxPrice) params.append('max_price', maxPrice);
    navigate(`/packages?${params.toString()}`);
  };

  const destinations = [
    { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80", count: "12+ Tours" },
    { name: "Alps", country: "Switzerland", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80", count: "8+ Tours" },
    { name: "Taj Mahal", country: "India", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80", count: "5+ Tours" },
    { name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80", count: "15+ Tours" }
  ];

  const testimonials = [
    { name: "Sarah Jenkins", role: "Avid Traveler", quote: "Booking through Roamify was absolute bliss. The itinerary for our Bali trip was flawless, and the local guides were incredibly friendly. Best holiday ever!", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { name: "David Thorne", role: "Explorer", quote: "The Swiss Alps winter tour was spectacular. Upgrading to the premium ski chalets was simple. The whole process was smooth and extremely convenient.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Animated background graphic */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80"
            alt="Scenic ocean"
            className="w-full h-full object-cover opacity-35 object-center mix-blend-lighten scale-105 select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 animate-fade-in mt-12">
          
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Voted #1 Best Travel Booking Platform
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
            Escape the Ordinary, <br />
            <span className="bg-gradient-to-r from-brand-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Roam the World
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            Indulge in hand-picked luxury tour packages with day-by-day customized travel itineraries, local English guides, and transparent booking fees.
          </p>

          {/* Search Bar Widget */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 rounded-3xl sm:rounded-full shadow-2xl border border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center justify-between"
          >
            {/* Input Location */}
            <div className="flex items-center gap-3 px-4 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0">
              <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
              <div className="w-full text-left">
                <label htmlFor="location" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination</label>
                <input
                  type="text"
                  id="location"
                  placeholder="Where to go?"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none placeholder-slate-400 mt-0.5"
                />
              </div>
            </div>

            {/* Input Budget */}
            <div className="flex items-center gap-3 px-4 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0">
              <IndianRupee className="w-5 h-5 text-brand-500 shrink-0" />
              <div className="w-full text-left">
                <label htmlFor="budget" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Max Budget</label>
                <input
                  type="number"
                  id="budget"
                  placeholder="Enter max price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none placeholder-slate-400 mt-0.5"
                />
              </div>
            </div>

            {/* Search Action Button */}
            <div className="px-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white font-bold rounded-2xl sm:rounded-full shadow-lg shadow-brand-500/20 active:scale-95 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Search className="w-4 h-4" />
                Find Packages
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Popular Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center md:text-left md:flex justify-between items-end">
          <div>
            <span className="text-brand-500 font-bold text-sm uppercase tracking-wider block mb-1">Inspirational Places</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Popular Destinations</h2>
          </div>
          <Link to="/packages" className="hidden md:flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-all">
            See all packages <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/packages?location=${dest.name}`)}
              className="group relative h-72 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-5 left-5 text-white">
                <span className="text-[10px] font-semibold text-brand-300 uppercase tracking-widest bg-brand-500/20 px-2 py-0.5 rounded-full border border-brand-500/10 mb-1 inline-block">
                  {dest.country}
                </span>
                <h3 className="text-lg font-bold">{dest.name}</h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">{dest.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Core Values / Why Us */}
      <section className="bg-slate-100/50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-500 font-bold text-sm uppercase tracking-wider block mb-1">Our Commitment</span>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Why Book With Roamify</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="bg-brand-50 text-brand-500 p-3 rounded-2xl w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Secure JWT Payments</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enjoy double-encrypted booking processes, robust data privacy middleware, and instant receipt logging in our MongoDB ledger.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="bg-brand-50 text-brand-500 p-3 rounded-2xl w-fit">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Day-by-Day Planners</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                No surprises. Every package offers an interactive hour-by-hour visual itinerary, covered hotels, meals, and flight directions.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="bg-brand-50 text-brand-500 p-3 rounded-2xl w-fit">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Premium 24/7 Support</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect with our certified local destination guides and dedicated flight re-routing agents at any step of your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-brand-500 font-bold text-sm uppercase tracking-wider block mb-1">Handpicked Adventures</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Featured Tour Packages</h2>
          <p className="text-slate-500 text-sm">Discover our highest rated itineraries, recommended by luxury travel bloggers.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4 animate-pulse">
                <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-95 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Explore More Packages
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-brand-500 font-bold text-sm uppercase tracking-wider block mb-1">Happy Voyagers</span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Reviews From Clients</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white border border-slate-100 shadow-sm p-8 rounded-3xl space-y-6 relative overflow-hidden">
              <Quote className="absolute right-6 top-6 w-16 h-16 text-slate-100 z-0 pointer-events-none" />
              <div className="flex gap-1.5 text-amber-400">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 italic text-sm leading-relaxed relative z-10 font-light">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-500/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{test.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Elegant Call-To-Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[40px] bg-gradient-to-r from-brand-600 to-teal-900 text-white overflow-hidden p-8 sm:p-16 shadow-2xl">
          {/* Graphic assets */}
          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80')" }}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">Ready for your next memorable journey?</h2>
              <p className="text-sm sm:text-base text-brand-100 font-light">
                Sign up today to receive an exclusive ₹5,000 coupon on your very first international booking. Free cancellation on all plans.
              </p>
            </div>
            
            <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link
                to="/register"
                className="text-center px-8 py-4 bg-white text-brand-600 hover:bg-slate-100 font-bold text-sm rounded-2xl active:scale-95 transform hover:-translate-y-0.5 shadow-xl transition-all duration-300"
              >
                Sign Up Free
              </Link>
              <Link
                to="/packages"
                className="text-center px-8 py-4 bg-brand-500/20 hover:bg-brand-500/30 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all duration-300"
              >
                Browse Itineraries
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
