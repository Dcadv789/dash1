import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface Company {
  id: string;
  trading_name: string;
}

interface DREAccount {
  id: string;
  nome: string;
  tipo: 'simples' | 'composta' | 'formula' | 'indicador' | 'soma_indicadores';
  ordem_padrao: number;
  visivel: boolean;
}

interface DREData {
  accountId: string;
  name: string;
  value: number;
  type: string;
  order: number;
  isExpanded?: boolean;
  children?: DREData[];
}

interface SystemUser {
  id: string;
  role: string;
  company_id: string | null;
  has_all_companies_access: boolean;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DREVisualizacao = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [dreData, setDreData] = useState<DREData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.has_all_companies_access) {
        fetchCompanies();
      } else if (currentUser.company_id) {
        setSelectedCompanyId(currentUser.company_id);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedCompanyId && selectedYear && selectedMonth) {
      fetchDREData();
    }
  }, [selectedCompanyId, selectedYear, selectedMonth]);

  const fetchUserData = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('system_users')
        .select('id, role, company_id, has_all_companies_access')
        .eq('auth_user_id', user?.id)
        .single();

      if (userError) throw userError;
      setCurrentUser(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Erro ao carregar dados do usuário');
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, trading_name')
        .eq('is_active', true)
        .order('trading_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
    }
  };

  const fetchDREData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar contas do DRE
      const { data: accounts, error: accountsError } = await supabase
        .from('contas_dre_modelo')
        .select('*')
        .eq('visivel', true)
        .order('ordem_padrao');

      if (accountsError) throw accountsError;

      // Buscar dados brutos para o período selecionado
      const { data: rawData, error: rawDataError } = await supabase
        .from('dados_brutos')
        .select(`
          id,
          categoria_id,
          indicador_id,
          valor
        `)
        .eq('empresa_id', selectedCompanyId)
        .eq('ano', selectedYear)
        .eq('mes', selectedMonth);

      if (rawDataError) throw rawDataError;

      // Processar os dados
      const processedData = await processAccountsData(accounts || [], rawData || []);
      setDreData(processedData);
    } catch (err) {
      console.error('Erro ao carregar dados do DRE:', err);
      setError('Erro ao carregar dados do DRE');
    } finally {
      setLoading(false);
    }
  };

  const processAccountsData = async (accounts: DREAccount[], rawData: any[]) => {
    const processedData: DREData[] = [];

    for (const account of accounts) {
      const value = calculateAccountValue(account, rawData);
      
      processedData.push({
        accountId: account.id,
        name: account.nome,
        value,
        type: account.tipo,
        order: account.ordem_padrao,
        isExpanded: true
      });
    }

    return processedData;
  };

  const calculateAccountValue = (account: DREAccount, rawData: any[]): number => {
    // Implementar lógica de cálculo baseada no tipo da conta
    switch (account.tipo) {
      case 'simples':
        return rawData.reduce((sum, data) => sum + (data.valor || 0), 0);
      case 'composta':
        // Implementar lógica para contas compostas
        return 0;
      case 'formula':
        // Implementar lógica para fórmulas
        return 0;
      case 'indicador':
        return rawData.find(data => data.indicador_id === account.id)?.valor || 0;
      case 'soma_indicadores':
        // Implementar lógica para soma de indicadores
        return 0;
      default:
        return 0;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Carregando dados do DRE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              Demonstrativo de Resultados
            </h1>
            <p className="text-zinc-400 mt-1">
              Visualize o DRE por período
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="text-zinc-500" size={20} />
            <span className="text-zinc-400">
              {selectedMonth} de {selectedYear}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentUser?.has_all_companies_access && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Empresa
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
              >
                <option value="">Selecione uma empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.trading_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Ano
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
            >
              {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Mês
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
            >
              {MONTHS.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">
                    Conta
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {dreData.map((item) => (
                  <tr key={item.accountId} className="border-b border-zinc-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.children ? (
                          <button
                            onClick={() => {
                              setDreData(dreData.map(d => 
                                d.accountId === item.accountId 
                                  ? { ...d, isExpanded: !d.isExpanded }
                                  : d
                              ));
                            }}
                            className="p-1 hover:bg-zinc-800 rounded transition-colors"
                          >
                            {item.isExpanded ? (
                              <ChevronDown size={16} className="text-zinc-400" />
                            ) : (
                              <ChevronRight size={16} className="text-zinc-400" />
                            )}
                          </button>
                        ) : (
                          <span className="w-6" />
                        )}
                        <span className="text-zinc-300">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`${
                        item.value < 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {formatCurrency(item.value)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};