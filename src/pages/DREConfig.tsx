import React, { useState, useEffect } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { DREConfigAccountRow } from '../components/DREConfig/DREConfigAccountRow';
import { DREConfigAccountModal } from '../components/DREConfig/DREConfigAccountModal';
import { useDREConfigAccounts } from '../hooks/useDREConfigAccounts';
import { Company } from '../types/company';
import { Category, Indicator } from '../types/financial';
import { DREConfigAccount } from '../types/DREConfig';
import { supabase } from '../lib/supabase';

type AccountType = 'all' | 'revenue' | 'expense' | 'flex' | 'total';

const TYPE_LABELS = {
  all: 'Todos',
  revenue: 'Receita',
  expense: 'Despesa',
  flex: 'Flex',
  total: 'Totalizador'
};

export const DREConfig = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AccountType>('all');
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DREConfigAccount | null>(null);
  const [categories] = useState<Category[]>(() => []);
  const [indicators] = useState<Indicator[]>(() => []);
  const [accountCompanies, setAccountCompanies] = useState<{[key: string]: string[]}>({});

  const {
    accounts,
    setAccounts,
    getChildAccounts,
    moveAccount,
    toggleAccountStatus,
    toggleAccountExpansion,
    deleteAccount
  } = useDREConfigAccounts(selectedCompanyId);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, trading_name, name')
        .eq('is_active', true)
        .order('trading_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = (account: DREConfigAccount) => {
    if (editingAccount) {
      setAccounts(accounts.map(acc => 
        acc.id === account.id ? account : acc
      ));
    } else {
      setAccounts([...accounts, account]);
    }
    setShowNewAccountModal(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      deleteAccount(accountId);
    }
  };

  const toggleCompanyForAccount = (accountId: string, companyId: string) => {
    setAccountCompanies(prev => {
      const companies = prev[accountId] || [];
      const newCompanies = companies.includes(companyId)
        ? companies.filter(id => id !== companyId)
        : [...companies, companyId];
      
      return {
        ...prev,
        [accountId]: newCompanies
      };
    });
  };

  const isCompanySelectedForAccount = (accountId: string, companyId: string) => {
    return (accountCompanies[accountId] || []).includes(companyId);
  };

  const sortedAccounts = [...accounts]
    .filter(acc => !selectedCompanyId || acc.companyId === selectedCompanyId)
    .filter(acc => selectedType === 'all' || acc.type === selectedType)
    .filter(acc => !acc.parentAccountId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">DRE Config</h1>
          <p className="text-zinc-400 mt-1">Configuração do Demonstrativo de Resultados</p>
        </div>
        <button
          onClick={() => setShowNewAccountModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-3"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Filtrar por Empresa
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
            >
              <option value="">Todas as empresas</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.trading_name} - {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:w-72">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Tipo de Conta
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(TYPE_LABELS) as [AccountType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Código</th>
                <th className="px-2 py-4 text-left text-sm font-semibold text-zinc-400">Conta</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-400">Tipo</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedAccounts.map(account => (
                <React.Fragment key={account.id}>
                  <DREConfigAccountRow
                    account={account}
                    level={0}
                    onToggleExpansion={toggleAccountExpansion}
                    onToggleStatus={toggleAccountStatus}
                    onStartEditing={setEditingAccount}
                    onMoveAccount={moveAccount}
                    onDelete={handleDeleteAccount}
                    childAccounts={getChildAccounts(account.id)}
                  />
                  <tr>
                    <td colSpan={4} className="px-6 py-2 border-b border-zinc-800">
                      <div className="flex flex-wrap gap-2">
                        {companies.map(company => (
                          <button
                            key={company.id}
                            onClick={() => toggleCompanyForAccount(account.id, company.id)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              isCompanySelectedForAccount(account.id, company.id)
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-zinc-700/50 text-zinc-400'
                            }`}
                          >
                            {company.trading_name}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DREConfigAccountModal
        isOpen={showNewAccountModal || editingAccount !== null}
        onClose={() => {
          setShowNewAccountModal(false);
          setEditingAccount(null);
        }}
        editingAccount={editingAccount}
        onSave={handleSaveAccount}
        selectedCompanyId={selectedCompanyId}
        categories={categories}
        indicators={indicators}
        parentAccounts={[]}
      />
    </div>
  );
};