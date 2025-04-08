import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Copy, PencilIcon, Save } from 'lucide-react';

interface Category {
  id: string;
  code: string;
  name: string;
  type: 'revenue' | 'expense';
  parentId: string | null;
  children: Category[];
  companyId: string;
}

interface Company {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  isActive: boolean;
  categoryLevels?: number;
}

export const Categories = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromCompanyId, setCopyFromCompanyId] = useState<string>('');
  const [copyToCompanyId, setCopyToCompanyId] = useState<string>('');
  const [isEditingLevels, setIsEditingLevels] = useState(false);

  // Simula a busca das empresas do banco de dados
  useEffect(() => {
    setCompanies([
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
    ]);
  }, []);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const updateCompanyCategoryLevels = (levels: number) => {
    setCompanies(companies.map(company => 
      company.id === selectedCompanyId
        ? { ...company, categoryLevels: levels }
        : company
    ));
    setIsEditingLevels(false);
  };

  const generateCode = (type: 'revenue' | 'expense', parentCategory?: Category) => {
    const prefix = type === 'revenue' ? 'R' : 'D';
    const parentCode = parentCategory ? parentCategory.code : '';
    const siblingCategories = parentCategory 
      ? parentCategory.children 
      : categories.filter(c => c.type === type && !c.parentId && c.companyId === selectedCompanyId);
    
    const nextNumber = (siblingCategories.length + 1).toString().padStart(2, '0');
    return parentCode ? `${parentCode}.${nextNumber}` : `${prefix}${nextNumber}`;
  };

  const addCategory = (type: 'revenue' | 'expense', parentId: string | null = null) => {
    if (!newCategoryName.trim() || !selectedCompanyId) return;

    const parentCategory = parentId 
      ? findCategory(categories, parentId)
      : undefined;

    const newCategory: Category = {
      id: Math.random().toString(36).substr(2, 9),
      code: generateCode(type, parentCategory),
      name: newCategoryName,
      type,
      parentId,
      children: [],
      companyId: selectedCompanyId
    };

    if (!parentId) {
      setCategories([...categories, newCategory]);
    } else {
      const updateCategories = (cats: Category[]): Category[] => {
        return cats.map(cat => {
          if (cat.id === parentId) {
            return { ...cat, children: [...cat.children, newCategory] };
          }
          if (cat.children.length > 0) {
            return { ...cat, children: updateCategories(cat.children) };
          }
          return cat;
        });
      };

      setCategories(updateCategories(categories));
    }

    setNewCategoryName('');
    setSelectedParentId(null);
  };

  const copyCategories = () => {
    if (!copyFromCompanyId || !copyToCompanyId) return;

    const deepCopyCategory = (category: Category): Category => {
      return {
        ...category,
        id: Math.random().toString(36).substr(2, 9),
        companyId: copyToCompanyId,
        children: category.children.map(child => deepCopyCategory(child))
      };
    };

    const categoriesToCopy = categories.filter(cat => cat.companyId === copyFromCompanyId);
    const copiedCategories = categoriesToCopy.map(cat => deepCopyCategory(cat));

    setCategories([...categories, ...copiedCategories]);
    setShowCopyModal(false);
    setCopyFromCompanyId('');
    setCopyToCompanyId('');
  };

  const findCategory = (cats: Category[], id: string): Category | undefined => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      const found = findCategory(cat.children, id);
      if (found) return found;
    }
    return undefined;
  };

  const deleteCategory = (categoryId: string) => {
    const removeCategory = (cats: Category[]): Category[] => {
      return cats.filter(cat => {
        if (cat.id === categoryId) return false;
        if (cat.children.length > 0) {
          cat.children = removeCategory(cat.children);
        }
        return true;
      });
    };

    setCategories(removeCategory(categories));
  };

  const renderCategoryItem = (category: Category, level: number = 0) => {
    if (!selectedCompany || level >= selectedCompany.categoryLevels!) return null;

    return (
      <div key={category.id} className="border-l-2 border-zinc-700 ml-4 pl-4">
        <div className="flex items-center gap-4 py-2">
          <span className="text-zinc-400 font-mono text-sm">{category.code}</span>
          <span className="text-zinc-100">{category.name}</span>
          {level < selectedCompany.categoryLevels! - 1 && (
            <button
              onClick={() => setSelectedParentId(category.id)}
              className="ml-auto p-1 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Plus size={16} className="text-zinc-400" />
            </button>
          )}
          <button
            onClick={() => deleteCategory(category.id)}
            className="p-1 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-zinc-400" />
          </button>
        </div>
        {category.children.length > 0 && (
          <div className="ml-4">
            {category.children.map(child => renderCategoryItem(child, level + 1))}
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

            {/* Níveis de Categoria (apenas se uma empresa estiver selecionada) */}
            {selectedCompany && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Níveis de Categoria
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
                onClick={() => setSelectedParentId(null)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Receita
              </button>
            </div>
            <div className="space-y-2">
              {categories
                .filter(cat => cat.type === 'revenue' && cat.companyId === selectedCompanyId)
                .map(category => renderCategoryItem(category))}
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Despesas</h2>
              <button
                onClick={() => setSelectedParentId(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Despesa
              </button>
            </div>
            <div className="space-y-2">
              {categories
                .filter(cat => cat.type === 'expense' && cat.companyId === selectedCompanyId)
                .map(category => renderCategoryItem(category))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Selecione uma empresa para gerenciar suas categorias</p>
        </div>
      )}

      {/* Modal de Nova Categoria */}
      {selectedParentId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">
              Nova Categoria
            </h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da categoria"
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedParentId(null);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => addCategory('revenue', selectedParentId)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              >
                Adicionar
              </button>
            </div>
          </div>
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