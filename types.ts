export interface UserProfile {
  name: string;
  phone?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone?: string;
  checkIn: string;
  departure: string;
  createdAt: string;
  groupId?: string;
}

export interface AssistantResponse {
  action: 'BOOK' | 'QUERY' | 'UNKNOWN' | 'HEALTH_CHECK';
  name?: string;
  checkIn?: string;
  departure?: string;
  isRecurring?: boolean;
  message: string;
}