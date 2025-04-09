export interface CategoryGroup {
  id: string;
  name: string;
  type: 'revenue' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense';
  group_id: string | null;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyCategory {
  id: string;
  company_id: string;
  category_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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