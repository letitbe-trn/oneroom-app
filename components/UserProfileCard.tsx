
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile | null;
  sheetUrl: string;
  onSave: (profile: UserProfile) => void;
  onUpdateSheetUrl: (url: string) => void;
}

const UserProfileCard: React.FC<Props> = ({ profile, sheetUrl, onSave, onUpdateSheetUrl }) => {
  const [isEditing, setIsEditing] = useState(!profile);
  const [showSettings, setShowSettings] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, phone });
    setIsEditing(false);
  };

  if (!isEditing && profile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Hồ sơ của bạn</p>
              <p className="text-sm font-bold text-gray-900">{profile.name}</p>
              {profile.phone && <p className="text-xs text-gray-500">{profile.phone}</p>}
            </div>
          </div>
          <div className="flex gap-1">
             <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-gray-500'}`}
              title="Cài đặt đồng bộ"
            >
              <i className="fas fa-cog text-sm"></i>
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-300 hover:text-blue-600 p-2 transition-colors"
              title="Chỉnh sửa hồ sơ"
            >
              <i className="fas fa-edit text-sm"></i>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-3 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Google Sheet Web App URL</label>
              <input 
                type="text" 
                placeholder="https://script.google.com/macros/s/..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={sheetUrl}
                onChange={(e) => onUpdateSheetUrl(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Dán liên kết Apps Script vào đây để tự động lưu database khách hàng và lịch đặt phòng vào Google Sheet của bạn.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-blue-100 animate-fade-in">
      <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <i className="fas fa-user-circle text-blue-500"></i>
        Thông Tin Cá Nhân
      </h4>
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Tên của bạn *"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="tel" 
          placeholder="Số điện thoại (tùy chọn)"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          Lưu thông tin
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;
