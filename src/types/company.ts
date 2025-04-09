export interface Company {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  isActive: boolean;
  maxDreLevel?: number;
}