import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, PencilIcon, Save, Check, X, FolderPlus, Power } from 'lucide-react';

interface Category {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense';
  groupId: string | null;
  companyId: string;
  isEditing?: boolean;
  isNew?: boolean;
  isActive: boolean;
}

interface CategoryGroup {
  id: string;
  name: string;
  type: 'revenue' | 'expense';
  companyId: string;
  isEditing?: boolean;
  isNew?: boolean;
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

export const Categories = () => {
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

  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromStorage('categories', [])
  );

  const [groups, setGroups] = useState<CategoryGroup[]>(() => 
    loadFromStorage('category_groups', [])
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');

  useEffect(() => {
    saveToStorage('categories', categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage('category_groups', groups);
  }, [groups]);

  useEffect(() => {
    saveToStorage('companies', companies);
  }, [companies]);

  const generateCode = (type: 'revenue' | 'expense') => {
    const prefix = type === 'revenue' ? 'R' : 'D';
    const existingCategories = categories.filter(c => 
      c.type === type && c.companyId === selectedCompanyId
    );
    const nextNumber = (existingCategories.length + 1).toString().padStart(2, '0');
    return `${prefix}${nextNumber}`;
  };

  const addCategory = (type: 'revenue' | 'expense', groupId: string | null = null) => {
    if (!selectedCompanyId) return;

    const newCategory: Category = {
      id: Math.random().toString(36).substr(2, 9),
      code: generateCode(type),
      name: '',
      type,
      groupId,
      companyId: selectedCompanyId,
      isEditing: true,
      isNew: true,
      isActive: true
    };

    setCategories([...categories, newCategory]);
  };

  const addGroup = (type: 'revenue' | 'expense') => {
    if (!selectedCompanyId) return;

    const newGroup: CategoryGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type,
      companyId: selectedCompanyId,
      isEditing: true,
      isNew: true
    };

    setGroups([...groups, newGroup]);
  };

  const startEditing = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, isEditing: true } : cat
    ));
  };

  const startEditingGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, isEditing: true } : group
    ));
  };

  const saveCategory = (categoryId: string, newName: string) => {
    if (!newName.trim()) return;

    setCategories(categories.map(cat => 
      cat.id === categoryId
        ? { ...cat, name: newName.trim(), isEditing: false, isNew: false }
        : cat
    ));
  };

  const saveGroup = (groupId: string, newName: string) => {
    if (!newName.trim()) return;

    setGroups(groups.map(group => 
      group.id === groupId
        ? { ...group, name: newName.trim(), isEditing: false, isNew: false }
        : group
    ));
  };

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId
        ? { ...cat, isActive: !cat.isActive }
        : cat
    ));
  };

  const cancelEditing = (categoryId: string, isNew: boolean = false) => {
    if (isNew) {
      deleteCategory(categoryId);
    } else {
      setCategories(categories.map(cat => 
        cat.id === categoryId ? { ...cat, isEditing: false } : cat
      ));
    }
  };

  const cancelEditingGroup = (groupId: string, isNew: boolean = false) => {
    if (isNew) {
      deleteGroup(groupId);
    } else {
      setGroups(groups.map(group => 
        group.id === groupId ? { ...group, isEditing: false } : group
      ));
    }
  };

  const copyCategories = () => {
    if (!copyFromCompanyId || !copyToCompanyId) return;

    const categoriesToCopy = categories.filter(cat => cat.companyId === copyFromCompanyId);
    const groupsToCopy = groups.filter(group => group.companyId === copyFromCompanyId);

    const copiedGroups = groupsToCopy.map(group => ({
      ...group,
      id: Math.random().toString(36).substr(2, 9),
      companyId: copyToCompanyId
    }));

    const groupIdMap = groupsToCopy.reduce((acc, group) => {
      const newGroup = copiedGroups.find(g => g.companyId === copyToCompanyId && g.type === group.type);
      acc[group.id] = newGroup ? newGroup.id : null;
      return acc;
    }, {} as Record<string, string | null>);

    const copiedCategories = categoriesToCopy.map(cat => ({
      ...cat,
      id: Math.random().toString(36).substr(2, 9),
      companyId: copyToCompanyId,
      groupId: cat.groupId ? groupIdMap[cat.groupId] : null
    }));

    setGroups([...groups, ...copiedGroups]);
    setCategories([...categories, ...copiedCategories]);
    setShowCopyModal(false);
    setCopyFromCompanyId('');
    setCopyToCompanyId('');
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    setCategories(categories.map(cat => 
      cat.groupId === groupId ? { ...cat, groupId: null } : cat
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: string, value: string, type: 'category' | 'group') => {
    if (e.key === 'Enter') {
      if (type === 'category') {
        saveCategory(id, value);
      } else {
        saveGroup(id, value);
      }
    }
  };

  const renderCategoryGroup = (group: CategoryGroup) => {
    const groupCategories = categories.filter(cat => 
      cat.groupId === group.id && cat.companyId === selectedCompanyId
    );

    return (
      <div key={group.id} className="mb-6 bg-zinc-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          {group.isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={group.name}
                onChange={(e) => {
                  setGroups(groups.map(g => 
                    g.id === group.id ? { ...g, name: e.target.value } : g
                  ));
                }}
                onKeyPress={(e) => handleKeyPress(e, group.id, group.name, 'group')}
                className="flex-1 bg-zinc-800 rounded px-2 py-1 text-zinc-100"
                placeholder="Nome do grupo"
                autoFocus
              />
              <button
                onClick={() => saveGroup(group.id, group.name)}
                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-green-400"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => cancelEditingGroup(group.id, group.isNew)}
                className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-red-400"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-zinc-200">{group.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditingGroup(group.id)}
                  className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                >
                  <PencilIcon size={16} />
                </button>
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          {groupCategories.map(category => (
            <div key={category.id} className={`flex items-center gap-4 py-2 px-4 bg-zinc-800/50 rounded-lg ${!category.isActive && 'opacity-50'}`}>
              <span className="text-zinc-400 font-mono text-sm w-20">{category.code}</span>
              {category.isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      setCategories(categories.map(cat => 
                        cat.id === category.id ? { ...cat, name: e.target.value } : cat
                      ));
                    }}
                    onKeyPress={(e) => handleKeyPress(e, category.id, category.name, 'category')}
                    className="flex-1 bg-zinc-800 rounded px-2 py-1 text-zinc-100"
                    placeholder="Nome da categoria"
                    autoFocus
                  />
                  <button
                    onClick={() => saveCategory(category.id, category.name)}
                    className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-green-400"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => cancelEditing(category.id, category.isNew)}
                    className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-zinc-100 flex-1">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCategoryStatus(category.id)}
                      className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                        category.isActive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      <Power size={16} />
                    </button>
                    <button
                      onClick={() => startEditing(category.id)}
                      className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <PencilIcon size={16} className="text-zinc-400" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-zinc-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          <button
            onClick={() => addCategory(group.type, group.id)}
            className="w-full mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Nova Categoria
          </button>
        </div>
      </div>
    );
  };

  const renderUngroupedCategories = (type: 'revenue' | 'expense') => {
    const ungroupedCategories = categories.filter(cat => 
      cat.type === type && 
      cat.groupId === null && 
      cat.companyId === selectedCompanyId
    );

    if (ungroupedCategories.length === 0) return null;

    return (
      <div className="mb-6 bg-zinc-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-zinc-200 mb-4">Sem Grupo</h3>
        <div className="space-y-2">
          {ungroupedCategories.map(category => (
            <div key={category.id} className={`flex items-center gap-4 py-2 px-4 bg-zinc-800/50 rounded-lg ${!category.isActive && 'opacity-50'}`}>
              <span className="text-zinc-400 font-mono text-sm w-20">{category.code}</span>
              {category.isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      setCategories(categories.map(cat => 
                        cat.id === category.id ? { ...cat, name: e.target.value } : cat
                      ));
                    }}
                    onKeyPress={(e) => handleKeyPress(e, category.id, category.name, 'category')}
                    className="flex-1 bg-zinc-800 rounded px-2 py-1 text-zinc-100"
                    placeholder="Nome da categoria"
                    autoFocus
                  />
                  <button
                    onClick={() => saveCategory(category.id, category.name)}
                    className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-green-400"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => cancelEditing(category.id, category.isNew)}
                    className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-zinc-100 flex-1">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCategoryStatus(category.id)}
                      className={`p-1 hover:bg-zinc-700 rounded-lg transition-colors ${
                        category.isActive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      <Power size={16} />
                    </button>
                    <button
                      onClick={() => startEditing(category.id)}
                      className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <PencilIcon size={16} className="text-zinc-400" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-zinc-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
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
        <div className="space-y-8">
          {/* Receitas */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Receitas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => addGroup('revenue')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-2"
                >
                  <FolderPlus size={16} />
                  Novo Grupo
                </button>
                <button
                  onClick={() => addCategory('revenue')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nova Receita
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {groups
                .filter(group => group.type === 'revenue' && group.companyId === selectedCompanyId)
                .map(renderCategoryGroup)}
              {renderUngroupedCategories('revenue')}
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Despesas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => addGroup('expense')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-2"
                >
                  <FolderPlus size={16} />
                  Novo Grupo
                </button>
                <button
                  onClick={() => addCategory('expense')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nova Despesa
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {groups
                .filter(group => group.type === 'expense' && group.companyId === selectedCompanyId)
                .map(renderCategoryGroup)}
              {renderUngroupedCategories('expense')}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Selecione uma empresa para gerenciar suas categorias</p>
        </div>
      )}

      {/* Modal de Cópia de Categorias */}
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
                onClick={copyCategories}
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