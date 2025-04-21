import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DreTemplate } from '../../types/dre';
import { supabase } from '../../lib/supabase';

interface DreTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: DreTemplate) => void;
  editingTemplate: DreTemplate | null;
}

export const DreTemplateModal: React.FC<DreTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTemplate
}) => {
  const [name, setName] = useState(editingTemplate?.name || '');
  const [description, setDescription] = useState(editingTemplate?.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        setError('O nome é obrigatório');
        return;
      }

      const templateData = {
        name,
        description: description || null,
        is_active: true
      };

      let data;
      if (editingTemplate) {
        const { data: updatedTemplate, error } = await supabase
          .from('dre_templates')
          .update(templateData)
          .eq('id', editingTemplate.id)
          .select()
          .single();

        if (error) throw error;
        data = updatedTemplate;
      } else {
        const { data: newTemplate, error } = await supabase
          .from('dre_templates')
          .insert([templateData])
          .select()
          .single();

        if (error) throw error;
        data = newTemplate;
      }

      onSave(data);
      onClose();
    } catch (err) {
      setError('Erro ao salvar template');
      console.error('Erro:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            {editingTemplate ? 'Editar Template' : 'Novo Template'}
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
              placeholder="Nome do template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 h-24 resize-none"
              placeholder="Descrição do template"
            />
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
            {editingTemplate ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};