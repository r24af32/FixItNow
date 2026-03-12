import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

// ─── Predefined Responses by Role ────────────────────────────────────────────
const CHATBOT_RESPONSES = {
  customer: {
    greet: "Hi! I'm your FixItNow assistant. How can I help you today?",
    options: [
      { q: "How to book a service?", a: "To book a service:\n1. Go to 'Services' from the sidebar\n2. Browse available service categories\n3. Click on a service to view provider details\n4. Click 'Book Now' button\n5. Select your preferred time slot\n6. Confirm booking\n\nYou'll receive a confirmation and can track status in 'My Bookings'." },
      { q: "How to check booking status?", a: "To check your booking status:\n1. Click 'My Bookings' in the sidebar\n2. You'll see all your bookings with status badges:\n   • Pending (Yellow) - Awaiting provider confirmation\n   • Confirmed (Blue) - Provider accepted\n   • Completed (Green) - Service finished\n   • Cancelled (Red) - Booking cancelled\n3. Click 'View Details' for more information" },
      { q: "How to cancel a booking?", a: "To cancel a booking:\n1. Go to 'My Bookings'\n2. Find the booking you want to cancel\n3. Click 'View Details' or 'Cancel' button\n4. Confirm cancellation\n\nNote: You can only cancel bookings that are Pending or Confirmed. Completed bookings cannot be cancelled." },
      { q: "How to give a review?", a: "To leave a review:\n1. Go to 'My Bookings'\n2. Find a Completed booking\n3. Click 'Leave Review' button\n4. Rate the service (1-5 stars)\n5. Write your feedback\n6. Submit\n\nYour review helps other customers and improves service quality!" },
      { q: "How to update my profile?", a: "To update your profile:\n1. Click 'Settings' in the sidebar\n2. Edit your personal information\n3. Update contact details if needed\n4. Change password (optional)\n5. Click 'Save Changes'\n\nMake sure to keep your contact information up to date!" },
    ]
  },
  provider: {
    greet: "Hello! I'm here to assist you with your provider account. What do you need help with?",
    options: [
      { q: "How to accept a booking?", a: "To accept a booking request:\n1. Go to 'My Bookings' in the sidebar\n2. Look for bookings with 'Pending' status\n3. Click 'View Details' to see booking information\n4. Click 'Accept' button if you can fulfill the request\n5. The customer will be notified\n\nMake sure you can deliver the service at the requested time before accepting!" },
      { q: "How to manage availability?", a: "To manage your availability:\n1. Go to 'Settings'\n2. Find 'Availability Time Slots' section\n3. Select or deselect time slots when you're available\n4. Update your service area radius if needed\n5. Save changes\n\nKeep your availability updated to receive relevant booking requests!" },
      { q: "How to update my profile?", a: "To update your provider profile:\n1. Click 'Settings' in the sidebar\n2. Edit your service category and description\n3. Update pricing information\n4. Change availability time slots\n5. Update service area\n6. Save changes\n\nA complete profile helps customers choose you!" },
      { q: "How to view my earnings?", a: "To check your earnings:\n1. Go to 'Dashboard'\n2. View 'Total Earnings' card\n3. See breakdown by:\n   • This Month\n   • Total Earnings\n   • Completed Jobs\n4. Click 'View Details' for transaction history\n\nPayments are processed after job completion and customer confirmation." },
      { q: "What if customer cancels?", a: "If a customer cancels a booking:\n• Before confirmation: No impact on you\n• After confirmation: You'll be notified immediately\n• Cancellation fees may apply (customer side)\n• Your slot becomes available again\n\nYou can also decline or cancel if absolutely necessary, but maintain good ratings by honoring commitments!" },
    ]
  },
  admin: {
    greet: "Welcome Admin! I can help you navigate the admin panel. What would you like to know?",
    options: [
      { q: "How to approve a provider?", a: "To approve a new provider:\n1. Click 'Pending Approvals' in sidebar\n2. Review provider details:\n   • Personal information\n   • Service category\n   • Uploaded ID proof\n   • Available time slots\n3. Download and verify ID document\n4. Click 'View Details' for complete information\n5. Click 'Approve' if everything is valid\n   OR 'Reject' if documents are invalid\n\nApproved providers can immediately start accepting bookings!" },
      { q: "How to manage disputes?", a: "To handle disputes:\n1. Go to 'Disputes' section\n2. View list of reported issues\n3. Click on a dispute to see details:\n   • Customer complaint\n   • Provider response\n   • Booking information\n4. Review evidence from both parties\n5. Take action:\n   • Resolve in favor of customer\n   • Resolve in favor of provider\n   • Request more information\n6. Add resolution notes\n\nFair dispute resolution maintains platform trust!" },
      { q: "How to view analytics?", a: "To view platform analytics:\n1. Go to 'Analytics' / 'Dashboard'\n2. See key metrics:\n   • Total Users\n   • Active Providers\n   • Total Bookings\n   • Revenue\n3. View graphs and trends\n4. Filter by date range\n5. Export reports if needed\n\nAnalytics help you make data-driven decisions!" },
      { q: "How to manage users?", a: "To manage users:\n1. Go to 'Users' section\n2. View all registered customers\n3. Search or filter users\n4. Click on a user to:\n   • View profile\n   • See booking history\n   • Suspend account (if policy violated)\n   • Activate/Deactivate\n\nUser management ensures platform quality and safety!" },
      { q: "How to view all providers?", a: "To view and manage providers:\n1. Go to 'Providers' section\n2. See list of all approved providers\n3. Filter by:\n   • Service category\n   • Status (Active/Inactive)\n   • Rating\n4. Click on provider to view:\n   • Profile details\n   • Completed jobs\n   • Customer reviews\n   • Earnings\n\nMonitor provider performance regularly!" },
    ]
  }
};

// ─── Chatbot Component ────────────────────────────────────────────────────────
export const Chatbot = ({ userRole = 'customer' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greet = CHATBOT_RESPONSES[userRole].greet;
      setMessages([{ type: 'bot', text: greet, timestamp: new Date() }]);
    }
  }, [isOpen, userRole, messages.length]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text, timestamp: new Date() }]);
    setInputText('');
    setIsTyping(true);

    // Find matching response
    setTimeout(() => {
      const responses = CHATBOT_RESPONSES[userRole].options;
      const match = responses.find(r => 
        text.toLowerCase().includes(r.q.toLowerCase().split(' ')[0]) ||
        r.q.toLowerCase().includes(text.toLowerCase())
      );

      let botReply;
      if (match) {
        botReply = match.a;
      } else {
        botReply = "I'm not sure about that. Here are some things I can help you with:\n\n" +
          responses.map((r, i) => `${i + 1}. ${r.q}`).join('\n');
      }

      setMessages(prev => [...prev, { type: 'bot', text: botReply, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800); // Simulate typing delay
  };

  const handleQuickOption = (option) => {
    sendMessage(option.q);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-600 bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">FixItNow Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.type === 'user'
                    ? 'bg-brand-500 text-white'
                    : 'bg-dark-700 text-dark-100 border border-dark-600'
                }`}>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Quick Options after greeting */}
            {messages.length === 1 && messages[0].type === 'bot' && (
              <div className="space-y-2">
                <p className="text-xs text-dark-400 text-center mb-2">Quick options:</p>
                {CHATBOT_RESPONSES[userRole].options.slice(0, 4).map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickOption(opt)}
                    className="w-full text-left px-3 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl text-sm text-dark-200 transition-colors"
                  >
                    {opt.q}
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-dark-700 border border-dark-600 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                  <span className="text-sm text-dark-400">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-dark-600">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-2.5 text-dark-100 placeholder-dark-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
