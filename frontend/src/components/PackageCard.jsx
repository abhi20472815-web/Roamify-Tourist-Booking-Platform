import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';

export const PackageCard = ({ pkg }) => {
  const { _id, title, price, duration, rating, location, images } = pkg;

  // Use the primary image thumbnail, fallback to a standard placeholder
  const thumbnail = images && images.length > 0 
    ? images[0] 
    : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-premium transform hover:-translate-y-2 transition-all duration-300">
      
      {/* Image Container with Zoom Effect */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={handleImageError}
        />
        {/* Price Tag Overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl text-white font-bold text-sm shadow-md border border-white/10">
          ₹{price.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-300">/ person</span>
        </div>
        
        {/* Rating Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-slate-900 font-semibold text-xs shadow">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 space-y-4">
        {/* Location & Duration Badges */}
        <div className="flex justify-between items-center gap-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1 text-brand-600">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{location}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>{duration}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">Premium Package</span>
          <Link
            to={`/packages/${_id}`}
            className="flex items-center gap-1 px-4 py-2 bg-slate-50 group-hover:bg-brand-500 text-slate-600 group-hover:text-white font-medium text-sm rounded-xl transition-all duration-300 shadow-sm"
          >
            Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
