import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

const suggestions = ['How do I book?', 'Which specialists?', 'Where is my prescription?'];

export default function Chatbot() {
  const { session } = useApp();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage(textValue = message) {
    const text = textValue.trim();
    if (!text) return;
    setMessages((items) => [...items, { role: 'user', text }]);
    setMessage('');
    setTyping(true);
    try {
      const data = await api('/api/chat', { method: 'POST', body: { message: text } });
      setMessages((items) => [...items, { role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages((items) => [...items, { role: 'bot', text: error.message }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="chat-head">
              <span className="chat-bot-icon"><Bot size={18} /></span>
              <div><strong>MediCare Assistant</strong><small><span className="pulse-dot" /> Online</small></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
            </div>
            <div className="chat-list" ref={listRef}>
              <div className="bubble bot">Hi{session?.user ? ` ${session.user.name.split(' ')[0]}` : ''}! 👋 How can I help you today?</div>
              {messages.length === 0 && (
                <div className="chat-suggestions">
                  {suggestions.map((item) => <button key={item} type="button" onClick={() => sendMessage(item)}>{item}</button>)}
                </div>
              )}
              {messages.map((item, index) => (
                <motion.div key={`${item.role}-${index}`} className={`bubble ${item.role}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {item.text}
                </motion.div>
              ))}
              {typing && <div className="bubble bot typing"><span /><span /><span /></div>}
            </div>
            <form className="chat-input" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message…" />
              <button type="submit" aria-label="Send"><Send size={16} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'chat'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
            {open ? <X size={24} /> : <MessageCircle size={24} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
