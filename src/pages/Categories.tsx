import React, { useState, useEffect } from 'react';
import { Plus, Copy, PencilIcon, Save, Check, X, FolderPlus, Power, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CategoryGroup, Category, CompanyCategory } from '../types/financial';
import { useAuth } from '../contexts/AuthContext';

interface Company {
  id: string;
  trading_name: string;
  name: string;
  is_active: boolean;
}

export const Categories = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companyCategories, setCompanyCategories] = useState<CompanyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchCategoryGroups();
      fetchCategories();
      fetchCompanyCategories();
    }
  }, [selectedCompanyId]);

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

  const fetchCategoryGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('category_groups')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategoryGroups(data || []);
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
      setError('Erro ao carregar grupos de categorias');
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

  const fetchCompanyCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('company_categories')
        .select('*')
        .eq('company_id', selectedCompanyId);

      if (error) throw error;
      setCompanyCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias da empresa:', err);
      setError('Erro ao carregar categorias da empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (type: 'revenue' | 'expense', name: string) => {
    try {
      const { data, error } = await supabase
        .from('category_groups')
        .insert([{ name, type }])
        .select()
        .single();

      if (error) throw error;
      setCategoryGroups([...categoryGroups, data]);
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
      setError('Erro ao criar grupo');
    }
  };

  const handleCreateCategory = async (
    type: 'revenue' | 'expense',
    name: string,
    groupId: string | null = null
  ) => {
    try {
      // 1. Criar categoria
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert([{ name, type, group_id: groupId }])
        .select()
        .single();

      if (categoryError) throw categoryError;

      // 2. Vincular à empresa
      if (category) {
        const { error: linkError } = await supabase
          .from('company_categories')
          .insert([{
            company_id: selectedCompanyId,
            category_id: category.id,
            is_active: true
          }]);

        if (linkError) throw linkError;
      }

      await Promise.all([
        fetchCategories(),
        fetchCompanyCategories()
      ]);
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      setError('Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async (
    categoryId: string,
    updates: Partial<Category>
  ) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId);

      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      setError('Erro ao atualizar categoria');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      await Promise.all([
        fetchCategories(),
        fetchCompanyCategories()
      ]);
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      setError('Erro ao excluir categoria');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      const currentStatus = companyCategories.find(
        cc => cc.category_id === categoryId
      )?.is_active;

      const { error } = await supabase
        .from('company_categories')
        .update({ is_active: !currentStatus })
        .eq('category_id', categoryId)
        .eq('company_id', selectedCompanyId);

      if (error) throw error;
      await fetchCompanyCategories();
    } catch (err) {
      console.error('Erro ao alterar status da categoria:', err);
      setError('Erro ao alterar status da categoria');
    }
  };

  const handleCopyCategories = async () => {
    if (!copyFromCompanyId || !copyToCompanyId) return;

    try {
      // 1. Obter categorias da empresa de origem
      const { data: sourceCategories, error: sourceError } = await supabase
        .from('company_categories')
        .select(`
          category_id,
          categories (*)
        `)
        .eq('company_id', copyFromCompanyId);

      if (sourceError) throw sourceError;

      // 2. Criar vínculos para a empresa de destino
      const newLinks = sourceCategories?.map(sc => ({
        company_id: copyToCompanyId,
        category_id: sc.category_id,
        is_active: true
      }));

      if (newLinks && newLinks.length > 0) {
        const { error: insertError } = await supabase
          .from('company_categories')
          .insert(newLinks);

        if (insertError) throw insertError;
      }

      setShowCopyModal(false);
      setCopyFromCompanyId('');
      setCopyToCompanyId('');
      
      if (selectedCompanyId === copyToCompanyId) {
        await fetchCompanyCategories();
      }
    } catch (err) {
      console.error('Erro ao copiar categorias:', err);
      setError('Erro ao copiar categorias');
    }
  };

  const getCategoryStatus = (categoryId: string): boolean => {
    return companyCategories.find(cc => cc.category_id === categoryId)?.is_active ?? false;
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
      {/* Cabeçalho */}
      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Categorias</h1>
              <p className="text-zinc-400 mt-2">Gerencie as categorias financeiras por empresa</p>
            </div>

            <button
              onClick={() => setShowCopyModal(true)}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-3"
            >
              <Copy size={20} />
              Copiar Categorias
            </button>
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
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.trading_name} - {company.name}
                </option>
              ))}
            </select>
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const name = window.prompt('Nome do grupo:');
                    if (name) handleCreateGroup('revenue', name);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-2"
                >
                  <FolderPlus size={16} />
                  Novo Grupo
                </button>
                <button
                  onClick={() => {
                    const name = window.prompt('Nome da categoria:');
                    if (name) handleCreateCategory('revenue', name);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nova Receita
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {categoryGroups
                .filter(group => group.type === 'revenue')
                .map(group => {
                  const groupCategories = categories.filter(
                    cat => cat.group_id === group.id
                  );

                  return (
                    <div key={group.id} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-200">{group.name}</h3>
                        <button
                          onClick={() => {
                            const name = window.prompt('Nome da categoria:');
                            if (name) handleCreateCategory('revenue', name, group.id);
                          }}
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Adicionar Categoria
                        </button>
                      </div>

                      <div className="space-y-2">
                        {groupCategories.map(category => (
                          <div
                            key={category.id}
                            className={`flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg ${
                              !getCategoryStatus(category.id) && 'opacity-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-zinc-400 font-mono text-sm">
                                {category.code}
                              </span>
                              <span className="text-zinc-100">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleCategoryStatus(category.id)}
                                className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                                  getCategoryStatus(category.id)
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  const newName = window.prompt('Novo nome:', category.name);
                                  if (newName) handleUpdateCategory(category.id, { name: newName });
                                }}
                                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                              >
                                <PencilIcon size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
                                    handleDeleteCategory(category.id);
                                  }
                                }}
                                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {/* Categorias sem grupo */}
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-zinc-200 mb-4">Sem Grupo</h3>
                <div className="space-y-2">
                  {categories
                    .filter(cat => cat.type === 'revenue' && !cat.group_id)
                    .map(category => (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg ${
                          !getCategoryStatus(category.id) && 'opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-zinc-400 font-mono text-sm">
                            {category.code}
                          </span>
                          <span className="text-zinc-100">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCategoryStatus(category.id)}
                            className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                              getCategoryStatus(category.id)
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const newName = window.prompt('Novo nome:', category.name);
                              if (newName) handleUpdateCategory(category.id, { name: newName });
                            }}
                            className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
                                handleDeleteCategory(category.id);
                              }
                            }}
                            className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Despesas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const name = window.prompt('Nome do grupo:');
                    if (name) handleCreateGroup('expense', name);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-2"
                >
                  <FolderPlus size={16} />
                  Novo Grupo
                </button>
                <button
                  onClick={() => {
                    const name = window.prompt('Nome da categoria:');
                    if (name) handleCreateCategory('expense', name);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nova Despesa
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {categoryGroups
                .filter(group => group.type === 'expense')
                .map(group => {
                  const groupCategories = categories.filter(
                    cat => cat.group_id === group.id
                  );

                  return (
                    <div key={group.id} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-200">{group.name}</h3>
                        <button
                          onClick={() => {
                            const name = window.prompt('Nome da categoria:');
                            if (name) handleCreateCategory('expense', name, group.id);
                          }}
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Adicionar Categoria
                        </button>
                      </div>

                      <div className="space-y-2">
                        {groupCategories.map(category => (
                          <div
                            key={category.id}
                            className={`flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg ${
                              !getCategoryStatus(category.id) && 'opacity-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-zinc-400 font-mono text-sm">
                                {category.code}
                              </span>
                              <span className="text-zinc-100">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleCategoryStatus(category.id)}
                                className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                                  getCategoryStatus(category.id)
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  const newName = window.prompt('Novo nome:', category.name);
                                  if (newName) handleUpdateCategory(category.id, { name: newName });
                                }}
                                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                              >
                                <PencilIcon size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
                                    handleDeleteCategory(category.id);
                                  }
                                }}
                                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {/* Categorias sem grupo */}
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-zinc-200 mb-4">Sem Grupo</h3>
                <div className="space-y-2">
                  {categories
                    .filter(cat => cat.type === 'expense' && !cat.group_id)
                    .map(category => (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg ${
                          !getCategoryStatus(category.id) && 'opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-zinc-400 font-mono text-sm">
                            {category.code}
                          </span>
                          <span className="text-zinc-100">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCategoryStatus(category.id)}
                            className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                              getCategoryStatus(category.id)
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const newName = window.prompt('Novo nome:', category.name);
                              if (newName) handleUpdateCategory(category.id, { name: newName });
                            }}
                            className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
                                handleDeleteCategory(category.id);
                              }
                            }}
                            className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Selecione uma empresa para gerenciar suas categorias</p>
        </div>
      )}

      {/* Modal de Cópia */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Copiar Categorias
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
                      {company.trading_name}
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
                      {company.trading_name}
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
                onClick={handleCopyCategories}
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