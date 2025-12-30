
export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  SITE_MANAGER = 'SITE_MANAGER',
  BACK_OFFICE = 'BACK_OFFICE'
}

export interface Customer {
  id: string;
  name: string;
  representative: string;
  address: string;
  phone: string;
  email: string;
  lastContact: string;
}

export enum ProjectStatus {
  INQUIRY = '引合',
  ESTIMATING = '見積中',
  CONTRACTED = '契約済',
  IN_PROGRESS = '着工中',
  COMPLETED = '完工',
  CANCELLED = '失注'
}

export interface Project {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  status: ProjectStatus;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
}

export interface EstimationItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  cost: number;
}

export interface DailyReport {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  reporter: string;
  content: string;
  photos: string[];
}

export interface PaymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
}
