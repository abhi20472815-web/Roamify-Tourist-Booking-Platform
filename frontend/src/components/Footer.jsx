import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Github, Twitter, Instagram, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get('newsletter-email');
    if (email) {
      toast.success("Successfully subscribed to newsletter! Check your inbox.");
      e.target.reset();
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-500 text-white p-2 rounded-xl shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Roamify
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Explore your dream destinations around the globe with custom luxury packages, certified expert local guides, and 24/7 client booking support.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-brand-500 hover:text-white rounded-lg transition-all duration-300" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-brand-500 hover:text-white rounded-lg transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-brand-500 hover:text-white rounded-lg transition-all duration-300" aria-label="Github">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-500 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-brand-500 transition-colors duration-200">
                  Browse Packages
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-500 transition-colors duration-200">
                  Sign In / Access Account
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-500 transition-colors duration-200">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Get In Touch</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <span>Taj Mahal Palace Chambers, Apollo Bandar, Colaba, Mumbai, Maharashtra 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <span>+91 1800-ROAMIFY (762-6439)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <span>support@roamify.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Newsletter</h3>
            <p className="text-sm mb-4 leading-relaxed">
              Subscribe to stay updated with seasonal discounts, adventure releases, and travel alerts.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                name="newsletter-email"
                required
                placeholder="Your email address"
                className="w-full bg-slate-800 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-brand-500 transition-all duration-300"
              />
              <button
                type="submit"
                className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-brand-500/10"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Roamify Tours. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors duration-150">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors duration-150">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
