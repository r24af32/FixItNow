import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";

export const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingData = location.state;

  const [upiId, setUpiId] = useState("");
  const [method, setMethod] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);

  const paymentDetails = {
    upiId: bookingData?.upiId || "name@okaxis",
    payeeName: bookingData?.provider || "Karan",
    amount: bookingData?.price || 0
  };

  const upiPaymentString = `upi://pay?pa=${paymentDetails.upiId}&pn=${paymentDetails.payeeName}&am=${paymentDetails.amount}&cu=INR`;

  useEffect(() => {
    if (!bookingData) navigate("/customer/services");
  }, []);

  const saveBooking = (status) => {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    const newBooking = {
      id: Date.now(),
      service: bookingData.service,
      provider: bookingData.provider,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      price: bookingData.price,
      status: status,
    };

    bookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
  };

  const handleProceed = () => {
    if (!method) {
      setError("Please select a payment method.");
      return
    }
    if (!agree) {
      setError("Please confirm the payment checkbox.");
      return;
    }
    setError("");

    if (!showQR) {
      setShowQR(true);
      return;
    }
    
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      const updated = bookings.map(b =>
        b.service === bookingData.service &&
        b.date === bookingData.date &&
        b.timeSlot === bookingData.timeSlot
          ? { ...b, status: "completed" }
          : b
      );
    localStorage.setItem("bookings", JSON.stringify(updated));

    alert("Payment Successful!");
    navigate("/customer/bookings");
  };

  const cancelPayment = () => {
    saveBooking("cancelled");
    alert("Payment Cancelled");
    navigate("/customer/bookings");
  };

  return (
    <div className="max-w-xl mx-auto bg-dark-800 p-6 rounded-xl border border-dark-700">
      <h2 className="text-xl font-bold text-white mb-4">Complete Payment</h2>

      <div className="space-y-2 text-sm text-dark-300 mb-4">
        <p>Service: {bookingData?.service}</p>
        <p>Provider: {bookingData?.provider}</p>
        <p>Date: {bookingData?.date}</p>
        <p>Time: {bookingData?.timeSlot}</p>
        <p className="text-brand-400 font-bold">
          Amount: ₹{bookingData?.price}
        </p>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="upi"
          className="flex items-center gap-3 p-3 border border-dark-600 rounded-lg cursor-pointer"
        >
          <input
            type="radio"
            id="upi"
            name="paymentMethod"
            value="upi"
            checked={method === "upi"}
            onChange={(e) => setMethod(e.target.value)}
            className="accent-brand-500"
          />
          <span className="text-lg">💳</span>
          <span className="text-white text-sm font-medium">
            Pay using UPI ID
          </span>
        </label>

        {method === "upi" && (
          <input
            type="text"
            placeholder="Enter UPI ID (example@upi)"
            value={upiId}
            onChange={(e) => {setUpiId(e.target.value); setError("");}}
            className="input-field"
          />
        )}

        <label
          htmlFor="googlepay"
          className="flex items-center gap-3 p-3 border border-dark-600 rounded-lg cursor-pointer"
        >
          <input
            type="radio"
            id="googlepay"
            name="paymentMethod"
            value="gpay"
            checked={method === "gpay"}
            onChange={(e) => {setMethod(e.target.value); setError("");}}
            className="accent-brand-500"
          />
          <span className="text-lg">
            <img
              src="/payment-icons/gpay.webp"
              alt="Google Pay"
              className="w-6 h-6"
            />
          </span>
          <span className="text-white text-sm font-medium">Google Pay</span>
        </label>

        <label
          htmlFor="paytm"
          className="flex items-center gap-3 p-3 border border-dark-600 rounded-lg cursor-pointer"
        >
          <input
            type="radio"
            id="paytm"
            name="paymentMethod"
            value="paytm"
            checked={method === "paytm"}
            onChange={(e) => {setMethod(e.target.value); setError("");}}
            className="accent-brand-500"
          />
          <span className="text-lg">
            <img
              src="/payment-icons/paytm.png"
              alt="Google Pay"
              className="w-6 h-6"
            />
          </span>
          <span className="text-white text-sm font-medium">Paytm</span>
        </label>

        <label
          htmlFor="phonepay"
          className="flex items-center gap-3 p-3 border border-dark-600 rounded-lg cursor-pointer"
        >
          <input
            type="radio"
            id="phonepay"
            name="paymentMethod"
            value="phonepe"
            checked={method === "phonepe"}
            onChange={(e) => {setMethod(e.target.value); setError("");}}
            className="accent-brand-500"
          />
          <span className="text-lg">
            <img
              src="/payment-icons/phonepay.png"
              alt="Google Pay"
              className="w-6 h-6"
            />
          </span>
          <span className="text-white text-sm font-medium">PhonePe</span>
        </label>

        {/* QR Code Section */}
        {showQR && method && method !== "upi" && (
            <div className="mt-5 bg-dark-700 p-4 rounded-lg border border-dark-600 text-center">
                <p className="text-white text-sm mb-3">
                Scan the QR code using {method === "gpay" ? "Google Pay" : method === "paytm" ? "Paytm" : "PhonePe"} to complete payment
                </p>

                <div className="flex justify-center bg-white p-3 rounded-lg">
                    <QRCode value={upiPaymentString} size={180} />
                </div>

                <p className="text-xs text-dark-400 mt-2">
                    After scanning and paying, click Proceed
                </p>
            </div>
        )}
      </div>

      <div className="space-y-3">
        {error && (
            <p className="text-red-400 text-sm mt-2">
                {error}
            </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label
          htmlFor="confirmPayment"
          className="mt-4 flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            id="confirmPayment"
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
          />

          <span className="text-sm text-dark-300">
            I confirm to proceed with payment
          </span>
        </label>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={cancelPayment}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg"
        >
          Cancel
        </button>

        <button
          // onClick={() => setShowQR(true)}
          disabled={!agree || !method}
          onClick={handleProceed}
          className={`btn-primary transition-all ${
            !agree || !method ? "opacity-40 cursor-not-allowed" : "opacity-100"
          }`}
        >
          {showQR ? "Complete Payment" : "Proceed"}
        </button>
      </div>
    </div>
  );
};
