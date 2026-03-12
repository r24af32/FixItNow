import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Image, Paperclip, Smile, ArrowLeft } from 'lucide-react';
import { MOCK_CHAT_MESSAGES } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/common/index';

const CONVERSATIONS = [
  { id: 1, name: 'Ravi Kumar', role: 'Electrician', lastMsg: 'I can come tomorrow at 10 AM', time: '2m', unread: 2, online: true },
  { id: 2, name: 'Suresh Babu', role: 'Plumber', lastMsg: 'Work is done! Please review', time: '1h', unread: 0, online: false },
  { id: 3, name: 'Mohan Das', role: 'Carpenter', lastMsg: 'What kind of furniture work?', time: '3h', unread: 0, online: true },
  { id: 4, name: 'Anil Sharma', role: 'AC Technician', lastMsg: 'Parts will arrive by tomorrow', time: '1d', unread: 0, online: false },
];

export const ChatPage = () => {
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0]);
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showConvList, setShowConvList] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), senderId: 'customer', content: input.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMsg]);
    setInput('');
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        senderId: 'provider',
        content: '✅ Got it! I\'ll be there at the scheduled time.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const filteredConvs = CONVERSATIONS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const role = user?.role || 'customer';

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-dark-950 rounded-2xl overflow-hidden border border-dark-700">
      {/* Conversation List */}
      <div className={`${showConvList ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-80 bg-dark-900 border-r border-dark-700`}>
        {/* Header */}
        <div className="p-4 border-b border-dark-700">
          <h2 className="font-display font-bold text-lg text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map(conv => (
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
                <p className="text-xs text-dark-400">{conv.role}</p>
                <p className="text-xs text-dark-500 truncate mt-0.5">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${!showConvList ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-900">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowConvList(true)} className="md:hidden p-2 rounded-lg hover:bg-dark-700 text-dark-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <Avatar name={activeConv.name} size="md" />
              {activeConv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-900" />}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{activeConv.name}</p>
              <p className="text-xs text-green-400">{activeConv.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Date separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-xs text-dark-500 px-2">Today</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          {messages.map(msg => {
            const isSelf = (role === 'customer' && msg.senderId === 'customer') || (role === 'provider' && msg.senderId === 'provider');
            return (
              <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isSelf && <Avatar name={activeConv.name} size="sm" />}
                <div className={`ml-2 mr-2 max-w-[70%]`}>
                  <div className={isSelf ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] mt-1 text-dark-500 ${isSelf ? 'text-right' : 'text-left'}`}>{msg.time}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-dark-700 bg-dark-900">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
              <Image className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className="input-field pr-10"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-brand-400 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
