export interface Category {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense';
  groupId: string | null;
  companyId: string;
  isActive: boolean;
}

export interface Indicator {
  id: string;
  code: string;
  name: string;
  formula: string;
  displayOrder: number;
  companyId: string;
  isActive: boolean;
}