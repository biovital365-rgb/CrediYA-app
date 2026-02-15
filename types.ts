export enum AppScreen {
  DASHBOARD = 'DASHBOARD',
  PERMISSIONS = 'PERMISSIONS',
  KYC = 'KYC',
  DISBURSEMENT = 'DISBURSEMENT',
  REPAYMENT = 'REPAYMENT'
}

export interface UserProfile {
  name: string;
  creditLimit: number;
  currentLevel: number;
  nextLevelLimit: number;
  kycVerified: boolean;
}

export interface LoanState {
  isActive: boolean;
  totalDebt: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  remainingInstallments: number;
}

export interface PaymentSchedule {
  date: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}
