import React, { useState, useEffect } from 'react';
import { Copy, PencilIcon, Save, Check, X, Plus, Minus, Equal, ArrowUp, ArrowDown, FolderPlus } from 'lucide-react';

interface DreAccount {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense' | 'total';
  displayOrder: number;
  companyId: string;
  isEditing?: boolean;
  categoryId?: string; // ID da categoria vinculada
  sumGroups?: string[]; // IDs dos grupos a serem somados
}

interface Category {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense';
  groupId: string | null;
  companyId: string;
  isActive: boolean;
}

interface CategoryGroup {
  id: string;
  name: string;
  type: 'revenue' | 'expense';
  companyId: string;
}

interface Company {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  isActive: boolean;
}

const loadFromStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const DEFAULT_TOTALS = [
  { code: 'T01', name: 'Receita Bruta', type: 'total', afterCode: 'R' },
  { code: 'T02', name: 'Receita Líquida', type: 'total', afterCode: 'R' },
  { code: 'T03', name: 'Lucro Bruto', type: 'total', afterCode: 'D' },
  { code: 'T04', name: 'Resultado Operacional', type: 'total', afterCode: 'D' },
  { code: 'T05', name: 'Resultado Antes do IR', type: 'total', afterCode: 'D' },
  { code: 'T06', name: 'Resultado Líquido', type: 'total', afterCode: 'D' }
];

export const Dre = () => {
  const [companies, setCompanies] = useState<Company[]>(() => 
    loadFromStorage('companies', [
      {
        id: 'COMP001',
        name: 'TechCorp Solutions Ltda',
        tradingName: 'TechCorp',
        cnpj: '12.345.678/0001-90',
        isActive: true
      },
      {
        id: 'COMP002',
        name: 'Inovação Digital S.A.',
        tradingName: 'InovaTech',
        cnpj: '23.456.789/0001-01',
        isActive: true
      },
      {
        id: 'COMP003',
        name: 'Global Software Enterprise',
        tradingName: 'GSE',
        cnpj: '34.567.890/0001-12',
        isActive: true
      }
    ])
  );

  const [accounts, setAccounts] = useState<DreAccount[]>(() => 
    loadFromStorage('dre_accounts', [])
  );

  const [categories] = useState<Category[]>(() => 
    loadFromStorage('categories', [])
  );

  const [groups] = useState<CategoryGroup[]>(() => 
    loadFromStorage('category_groups', [])
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<number>(0);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccountType, setNewAccountType] = useState<'category' | 'total'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [newAccountName, setNewAccountName] = useState('');

  useEffect(() => {
    saveToStorage('dre_accounts', accounts);
  }, [accounts]);

  const startEditingOrder = (accountId: string, currentOrder: number) => {
    setEditingOrder(accountId);
    setNewOrder(currentOrder);
  };

  const saveOrder = (accountId: string) => {
    if (newOrder < 1) return;

    setAccounts(accounts.map(acc => 
      acc.id === accountId
        ? { ...acc, displayOrder: newOrder }
        : acc
    ));
    setEditingOrder(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, accountId: string) => {
    if (e.key === 'Enter') {
      saveOrder(accountId);
    }
  };

  const copyAccounts = () => {
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

  const moveAccount = (accountId: string, direction: 'up' | 'down') => {
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    const account = accounts[accountIndex];
    
    if (!account) return;

    const newAccounts = [...accounts];
    if (direction === 'up' && accountIndex > 0) {
      const temp = newAccounts[accountIndex - 1].displayOrder;
      newAccounts[accountIndex - 1].displayOrder = account.displayOrder;
      newAccounts[accountIndex].displayOrder = temp;
    } else if (direction === 'down' && accountIndex < accounts.length - 1) {
      const temp = newAccounts[accountIndex + 1].displayOrder;
      newAccounts[accountIndex + 1].displayOrder = account.displayOrder;
      newAccounts[accountIndex].displayOrder = temp;
    }

    setAccounts(newAccounts);
  };

  const handleAddAccount = () => {
    if (!selectedCompanyId) return;

    const maxOrder = Math.max(...accounts.map(acc => acc.displayOrder), 0);
    const newAccount: DreAccount = {
      id: Math.random().toString(36).substr(2, 9),
      code: `A${(accounts.length + 1).toString().padStart(2, '0')}`,
      name: newAccountName || (newAccountType === 'category' 
        ? categories.find(c => c.id === selectedCategory)?.name || ''
        : 'Novo Totalizador'),
      type: newAccountType === 'category' 
        ? (categories.find(c => c.id === selectedCategory)?.type || 'revenue')
        : 'total',
      displayOrder: maxOrder + 1,
      companyId: selectedCompanyId,
      categoryId: newAccountType === 'category' ? selectedCategory : undefined,
      sumGroups: newAccountType === 'total' ? selectedGroups : undefined
    };

    setAccounts([...accounts, newAccount]);
    setShowNewAccountModal(false);
    resetNewAccountForm();
  };

  const resetNewAccountForm = () => {
    setNewAccountType('category');
    setSelectedCategory('');
    setSelectedGroups([]);
    setNewAccountName('');
  };

  const renderAccountTypeIcon = (type: 'revenue' | 'expense' | 'total') => {
    switch (type) {
      case 'revenue':
        return <Plus size={16} className="text-green-400" />;
      case 'expense':
        return <Minus size={16} className="text-red-400" />;
      case 'total':
        return <Equal size={16} className="text-blue-400" />;
    }
  };

  const sortedAccounts = [...accounts]
    .filter(acc => acc.companyId === selectedCompanyId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Cabeçalho */}
      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">DRE</h1>
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

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Empresa
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-zinc-800 text-zinc-100 rounded-lg px-4 py-3 w-full md:w-96"
            >
              <option value="">Selecione uma empresa</option>
              {companies.filter(c => c.isActive).map(company => (
                <option key={company.id} value={company.id}>
                  {company.tradingName} - {company.name}
                </option>
              ))}
            </select>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Ordem</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Código</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Nome</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      {editingOrder === account.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newOrder}
                            onChange={(e) => setNewOrder(Number(e.target.value))}
                            onKeyPress={(e) => handleKeyPress(e, account.id)}
                            className="w-20 bg-zinc-800 rounded px-2 py-1 text-zinc-100"
                            min="1"
                          />
                          <button
                            onClick={() => saveOrder(account.id)}
                            className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-green-400"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingOrder(null)}
                            className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span 
                          className="text-zinc-400 cursor-pointer hover:text-zinc-100"
                          onClick={() => startEditingOrder(account.id, account.displayOrder)}
                        >
                          {account.displayOrder}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 font-mono">{account.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800">
                        {renderAccountTypeIcon(account.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-100">{account.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => moveAccount(account.id, 'up')}
                          className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveAccount(account.id, 'down')}
                          className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
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

      {/* Modal de Nova Conta */}
      {showNewAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                Nova Conta
              </h3>
              <button
                onClick={() => {
                  setShowNewAccountModal(false);
                  resetNewAccountForm();
                }}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tipo de Conta
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={newAccountType === 'category'}
                      onChange={() => setNewAccountType('category')}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-300">Categoria</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={newAccountType === 'total'}
                      onChange={() => setNewAccountType('total')}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-300">Totalizador</span>
                  </label>
                </div>
              </div>

              {newAccountType === 'category' ? (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Selecione uma Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  >
                    <option value="">Selecione...</option>
                    {categories
                      .filter(c => c.companyId === selectedCompanyId && c.isActive)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.code} - {category.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Nome do Totalizador
                    </label>
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                      placeholder="Ex: Resultado Operacional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Selecione os Grupos para Somar
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {groups
                        .filter(g => g.companyId === selectedCompanyId)
                        .map(group => (
                          <label key={group.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedGroups.includes(group.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGroups([...selectedGroups, group.id]);
                                } else {
                                  setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                }
                              }}
                              className="text-blue-600 rounded"
                            />
                            <span className="text-zinc-300">{group.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowNewAccountModal(false);
                  resetNewAccountForm();
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAccount}
                disabled={
                  (newAccountType === 'category' && !selectedCategory) ||
                  (newAccountType === 'total' && (!newAccountName || selectedGroups.length === 0))
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cópia */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Copiar DRE
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Copiar de:
                </label>
                <select
                  value={copyFromCompanyId}
                  onChange={(e) => setCopyFromCompanyId(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.tradingName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Copiar para:
                </label>
                <select
                  value={copyToCompanyId}
                  onChange={(e) => setCopyToCompanyId(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.tradingName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={copyAccounts}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};