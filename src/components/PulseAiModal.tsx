import React, { useState } from 'react';
import { Bot, Sparkles, Send, X, Calendar, MapPin, Ticket } from 'lucide-react';
import { EventItem } from '../types';

interface PulseAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (event: EventItem) => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  recommendations?: EventItem[];
}

export const PulseAiModal: React.FC<PulseAiModalProps> = ({ isOpen, onClose, onSelectEvent }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am **Pulse AI**, your intelligent event concierge. Ask me to discover tech summits, compare VIP perks, check venue locations, or explain how our one-time QR check-in works!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Show tech events in Karachi 🚀',
    'What perks are in VIP Pass? ⭐',
    'How does QR check-in work? 🎟️',
    'Music festivals in Lahore 🎶',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.message,
            recommendations: data.recommendations,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'I encountered an issue processing that query. Please try again!' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Our AI concierge service is temporarily optimizing. Please browse events directly!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-850 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                Pulse AI Event Assistant
                <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/30 font-semibold">
                  AI Concierge
                </span>
              </h3>
              <p className="text-xs text-slate-400">Smart event discovery & VIP guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>

              {/* Event Recommendation Cards */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-2.5 w-full space-y-2">
                  <p className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5" />
                    Recommended Events (Click to View):
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.recommendations.map((ev) => (
                      <div
                        key={ev._id}
                        onClick={() => {
                          onSelectEvent(ev);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-indigo-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div className="truncate">
                            <h4 className="text-xs font-semibold text-white truncate">{ev.title}</h4>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-indigo-400" />
                              {ev.city} • {ev.venue}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-400 shrink-0 ml-2">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 w-fit">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Pulse AI is analyzing events...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 px-3 py-1 rounded-full border border-slate-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-850 border-t border-slate-700 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Pulse AI about events, VIP perks, or check-in rules..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white disabled:text-slate-500 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
