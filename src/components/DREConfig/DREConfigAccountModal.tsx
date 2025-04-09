import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Minus, Equal } from 'lucide-react';
import { DREConfigAccount } from '../../types/DREConfig';
import { Category, Indicator } from '../../types/financial';

interface DREConfigAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAccount: DREConfigAccount | null;
  onSave: (account: DREConfigAccount) => void;
  selectedCompanyId: string;
  categories: Category[];
  indicators: Indicator[];
  parentAccounts: DREConfigAccount[];
}

const loadFromStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const DREConfigAccountModal = ({
  isOpen,
  onClose,
  editingAccount,
  onSave,
  selectedCompanyId,
  categories,
  indicators,
  parentAccounts
}: DREConfigAccountModalProps) => {
  const [accountType, setAccountType] = useState<'category' | 'indicator' | 'total' | 'flex'>('category');
  const [categoryType, setCategoryType] = useState<'revenue' | 'expense'>('revenue');
  const [accountName, setAccountName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedParentAccount, setSelectedParentAccount] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [blankAccountSign, setBlankAccountSign] = useState<'positive' | 'negative'>('positive');

  useEffect(() => {
    if (editingAccount) {
      setAccountType(editingAccount.type === 'revenue' || editingAccount.type === 'expense' ? 'category' : editingAccount.type);
      setCategoryType(editingAccount.type as 'revenue' | 'expense');
      setAccountName(editingAccount.name);
      setSelectedCategories(editingAccount.categoryIds || []);
      setSelectedIndicator(editingAccount.indicatorId || null);
      setSelectedAccounts(editingAccount.selectedAccounts || []);
      setSelectedParentAccount(editingAccount.parentAccountId || null);
      setBlankAccountSign(editingAccount.sign || 'positive');
    } else {
      resetForm();
    }
  }, [editingAccount]);

  const resetForm = () => {
    setAccountType('category');
    setCategoryType('revenue');
    setAccountName('');
    setSelectedCategories([]);
    setSelectedIndicator(null);
    setSelectedAccounts([]);
    setSelectedParentAccount(null);
    setCategorySearch('');
    setIndicatorSearch('');
    setBlankAccountSign('positive');
  };

  const handleSave = () => {
    const maxOrder = Math.max(...loadFromStorage('dreconfig_accounts', [])
      .filter((acc: DREConfigAccount) => acc.parentAccountId === selectedParentAccount)
      .map((acc: DREConfigAccount) => acc.displayOrder), 0);

    const newAccount: DREConfigAccount = {
      id: editingAccount?.id || Math.random().toString(36).substr(2, 9),
      code: editingAccount?.code || `A${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      name: accountName,
      type: accountType === 'category' ? categoryType : accountType,
      displayOrder: editingAccount?.displayOrder || maxOrder + 1,
      companyId: selectedCompanyId,
      isActive: true,
      parentAccountId: selectedParentAccount,
      categoryIds: accountType === 'category' ? selectedCategories : undefined,
      indicatorId: accountType === 'indicator' ? selectedIndicator : undefined,
      selectedAccounts: accountType === 'total' ? selectedAccounts : undefined,
      sign: accountType === 'flex' ? blankAccountSign : undefined
    };

    onSave(newAccount);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-zinc-100">
            {editingAccount ? 'Editar Conta' : 'Nova Conta'}
          </h3>
          <button
            onClick={onClose}
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
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
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
              {parentAccounts.map(account => (
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
                  checked={accountType === 'category'}
                  onChange={() => setAccountType('category')}
                  className="text-blue-600"
                />
                <span className="text-zinc-300">Categoria</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={accountType === 'indicator'}
                  onChange={() => setAccountType('indicator')}
                  className="text-blue-600"
                />
                <span className="text-zinc-300">Indicador</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={accountType === 'total'}
                  onChange={() => setAccountType('total')}
                  className="text-blue-600"
                />
                <span className="text-zinc-300">Totalizador</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={accountType === 'flex'}
                  onChange={() => setAccountType('flex')}
                  className="text-blue-600"
                />
                <span className="text-zinc-300">Flexível</span>
              </label>
            </div>
          </div>

          {accountType === 'category' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Tipo de Categoria
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={categoryType === 'revenue'}
                    onChange={() => setCategoryType('revenue')}
                    className="text-blue-600"
                  />
                  <span className="text-zinc-300">Receita</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={categoryType === 'expense'}
                    onChange={() => setCategoryType('expense')}
                    className="text-blue-600"
                  />
                  <span className="text-zinc-300">Despesa</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Categorias
                </label>
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Buscar categorias..."
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 mb-2"
                />
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories
                    .filter(c => 
                      c.type === categoryType &&
                      c.companyId === selectedCompanyId &&
                      c.name.toLowerCase().includes(categorySearch.toLowerCase())
                    )
                    .map(category => (
                      <label key={category.id} className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            }
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-zinc-300">{category.code} - {category.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          )}

          {accountType === 'indicator' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Indicador
              </label>
              <input
                type="text"
                value={indicatorSearch}
                onChange={(e) => setIndicatorSearch(e.target.value)}
                placeholder="Buscar indicadores..."
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 mb-2"
              />
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {indicators
                  .filter(i => 
                    i.companyId === selectedCompanyId &&
                    i.name.toLowerCase().includes(indicatorSearch.toLowerCase())
                  )
                  .map(indicator => (
                    <label key={indicator.id} className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg">
                      <input
                        type="radio"
                        checked={selectedIndicator === indicator.id}
                        onChange={() => setSelectedIndicator(indicator.id)}
                        className="text-blue-600"
                      />
                      <span className="text-zinc-300">{indicator.code} - {indicator.name}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {accountType === 'total' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Contas para Totalizar
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {loadFromStorage('dreconfig_accounts', [])
                  .filter((acc: DREConfigAccount) => 
                    acc.companyId === selectedCompanyId && 
                    acc.type !== 'total' &&
                    acc.type !== 'flex'
                  )
                  .map((account: DREConfigAccount) => (
                    <label key={account.id} className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccounts([...selectedAccounts, account.id]);
                          } else {
                            setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                          }
                        }}
                        className="text-blue-600"
                      />
                      <span className="text-zinc-300">{account.code} - {account.name}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {accountType === 'flex' && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Sinal da Conta
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={blankAccountSign === 'positive'}
                    onChange={() => setBlankAccountSign('positive')}
                    className="text-blue-600"
                  />
                  <span className="text-zinc-300">Positivo (+)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={blankAccountSign === 'negative'}
                    onChange={() => setBlankAccountSign('negative')}
                    className="text-blue-600"
                  />
                  <span className="text-zinc-300">Negativo (-)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!accountName || (accountType === 'category' && selectedCategories.length === 0) || (accountType === 'indicator' && !selectedIndicator) || (accountType === 'total' && selectedAccounts.length === 0)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingAccount ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
};