import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Filter, RefreshCw, Compass } from 'lucide-react';
import api from '../services/api';
import { PackageCard } from '../components/PackageCard';

export const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL search params if present
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '');
  const [locationKeyword, setLocationKeyword] = useState(searchParams.get('location') || '');
  const [maxPriceFilter, setMaxPriceFilter] = useState(searchParams.get('max_price') || '');

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Build API query parameters
      const params = {};
      if (searchKeyword) params.search = searchKeyword;
      if (locationKeyword) params.location = locationKeyword;
      if (maxPriceFilter) params.max_price = maxPriceFilter;

      const res = await api.get('/packages', { params });
      setPackages(res.data);
    } catch (err) {
      console.error("Error loading packages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when URL query params change (e.g. from Home search redirect)
  useEffect(() => {
    // Sync states with URL changes
    setSearchKeyword(searchParams.get('search') || '');
    setLocationKeyword(searchParams.get('location') || '');
    setMaxPriceFilter(searchParams.get('max_price') || '');
  }, [searchParams]);

  // Execute fetch when search query parameters change
  useEffect(() => {
    fetchPackages();
  }, [searchKeyword, locationKeyword, maxPriceFilter]);

  const handleClearFilters = () => {
    setSearchKeyword('');
    setLocationKeyword('');
    setMaxPriceFilter('');
    setSearchParams({});
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (searchKeyword) params.search = searchKeyword;
    if (locationKeyword) params.location = locationKeyword;
    if (maxPriceFilter) params.max_price = maxPriceFilter;
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
          Explore Tour Packages
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Filter and compare custom daily itineraries curated by professional travel designers.
        </p>
      </div>

      {/* Interactive Filters Panel */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Filter className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-bold text-slate-800">Search Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Keyword Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Keywords</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="e.g. Island, Temple, Ski..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Location Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Location / Country</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="e.g. Bali, Switzerland..."
                value={locationKeyword}
                onChange={(e) => setLocationKeyword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Max Price Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Maximum Budget (₹)</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
              <IndianRupee className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
              <input
                type="number"
                placeholder="e.g. 1000, 1500..."
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

        </div>

        {/* Filters footer action */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </form>

      {/* Packages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4 animate-pulse">
              <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 max-w-md mx-auto">
          <div className="bg-slate-100 text-slate-400 p-4 rounded-full w-fit mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Packages Match Your Filters</h3>
          <p className="text-sm text-slate-500 leading-relaxed px-6">
            We couldn't find any tour packages matching your search terms. Try clearing filters or entering a different destination!
          </p>
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors"
          >
            Show All Packages
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      )}

    </div>
  );
};
