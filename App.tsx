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

  useEffect(() => {
    const savedBookings = localStorage.getItem(STORAGE_KEY);
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

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

  const handleAddBooking = async (
    newBookingBase: Omit<Booking, 'id' | 'createdAt'>, 
    isRecurring: boolean,
    updateProfile: boolean
  ) => {
    const instances: Booking[] = [];
    const createdAt = new Date().toISOString();

    if (updateProfile) {
      setProfile({ name: newBookingBase.name, phone: newBookingBase.phone });
    }

    const startBase = new Date(newBookingBase.checkIn);
    const endBase = new Date(newBookingBase.departure);
    const durationMs = endBase.getTime() - startBase.getTime();

    const count = isRecurring ? RECURRING_WEEKS : 1;
    for (let i = 0; i < count; i++) {
      const instanceStart = new Date(startBase.getTime());
      instanceStart.setDate(instanceStart.getDate() + (i * 7));
      const instanceEnd = new Date(instanceStart.getTime() + durationMs);

      instances.push({
        id: crypto.randomUUID(),
        name: newBookingBase.name,
        phone: newBookingBase.phone,
        checkIn: instanceStart.toISOString(),
        departure: instanceEnd.toISOString(),
        createdAt,
        groupId: isRecurring ? 'group-' + createdAt : undefined
      });
    }

    const updatedBookings = [...bookings, ...instances];
    setBookings(updatedBookings);
    showToast("Thành công!");
    performSync(updatedBookings);
  };

  const handleDeleteBooking = (id: string) => {
    const updatedBookings = bookings.filter(b => b.id !== id);
    setBookings(updatedBookings);
    performSync(updatedBookings);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] p-4 rounded-2xl shadow-xl text-white ${toast.type === 'success' ? 'bg-blue-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl">OneRoom</h1>
          {isSyncing && <span className="text-xs text-blue-500 animate-pulse">Đang đồng bộ...</span>}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <SmartAssistant 
            bookings={bookings} 
            onBook={(b: Omit<Booking, 'id' | 'createdAt'>, rec: boolean) => handleAddBooking(b, rec, false)} 
          />
          <BookingForm userProfile={profile} onAdd={handleAddBooking} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <UserProfileCard profile={profile} sheetUrl={sheetUrl} onSave={setProfile} onUpdateSheetUrl={setSheetUrl} />
          <BookingList bookings={bookings} onDelete={handleDeleteBooking} />
        </div>
      </main>
    </div>
  );
};

export default App;