import React, { useState } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { DreAccountRow } from '../components/dre/DreAccountRow';
import { DreAccountModal } from '../components/dre/DreAccountModal';
import { DreCopyModal } from '../components/dre/DreCopyModal';
import { useDreAccounts } from '../hooks/useDreAccounts';
import { Company } from '../types/company';
import { Category, Indicator } from '../types/financial';
import { DreAccount } from '../types/dre';

const loadFromStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const DreConfig = () => {
  const [companies] = useState<Company[]>(() => 
    loadFromStorage('companies', [
      {
        id: 'COMP001',
        name: 'TechCorp Solutions Ltda',
        tradingName: 'TechCorp',
        cnpj: '12.345.678/0001-90',
        isActive: true,
        maxDreLevel: 3
      },
      {
        id: 'COMP002',
        name: 'Inovação Digital S.A.',
        tradingName: 'InovaTech',
        cnpj: '23.456.789/0001-01',
        isActive: true,
        maxDreLevel: 3
      },
      {
        id: 'COMP003',
        name: 'Global Software Enterprise',
        tradingName: 'GSE',
        cnpj: '34.567.890/0001-12',
        isActive: true,
        maxDreLevel: 3
      }
    ])
  );

  const [categories] = useState<Category[]>(() => 
    loadFromStorage('categories', [])
  );

  const [indicators] = useState<Indicator[]>(() => 
    loadFromStorage('indicators', [])
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DreAccount | null>(null);

  const {
    accounts,
    setAccounts,
    getChildAccounts,
    moveAccount,
    toggleAccountStatus,
    toggleAccountExpansion,
    deleteAccount
  } = useDreAccounts(selectedCompanyId);

  const handleCopyAccounts = () => {
    if (!copyFromCompanyId || !copyToCompanyId) return;

    const accountsToCopy = accounts.filter(acc => acc.companyId === copyFromCompanyId);
    const copiedAccounts = accountsToCopy.map(acc => ({
      ...acc,
      id: Math.random().toString(36).substr(2, 9),
      companyId: copyToCompanyId
    }));

    setAccounts([...accounts, ...copiedAccounts]);
    setShowCopyModal(false);
    setCopyFromCompanyId('');
    setCopyToCompanyId('');
  };

  const updateCompanyMaxLevel = (companyId: string, maxLevel: number) => {
    companies.forEach(company => {
      if (company.id === companyId) {
        company.maxDreLevel = maxLevel;
      }
    });
  };

  const getAvailableParentAccounts = (currentAccountId?: string): DreAccount[] => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId);
    if (!selectedCompany) return [];

    const availableAccounts = accounts.filter(acc => {
      // Filtra apenas contas da empresa selecionada
      if (acc.companyId !== selectedCompanyId) return false;
      
      // Filtra apenas contas do tipo totalizador ou em branco
      if (acc.type !== 'total' && acc.type !== 'blank') return false;
      
      // Não permite selecionar a própria conta como pai
      if (acc.id === currentAccountId) return false;
      
      // Não permite selecionar descendentes da conta atual como pai
      if (isDescendant(acc.id, currentAccountId)) return false;

      // Verifica o nível máximo permitido
      const level = getAccountLevel(acc.id);
      return level < (selectedCompany.maxDreLevel - 1);
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

  const handleSaveAccount = (account: DreAccount) => {
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
      {/* Cabeçalho */}
      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">DRE Config</h1>
              <p className="text-zinc-400 mt-2">Demonstrativo de Resultados</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewAccountModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-3"
              >
                <Plus size={20} />
                Nova Conta
              </button>

              <button
                onClick={() => setShowCopyModal(true)}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-3"
              >
                <Copy size={20} />
                Copiar DRE
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-96">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Empresa
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-zinc-800 text-zinc-100 rounded-lg px-4 py-3 w-full appearance-none pr-10"
              >
                <option value="">Selecione uma empresa</option>
                {companies.filter(c => c.isActive).map(company => (
                  <option key={company.id} value={company.id}>
                    {company.tradingName} - {company.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCompanyId && (
              <div className="md:w-64">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Níveis Máximos do DRE
                </label>
                <select
                  value={companies.find(c => c.id === selectedCompanyId)?.maxDreLevel || 3}
                  onChange={(e) => updateCompanyMaxLevel(selectedCompanyId, Number(e.target.value))}
                  className="bg-zinc-800 text-zinc-100 rounded-lg px-4 py-3 w-full appearance-none pr-10"
                >
                  <option value={3}>3 Níveis</option>
                  <option value={4}>4 Níveis</option>
                  <option value={5}>5 Níveis</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
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
                  <DreAccountRow
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

      {/* Modais */}
      <DreAccountModal
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

      <DreCopyModal
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