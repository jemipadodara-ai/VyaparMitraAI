export type TaskCategory =
  | 'Order'
  | 'Payment Reminder'
  | 'Delivery Instruction'
  | 'Customer Follow-up'
  | 'Task';

export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Not Applicable';

export type TaskStatus = 'New' | 'In Progress' | 'Completed' | 'Pending Payment';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface ExtractedTaskData {
  id?: string;
  customerName: string;
  actionType: TaskCategory;
  summary: string;
  summaryGujarati: string;
  itemsQuantity: string;
  amount: number | null;
  formattedAmount: string;
  paymentStatus: PaymentStatus;
  dueDate: string; // e.g. "2026-08-10" or "Tomorrow"
  dueDateLabel: string; // e.g. "કાલે (10 ઓગસ્ટ)"
  priority: TaskPriority;
  status: TaskStatus;
  suggestedNextAction: string;
  suggestedNextActionGujarati: string;
  whatsappMessage: string;
  whatsappMessageEnglish: string;
  confidenceScore: number; // 0 - 100
  detectedLanguage: 'Gujarati' | 'Gujlish' | 'English' | 'Mixed' | 'Manual Entry';
  createdAt?: string;
  originalAudioText?: string;
}

export interface ParseInstructionRequest {
  text?: string;
  audioBase64?: string;
  mimeType?: string;
}

export interface ParseInstructionResponse {
  success: boolean;
  data?: ExtractedTaskData;
  error?: string;
  rawText?: string;
}

export interface UserAccount {
  id: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  pin: string;
  businessType: 'Retailer' | 'Wholesaler' | 'Contractor' | 'Service/Tuition' | 'Manufacturer' | 'Other';
  createdAt: string;
}

export interface SamplePreset {
  id: string;
  title: string;
  titleGujarati: string;
  userType: 'Shopkeeper' | 'Distributor' | 'Manufacturer' | 'Tuition' | 'Service/Contractor';
  rawInstruction: string;
  scriptType: 'Gujarati' | 'Gujlish';
  description: string;
}
