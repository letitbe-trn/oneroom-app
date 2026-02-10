import React, { useState, useEffect } from 'react';
import { processNaturalLanguage, analyzeConflicts } from '../services/geminiService';
import { Booking } from '../types';

interface Props {
  bookings: Booking[];
  onBook: (booking: Omit<Booking, 'id' | 'createdAt'>, isRecurring: boolean) => void;
}

const SmartAssistant: React.FC<Props> = ({ bookings, onBook }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [proactiveAlert, setProactiveAlert] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const conflicts = [];
      for (let i = 0; i < bookings.length; i++) {
        for (let j = i + 1; j < bookings.length; j++) {
          const b1 = bookings[i];
          const b2 = bookings[j];
          if (new Date(b1.checkIn).getTime() < new Date(b2.departure).getTime() && 
              new Date(b1.departure).getTime() > new Date(b2.checkIn).getTime()) {
            conflicts.push({ b1: b1.name, b2: b2.name, time: b1.checkIn });
          }
        }
      }
      if (conflicts.length > 0 && !proactiveAlert) {
        try {
          const alertMessage = await analyzeConflicts(conflicts);
          setProactiveAlert(alertMessage);
        } catch (err) {}
      } else if (conflicts.length === 0) {
        setProactiveAlert(null);
      }
    };
    const timer = setTimeout(checkHealth, 2000);
    return () => clearTimeout(timer);
  }, [bookings, proactiveAlert]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const result = await processNaturalLanguage(input, bookings);
      setResponse(result.message);
      if (result.action === 'BOOK' && result.name && result.checkIn && result.departure) {
        onBook({ name: result.name, checkIn: result.checkIn, departure: result.departure }, result.isRecurring || false);
      }
    } catch (err) {
      setResponse("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
      <div className="flex items-center gap-3 mb-4">
        <i className="fas fa-robot text-xl"></i>
        <h3 className="font-bold text-lg">Trợ Lý AI</h3>
      </div>
      <div className="space-y-4">
        {proactiveAlert && <div className="bg-amber-400/20 p-3 rounded-xl text-xs border border-amber-400/40">{proactiveAlert}</div>}
        {response && <div className="bg-white/10 p-3 rounded-xl text-sm border border-white/20">{response}</div>}
        <div className="relative">
          <input 
            type="text" 
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-100 outline-none"
            placeholder="Yêu cầu trợ lý AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} className="absolute right-2 top-2 p-2">
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;