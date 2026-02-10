
import React, { useState } from 'react';

interface Props {
  sheetUrl: string;
  onUrlChange: (url: string) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
}

const SyncSettings: React.FC<Props> = ({ sheetUrl, onUrlChange, onSyncNow, isSyncing }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${sheetUrl ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
      >
        <i className={`fas ${sheetUrl ? 'fa-sync-alt' : 'fa-cog'} ${isSyncing ? 'fa-spin' : ''}`}></i>
        <span>{sheetUrl ? 'Đang kết nối Sheet' : 'Kết nối Google Sheet'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800">Cấu hình Google Sheet</h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Apps Script Web App URL</label>
              <input 
                type="text" 
                placeholder="https://script.google.com/macros/s/..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={sheetUrl}
                onChange={(e) => onUrlChange(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-[11px] text-blue-700 leading-relaxed">
                <i className="fas fa-info-circle mr-1"></i>
                Dữ liệu sẽ tự động đồng bộ mỗi khi bạn thêm hoặc xóa lượt đặt phòng.
              </p>
            </div>

            <button 
              onClick={() => { onSyncNow(); setIsOpen(false); }}
              disabled={!sheetUrl || isSyncing}
              className="w-full bg-gray-900 text-white text-sm font-bold py-2 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ thủ công ngay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncSettings;
