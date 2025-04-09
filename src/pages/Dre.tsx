import React, { useState, useEffect } from 'react';
import { Copy, PencilIcon, Save, Check, X, Plus, Minus, Equal, ArrowUp, ArrowDown, FolderPlus, Power, ChevronDown, ChevronRight } from 'lucide-react';

interface DreAccount {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense' | 'total';
  displayOrder: number;
  companyId: string;
  isEditing?: boolean;
  categoryIds?: string[];
  indicatorId?: string;
  selectedAccounts?: string[];
  parentAccountId?: string | null;
  isActive: boolean;
  isExpanded?: boolean;
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

interface Indicator {
  id: string;
  code: string;
  name: string;
  formula: string;
  displayOrder: number;
  companyId: string;
  isActive: boolean;
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

  const [indicators] = useState<Indicator[]>(() => 
    loadFromStorage('indicators', [])
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<number>(0);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccountType, setNewAccountType] = useState<'category' | 'indicator' | 'total'>('category');
  const [categoryType, setCategoryType] = useState<'revenue' | 'expense'>('revenue');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [selectedDreAccounts, setSelectedDreAccounts] = useState<string[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [editingAccount, setEditingAccount] = useState<DreAccount | null>(null);
  const [selectedParentAccount, setSelectedParentAccount] = useState<string | null>(null);

  useEffect(() => {
    saveToStorage('dre_accounts', accounts);
  }, [accounts]);

  const calculateAccountValue = (accountId: string): number => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return 0;

    if (account.categoryIds && account.categoryIds.length > 0) {
      return account.type === 'revenue' ? 1 : -1;
    }

    if (account.selectedAccounts && account.selectedAccounts.length > 0) {
      return account.selectedAccounts.reduce((sum, childId) => {
        return sum + calculateAccountValue(childId);
      }, 0);
    }

    return 0;
  };

  const toggleAccountExpansion = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, isExpanded: !acc.isExpanded } : acc
    ));
  };

  const getChildAccounts = (accountId: string): DreAccount[] => {
    return accounts.filter(acc => 
      acc.parentAccountId === accountId && 
      acc.companyId === selectedCompanyId
    );
  };

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

  const filteredCategories = categories.filter(category => 
    category.companyId === selectedCompanyId &&
    category.type === categoryType &&
    category.isActive &&
    category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
    !selectedCategories.some(sc => sc.id === category.id)
  );

  const filteredIndicators = indicators.filter(indicator =>
    indicator.companyId === selectedCompanyId &&
    indicator.isActive &&
    indicator.name.toLowerCase().includes(indicatorSearch.toLowerCase())
  );

  const handleAddAccount = () => {
    if (!selectedCompanyId || !newAccountName) return;

    const maxOrder = Math.max(...accounts.map(acc => acc.displayOrder), 0);
    const newAccount: DreAccount = {
      id: Math.random().toString(36).substr(2, 9),
      code: `A${(accounts.length + 1).toString().padStart(2, '0')}`,
      name: newAccountName,
      type: newAccountType === 'category' ? categoryType : 'total',
      displayOrder: maxOrder + 1,
      companyId: selectedCompanyId,
      parentAccountId: selectedParentAccount,
      isActive: true,
      isExpanded: false
    };

    if (newAccountType === 'category' && selectedCategories.length > 0) {
      newAccount.categoryIds = selectedCategories.map(c => c.id);
    } else if (newAccountType === 'indicator' && selectedIndicator) {
      newAccount.indicatorId = selectedIndicator.id;
    } else if (newAccountType === 'total') {
      newAccount.selectedAccounts = selectedDreAccounts;
    }

    setAccounts([...accounts, newAccount]);
    resetNewAccountForm();
    setShowNewAccountModal(false);
  };

  const handleEditAccount = () => {
    if (!editingAccount) return;

    setAccounts(accounts.map(acc => 
      acc.id === editingAccount.id ? editingAccount : acc
    ));
    setEditingAccount(null);
  };

  const toggleAccountStatus = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, isActive: !acc.isActive } : acc
    ));
  };

  const resetNewAccountForm = () => {
    setNewAccountType('category');
    setNewAccountName('');
    setCategoryType('revenue');
    setCategorySearch('');
    setSelectedCategories([]);
    setIndicatorSearch('');
    setSelectedIndicator(null);
    setSelectedDreAccounts([]);
    setSelectedParentAccount(null);
  };

  const handleToggleCategory = (category: Category) => {
    setSelectedCategories(prev => {
      const isSelected = prev.some(c => c.id === category.id);
      if (isSelected) {
        return prev.filter(c => c.id !== category.id);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleToggleAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    setSelectedDreAccounts(prev => {
      const isSelected = prev.includes(accountId);
      if (isSelected) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const renderAccountRow = (account: DreAccount, level: number = 0) => {
    const childAccounts = getChildAccounts(account.id);
    const hasChildren = childAccounts.length > 0;
    const accountValue = calculateAccountValue(account.id);
    
    return (
      <React.Fragment key={account.id}>
        <tr className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${!account.isActive && 'opacity-50'}`}>
          <td className="px-6 py-4">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleAccountExpansion(account.id)}
                  className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                >
                  {account.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <span className="text-zinc-400 font-mono">{account.code}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              {account.type === 'revenue' && <Plus size={16} className="text-green-400" />}
              {account.type === 'expense' && <Minus size={16} className="text-red-400" />}
              {account.type === 'total' && <Equal size={16} className="text-blue-400" />}
              <span className="text-zinc-100">{account.name}</span>
            </div>
          </td>
          <td className="px-6 py-4 text-right">
            <span className={`font-mono ${
              accountValue > 0 ? 'text-green-400' : accountValue < 0 ? 'text-red-400' : 'text-zinc-400'
            }`}>
              {accountValue.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL'
              })}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => toggleAccountStatus(account.id)}
                className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                  account.isActive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <Power size={16} />
              </button>
              <button
                onClick={() => setEditingAccount(account)}
                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
              >
                <PencilIcon size={16} />
              </button>
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
        {account.isExpanded && childAccounts.map(childAccount => 
          renderAccountRow(childAccount, level + 1)
        )}
      </React.Fragment>
    );
  };

  const sortedAccounts = [...accounts]
    .filter(acc => acc.companyId === selectedCompanyId && !acc.parentAccountId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-6xl mx-auto py-8">
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

      {selectedCompanyId ? (
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Código</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Conta</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Valor</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedAccounts.map(account => renderAccountRow(account))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Selecione uma empresa para visualizar o DRE</p>
        </div>
      )}

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
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="Nome da conta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Conta Pai (Opcional)
                </label>
                <select
                  value={selectedParentAccount || ''}
                  onChange={(e) => setSelectedParentAccount(e.target.value || null)}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                >
                  <option value="">Nenhuma (Conta Principal)</option>
                  {accounts
                    .filter(acc => acc.companyId === selectedCompanyId && acc.type === 'total')
                    .map(account => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                </select>
              </div>

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
                      checked={newAccountType === 'indicator'}
                      onChange={() => setNewAccountType('indicator')}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-300">Indicador</span>
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

              {newAccountType === 'category' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Tipo de Categoria
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={categoryType === 'revenue'}
                          onChange={() => {
                            setCategoryType('revenue');
                            setSelectedCategories([]);
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-zinc-300">Receita</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={categoryType === 'expense'}
                          onChange={() => {
                            setCategoryType('expense');
                            setSelectedCategories([]);
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-zinc-300">Despesa</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Buscar Categoria
                    </label>
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                      placeholder="Digite para buscar..."
                    />
                    
                    {categorySearch && (
                      <div className="mt-2 max-h-40 overflow-y-auto bg-zinc-800 rounded-lg">
                        {filteredCategories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => handleToggleCategory(category)}
                            className="w-full px-4 py-2 text-left hover:bg-zinc-700 text-zinc-300"
                          >
                            {category.code} - {category.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Categorias Selecionadas
                      </label>
                      <div className="space-y-2">
                        {selectedCategories.map(category => (
                          <div key={category.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg">
                            <span className="text-zinc-300">
                              {category.code} - {category.name}
                            </span>
                            <button
                              onClick={() => handleToggleCategory(category)}
                              className="text-zinc-400 hover:text-red-400"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {newAccountType === 'indicator' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Buscar Indicador
                  </label>
                  <input
                    type="text"
                    value={indicatorSearch}
                    onChange={(e) => setIndicatorSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                    placeholder="Digite para buscar..."
                  />
                  
                  {indicatorSearch && (
                    <div className="mt-2 max-h-40 overflow-y-auto bg-zinc-800 rounded-lg">
                      {filteredIndicators.map(indicator => (
                        <button
                          key={indicator.id}
                          onClick={() => {
                            setSelectedIndicator(indicator);
                            setIndicatorSearch('');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-zinc-700 text-zinc-300"
                        >
                          {indicator.code} - {indicator.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedIndicator && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Indicador Selecionado
                      </label>
                      <div className="bg-zinc-800 p-2 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">
                            {selectedIndicator.code} - {selectedIndicator.name}
                          </span>
                          <button
                            onClick={() => setSelectedIndicator(null)}
                            className="text-zinc-400 hover:text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {newAccountType === 'total' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Selecionar Contas
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {accounts
                      .filter(acc => acc.companyId === selectedCompanyId && acc.type !== 'total')
                      .map(account => {
                        const isSelected = selectedDreAccounts.includes(account.id);
                        return (
                          <div key={account.id} className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleAccount(account.id)}
                              className="text-blue-600"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                {account.type === 'revenue' && <Plus size={16} className="text-green-400" />}
                                {account.type === 'expense' && <Minus size={16} className="text-red-400" />}
                              </div>
                              <span className="text-zinc-300">
                                {account.code} - {account.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
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
                  !newAccountName ||
                  (newAccountType === 'category' && selectedCategories.length === 0) ||
                  (newAccountType === 'indicator' && !selectedIndicator) ||
                  (newAccountType === 'total' && selectedDreAccounts.length === 0)
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => {
                  setShowCopyModal(false);
                  setCopyFromCompanyId('');
                  setCopyToCompanyId('');
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={copyAccounts}
                disabled={!copyFromCompanyId || !copyToCompanyId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
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