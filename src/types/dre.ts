export interface DreAccount {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense' | 'total' | 'blank';
  displayOrder: number;
  companyId: string;
  isEditing?: boolean;
  categoryIds?: string[];
  indicatorId?: string;
  selectedAccounts?: string[];
  parentAccountId?: string | null;
  isActive: boolean;
  isExpanded?: boolean;
  level?: number;
  sign?: 'positive' | 'negative';
}