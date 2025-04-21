import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DreSection, DreTemplate } from '../../types/dre';
import { supabase } from '../../lib/supabase';

interface DreSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: DreSection) => void;
  editingSection: DreSection | null;
  companyId: string;
}

export const DreSectionModal: React.FC<DreSectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSection,
  companyId
}) => {
  const [name, setName] = useState(editingSection?.name || '');
  const [code, setCode] = useState(editingSection?.code || '');
  const [templateId, setTemplateId] = useState(editingSection?.template_id || '');
  const [templates, setTemplates] = useState<DreTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('dre_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (!name.trim() || !code.trim()) {
        setError('Nome e código são obrigatórios');
        return;
      }

      const sectionData = {
        name,
        code,
        company_id: companyId,
        template_id: templateId || null,
        is_active: true
      };

      let data;
      if (editingSection) {
        const { data: updatedSection, error } = await supabase
          .from('dre_sections')
          .update(sectionData)
          .eq('id', editingSection.id)
          .select()
          .single();

        if (error) throw error;
        data = updatedSection;
      } else {
        const { data: newSection, error } = await supabase
          .from('dre_sections')
          .insert([sectionData])
          .select()
          .single();

        if (error) throw error;
        data = newSection;
      }

      onSave(data);
      onClose();
    } catch (err) {
      setError('Erro ao salvar seção');
      console.error('Erro:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            {editingSection ? 'Editar Seção' : 'Nova Seção'}
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
              placeholder="Nome da seção"
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
              placeholder="Código da seção"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Template (Opcional)
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
            >
              <option value="">Nenhum template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
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
            {editingSection ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};