import React, { useState, useEffect } from 'react';
import { Plus, Copy, PencilIcon, Save, Check, X, Calculator, Power, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, Indicator } from '../types/financial';

interface Company {
  id: string;
  trading_name: string;
  name: string;
  is_active: boolean;
}

const OPERATION_LABELS = {
  sum: 'Soma',
  subtract: 'Subtração',
  multiply: 'Multiplicação',
  divide: 'Divisão'
};

export const Indicators = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewIndicatorModal, setShowNewIndicatorModal] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  // Form state
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    type: 'manual' as const,
    calculation_type: undefined as 'category' | 'indicator' | undefined,
    operation: undefined as 'sum' | 'subtract' | 'multiply' | 'divide' | undefined,
    source_ids: [] as string[]
  });

  useEffect(() => {
    fetchCompanies();
    fetchCategories();
    fetchIndicators();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, trading_name, name, is_active')
        .eq('is_active', true)
        .order('trading_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIndicator = async () => {
    if (!selectedCompanyId || !newIndicator.name) return;

    try {
      const { data, error } = await supabase
        .from('indicators')
        .insert([{
          name: newIndicator.name,
          type: newIndicator.type,
          calculation_type: newIndicator.calculation_type,
          operation: newIndicator.operation,
          source_ids: newIndicator.source_ids,
          company_id: selectedCompanyId,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setIndicators([...indicators, data]);
      setShowNewIndicatorModal(false);
      resetNewIndicatorForm();
    } catch (err) {
      console.error('Erro ao criar indicador:', err);
      setError('Erro ao criar indicador');
    }
  };

  const handleUpdateIndicator = async () => {
    if (!editingIndicator) return;

    try {
      const { error } = await supabase
        .from('indicators')
        .update({
          name: editingIndicator.name,
          type: editingIndicator.type,
          calculation_type: editingIndicator.calculation_type,
          operation: editingIndicator.operation,
          source_ids: editingIndicator.source_ids,
          is_active: editingIndicator.is_active
        })
        .eq('id', editingIndicator.id);

      if (error) throw error;

      setIndicators(indicators.map(ind => 
        ind.id === editingIndicator.id ? editingIndicator : ind
      ));
      setEditingIndicator(null);
    } catch (err) {
      console.error('Erro ao atualizar indicador:', err);
      setError('Erro ao atualizar indicador');
    }
  };

  const handleDeleteIndicator = async (indicatorId: string) => {
    if (!confirm('Tem certeza que deseja excluir este indicador?')) return;

    try {
      const { error } = await supabase
        .from('indicators')
        .delete()
        .eq('id', indicatorId);

      if (error) throw error;

      setIndicators(indicators.filter(ind => ind.id !== indicatorId));
    } catch (err) {
      console.error('Erro ao excluir indicador:', err);
      setError('Erro ao excluir indicador');
    }
  };

  const toggleIndicatorStatus = async (indicatorId: string) => {
    const indicator = indicators.find(ind => ind.id === indicatorId);
    if (!indicator) return;

    try {
      const { error } = await supabase
        .from('indicators')
        .update({ is_active: !indicator.is_active })
        .eq('id', indicatorId);

      if (error) throw error;

      setIndicators(indicators.map(ind =>
        ind.id === indicatorId ? { ...ind, is_active: !ind.is_active } : ind
      ));
    } catch (err) {
      console.error('Erro ao alterar status do indicador:', err);
      setError('Erro ao alterar status do indicador');
    }
  };

  const resetNewIndicatorForm = () => {
    setNewIndicator({
      name: '',
      type: 'manual',
      calculation_type: undefined,
      operation: undefined,
      source_ids: []
    });
  };

  const filteredIndicators = indicators.filter(ind => 
    selectedCompanyId ? ind.company_id === selectedCompanyId : true
  );

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
          <h1 className="text-2xl font-bold text-zinc-100">Indicadores</h1>
          <p className="text-zinc-400 mt-1">Gerencie os indicadores financeiros por empresa</p>
        </div>
        <button 
          onClick={() => setShowNewIndicatorModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Indicador
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
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
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.trading_name} - {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Cálculo</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicators.map((indicator) => (
                <tr key={indicator.id} className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${!indicator.is_active && 'opacity-50'}`}>
                  <td className="px-6 py-4">
                    <span className="text-zinc-400 font-mono">{indicator.code}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-100">{indicator.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      indicator.type === 'manual'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {indicator.type === 'manual' ? 'Manual' : 'Calculado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {indicator.type === 'calculated' && (
                      <div className="flex items-center gap-2">
                        <Calculator size={16} className="text-zinc-500" />
                        <span>
                          {indicator.calculation_type === 'category' ? 'Categorias' : 'Indicadores'} - {OPERATION_LABELS[indicator.operation!]}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleIndicatorStatus(indicator.id)}
                        className={`p-2 hover:bg-zinc-700 rounded-lg transition-colors ${
                          indicator.is_active ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => setEditingIndicator(indicator)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                      >
                        <PencilIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteIndicator(indicator.id)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo/Editar Indicador */}
      {(showNewIndicatorModal || editingIndicator) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">
                {editingIndicator ? 'Editar Indicador' : 'Novo Indicador'}
              </h2>
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
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nome do Indicador
                </label>
                <input
                  type="text"
                  value={editingIndicator ? editingIndicator.name : newIndicator.name}
                  onChange={(e) => {
                    if (editingIndicator) {
                      setEditingIndicator({ ...editingIndicator, name: e.target.value });
                    } else {
                      setNewIndicator({ ...newIndicator, name: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="Ex: Margem de Lucro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tipo de Indicador
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={editingIndicator ? editingIndicator.type === 'manual' : newIndicator.type === 'manual'}
                      onChange={() => {
                        if (editingIndicator) {
                          setEditingIndicator({
                            ...editingIndicator,
                            type: 'manual',
                            calculation_type: undefined,
                            operation: undefined,
                            source_ids: []
                          });
                        } else {
                          setNewIndicator({
                            ...newIndicator,
                            type: 'manual',
                            calculation_type: undefined,
                            operation: undefined,
                            source_ids: []
                          });
                        }
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-300">Manual</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={editingIndicator ? editingIndicator.type === 'calculated' : newIndicator.type === 'calculated'}
                      onChange={() => {
                        if (editingIndicator) {
                          setEditingIndicator({
                            ...editingIndicator,
                            type: 'calculated',
                            calculation_type: 'category',
                            operation: 'sum',
                            source_ids: []
                          });
                        } else {
                          setNewIndicator({
                            ...newIndicator,
                            type: 'calculated',
                            calculation_type: 'category',
                            operation: 'sum',
                            source_ids: []
                          });
                        }
                      }}
                      className="text-blue-600"
                    />
                    <span className="text-zinc-300">Calculado</span>
                  </label>
                </div>
              </div>

              {((editingIndicator && editingIndicator.type === 'calculated') || 
                (!editingIndicator && newIndicator.type === 'calculated')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Tipo de Cálculo
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={editingIndicator 
                            ? editingIndicator.calculation_type === 'category'
                            : newIndicator.calculation_type === 'category'}
                          onChange={() => {
                            if (editingIndicator) {
                              setEditingIndicator({
                                ...editingIndicator,
                                calculation_type: 'category',
                                source_ids: []
                              });
                            } else {
                              setNewIndicator({
                                ...newIndicator,
                                calculation_type: 'category',
                                source_ids: []
                              });
                            }
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-zinc-300">Categorias</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={editingIndicator
                            ? editingIndicator.calculation_type === 'indicator'
                            : newIndicator.calculation_type === 'indicator'}
                          onChange={() => {
                            if (editingIndicator) {
                              setEditingIndicator({
                                ...editingIndicator,
                                calculation_type: 'indicator',
                                source_ids: []
                              });
                            } else {
                              setNewIndicator({
                                ...newIndicator,
                                calculation_type: 'indicator',
                                source_ids: []
                              });
                            }
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-zinc-300">Indicadores</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Operação
                    </label>
                    <select
                      value={editingIndicator ? editingIndicator.operation : newIndicator.operation}
                      onChange={(e) => {
                        const value = e.target.value as 'sum' | 'subtract' | 'multiply' | 'divide';
                        if (editingIndicator) {
                          setEditingIndicator({ ...editingIndicator, operation: value });
                        } else {
                          setNewIndicator({ ...newIndicator, operation: value });
                        }
                      }}
                      className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                    >
                      {Object.entries(OPERATION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      {editingIndicator?.calculation_type === 'category' || newIndicator.calculation_type === 'category'
                        ? 'Selecione as Categorias'
                        : 'Selecione os Indicadores'}
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(editingIndicator?.calculation_type === 'category' || newIndicator.calculation_type === 'category')
                        ? categories
                            .filter(c => c.company_id === selectedCompanyId)
                            .map(category => (
                              <label key={category.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editingIndicator
                                    ? editingIndicator.source_ids.includes(category.id)
                                    : newIndicator.source_ids.includes(category.id)}
                                  onChange={(e) => {
                                    const newSourceIds = e.target.checked
                                      ? [...(editingIndicator ? editingIndicator.source_ids : newIndicator.source_ids), category.id]
                                      : (editingIndicator ? editingIndicator.source_ids : newIndicator.source_ids)
                                          .filter(id => id !== category.id);
                                    
                                    if (editingIndicator) {
                                      setEditingIndicator({ ...editingIndicator, source_ids: newSourceIds });
                                    } else {
                                      setNewIndicator({ ...newIndicator, source_ids: newSourceIds });
                                    }
                                  }}
                                  className="text-blue-600 rounded"
                                />
                                <span className="text-zinc-300">
                                  {category.code} - {category.name}
                                </span>
                              </label>
                            ))
                        : indicators
                            .filter(i => i.company_id === selectedCompanyId && i.id !== editingIndicator?.id)
                            .map(indicator => (
                              <label key={indicator.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editingIndicator
                                    ? editingIndicator.source_ids.includes(indicator.id)
                                    : newIndicator.source_ids.includes(indicator.id)}
                                  onChange={(e) => {
                                    const newSourceIds = e.target.checked
                                      ? [...(editingIndicator ? editingIndicator.source_ids : newIndicator.source_ids), indicator.id]
                                      : (editingIndicator ? editingIndicator.source_ids : newIndicator.source_ids)
                                          .filter(id => id !== indicator.id);
                                    
                                    if (editingIndicator) {
                                      setEditingIndicator({ ...editingIndicator, source_ids: newSourceIds });
                                    } else {
                                      setNewIndicator({ ...newIndicator, source_ids: newSourceIds });
                                    }
                                  }}
                                  className="text-blue-600 rounded"
                                />
                                <span className="text-zinc-300">
                                  {indicator.code} - {indicator.name}
                                </span>
                              </label>
                            ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewIndicatorModal(false);
                  setEditingIndicator(null);
                  resetNewIndicatorForm();
                }}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-100"
              >
                Cancelar
              </button>
              <button
                onClick={editingIndicator ? handleUpdateIndicator : handleCreateIndicator}
                disabled={
                  editingIndicator
                    ? !editingIndicator.name || (editingIndicator.type === 'calculated' && editingIndicator.source_ids.length === 0)
                    : !newIndicator.name || (newIndicator.type === 'calculated' && newIndicator.source_ids.length === 0)
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingIndicator ? 'Salvar' : 'Criar Indicador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};