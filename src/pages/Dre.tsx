import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Copy, PencilIcon, Save, Check, X, Calculator } from 'lucide-react';

interface DreAccount {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense' | 'total';
  parentId: string | null;
  children: DreAccount[];
  companyId: string;
  isEditing?: boolean;
  isNew?: boolean;
  isTotal?: boolean;
}

interface Company {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  isActive: boolean;
  categoryLevels?: number;
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
        isActive: true,
        categoryLevels: 3
      },
      {
        id: 'COMP002',
        name: 'Inovação Digital S.A.',
        tradingName: 'InovaTech',
        cnpj: '23.456.789/0001-01',
        isActive: true,
        categoryLevels: 4
      },
      {
        id: 'COMP003',
        name: 'Global Software Enterprise',
        tradingName: 'GSE',
        cnpj: '34.567.890/0001-12',
        isActive: true,
        categoryLevels: 5
      }
    ])
  );

  const [accounts, setAccounts] = useState<DreAccount[]>(() => 
    loadFromStorage('dre_accounts', [])
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');
  const [isEditingLevels, setIsEditingLevels] = useState(false);

  useEffect(() => {
    saveToStorage('dre_accounts', accounts);
  }, [accounts]);

  useEffect(() => {
    saveToStorage('companies', companies);
  }, [companies]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const updateCompanyCategoryLevels = (levels: number) => {
    setCompanies(companies.map(company => 
      company.id === selectedCompanyId
        ? { ...company, categoryLevels: levels }
        : company
    ));
    setIsEditingLevels(false);
  };

  const generateCode = (type: 'revenue' | 'expense', parentAccount?: DreAccount) => {
    const prefix = type === 'revenue' ? 'R' : 'D';
    const parentCode = parentAccount ? parentAccount.code : '';
    const siblingAccounts = parentAccount 
      ? parentAccount.children 
      : accounts.filter(a => a.type === type && !a.parentId && a.companyId === selectedCompanyId);
    
    const nextNumber = (siblingAccounts.length + 1).toString().padStart(2, '0');
    return parentCode ? `${parentCode}.${nextNumber}` : `${prefix}${nextNumber}`;
  };

  const addAccount = (type: 'revenue' | 'expense', parentId: string | null = null) => {
    if (!selectedCompanyId) return;

    const parentAccount = parentId 
      ? findAccount(accounts, parentId)
      : undefined;

    const newAccount: DreAccount = {
      id: Math.random().toString(36).substr(2, 9),
      code: generateCode(type, parentAccount),
      name: '',
      type,
      parentId,
      children: [],
      companyId: selectedCompanyId,
      isEditing: true,
      isNew: true
    };

    if (!parentId) {
      setAccounts([...accounts, newAccount]);
    } else {
      const updateAccounts = (accs: DreAccount[]): DreAccount[] => {
        return accs.map(acc => {
          if (acc.id === parentId) {
            return { ...acc, children: [...acc.children, newAccount] };
          }
          if (acc.children.length > 0) {
            return { ...acc, children: updateAccounts(acc.children) };
          }
          return acc;
        });
      };

      setAccounts(updateAccounts(accounts));
    }
  };

  const startEditing = (accountId: string) => {
    const updateAccountEditing = (accs: DreAccount[]): DreAccount[] => {
      return accs.map(acc => {
        if (acc.id === accountId) {
          return { ...acc, isEditing: true };
        }
        if (acc.children.length > 0) {
          return { ...acc, children: updateAccountEditing(acc.children) };
        }
        return acc;
      });
    };

    setAccounts(updateAccountEditing(accounts));
  };

  const saveAccount = (accountId: string, newName: string) => {
    if (!newName.trim()) return;

    const updateAccountName = (accs: DreAccount[]): DreAccount[] => {
      return accs.map(acc => {
        if (acc.id === accountId) {
          return { 
            ...acc, 
            name: newName.trim(), 
            isEditing: false,
            isNew: false 
          };
        }
        if (acc.children.length > 0) {
          return { ...acc, children: updateAccountName(acc.children) };
        }
        return acc;
      });
    };

    setAccounts(updateAccountName(accounts));
  };

  const cancelEditing = (accountId: string, isNew: boolean = false) => {
    if (isNew) {
      deleteAccount(accountId);
    } else {
      const updateAccountEditing = (accs: DreAccount[]): DreAccount[] => {
        return accs.map(acc => {
          if (acc.id === accountId) {
            return { ...acc, isEditing: false };
          }
          if (acc.children.length > 0) {
            return { ...acc, children: updateAccountEditing(acc.children) };
          }
          return acc;
        });
      };

      setAccounts(updateAccountEditing(accounts));
    }
  };

  const copyAccounts = () => {
    if (!copyFromCompanyId || !copyToCompanyId) return;

    const deepCopyAccount = (account: DreAccount): DreAccount => {
      return {
        ...account,
        id: Math.random().toString(36).substr(2, 9),
        companyId: copyToCompanyId,
        children: account.children.map(child => deepCopyAccount(child))
      };
    };

    const accountsToCopy = accounts.filter(acc => acc.companyId === copyFromCompanyId);
    const copiedAccounts = accountsToCopy.map(acc => deepCopyAccount(acc));

    setAccounts([...accounts, ...copiedAccounts]);
    setShowCopyModal(false);
    setCopyFromCompanyId('');
    setCopyToCompanyId('');
  };

  const findAccount = (accs: DreAccount[], id: string): DreAccount | undefined => {
    for (const acc of accs) {
      if (acc.id === id) return acc;
      const found = findAccount(acc.children, id);
      if (found) return found;
    }
    return undefined;
  };

  const deleteAccount = (accountId: string) => {
    const removeAccount = (accs: DreAccount[]): DreAccount[] => {
      return accs.filter(acc => {
        if (acc.id === accountId) return false;
        if (acc.children.length > 0) {
          acc.children = removeAccount(acc.children);
        }
        return true;
      });
    };

    setAccounts(removeAccount(accounts));
  };

  const renderTotalLine = (total: typeof DEFAULT_TOTALS[0], accounts: DreAccount[]) => {
    const accountsBeforeTotal = accounts.filter(acc => 
      acc.companyId === selectedCompanyId && 
      acc.code.startsWith(total.afterCode)
    );

    return (
      <div key={total.code} className="border-t-2 border-zinc-700 mt-4 pt-4">
        <div className="flex items-center gap-4 py-2 bg-zinc-800/50">
          <span className="text-zinc-400 font-mono text-sm w-20">{total.code}</span>
          <span className="text-zinc-100 font-semibold flex-1">{total.name}</span>
          <div className="flex items-center gap-2 px-4">
            <Calculator size={16} className="text-zinc-400" />
            <span className="text-zinc-300">
              {accountsBeforeTotal.length} contas
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderAccountItem = (account: DreAccount, level: number = 0) => {
    if (!selectedCompany || level >= selectedCompany.categoryLevels!) return null;

    return (
      <div key={account.id} className="border-l-2 border-zinc-700 ml-4 pl-4">
        <div className="flex items-center gap-4 py-2">
          <span className="text-zinc-400 font-mono text-sm w-20">{account.code}</span>
          {account.isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={account.name}
                onChange={(e) => {
                  const updateAccountName = (accs: DreAccount[]): DreAccount[] => {
                    return accs.map(acc => {
                      if (acc.id === account.id) {
                        return { ...acc, name: e.target.value };
                      }
                      if (acc.children.length > 0) {
                        return { ...acc, children: updateAccountName(acc.children) };
                      }
                      return acc;
                    });
                  };
                  setAccounts(updateAccountName(accounts));
                }}
                className="flex-1 bg-zinc-800 rounded px-2 py-1 text-zinc-100"
                placeholder="Nome da conta"
                autoFocus
              />
              <button
                onClick={() => saveAccount(account.id, account.name)}
                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-green-400"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => cancelEditing(account.id, account.isNew)}
                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-red-400"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <span className="text-zinc-100 flex-1">{account.name}</span>
              <div className="flex items-center gap-2">
                {level < selectedCompany.categoryLevels! - 1 && (
                  <button
                    onClick={() => addAccount(account.type, account.id)}
                    className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <Plus size={16} className="text-zinc-400" />
                  </button>
                )}
                <button
                  onClick={() => startEditing(account.id)}
                  className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <PencilIcon size={16} className="text-zinc-400" />
                </button>
                <button
                  onClick={() => deleteAccount(account.id)}
                  className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-zinc-400" />
                </button>
              </div>
            </>
          )}
        </div>
        {account.children.length > 0 && (
          <div className="ml-4">
            {account.children.map(child => renderAccountItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Cabeçalho */}
      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">DRE</h1>
              <p className="text-zinc-400 mt-2">Gerencie as contas do Demonstrativo de Resultados</p>
            </div>

            <button
              onClick={() => setShowCopyModal(true)}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-3"
            >
              <Copy size={20} />
              Copiar Contas
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Seleção de Empresa */}
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

            {/* Níveis de Categoria */}
            {selectedCompany && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Níveis de Conta
                </label>
                <div className="flex items-center gap-4">
                  {isEditingLevels ? (
                    <>
                      <div className="flex gap-2">
                        {[3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => updateCompanyCategoryLevels(level)}
                            className={`px-4 py-2 rounded-lg ${
                              selectedCompany.categoryLevels === level
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsEditingLevels(false)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
                      >
                        <Save size={16} />
                        Salvar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-zinc-100 bg-zinc-800 px-4 py-2 rounded-lg">
                        {selectedCompany.categoryLevels} níveis
                      </span>
                      <button
                        onClick={() => setIsEditingLevels(true)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                      >
                        <PencilIcon size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {selectedCompanyId ? (
        <div className="space-y-8">
          {/* Receitas */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Receitas</h2>
              <button
                onClick={() => addAccount('revenue')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Receita
              </button>
            </div>
            <div className="space-y-2">
              {accounts
                .filter(acc => acc.type === 'revenue' && acc.companyId === selectedCompanyId)
                .map(account => renderAccountItem(account))}
              {renderTotalLine(DEFAULT_TOTALS[0], accounts)}
              {renderTotalLine(DEFAULT_TOTALS[1], accounts)}
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Despesas</h2>
              <button
                onClick={() => addAccount('expense')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Despesa
              </button>
            </div>
            <div className="space-y-2">
              {accounts
                .filter(acc => acc.type === 'expense' && acc.companyId === selectedCompanyId)
                .map(account => renderAccountItem(account))}
              {DEFAULT_TOTALS.slice(2).map(total => 
                renderTotalLine(total, accounts)
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Selecione uma empresa para gerenciar suas contas</p>
        </div>
      )}

      {/* Modal de Cópia de Contas */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Copiar Contas
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