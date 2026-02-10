
import React, { useState, useEffect, useCallback } from 'react';
import { Booking, UserProfile } from './types';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import SmartAssistant from './components/SmartAssistant';
import UserProfileCard from './components/UserProfileCard';
import { syncToGoogleSheet } from './services/googleSheetService';

const STORAGE_KEY = 'oneroom_bookings';
const PROFILE_KEY = 'oneroom_user_profile';
const SHEET_URL_KEY = 'oneroom_sheet_url';
const RECURRING_WEEKS = 8;

const App: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem(SHEET_URL_KEY) || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load data
  useEffect(() => {
    const savedBookings = localStorage.getItem(STORAGE_KEY);
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(SHEET_URL_KEY, sheetUrl);
  }, [sheetUrl]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const performSync = useCallback(async (currentBookings: Booking[]) => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    try {
      await syncToGoogleSheet(sheetUrl, currentBookings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl]);

  const handleShare = async () => {
    const shareUrl = window.location.origin + window.location.pathname;
    const shareData = {
      title: 'OneRoom - Đặt Phòng Nhanh',
      text: 'Ứng dụng đặt phòng OneRoom cực kỳ tiện lợi, hỗ trợ AI thông minh!',
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('Share not supported');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Đã sao chép link ứng dụng vào bộ nhớ tạm!");
      } catch (clipboardErr) {
        showToast("Không thể chia sẻ hoặc sao chép liên kết lúc này.", "error");
      }
    }
  };

  const isOverlap = (newStart: string, newEnd: string, currentBookings: Booking[]) => {
    const start = new Date(newStart).getTime();
    const end = new Date(newEnd).getTime();
    return currentBookings.some(b => {
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.departure).getTime();
      return (start < bEnd && end > bStart);
    });
  };

  const handleAddBooking = async (
    newBookingBase: Omit<Booking, 'id' | 'createdAt'>, 
    isRecurring: boolean,
    updateProfile: boolean
  ) => {
    const instances: Booking[] = [];
    const groupId = isRecurring ? crypto.randomUUID() : undefined;
    const createdAt = new Date().toISOString();

    if (updateProfile) {
      setProfile({ name: newBookingBase.name, phone: newBookingBase.phone });
    }

    const startBase = new Date(newBookingBase.checkIn);
    const endBase = new Date(newBookingBase.departure);
    const durationMs = endBase.getTime() - startBase.getTime();

    if (startBase >= endBase) {
      showToast("Thời gian không hợp lệ!", 'error');
      return;
    }

    const count = isRecurring ? RECURRING_WEEKS : 1;
    
    for (let i = 0; i < count; i++) {
      const instanceStart = new Date(startBase.getTime());
      instanceStart.setDate(instanceStart.getDate() + (i * 7));
      const instanceEnd = new Date(instanceStart.getTime() + durationMs);

      if (isOverlap(instanceStart.toISOString(), instanceEnd.toISOString(), bookings)) {
        showToast(`Trùng lịch tại tuần ${i + 1}!`, 'error');
        return;
      }

      instances.push({
        id: crypto.randomUUID(),
        name: newBookingBase.name,
        phone: newBookingBase.phone,
        checkIn: instanceStart.toISOString(),
        departure: instanceEnd.toISOString(),
        createdAt,
        groupId
      });
    }

    const updatedBookings = [...bookings, ...instances];
    setBookings(updatedBookings);
    showToast(isRecurring ? `Đã đặt ${RECURRING_WEEKS} tuần!` : "Thành công!");
    performSync(updatedBookings);
  };

  const handleDeleteBooking = (id: string) => {
    const updatedBookings = bookings.filter(b => b.id !== id);
    setBookings(updatedBookings);
    showToast("Đã hủy lượt đặt.");
    performSync(updatedBookings);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-white ${toast.type === 'success' ? 'bg-blue-600' : 'bg-red-500'}`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <i className="fas fa-hotel text-sm sm:text-base"></i>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight leading-none">OneRoom</h1>
              <span className="text-[8px] sm:text-[10px] uppercase font-bold text-blue-500 tracking-widest hidden xs:block">Premium Booking</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSyncing && (
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold animate-pulse">
                <i className="fas fa-sync-alt fa-spin"></i>
                <span className="hidden sm:inline">Đang lưu database...</span>
              </div>
            )}
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border border-gray-200 active:scale-95"
              title="Chia sẻ ứng dụng"
            >
              <i className="fas fa-share-alt text-blue-500"></i>
              <span className="hidden xs:inline">Chia sẻ</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        <section className="text-center md:text-left space-y-3">
          {profile ? (
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-2 animate-fade-in">
              Chào mừng trở lại, {profile.name}! 👋
            </div>
          ) : null}
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Đặt phòng của bạn <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">trong nháy mắt.</span>
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl">
            Tự động điền thông tin người đặt & đồng bộ lịch trình với hệ thống Google Sheet.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <SmartAssistant bookings={bookings} onBook={(b, rec) => handleAddBooking(b, rec, false)} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-gray-400 font-medium uppercase tracking-wider">Mẫu đặt phòng</span>
              </div>
            </div>
            <BookingForm userProfile={profile} onAdd={handleAddBooking} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <UserProfileCard 
              profile={profile} 
              sheetUrl={sheetUrl}
              onSave={setProfile} 
              onUpdateSheetUrl={setSheetUrl}
            />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Thống kê phòng</h4>
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-3xl text-blue-600 font-black">{bookings.length}</div>
                <div className="text-sm text-blue-800 leading-tight">
                  Lượt đặt phòng <br/> đã xác nhận
                </div>
              </div>
            </div>
            <BookingList bookings={bookings} onDelete={handleDeleteBooking} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md md:hidden z-20">
        <button 
          onClick={() => window.scrollTo({ top: profile ? 400 : 800, behavior: 'smooth' })}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-transform"
        >
          <i className="fas fa-calendar-plus"></i>
          ĐẶT PHÒNG NGAY
        </button>
      </div>
    </div>
  );
};

export default App;
