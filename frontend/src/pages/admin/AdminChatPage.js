import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Search, ArrowLeft, Phone, Video, MoreVertical, MessageCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, SectionHeader } from '../../components/common/index';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const AdminChatPage = () => {
  const { user } = useAuth();

  const [contacts, setContacts]         = useState([]);
  const [activeConv, setActiveConv]     = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [search, setSearch]             = useState('');
  const [showConvList, setShowConvList] = useState(true);

  const stompClientRef  = useRef(null);
  const activeConvIdRef = useRef(null);
  const bottomRef       = useRef(null);
  const inputRef        = useRef('');

  // ─── 1. Load Contacts & Filter Active Chats ──────────────────────────────
  useEffect(() => {
    const loadAllContacts = async () => {
      if (!user?.id) return;
      
      let providersList = [];
      let customersList = [];

      try {
        const pRes = await api.get('/admin/providers');
        const rawProviders = Array.isArray(pRes.data) ? pRes.data : pRes.data.providers || [];
        providersList = rawProviders.map(p => {
          const actualUserId = p.user?.id || p.userId || p.id;
          return {
            id:      actualUserId,
            name:    p.user?.name || p.name || p.providerName || `Provider #${actualUserId}`,
            role:    'provider',
            lastMsg: 'Tap to chat',
            unread:  0,
            online:  true,
            hasHistory: false // 🔥 Default to false
          };
        });
      } catch (err) { console.error('Failed to load providers', err); }

      try {
        const cRes = await api.get('/admin/users');
        const allUsers = Array.isArray(cRes.data) ? cRes.data : cRes.data.users || [];
        customersList = allUsers
          .filter(u => u.role && u.role.toUpperCase() === 'CUSTOMER')
          .map(c => ({
            id:      c.id,
            name:    c.name || `Customer #${c.id}`,
            role:    'customer',
            lastMsg: 'Tap to chat',
            unread:  0,
            online:  true,
            hasHistory: false // 🔥 Default to false
          }));
      } catch (err) { console.error('Failed to load customers', err); }

      const allContacts = [...providersList, ...customersList];
      const uniqueContacts = Array.from(new Map(allContacts.map(c => [c.id, c])).values());

      // 🔥 Fetch history to find out who the Admin has ACTUALLY chatted with
      const contactsWithHistory = await Promise.all(uniqueContacts.map(async (contact) => {
        try {
            const historyRes = await api.get(`/messages/${user.id}/${contact.id}`);
            const msgs = historyRes.data || [];
            if (msgs.length > 0) {
                const lastMsg = msgs[msgs.length - 1];
                return {
                    ...contact,
                    hasHistory: true, // They chatted! Make them visible.
                    lastMsg: lastMsg.content,
                    time: new Date(lastMsg.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    lastMsgTimestamp: new Date(lastMsg.sentAt).getTime()
                };
            }
        } catch (e) {}
        return contact;
      }));

      // Sort so the most recent chats are at the very top
      contactsWithHistory.sort((a, b) => (b.lastMsgTimestamp || 0) - (a.lastMsgTimestamp || 0));

      setContacts(contactsWithHistory);

      // Auto-select the first ACTIVE chat
      const activeOnly = contactsWithHistory.filter(c => c.hasHistory);
      if (activeOnly.length > 0) {
        setActiveConv(activeOnly[0]);
      }
    };
    
    loadAllContacts();
  }, [user]);

  // ─── 2. Fetch history when active chat changes ───────────────────────────
  useEffect(() => {
    if (!user?.id || !activeConv?.id) return;
    activeConvIdRef.current = activeConv.id;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/messages/${user.id}/${activeConv.id}`);
        setMessages(res.data);
        setContacts(prev => prev.map(c => c.id === activeConv.id ? { ...c, unread: 0 } : c));
      } catch (err) { console.error('Failed to load chat history', err); }
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
              time:    new Date(msg.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              unread:  activeConvIdRef.current === msg.senderId ? 0 : (c.unread || 0) + 1,
              hasHistory: true // 🔥 Instantly reveal them in the sidebar if they message you!
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

  // ─── 5. Send ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = inputRef.current.trim();
    if (!text || !stompClientRef.current || !activeConv) return;

    const chatMessage = { senderId: user.id, receiverId: activeConv.id, content: text };
    stompClientRef.current.send('/app/chat', {}, JSON.stringify(chatMessage));

    setMessages(prev => [...prev, { ...chatMessage, id: Date.now(), sentAt: new Date().toISOString() }]);
    setContacts(prev => prev.map(c =>
      // 🔥 If Admin messages someone new, make them visible permanently!
      c.id === activeConv.id ? { ...c, lastMsg: `You: ${text}`, time: 'Just now', hasHistory: true } : c
    ));
    setInput('');
    inputRef.current = '';
  }, [activeConv, user]);

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // 🔥 Filter the sidebar view perfectly
  const displayedContacts = contacts.filter(c => {
    // If the admin is typing in the search bar, show EVERYONE who matches
    if (search.trim() !== '') {
      return c.name.toLowerCase().includes(search.toLowerCase());
    }
    // Otherwise, ONLY show people they have chatted with (or who have unread messages)
    return c.hasHistory || c.unread > 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Messages" subtitle="Your active inbox" />

      <div className="h-[calc(100vh-12rem)] flex bg-dark-950 rounded-2xl overflow-hidden border border-dark-700">
        {/* ─── SIDEBAR ─── */}
        <div className={`${showConvList ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-80 bg-dark-900 border-r border-dark-700`}>
          <div className="p-4 border-b border-dark-700">
            <h2 className="font-display font-bold text-lg text-white mb-3">Recent Chats</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search to start a new chat..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field py-2 text-sm"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayedContacts.length === 0 ? (
              <div className="p-6 text-center text-dark-400 text-sm">
                {search ? "No users found matching your search." : "Your inbox is empty. Search for a user above to start chatting."}
              </div>
            ) : (
              displayedContacts.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConv(conv); setShowConvList(false); }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-dark-800 transition-colors text-left border-b border-dark-800 ${activeConv?.id === conv.id ? 'bg-dark-800 border-l-2 border-l-brand-500' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar name={conv.name} size="md" />
                    {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-white text-sm truncate">
                        {conv.name}
                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-dark-700 text-dark-300 text-[10px] uppercase tracking-wider">
                          {conv.role}
                        </span>
                      </p>
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
              ))
            )}
          </div>
        </div>

        {/* ─── CHAT WINDOW ─── */}
        {activeConv ? (
          <div className={`${!showConvList ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-900">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowConvList(true)} className="md:hidden p-2 rounded-lg hover:bg-dark-700 text-dark-400">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar name={activeConv.name} size="md" />
                <div>
                  <p className="font-semibold text-white text-sm">
                    {activeConv.name}
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] uppercase">
                        {activeConv.role}
                    </span>
                  </p>
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
        ) : (
          <div className={`${!showConvList ? 'flex' : 'hidden md:flex'} flex-1 flex-col items-center justify-center p-10 text-center`}>
            <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-dark-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Chat Selected</h3>
            <p className="text-dark-400 text-sm max-w-sm">Select a conversation from the sidebar or search for a new user to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};