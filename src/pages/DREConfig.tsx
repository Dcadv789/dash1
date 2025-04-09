import React, { useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { DREConfigAccountRow } from '../components/DREConfig/DREConfigAccountRow';
import { DREConfigAccountModal } from '../components/DREConfig/DREConfigAccountModal';
import { useDREConfigAccounts } from '../hooks/useDREConfigAccounts';
import { Company } from '../types/company';
import { Category, Indicator } from '../types/financial';
import { DREConfigAccount } from '../types/DREConfig';

const loadFromStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const DREConfig = () => {
  const [companies] = useState<Company[]>(() => 
    loadFromStorage('companies', [])
  );

  const [categories] = useState<Category[]>(() => 
    loadFromStorage('categories', [])
  );

  const [indicators] = useState<Indicator[]>(() => 
    loadFromStorage('indicators', [])
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DREConfigAccount | null>(null);

  const {
    accounts,
    setAccounts,
    getChildAccounts,
    moveAccount,
    toggleAccountStatus,
    toggleAccountExpansion,
    deleteAccount
  } = useDREConfigAccounts(selectedCompanyId);

  const getAvailableParentAccounts = (currentAccountId?: string): DREConfigAccount[] => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId);
    if (!selectedCompany) return [];

    const availableAccounts = accounts.filter(acc => {
      if (acc.companyId !== selectedCompanyId) return false;
      if (acc.type !== 'total' && acc.type !== 'blank') return false;
      if (acc.id === currentAccountId) return false;
      if (isDescendant(acc.id, currentAccountId)) return false;
      const level = getAccountLevel(acc.id);
      return level < ((selectedCompany.maxDreLevel || 3) - 1);
    });

    return availableAccounts;
  };

  const getAccountLevel = (accountId: string | null): number => {
    if (!accountId) return 0;
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return 0;
    return 1 + getAccountLevel(account.parentAccountId);
  };

  const isDescendant = (potentialParentId: string, accountId?: string): boolean => {
    if (!accountId) return false;
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return false;
    if (account.parentAccountId === potentialParentId) return true;
    return isDescendant(potentialParentId, account.parentAccountId);
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

  const sortedAccounts = [...accounts]
    .filter(acc => acc.companyId === selectedCompanyId && !acc.parentAccountId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

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

      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-zinc-400" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 min-w-[200px] appearance-none"
            >
              <option value="">Selecione uma empresa</option>
              {companies.filter(c => c.isActive).map(company => (
                <option key={company.id} value={company.id}>
                  {company.tradingName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedCompanyId ? (
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
                  <DREConfigAccountRow
                    key={account.id}
                    account={account}
                    level={0}
                    onToggleExpansion={toggleAccountExpansion}
                    onToggleStatus={toggleAccountStatus}
                    onStartEditing={setEditingAccount}
                    onMoveAccount={moveAccount}
                    onDelete={handleDeleteAccount}
                    childAccounts={getChildAccounts(account.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Selecione uma empresa para visualizar o DRE</p>
        </div>
      )}

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
        parentAccounts={getAvailableParentAccounts(editingAccount?.id)}
      />
    </div>
  );
};