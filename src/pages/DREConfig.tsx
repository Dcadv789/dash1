import React, { useState, useEffect } from 'react';
import { Plus, Copy } from 'lucide-react';
import { DREConfigAccountRow } from '../components/DREConfig/DREConfigAccountRow';
import { DREConfigAccountModal } from '../components/DREConfig/DREConfigAccountModal';
import { DREConfigCopyModal } from '../components/DREConfig/DREConfigCopyModal';
import { Company } from '../types/company';
import { Category, Indicator } from '../types/financial';
import { DREConfigAccount } from '../types/DREConfig';
import { supabase } from '../lib/supabase';

type AccountType = 'all' | 'revenue' | 'expense' | 'total' | 'flex';

const TYPE_LABELS = {
  all: 'Todos',
  revenue: 'Receita',
  expense: 'Despesa',
  total: 'Totalizador',
  flex: 'Flexível'
};

export const DREConfig = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accounts, setAccounts] = useState<DREConfigAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AccountType>('all');
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DREConfigAccount | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState('');
  const [copyToCompanyId, setCopyToCompanyId] = useState('');

  useEffect(() => {
    fetchCompanies();
    fetchCategories();
    fetchIndicators();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchAccounts();
    }
  }, [selectedCompanyId]);

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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('code');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
    }
  };

  const fetchIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from('indicators')
        .select('*')
        .order('code');

      if (error) throw error;
      setIndicators(data || []);
    } catch (err) {
      console.error('Erro ao carregar indicadores:', err);
      setError('Erro ao carregar indicadores');
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('dre_config_accounts')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('display_order');

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Erro ao carregar contas');
    }
  };

  const handleSaveAccount = async (account: DREConfigAccount) => {
    try {
      const accountData = {
        name: account.name,
        type: account.type,
        company_id: selectedCompanyId,
        category_ids: account.categoryIds,
        indicator_id: account.indicatorId,
        selected_accounts: account.selectedAccounts,
        parent_account_id: account.parentAccountId,
        is_active: account.isActive,
        sign: account.sign,
        display_order: account.displayOrder
      };

      if (editingAccount) {
        const { error } = await supabase
          .from('dre_config_accounts')
          .update(accountData)
          .eq('id', editingAccount.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dre_config_accounts')
          .insert([accountData]);

        if (error) throw error;
      }

      setShowNewAccountModal(false);
      setEditingAccount(null);
      fetchAccounts();
    } catch (err) {
      console.error('Erro ao salvar conta:', err);
      setError('Erro ao salvar conta');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
      const { error } = await supabase
        .from('dre_config_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      fetchAccounts();
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      setError('Erro ao excluir conta');
    }
  };

  const handleCopyAccounts = async () => {
    if (!copyFromCompanyId || !copyToCompanyId) return;

    try {
      const { data: sourceAccounts, error: fetchError } = await supabase
        .from('dre_config_accounts')
        .select('*')
        .eq('company_id', copyFromCompanyId);

      if (fetchError) throw fetchError;

      if (sourceAccounts) {
        const newAccounts = sourceAccounts.map(acc => ({
          ...acc,
          id: undefined,
          company_id: copyToCompanyId,
          created_at: undefined,
          updated_at: undefined
        }));

        const { error: insertError } = await supabase
          .from('dre_config_accounts')
          .insert(newAccounts);

        if (insertError) throw insertError;
      }

      setShowCopyModal(false);
      setCopyFromCompanyId('');
      setCopyToCompanyId('');
      fetchAccounts();
    } catch (err) {
      console.error('Erro ao copiar contas:', err);
      setError('Erro ao copiar contas');
    }
  };

  const getChildAccounts = (accountId: string | null): DREConfigAccount[] => {
    return accounts.filter(acc => acc.parentAccountId === accountId);
  };

  const handleMoveAccount = async (accountId: string, direction: 'up' | 'down') => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    const siblings = accounts.filter(acc => 
      acc.parentAccountId === account.parentAccountId
    ).sort((a, b) => a.displayOrder - b.displayOrder);

    const currentIndex = siblings.findIndex(acc => acc.id === accountId);
    
    if (direction === 'up' && currentIndex > 0) {
      const prevAccount = siblings[currentIndex - 1];
      await updateAccountOrder(account, prevAccount.displayOrder);
      await updateAccountOrder(prevAccount, account.displayOrder);
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      const nextAccount = siblings[currentIndex + 1];
      await updateAccountOrder(account, nextAccount.displayOrder);
      await updateAccountOrder(nextAccount, account.displayOrder);
    }

    fetchAccounts();
  };

  const updateAccountOrder = async (account: DREConfigAccount, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('dre_config_accounts')
        .update({ display_order: newOrder })
        .eq('id', account.id);

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao atualizar ordem:', err);
      setError('Erro ao atualizar ordem das contas');
    }
  };

  const toggleAccountStatus = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    try {
      const { error } = await supabase
        .from('dre_config_accounts')
        .update({ is_active: !account.isActive })
        .eq('id', accountId);

      if (error) throw error;
      fetchAccounts();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status da conta');
    }
  };

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
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewAccountModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Conta
          </button>
          <button
            onClick={() => setShowCopyModal(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-2"
          >
            <Copy size={20} />
            Copiar DRE
          </button>
        </div>
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
              {accounts
                .filter(acc => !acc.parentAccountId)
                .filter(acc => selectedType === 'all' || acc.type === selectedType)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(account => (
                  <DREConfigAccountRow
                    key={account.id}
                    account={account}
                    level={0}
                    onToggleExpansion={(id) => {
                      setAccounts(accounts.map(acc =>
                        acc.id === id ? { ...acc, isExpanded: !acc.isExpanded } : acc
                      ));
                    }}
                    onToggleStatus={toggleAccountStatus}
                    onStartEditing={setEditingAccount}
                    onMoveAccount={handleMoveAccount}
                    onDelete={handleDeleteAccount}
                    childAccounts={getChildAccounts(account.id)}
                  />
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
        parentAccounts={accounts.filter(acc => 
          acc.type === 'total' || acc.type === 'flex'
        )}
      />

      <DREConfigCopyModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        companies={companies}
        copyFromCompanyId={copyFromCompanyId}
        copyToCompanyId={copyToCompanyId}
        onCopyFromChange={setCopyFromCompanyId}
        onCopyToChange={setCopyToCompanyId}
        onCopy={handleCopyAccounts}
      />
    </div>
  );
};