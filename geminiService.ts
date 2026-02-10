import { GoogleGenAI, Type } from "@google/genai";
import { Booking } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const processNaturalLanguage = async (
  prompt: string,
  existingBookings: Booking[]
) => {
  const now = new Date().toISOString();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Hôm nay là ${now}. Dựa trên tin nhắn của người dùng: "${prompt}", hãy phân tích ý định.
    Nếu họ muốn đặt phòng, hãy trích xuất tên, thời gian bắt đầu và kết thúc (định dạng ISO).
    Nếu họ dùng các từ như "mỗi thứ...", "hàng tuần", "hàng ngày", hãy đặt isRecurring thành true.
    Nếu họ hỏi về lịch trống, hãy xem danh sách đặt phòng hiện tại: ${JSON.stringify(existingBookings)}.
    Trả về kết quả dưới dạng JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            enum: ['BOOK', 'QUERY', 'UNKNOWN'],
            description: 'Hành động người dùng muốn thực hiện.'
          },
          name: { type: Type.STRING },
          checkIn: { type: Type.STRING },
          departure: { type: Type.STRING },
          isRecurring: { type: Type.BOOLEAN },
          message: { type: Type.STRING }
        },
        required: ['action', 'message']
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    return { action: 'UNKNOWN', message: "Xin lỗi, tôi không hiểu yêu cầu của bạn." };
  }
};

export const analyzeConflicts = async (conflicts: any[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-lite-latest',
    contents: `Tôi phát hiện các xung đột lịch trình sau: ${JSON.stringify(conflicts)}. 
    Hãy viết một thông báo cảnh báo ngắn gọn, thân thiện và chuyên nghiệp.`,
  });
  return response.text;
};