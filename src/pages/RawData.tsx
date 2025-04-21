import React, { useState, useEffect } from 'react';
import { Plus, PencilIcon, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Company {
  id: string;
  trading_name: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  type: 'revenue' | 'expense';
}

interface RawData {
  id: string;
  empresa_id: string;
  ano: number;
  mes: string;
  categoria_id: string;
  valor: number;
  company?: Company;
  category?: Category;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const ANOS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

export const RawData = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawData, setRawData] = useState<RawData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    empresa_id: '',
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    categoria_id: '',
    valor: ''
  });

  const [editingData, setEditingData] = useState<RawData | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchCategories();
    fetchRawData();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, trading_name')
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
        .select('id, name, code, type')
        .order('code');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias');
    }
  };

  const fetchRawData = async () => {
    try {
      const { data, error } = await supabase
        .from('dados_brutos')
        .select(`
          *,
          company:companies(id, trading_name),
          category:categories(id, name, code)
        `)
        .order('ano', { ascending: false })
        .order('mes');

      if (error) throw error;
      setRawData(data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const valor = parseFloat(formData.valor.replace(',', '.'));
      
      if (isNaN(valor) || valor < 0) {
        setError('Valor inválido');
        return;
      }

      const dataPayload = {
        empresa_id: formData.empresa_id,
        ano: formData.ano,
        mes: formData.mes,
        categoria_id: formData.categoria_id,
        valor
      };

      if (editingData) {
        const { error } = await supabase
          .from('dados_brutos')
          .update(dataPayload)
          .eq('id', editingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dados_brutos')
          .upsert([dataPayload], {
            onConflict: 'empresa_id,ano,mes,categoria_id'
          });

        if (error) throw error;
      }

      await fetchRawData();
      setShowForm(false);
      setEditingData(null);
      resetForm();
      setSuccess('Dados salvos com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar dados:', err);
      setError('Erro ao salvar dados');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const { error } = await supabase
        .from('dados_brutos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchRawData();
      setSuccess('Registro excluído com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao excluir registro:', err);
      setError('Erro ao excluir registro');
    }
  };

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      ano: new Date().getFullYear(),
      mes: MESES[new Date().getMonth()],
      categoria_id: '',
      valor: ''
    });
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
          <h1 className="text-2xl font-bold text-zinc-100">Dados Brutos</h1>
          <p className="text-zinc-400 mt-1">Gerenciamento de dados financeiros por período</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
          <Check size={20} className="text-green-400" />
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">
                {editingData ? 'Editar Registro' : 'Novo Registro'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingData(null);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Empresa
                </label>
                <select
                  value={formData.empresa_id}
                  onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.trading_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Ano
                </label>
                <select
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                >
                  {ANOS.map(ano => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Mês
                </label>
                <select
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                >
                  {MESES.map(mes => (
                    <option key={mes} value={mes}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                >
                  <option value="">Selecione uma categoria</option>
                  <optgroup label="Receitas">
                    {categories
                      .filter(cat => cat.type === 'revenue')
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.code} - {category.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Despesas">
                    {categories
                      .filter(cat => cat.type === 'expense')
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.code} - {category.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Valor
                </label>
                <input
                  type="text"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingData(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.empresa_id || !formData.categoria_id || !formData.valor}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingData ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Empresa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Período</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Categoria</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Valor</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rawData.map((data) => (
                <tr key={data.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-6 py-4 text-zinc-300">
                    {data.company?.trading_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">{data.mes}</span>
                    <span className="text-zinc-500 mx-1">/</span>
                    <span className="text-zinc-300">{data.ano}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-mono text-sm">{data.category?.code}</span>
                      <span className="text-zinc-300">{data.category?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-zinc-300">
                      {data.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingData(data);
                          setFormData({
                            empresa_id: data.empresa_id,
                            ano: data.ano,
                            mes: data.mes,
                            categoria_id: data.categoria_id,
                            valor: data.valor.toString()
                          });
                          setShowForm(true);
                        }}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                      >
                        <PencilIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(data.id)}
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
    </div>
  );
};