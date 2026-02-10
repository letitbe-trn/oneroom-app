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

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await processNaturalLanguage(input, bookings);
      setResponse(result.message);
      if (result.action === 'BOOK' && result.name && result.checkIn && result.departure) {
        onBook({ name: result.name, checkIn: result.checkIn, departure: result.departure }, result.isRecurring || false);
      }
    } catch (err) {
      setResponse("Lỗi AI.");
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <i className="fas fa-robot"></i> Trợ Lý AI
      </h3>
      {response && <div className="bg-white/10 p-3 rounded-lg mb-4 text-sm">{response}</div>}
      <div className="relative">
        <input 
          className="w-full bg-white/20 border-none rounded-xl px-4 py-3 outline-none"
          placeholder="Yêu cầu đặt phòng..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="absolute right-2 top-2 p-2">
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </button>
      </div>
    </div>
  );
};

export default SmartAssistant;