import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DreLine, DreLineType } from '../../types/dre';
import { Category } from '../../types/financial';
import { supabase } from '../../lib/supabase';

interface DreLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (line: DreLine) => void;
  editingLine: DreLine | null;
  sectionId: string;
  parentId?: string | null;
}

const LINE_TYPE_LABELS: Record<DreLineType, string> = {
  header: 'Cabeçalho',
  category: 'Categoria',
  calculation: 'Cálculo',
  indicator: 'Indicador',
  subtotal: 'Subtotal',
  total: 'Total'
};

export const DreLineModal: React.FC<DreLineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLine,
  sectionId,
  parentId
}) => {
  const [name, setName] = useState(editingLine?.name || '');
  const [code, setCode] = useState(editingLine?.code || '');
  const [type, setType] = useState<DreLineType>(editingLine?.type || 'header');
  const [categoryIds, setCategoryIds] = useState<string[]>(editingLine?.category_ids || []);
  const [formula, setFormula] = useState(editingLine?.formula || '');
  const [indentLevel, setIndentLevel] = useState(editingLine?.indent_level || 0);
  const [showPercentage, setShowPercentage] = useState(editingLine?.show_percentage || false);
  const [highlightColor, setHighlightColor] = useState(editingLine?.highlight_color || '');
  const [isBold, setIsBold] = useState(editingLine?.is_bold || false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'category') {
      fetchCategories();
    }
  }, [type]);

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
    }
  };

  const handleSave = async () => {
    try {
      if (!name.trim() || !code.trim()) {
        setError('Nome e código são obrigatórios');
        return;
      }

      const lineData = {
        name,
        code,
        type,
        section_id: sectionId,
        parent_id: parentId || null,
        category_ids: type === 'category' ? categoryIds : null,
        formula: type === 'calculation' ? formula : null,
        indent_level: indentLevel,
        show_percentage: showPercentage,
        highlight_color: highlightColor || null,
        is_bold: isBold,
        is_active: true
      };

      let data;
      if (editingLine) {
        const { data: updatedLine, error } = await supabase
          .from('dre_lines')
          .update(lineData)
          .eq('id', editingLine.id)
          .select()
          .single();

        if (error) throw error;
        data = updatedLine;
      } else {
        const { data: newLine, error } = await supabase
          .from('dre_lines')
          .insert([lineData])
          .select()
          .single();

        if (error) throw error;
        data = newLine;
      }

      onSave(data);
      onClose();
    } catch (err) {
      setError('Erro ao salvar linha');
      console.error('Erro:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            {editingLine ? 'Editar Linha' : 'Nova Linha'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="Nome da linha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Código
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="Código da linha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DreLineType)}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
              >
                {Object.entries(LINE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {type === 'category' && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Categorias
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategoryIds([...categoryIds, category.id]);
                          } else {
                            setCategoryIds(categoryIds.filter(id => id !== category.id));
                          }
                        }}
                        className="text-blue-600"
                      />
                      <span className="text-zinc-300">
                        {category.code} - {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {type === 'calculation' && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Fórmula
                </label>
                <textarea
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 h-24 resize-none"
                  placeholder="Fórmula de cálculo"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Nível de Indentação
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={indentLevel}
                onChange={(e) => setIndentLevel(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Cor de Destaque
              </label>
              <input
                type="text"
                value={highlightColor}
                onChange={(e) => setHighlightColor(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="#RRGGBB"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPercentage}
                  onChange={(e) => setShowPercentage(e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-zinc-300">Mostrar Percentual</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-zinc-300">Texto em Negrito</span>
              </label>
            </div>
          </div>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            {editingLine ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};