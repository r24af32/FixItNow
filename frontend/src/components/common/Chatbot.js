import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleGenAI } from '@google/genai'; // 🔥 NEW: The official, supported SDK

// Initialize the New Gemini API
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
// NEW: Initialization format for the new SDK
const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

export const Chatbot = () => {
  const { user } = useAuth();
  const activeRole = user?.role?.toLowerCase() || 'customer';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 The "Brain" of your Chatbot (Now with STRICT rules against hallucination)
  const getSystemContext = (role) => {
    const baseContext = `You are the official AI Support Assistant for 'FixItNow', a local neighborhood service marketplace. 
    CRITICAL RULE: DO NOT invent features, pages, or buttons. If a user asks how to do something, ONLY use the exact features listed below. Do not tell them to "visit the Help Center" or "Email support" because those do not exist. 
    You must be polite, helpful, and concise. Keep answers to 2-3 short sentences. Do not use markdown formatting like **bold** or *italics*.`;

    if (role === 'customer') {
      return `${baseContext}
      
CUSTOMER FEATURES:

DASHBOARD: Welcome message, nearby services overview, active bookings, booking statistics, service categories, quick actions.

SERVICE DISCOVERY: Browse services with filtering by category, subcategory, price, distance, ratings. Search and service detail pages with provider info. Map-based location display.

BOOKINGS: View all bookings with real-time status. Statuses: Pending (yellow), Confirmed (blue), Completed (green), Cancelled (red). Accept, decline, or view booking details.

REVIEWS & RATINGS: Submit star ratings and reviews for completed services. View provider ratings and review history.

PAYMENTS: After provider marks job Completed, customer clicks Payment section to pay via UPI or Card.

MESSAGING: Real-time chat with providers. Message history. Chat with Admin Support from Messages tab.

SETTINGS: Profile management, account preferences.

How to book: Go to 'Find Services' tab -> select service -> click 'Book Now' -> pick time slot. After completion, pay on notification. Leave review after payment on 'Rate Service' button.`;
    }
    if (role === 'provider') {
      return `${baseContext}
      
PROVIDER FEATURES:

DASHBOARD: Earnings overview with charts and breakdown. Average rating with review count. New booking requests. Today's bookings schedule. Availability toggle. Quick action buttons.

SERVICES: Create new services via 'Add Service'. View, edit, delete services. Manage categories, subcategories, pricing, descriptions, status (ACTIVE/SUSPENDED). View service statistics: completed jobs count, total revenue, average rating, review count.

BOOKINGS: View all bookings (pending, accepted, declined, completed). Accept or decline requests. Mark as completed to trigger payment. View customer details. See today's highlights. Get booking route via 'View Route' (GPS directions). Filter by status.

REVIEWS: View all customer reviews and feedback. See overall rating statistics and review count.

MESSAGING: Real-time chat with customers. Message history. Chat with Admin Support from Messages tab.

SETTINGS: Profile management with availability preferences and account settings.

To accept job: Go to 'Bookings' tab -> find Pending -> click 'Accept Booking'. Click 'View Route' for GPS directions. Complete work and click 'Mark as Completed'. Customer will then pay you.`;
    }
    return `${baseContext}
    
ADMIN FEATURES:

ANALYTICS DASHBOARD: Total users (Customers, Providers, Admins). Active bookings count. Total transactions and revenue. Service utilization statistics. Chart visualization. Verification status. Recent provider applications. Active disputes. Recently joined users. Category-wise service breakdown.

USER MANAGEMENT: View all users with search. Filter by role (customer, provider, admin, suspended). View user details: name, email, role, location, total bookings, joined date. Suspend or activate accounts. Manage status (active/inactive/suspended).

PROVIDER MANAGEMENT: View providers with search. Filter by approval status (pending, approved, rejected, suspended). View details: name, email, category, service area. Download ID documents and proof files. View credentials and verification documents. Approve, reject, or suspend accounts.

PROVIDER APPROVAL: View pending applications in 'Pending Approvals'. Review info and documents. Approve to mark APPROVED. Reject to mark REJECTED. Tab filtering shows all/pending/approved/rejected with count badges.

SERVICE MANAGEMENT: View all services. Filter by status (active, suspended). See details: category, subcategory, price, description. View statistics: completed jobs, total revenue, average rating, review count. Suspend or restore services. Access provider info.

DISPUTES: View active disputes with customer vs provider info and service/booking context. Resolve or dismiss disputes. See customer/provider/service status on cards. View full details in modal. Suspend specific providers or services. Real-time status updates.

MESSAGING: Chat with all customers and providers from 'Messages' tab. Unified interface. View contact history. Check online/offline status. Retrieve message history.

To approve provider: Go to 'Pending Approvals' -> view info and documents -> click 'Approve'. To resolve dispute: Go to 'Disputes' -> view details -> choose Resolve or Dismiss -> can also Suspend Provider or Suspend Service.`;
  };
  // Initialize the Chat Session when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetings = {
        customer: "Hi! I'm your FixItNow AI assistant. I can help you with finding services, booking appointments, making payments, leaving reviews, and messaging providers. What would you like to know?",
        provider: "Hello! I'm your FixItNow AI assistant. I can help you manage your services, accept bookings, view earnings, track jobs with routes, and chat with customers. What do you need?",
        admin: "Welcome! I'm your FixItNow AI assistant. I can help you with user management, provider approvals, dispute resolution, service management, analytics, and messaging. How can I help?"
      };
      setMessages([{ type: 'bot', text: greetings[activeRole], timestamp: new Date() }]);

      if (ai) {
        try {
          //🔥 NEW: We added Temperature to force the AI to be strictly obedient!
          const session = ai.chats.create({
            model: "gemini-2.5-flash", 
            config: {
                systemInstruction: getSystemContext(activeRole),
                temperature: 0.1, // 0.1 means strictly factual, no inventing or guessing!
            }
          });
          setChatSession(session);
        } catch (error) {
          console.error("Failed to initialize AI:", error);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeRole, messages.length]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text, timestamp: new Date() }]);
    setInputText('');
    setIsTyping(true);

    if (!ai || !chatSession) {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: "Error: Gemini API key is missing or AI failed to initialize.", timestamp: new Date() }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      // 🔥 NEW: The new SDK syntax for sending a message
      const result = await chatSession.sendMessage({ message: text });
      const botReply = result.text;
      setMessages(prev => [...prev, { type: 'bot', text: botReply, timestamp: new Date() }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { type: 'bot', text: "I'm having trouble connecting to my server right now. Please try again later.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg hover:shadow-glow-orange transition-all duration-200 flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900 animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-80 sm:w-96 h-[500px] bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl flex flex-col animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-dark-600 bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="font-semibold text-white">FixItNow AI</h3>
                <p className="text-xs text-white/80 capitalize">{activeRole} Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-dark-600">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.type === 'user' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-dark-700 text-dark-100 border border-dark-600 rounded-bl-sm'}`}>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in"><div className="bg-dark-700 border border-dark-600 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2"><Loader2 className="w-4 h-4 text-brand-400 animate-spin" /><span className="text-sm text-dark-400">AI is thinking...</span></div></div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-dark-600 bg-dark-900 rounded-b-2xl">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }} className="flex gap-2">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-dark-800 border border-dark-600 rounded-xl px-4 py-2.5 text-white placeholder-dark-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" />
              <button type="submit" disabled={!inputText.trim() || isTyping} className="w-11 h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center flex-shrink-0"><Send className="w-5 h-5 -ml-0.5" /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};