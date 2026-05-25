import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Menu, X, LogOut, User, LayoutDashboard, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out!");
    setMobileMenuOpen(false);
  };

  const activeStyle = ({ isActive }) =>
    isActive
      ? "text-brand-600 font-semibold border-b-2 border-brand-500 pb-1"
      : "text-slate-600 hover:text-brand-500 transition-colors duration-200";

  const activeMobileStyle = ({ isActive }) =>
    isActive
      ? "block px-4 py-2 text-brand-600 font-semibold bg-brand-50/50 rounded-lg"
      : "block px-4 py-2 text-slate-600 hover:text-brand-500 hover:bg-slate-50 rounded-lg transition-all duration-200";

  return (
    <nav className="sticky top-0 z-50 w-full glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-500 text-white p-2 rounded-xl shadow-md group-hover:scale-105 group-hover:bg-brand-600 transition-all duration-300">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-teal-500 bg-clip-text text-transparent">
              Roamify
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={activeStyle}>
              Home
            </NavLink>
            <NavLink to="/packages" className={activeStyle}>
              Tour Packages
            </NavLink>
            
            {user && (
              <NavLink to="/my-bookings" className={activeStyle}>
                My Bookings
              </NavLink>
            )}

            {user && user.role === 'admin' && (
              <NavLink to="/admin" className={activeStyle}>
                Admin Dashboard
              </NavLink>
            )}
          </div>

          {/* Desktop Right Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    Hi, {user.name.split(' ')[0]}
                  </span>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.5 bg-brand-500 text-[10px] font-bold text-white uppercase rounded">
                      Admin
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 rounded-xl transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-brand-500 hover:bg-slate-100/50 rounded-xl transition-colors duration-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={activeMobileStyle}
            >
              Home
            </NavLink>
            <NavLink
              to="/packages"
              onClick={() => setMobileMenuOpen(false)}
              className={activeMobileStyle}
            >
              Tour Packages
            </NavLink>
            
            {user && (
              <>
                <NavLink
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={activeMobileStyle}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> My Bookings
                  </span>
                </NavLink>
              </>
            )}

            {user && user.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={activeMobileStyle}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </span>
              </NavLink>
            )}

            <hr className="my-3 border-slate-100" />

            {user ? (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200/50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
