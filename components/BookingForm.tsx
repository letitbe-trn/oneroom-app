
import React, { useState, useEffect } from 'react';
import { Booking, UserProfile } from '../types';

interface Props {
  userProfile: UserProfile | null;
  onAdd: (booking: Omit<Booking, 'id' | 'createdAt'>, isRecurring: boolean, updateProfile: boolean) => void;
}

const BookingForm: React.FC<Props> = ({ userProfile, onAdd }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [departure, setDeparture] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);

  // Auto-fill when profile changes
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !checkIn || !departure) return;
    
    onAdd({ name, phone, checkIn, departure }, isRecurring, updateProfile);
    
    // Clear dynamic fields but keep name/phone if profile not updated
    setCheckIn('');
    setDeparture('');
    setIsRecurring(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-calendar-check text-blue-500"></i>
        Đặt Phòng Ngay
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tên Người Đặt</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
              <i className="fas fa-user"></i>
            </span>
            <input
              type="text"
              required
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Số Điện Thoại</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm">
              <i className="fas fa-phone"></i>
            </span>
            <input
              type="tel"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="09xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Thời Gian Check-in</label>
          <input
            type="datetime-local"
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Thời Gian Departure</label>
          <input
            type="datetime-local"
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="recurring"
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <label htmlFor="recurring" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
            Lặp lại hàng tuần (8 tuần tiếp theo)
          </label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="save_profile"
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            checked={updateProfile}
            onChange={(e) => setUpdateProfile(e.target.checked)}
          />
          <label htmlFor="save_profile" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
            Lưu thông tin này làm hồ sơ mặc định
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transform active:scale-[0.98]"
      >
        <i className="fas fa-check-circle"></i>
        Xác Nhận Đặt Phòng
      </button>
    </form>
  );
};

export default BookingForm;
