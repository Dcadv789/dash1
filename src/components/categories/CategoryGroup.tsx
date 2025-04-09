import React, { useState } from 'react';
import { Plus, Power, PencilIcon, Trash2, Check, X } from 'lucide-react';
import { Category } from '../../types/financial';

interface Company {
  id: string;
  trading_name: string;
  name: string;
}

interface CategoryGroupProps {
  groupName: string;
  groupId?: string;
  categories: Category[];
  companies: Company[];
  onAddCategory: (groupId?: string) => void;
  onToggleStatus: (categoryId: string, companyId: string) => void;
  onUpdateCategory: (categoryId: string, name: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  getCategoryStatus: (categoryId: string, companyId: string) => boolean;
}

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  groupName,
  groupId,
  categories,
  companies,
  onAddCategory,
  onToggleStatus,
  onUpdateCategory,
  onDeleteCategory,
  getCategoryStatus,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category.id);
    setNewCategoryName(category.name);
  };

  const handleSaveEdit = (categoryId: string) => {
    if (newCategoryName.trim()) {
      onUpdateCategory(categoryId, newCategoryName);
    }
    setEditingCategory(null);
    setNewCategoryName('');
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-zinc-200">{groupName}</h3>
        <button
          onClick={() => onAddCategory(groupId)}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Adicionar Categoria
        </button>
      </div>

      <div className="space-y-4">
        {categories.map(category => (
          <div
            key={category.id}
            className="bg-zinc-800/50 rounded-lg overflow-hidden"
          >
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-zinc-400 font-mono text-sm">
                  {category.code}
                </span>
                {editingCategory === category.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="bg-zinc-700 px-2 py-1 rounded text-zinc-100"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(category.id)}
                      className="p-1 hover:bg-zinc-700 rounded-lg text-green-400"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 hover:bg-zinc-700 rounded-lg text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-zinc-100">{category.name}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!editingCategory && (
                  <>
                    <button
                      onClick={() => handleStartEdit(category)}
                      className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
                          onDeleteCategory(category.id);
                        }
                      }}
                      className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="px-3 pb-3 flex flex-wrap gap-2">
              {companies.map(company => (
                <button
                  key={company.id}
                  onClick={() => onToggleStatus(category.id, company.id)}
                  className={`px-2 py-1 rounded text-xs ${
                    getCategoryStatus(category.id, company.id)
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {company.trading_name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};