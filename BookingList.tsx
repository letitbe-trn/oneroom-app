
import React, { useState } from 'react';
import { Booking } from '../types';

interface Props {
  bookings: Booking[];
  onDelete: (id: string) => void;
}

const BookingList: React.FC<Props> = ({ bookings, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
  );

  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeletingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
        <div className="text-gray-400 mb-2">
          <i className="fas fa-calendar-times text-4xl"></i>
        </div>
        <p className="text-gray-500">Chưa có lượt đặt phòng nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 px-1">Lịch Đặt Sắp Tới</h3>
      {sortedBookings.map((booking) => (
        <div 
          key={booking.id} 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-blue-200 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {booking.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{booking.name}</p>
              <p className="text-sm text-gray-500">
                <i className="far fa-clock mr-1"></i>
                {new Date(booking.checkIn).toLocaleString('vi-VN')}
              </p>
              {booking.groupId && (
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Lặp lại</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setDeletingId(booking.id)}
            className="text-gray-300 hover:text-red-500 p-2 transition-colors"
            title="Hủy đặt phòng"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      ))}

      {/* Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-bounce-in">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
              <i className="fas fa-exclamation-triangle text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Xác nhận hủy?</h4>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn hủy lượt đặt phòng này không? Thao tác này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Bỏ qua
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
