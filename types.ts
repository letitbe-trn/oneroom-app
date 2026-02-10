
export interface UserProfile {
  name: string;
  phone?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone?: string; // Lưu thêm số điện thoại vào booking để quản lý dễ hơn
  checkIn: string; // ISO string
  departure: string; // ISO string
  createdAt: string;
  groupId?: string; // Để nhận diện các booking thuộc cùng một chuỗi lặp lại
}

export interface AssistantResponse {
  action: 'BOOK' | 'QUERY' | 'UNKNOWN' | 'HEALTH_CHECK';
  name?: string;
  checkIn?: string;
  departure?: string;
  isRecurring?: boolean;
  message: string;
}

export interface Conflict {
  booking1: Booking;
  booking2: Booking;
}
