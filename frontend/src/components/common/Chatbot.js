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

  // 🔥 The "Brain" of your Chatbot
  // 🔥 The "Brain" of your Chatbot (Now with STRICT rules against hallucination)
  const getSystemContext = (role) => {
    const baseContext = `You are the official AI Support Assistant for 'FixItNow', a local neighborhood service marketplace. 
    CRITICAL RULE: DO NOT invent features, pages, or buttons. If a user asks how to do something, ONLY use the exact features listed below. Do not tell them to "visit the Help Center" or "Email support" because those do not exist. 
    You must be polite, helpful, and concise. Keep answers to 2-3 short sentences. Do not use markdown formatting like **bold** or *italics*.`;

    if (role === 'customer') {
      return `${baseContext} 
      The person you are talking to is a CUSTOMER. 
      - To book: Go to 'Services', select a service, click 'Book Now', and pick a time slot.
      - Booking Statuses: Pending (yellow), Confirmed (blue), Completed (green), Cancelled (red).
      - Payments: After the provider marks a job 'Completed', the customer clicks 'Pay Now' to pay via UPI/Card.
      - Reviews: Only available on Completed jobs via the 'Rate Service' button.
      - Contact Admin/Support: Tell them to go to the 'Messages' tab on the sidebar and click on 'Admin Support' to chat directly with the platform administrator.`;
    }
    if (role === 'provider') {
      return `${baseContext} 
      The person you are talking to is a PROVIDER.
      - Accepting Jobs: Go to 'Bookings' -> 'Pending' and click 'Accept Booking'.
      - Navigation: Click 'View Route' to get live GPS directions to the customer.
      - Completing Jobs: Click 'Mark as Completed' after finishing the work. This triggers the customer to pay.
      - Adding Services: Go to 'My Services' and click 'Add Service' to list a new skill.
      - Contact Admin/Support: Tell them to go to the 'Messages' tab and click on 'Admin Support' to chat with the administrator.`;
    }
    return `${baseContext} 
      The person you are talking to is an ADMIN. 
      - Approve Providers: Go to 'Pending Approvals', view their details, and click 'Approve'.
      - Disputes: Go to the 'Disputes' tab to resolve conflicts between customers and providers.
      - Messaging: Go to the 'Messages' tab. You can search for and chat with any Customer or Provider here.
      - Analytics: View platform stats like revenue and active users in 'Analytics'.`;
  };
  // Initialize the Chat Session when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetings = {
        customer: "Hi! I'm your FixItNow AI assistant. Ask me anything about finding services, bookings, or payments!",
        provider: "Hello Provider! I'm your FixItNow AI assistant. Ask me how to manage your jobs, routes, or earnings.",
        admin: "Welcome Admin. I'm the FixItNow platform AI. How can I assist your management tasks today?"
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