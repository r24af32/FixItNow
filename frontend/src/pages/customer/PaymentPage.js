import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import { api } from '../../utils/api';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingData = location.state;

  const [upiId, setUpiId] = useState("");
  const [method, setMethod] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentDetails = {
    upiId: bookingData?.upiId || "name@okaxis",
    payeeName: bookingData?.provider || "Service Provider",
    amount: bookingData?.price || 0
  };

  const upiPaymentString = `upi://pay?pa=${paymentDetails.upiId}&pn=${paymentDetails.payeeName}&am=${paymentDetails.amount}&cu=INR`;

  useEffect(() => {
    if (!bookingData) navigate("/customer/bookings");
  }, [bookingData, navigate]);

const handleProceed = async () => {
    if (!method) {
      setError("Please select a payment method.");
      return;
    }
    
    // 🔥 FIX 1: Prevent empty UPI IDs
    if (method === "upi" && !upiId.trim()) {
      setError("Please enter your valid UPI ID.");
      return;
    }

    if (!agree) {
      setError("Please confirm the payment checkbox.");
      return;
    }
    setError("");

    if (!showQR && method !== "upi") {
      setShowQR(true);
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Update booking status to completed
      await api.put(`/bookings/${bookingData.id}/complete`);
      
      // 🔥 FIX 2: Notify the Provider about the payment!
      await api.post('/notifications/create', {
        userId: bookingData.providerId, // Sends directly to the Provider
        bookingId: bookingData.id,
        role: "provider",
        icon: "💰",
        text: `Payment of ₹${bookingData.price} received for ${bookingData.service}!`,
        viewed: false,
        createdAt: Date.now()
      });
      
      alert("Payment Successful!");
      navigate("/customer/bookings");
    } catch (err) {
      console.error(err);
      setError("Failed to verify payment with the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelPayment = () => {
    navigate("/customer/bookings");
  };

  return (
    <div className="max-w-xl mx-auto bg-dark-800 p-6 rounded-xl border border-dark-700 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-4">Complete Payment</h2>

      <div className="space-y-2 text-sm text-dark-300 mb-4 bg-dark-900/50 p-4 rounded-xl">
        <p>Service: <span className="text-white">{bookingData?.service}</span></p>
        <p>Provider: <span className="text-white">{bookingData?.provider}</span></p>
        <p>Date: <span className="text-white">{bookingData?.date}</span></p>
        <p>Time: <span className="text-white">{bookingData?.timeSlot}</span></p>
        <p className="text-brand-400 font-bold mt-2 text-lg">
          Amount: ₹{bookingData?.price}
        </p>
      </div>

      <div className="space-y-3">
        <label htmlFor="upi" className="flex items-center gap-3 p-3 border border-dark-600 rounded-lg cursor-pointer hover:border-brand-500/50 transition-colors">
          <input type="radio" id="upi" name="paymentMethod" value="upi" checked={method === "upi"} onChange={(e) => setMethod(e.target.value)} className="accent-brand-500" />
          <span className="text-lg">💳</span>
          <span className="text-white text-sm font-medium">Pay using UPI ID</span>
        </label>

        {method === "upi" && (
          <div className="pl-12 pr-1 mt-1 mb-3">
            <input 
              type="text" 
              placeholder="Enter UPI ID (example@upi)" 
              value={upiId} 
              onChange={(e) => {setUpiId(e.target.value); setError("");}} 
              className="input-field w-full" 
            />
          </div>
        )}

        <label htmlFor="googlepay" className="flex items-center gap-3 p-3 border border-dark-600 rounded-lg cursor-pointer hover:border-brand-500/50 transition-colors">
          <input type="radio" id="googlepay" name="paymentMethod" value="gpay" checked={method === "gpay"} onChange={(e) => {setMethod(e.target.value); setError("");}} className="accent-brand-500" />
          <span className="text-lg">📱</span>
          <span className="text-white text-sm font-medium">Google Pay</span>
        </label>

        <label htmlFor="paytm" className="flex items-center gap-3 p-3 border border-dark-600 rounded-lg cursor-pointer hover:border-brand-500/50 transition-colors">
          <input type="radio" id="paytm" name="paymentMethod" value="paytm" checked={method === "paytm"} onChange={(e) => {setMethod(e.target.value); setError("");}} className="accent-brand-500" />
          <span className="text-lg">💰</span>
          <span className="text-white text-sm font-medium">Paytm</span>
        </label>

        {/* QR Code Section */}
        {showQR && method && method !== "upi" && (
            <div className="mt-5 bg-dark-700 p-4 rounded-lg border border-dark-600 text-center animate-slide-up">
                <p className="text-white text-sm mb-3">
                Scan the QR code using {method === "gpay" ? "Google Pay" : "Paytm"} to complete payment
                </p>
                <div className="flex justify-center bg-white p-3 rounded-lg inline-block mx-auto">
                    <QRCode value={upiPaymentString} size={180} />
                </div>
                <p className="text-xs text-dark-400 mt-3">After scanning and paying, click Proceed</p>
            </div>
        )}
      </div>

      <div className="space-y-3">
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="confirmPayment" className="mt-4 flex items-center gap-2 cursor-pointer select-none">
          <input id="confirmPayment" type="checkbox" checked={agree} onChange={() => setAgree(!agree)} className="accent-brand-500 rounded" />
          <span className="text-sm text-dark-300">I confirm to proceed with payment</span>
        </label>
      </div>

      <div className="flex justify-between mt-6 gap-4">
        <button onClick={cancelPayment} className="px-6 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors font-medium">
          Cancel
        </button>

        <button
          disabled={!agree || !method || isProcessing}
          onClick={handleProceed}
          className={`btn-primary flex-1 transition-all ${(!agree || !method || isProcessing) ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}
        >
          {isProcessing ? "Processing..." : (showQR ? "Complete Payment" : "Proceed")}
        </button>
      </div>
    </div>
  );
};