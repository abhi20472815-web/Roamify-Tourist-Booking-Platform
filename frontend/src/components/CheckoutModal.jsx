import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, Send, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutModal = ({ isOpen, onClose, totalCost, packageName, travelDate, guestsCount, onPaymentSuccess }) => {
  const [paymentMode, setPaymentMode] = useState('card'); // card, upi, netbanking
  const [step, setStep] = useState('form'); // form, processing, success
  const [processingText, setProcessingText] = useState('Connecting to payment gateway...');
  
  // Form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // Simulated gateway transitions
  useEffect(() => {
    let timer1, timer2, timer3;
    if (step === 'processing') {
      timer1 = setTimeout(() => {
        setProcessingText('Establishing secure connection with Bank API...');
      }, 1000);

      timer2 = setTimeout(() => {
        setProcessingText('Authorizing ₹' + totalCost.toLocaleString('en-IN') + '...');
      }, 2000);

      timer3 = setTimeout(() => {
        // Generate random txn reference
        const generatedTxn = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
        setStep('success');
        onPaymentSuccess(generatedTxn);
      }, 3500);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step]);

  if (!isOpen) return null;

  // Format Card Number (Auto Space every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 16) value = value.slice(0, 16);
    
    // Split into chunks of 4
    const chunks = value.match(/.{1,4}/g);
    setCardNumber(chunks ? chunks.join(' ') : value);
  };

  // Format Expiry MM/YY (Auto insert slash)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 2) {
      // Validate month
      let month = parseInt(value.slice(0, 2));
      if (month < 1) month = 1;
      if (month > 12) month = 12;
      const monthStr = month.toString().padStart(2, '0');
      
      const rest = value.slice(2);
      setExpiry(`${monthStr}/${rest}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) setCvv(value);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (paymentMode === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16) {
        toast.error("Please enter a valid 16-digit Card Number!");
        return;
      }
      if (expiry.length !== 5) {
        toast.error("Please enter a valid Expiry Date (MM/YY)!");
        return;
      }
      if (cvv.length !== 3) {
        toast.error("Please enter a valid 3-digit CVV!");
        return;
      }
      if (!cardName.trim()) {
        toast.error("Please enter the Cardholder Name!");
        return;
      }
    } else if (paymentMode === 'upi') {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(upiId)) {
        toast.error("Please enter a valid UPI ID (e.g. name@upi)!");
        return;
      }
    } else if (paymentMode === 'netbanking') {
      if (!selectedBank) {
        toast.error("Please select your bank!");
        return;
      }
    }

    setStep('processing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Secure Gateway Checkout</h3>
            <p className="text-xs text-slate-400">Double-encrypted SSL payment channel</p>
          </div>
          {step === 'form' && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm bg-white border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

          {/* STEP 1: FORM INPUT */}
          {step === 'form' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              
              {/* Order Summary Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 text-xs font-semibold text-slate-600 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Booking Details</span>
                <div className="flex justify-between items-center text-slate-800">
                  <span className="font-extrabold text-sm">{packageName}</span>
                  <span className="text-brand-600 font-black text-sm">₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Travel Date: {travelDate}</span>
                  <span>Guests: {guestsCount}</span>
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentMode('card')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-brand-500" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'upi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Send className="w-4 h-4 text-brand-500" />
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('netbanking')}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMode === 'netbanking' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-brand-500" />
                  Net Bank
                </button>
              </div>

              {/* Payment Modality Detail Blocks */}
              
              {/* Modality: Credit Card */}
              {paymentMode === 'card' && (
                <div className="space-y-4">
                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Card Number</label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-brand-500 transition-colors">
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-none placeholder-slate-300"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-500 placeholder-slate-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CVV</label>
                      <input
                        type="password"
                        required
                        placeholder="•••"
                        value={cvv}
                        onChange={handleCvvChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-500 placeholder-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modality: UPI */}
              {paymentMode === 'upi' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Enter UPI Address ID</label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-brand-500 transition-colors">
                      <input
                        type="text"
                        required
                        placeholder="e.g. john@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-none placeholder-slate-300"
                      />
                      <Send className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal pt-1">
                      Enter your GPay, PhonePe, or Paytm UPI ID. You will receive a secure simulation request on your UPI provider.
                    </p>
                  </div>
                </div>
              )}

              {/* Modality: Net Banking */}
              {paymentMode === 'netbanking' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Your Bank</label>
                    <select
                      required
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-500"
                    >
                      <option value="">-- Choose Bank --</option>
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Checkout */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                Proceed Secure Payment
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          {/* STEP 2: PROCESSING SIMULATOR SPIN */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-pulse">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
              <div className="text-center space-y-2">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Processing Transaction</h4>
                <p className="text-xs text-slate-400 leading-normal max-w-xs">{processingText}</p>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT SUCCESS */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
              <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full w-fit animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 text-lg">Transaction Approved!</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                  Your payment has been cleared by the central secure gateway and logged in MongoDB.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer (Security Badging) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>PCI-DSS COMPLIANT | 256-BIT SSL ENCRYPTION</span>
        </div>

      </div>
    </div>
  );
};
