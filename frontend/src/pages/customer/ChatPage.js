import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Search, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/common/index';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const targetContact = location.state;

  const [contacts, setContacts]       = useState([]);
  const [activeConv, setActiveConv]   = useState(null);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [search, setSearch]           = useState('');
  const [showConvList, setShowConvList] = useState(true);

  const stompClientRef   = useRef(null);
  const activeConvIdRef  = useRef(null);
  const bottomRef        = useRef(null);
  const inputRef         = useRef('');

  // ─── 1. Load contacts ────────────────────────────────────────────────────
  useEffect(() => {
    const loadContacts = async () => {
      if (!user?.id) return;
      try {
        const endpoint = user.role === 'customer' ? '/bookings/customer' : '/bookings/provider';
        const res = await api.get(endpoint);

        const uniqueIds = new Set();
        res.data.forEach(b => {
          if (user.role === 'customer' && b.providerId) uniqueIds.add(b.providerId);
          if (user.role === 'provider' && b.customerId) uniqueIds.add(b.customerId);
        });
        if (targetContact?.contactId) uniqueIds.add(targetContact.contactId);

        const loaded = [];

        // 🔥 CRITICAL FIX: Inject Admin Support with YOUR Database ID (17)
        if (user.role === 'customer' || user.role === 'provider') {
          loaded.push({
            id: 17, // <--- Matching your DB for admin@gmail.com
            name: "Admin Support 🛡️",
            role: "admin",
            lastMsg: "Need help? Message us.",
            unread: 0,
            online: true,
          });
        }

        for (let id of uniqueIds) {
          try {
            const r = await api.get(`/users/${id}`);
            loaded.push({ id: r.data.id, name: r.data.name, role: r.data.role, lastMsg: 'Tap to chat', unread: 0, online: true });
          } catch {
            loaded.push({
              id,
              name: targetContact?.contactId === id ? targetContact.contactName : `User #${id}`,
              role: targetContact?.contactId === id ? targetContact.contactRole : (user.role === 'customer' ? 'Provider' : 'Customer'),
              lastMsg: 'Tap to chat', unread: 0, online: true,
            });
          }
        }

        setContacts(loaded);

        if (targetContact?.contactId) {
          const active = loaded.find(c => c.id === targetContact.contactId);
          if (active) setActiveConv(active);
        } else if (loaded.length > 0) {
          setActiveConv(loaded[0]);
        }
      } catch (err) {
        console.error('Failed to load contacts', err);
      }
    };
    loadContacts();
  }, [user, targetContact]);

  // ─── 2. Fetch history when active chat changes ───────────────────────────
  useEffect(() => {
    if (!user?.id || !activeConv?.id) return;
    activeConvIdRef.current = activeConv.id;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/messages/${user.id}/${activeConv.id}`);
        setMessages(res.data);
        setContacts(prev => prev.map(c => c.id === activeConv.id ? { ...c, unread: 0 } : c));
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, [user, activeConv]);

  // ─── 3. WebSocket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    client.debug = () => {};

    client.connect({}, () => {
      client.subscribe(`/topic/messages/${user.id}`, (payload) => {
        const msg = JSON.parse(payload.body);

        if (activeConvIdRef.current === msg.senderId) {
          setMessages(prev => [...prev, msg]);
        }

        setContacts(prev => prev.map(c => {
          if (c.id === msg.senderId) {
            return {
              ...c,
              lastMsg: msg.content,
              time: formatTime(msg.sentAt),
              unread: activeConvIdRef.current === msg.senderId ? 0 : (c.unread || 0) + 1,
            };
          }
          return c;
        }));
      });
    });

    stompClientRef.current = client;
    return () => { client.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ─── 4. Auto-scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── 5. Send message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = inputRef.current.trim();
    if (!text || !stompClientRef.current || !activeConv) return;

    const chatMessage = {
      senderId:   user.id,
      receiverId: activeConv.id,
      content:    text,
    };

    stompClientRef.current.send('/app/chat', {}, JSON.stringify(chatMessage));

    setMessages(prev => [...prev, { ...chatMessage, id: Date.now(), sentAt: new Date().toISOString() }]);
    setContacts(prev => prev.map(c =>
      c.id === activeConv.id ? { ...c, lastMsg: `You: ${text}`, time: 'Just now' } : c
    ));

    setInput('');
    inputRef.current = '';
  }, [activeConv, user]);

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (contacts.length === 0) return <div className="p-10 text-center text-white">No active chats yet. Go book a service!</div>;
  if (!activeConv) return <div className="p-10 text-center text-white">Loading chats...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-dark-950 rounded-2xl overflow-hidden border border-dark-700">
      <div className={`${showConvList ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-80 bg-dark-900 border-r border-dark-700`}>
        <div className="p-4 border-b border-dark-700">
          <h2 className="font-display font-bold text-lg text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field py-2 text-sm"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setActiveConv(conv); setShowConvList(false); }}
              className={`w-full flex items-center gap-3 p-4 hover:bg-dark-800 transition-colors text-left border-b border-dark-800 ${activeConv.id === conv.id ? 'bg-dark-800 border-l-2 border-l-brand-500' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <Avatar name={conv.name} size="md" />
                {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-white text-sm truncate">{conv.name}</p>
                  <span className="text-xs text-dark-500">{conv.time}</span>
                </div>
                <p className="text-xs text-brand-400 truncate">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={`${!showConvList ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-900">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowConvList(true)} className="md:hidden p-2 rounded-lg hover:bg-dark-700 text-dark-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Avatar name={activeConv.name} size="md" />
            <div>
              <p className="font-semibold text-white text-sm">{activeConv.name}</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => {
            const isSelf = msg.senderId === user.id;
            return (
              <div key={msg.id || index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isSelf && <Avatar name={activeConv.name} size="sm" />}
                <div className="ml-2 mr-2 max-w-[70%]">
                  <div className={isSelf ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] mt-1 text-dark-500 ${isSelf ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.sentAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 pr-20 border-t border-dark-700 bg-dark-900">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => { setInput(e.target.value); inputRef.current = e.target.value; }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className="input-field pr-10"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};