
import { Booking } from "../types";

export const syncToGoogleSheet = async (url: string, bookings: Booking[]) => {
  if (!url) return;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync',
        data: bookings.map(b => ({
          id: b.id,
          name: b.name,
          phone: b.phone || 'N/A', // Thêm số điện thoại vào database
          checkIn: new Date(b.checkIn).toLocaleString('vi-VN'),
          departure: new Date(b.departure).toLocaleString('vi-VN'),
          createdAt: new Date(b.createdAt).toLocaleString('vi-VN'),
          isRecurring: !!b.groupId
        }))
      }),
    });
    return true;
  } catch (error) {
    console.error("Lỗi đồng bộ Google Sheet:", error);
    throw error;
  }
};

/**
 * MÃ NGUỒN GOOGLE APPS SCRIPT CẬP NHẬT:
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var content = JSON.parse(e.postData.contents);
 *   
 *   if (content.action === 'sync') {
 *     sheet.clear();
 *     // Tiêu đề có thêm cột Số điện thoại
 *     sheet.appendRow(["ID", "Người đặt", "Số điện thoại", "Check-in", "Departure", "Ngày tạo", "Lặp lại"]);
 *     
 *     content.data.forEach(function(row) {
 *       sheet.appendRow([row.id, row.name, row.phone, row.checkIn, row.departure, row.createdAt, row.isRecurring]);
 *     });
 *     
 *     return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
 *   }
 * }
 */
