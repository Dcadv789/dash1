import React, { useState, useEffect } from 'react';
import { Copy, PencilIcon, Save, Check, X, Plus, Minus, Equal, ArrowUp, ArrowDown, Calculator, Power, Trash2 } from 'lucide-react';

interface Indicator {
  id: string;
  code: string;
  name: string;
  formula: string;
  displayOrder: number;
  companyId: string;
  isEditing?: boolean;
  selectedCategories: string[];
  isActive: boolean;
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

export const Indicators = () => {
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

  const [indicators, setIndicators] = useState<Indicator[]>(() => 
    loadFromStorage('indicators', [])
  );

  const [categories] = useState<Category[]>(() => 
    loadFromStorage('categories', [])
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<number>(0);
  const [showNewIndicatorModal, setShowNewIndicatorModal] = useState(false);
  const [newIndicatorName, setNewIndicatorName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCategoryType, setSelectedCategoryType] = useState<'revenue' | 'expense'>('revenue');
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  useEffect(() => {
    saveToStorage('indicators', indicators);
  }, [indicators]);

  const startEditingOrder = (indicatorId: string, currentOrder: number) => {
    setEditingOrder(indicatorId);
    setNewOrder(currentOrder);
  };

  const saveOrder = (indicatorId: string) => {
    if (newOrder < 1) return;

    setIndicators(indicators.map(ind => 
      ind.id === indicatorId
        ? { ...ind, displayOrder: newOrder }
        : ind
    ));
    setEditingOrder(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, indicatorId: string) => {
    if (e.key === 'Enter') {
      saveOrder(indicatorId);
    }
  };

  const copyIndicators = () => {
    if (!copyFromCompanyId || !copyToCompanyId) return;

    const indicatorsToCopy = indicators.filter(ind => ind.companyId === copyFromCompanyId);
    const copiedIndicators = indicatorsToCopy.map(ind => ({
      ...ind,
      id: Math.random().toString(36).substr(2, 9),
      companyId: copyToCompanyId
    }));

    setIndicators([...indicators, ...copiedIndicators]);
    setShowCopyModal(false);
    setCopyFromCompanyId('');
    setCopyToCompanyId('');
  };

  const moveIndicator = (indicatorId: string, direction: 'up' | 'down') => {
    const indicatorIndex = indicators.findIndex(ind => ind.id === indicatorId);
    const indicator = indicators[indicatorIndex];
    
    if (!indicator) return;

    const newIndicators = [...indicators];
    if (direction === 'up' && indicatorIndex > 0) {
      const temp = newIndicators[indicatorIndex - 1].displayOrder;
      newIndicators[indicatorIndex - 1].displayOrder = indicator.displayOrder;
      newIndicators[indicatorIndex].displayOrder = temp;
    } else if (direction === 'down' && indicatorIndex < indicators.length - 1) {
      const temp = newIndicators[indicatorIndex + 1].displayOrder;
      newIndicators[indicatorIndex + 1].displayOrder = indicator.displayOrder;
      newIndicators[indicatorIndex].displayOrder = temp;
    }

    setIndicators(newIndicators);
  };

  const handleAddIndicator = () => {
    if (!selectedCompanyId || !newIndicatorName || selectedCategories.length === 0) return;

    const maxOrder = Math.max(...indicators.map(ind => ind.displayOrder), 0);
    const newIndicator: Indicator = {
      id: Math.random().toString(36).substr(2, 9),
      code: `I${(indicators.length + 1).toString().padStart(2, '0')}`,
      name: newIndicatorName,
      formula: selectedCategories.join('+'),
      displayOrder: maxOrder + 1,
      companyId: selectedCompanyId,
      selectedCategories,
      isActive: true
    };

    setIndicators([...indicators, newIndicator]);
    setShowNewIndicatorModal(false);
    resetNewIndicatorForm();
  };

  const handleEditIndicator = () => {
    if (!editingIndicator) return;

    setIndicators(indicators.map(ind => 
      ind.id === editingIndicator.id ? editingIndicator : ind
    ));
    setEditingIndicator(null);
  };

  const toggleIndicatorStatus = (indicatorId: string) => {
    setIndicators(indicators.map(ind => 
      ind.id === indicatorId ? { ...ind, isActive: !ind.isActive } : ind
    ));
  };

  const deleteIndicator = (indicatorId: string) => {
    if (confirm('Tem certeza que deseja excluir este indicador?')) {
      setIndicators(indicators.filter(ind => ind.id !== indicatorId));
    }
  };

  const resetNewIndicatorForm = () => {
    setNewIndicatorName('');
    setSelectedCategories([]);
    setSelectedCategoryType('revenue');
  };

  const sortedIndicators = [...indicators]
    .filter(ind => ind.companyId === selectedCompanyId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Cabeçalho */}
      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Indicadores</h1>
              <p className="text-zinc-400 mt-2">Gerencie os indicadores financeiros por empresa</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewIndicatorModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-3"
              >
                <Plus size={20} />
                Novo Indicador
              </button>

              <button
                onClick={() => setShowCopyModal(true)}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-3"
              >
                <Copy size={20} />
                Copiar Indicadores
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Fórmula</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedIndicators.map((indicator) => (
                  <tr key={indicator.id} className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${!indicator.isActive && 'opacity-50'}`}>
                    <td className="px-6 py-4">
                      {editingOrder === indicator.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newOrder}
                            onChange={(e) => setNewOrder(Number(e.target.value))}
                            onKeyPress={(e) => handleKeyPress(e, indicator.id)}
                            className="w-20 bg-zinc-800 rounded px-2 py-1 text-zinc-100"
                            min="1"
                          />
                          <button
                            onClick={() => saveOrder(indicator.id)}
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
                          onClick={() => startEditingOrder(indicator.id, indicator.displayOrder)}
                        >
                          {indicator.displayOrder}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 font-mono">{indicator.code}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-100">{indicator.name}</td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">{indicator.formula}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleIndicatorStatus(indicator.id)}
                          className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                            indicator.isActive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          <Power size={16} />
                        </button>
                        <button
                          onClick={() => setEditingIndicator(indicator)}
                          className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                        >
                          <PencilIcon size={16} />
                        </button>
                        <button
                          onClick={() => deleteIndicator(indicator.id)}
                          className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => moveIndicator(indicator.id, 'up')}
                          className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveIndicator(indicator.id, 'down')}
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
          <p className="text-zinc-400">Selecione uma empresa para gerenciar os indicadores</p>
        </div>
      )}

      {/* Modal de Novo/Editar Indicador */}
      {(showNewIndicatorModal || editingIndicator) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                {editingIndicator ? 'Editar Indicador' : 'Novo Indicador'}
              </h3>
              <button
                onClick={() => {
                  setShowNewIndicatorModal(false);
                  setEditingIndicator(null);
                  resetNewIndicatorForm();
                }}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Nome do Indicador
                </label>
                <input
                  type="text"
                  value={editingIndicator ? editingIndicator.name : newIndicatorName}
                  onChange={(e) => {
                    if (editingIndicator) {
                      setEditingIndicator({ ...editingIndicator, name: e.target.value });
                    } else {
                      setNewIndicatorName(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="Ex: Margem de Lucro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tipo de Categoria
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={selectedCategoryType === 'revenue'}
                      onChange={() => {
                        setSelectedCategoryType('revenue');
                        setSelectedCategories([]);
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-300">Receitas</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={selectedCategoryType === 'expense'}
                      onChange={() => {
                        setSelectedCategoryType('expense');
                        setSelectedCategories([]);
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-300">Despesas</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Selecione as Categorias para o Cálculo
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories
                    .filter(c => 
                      c.companyId === selectedCompanyId && 
                      c.isActive && 
                      c.type === selectedCategoryType
                    )
                    .map(category => (
                      <label key={category.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingIndicator 
                            ? editingIndicator.selectedCategories.includes(category.id)
                            : selectedCategories.includes(category.id)
                          }
                          onChange={(e) => {
                            const categoryId = category.id;
                            if (editingIndicator) {
                              const newCategories = e.target.checked
                                ? [...editingIndicator.selectedCategories, categoryId]
                                : editingIndicator.selectedCategories.filter(id => id !== categoryId);
                              setEditingIndicator({
                                ...editingIndicator,
                                selectedCategories: newCategories,
                                formula: newCategories.join('+')
                              });
                            } else {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, categoryId]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
                              }
                            }
                          }}
                          className="text-blue-600 rounded"
                        />
                        <span className="text-zinc-300">{category.code} - {category.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowNewIndicatorModal(false);
                  setEditingIndicator(null);
                  resetNewIndicatorForm();
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={editingIndicator ? handleEditIndicator : handleAddIndicator}
                disabled={
                  editingIndicator
                    ? !editingIndicator.name || editingIndicator.selectedCategories.length === 0
                    : !newIndicatorName || selectedCategories.length === 0
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingIndicator ? 'Salvar' : 'Adicionar'}
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
              Copiar Indicadores
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
                onClick={copyIndicators}
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