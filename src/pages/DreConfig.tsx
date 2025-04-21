import React, { useState, useEffect } from 'react';
import { Plus, Copy, ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DreTemplate, DreSection, DreLine } from '../types/dre';
import { DreTemplateModal } from '../components/dre/DreTemplateModal';
import { DreSectionModal } from '../components/dre/DreSectionModal';
import { DreLineModal } from '../components/dre/DreLineModal';

interface Company {
  id: string;
  trading_name: string;
  name: string;
}

export const DreConfig = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [templates, setTemplates] = useState<DreTemplate[]>([]);
  const [sections, setSections] = useState<DreSection[]>([]);
  const [lines, setLines] = useState<DreLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modais
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DreTemplate | null>(null);
  const [editingSection, setEditingSection] = useState<DreSection | null>(null);
  const [editingLine, setEditingLine] = useState<DreLine | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCompanies();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchSections();
      fetchLines();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, trading_name, name')
        .eq('is_active', true)
        .order('trading_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('dre_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
      setError('Erro ao carregar templates');
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('dre_sections')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('display_order');

      if (error) throw error;
      setSections(data || []);
    } catch (err) {
      console.error('Erro ao carregar seções:', err);
      setError('Erro ao carregar seções');
    }
  };

  const fetchLines = async () => {
    try {
      const { data, error } = await supabase
        .from('dre_lines')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setLines(data || []);
    } catch (err) {
      console.error('Erro ao carregar linhas:', err);
      setError('Erro ao carregar linhas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: DreTemplate) => {
    await fetchTemplates();
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleSaveSection = async (section: DreSection) => {
    await fetchSections();
    setShowSectionModal(false);
    setEditingSection(null);
  };

  const handleSaveLine = async (line: DreLine) => {
    await fetchLines();
    setShowLineModal(false);
    setEditingLine(null);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta seção?')) return;

    try {
      const { error } = await supabase
        .from('dre_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      await fetchSections();
    } catch (err) {
      console.error('Erro ao excluir seção:', err);
      setError('Erro ao excluir seção');
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta linha?')) return;

    try {
      const { error } = await supabase
        .from('dre_lines')
        .delete()
        .eq('id', lineId);

      if (error) throw error;
      await fetchLines();
    } catch (err) {
      console.error('Erro ao excluir linha:', err);
      setError('Erro ao excluir linha');
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const getSectionLines = (sectionId: string): DreLine[] => {
    return lines.filter(line => line.section_id === sectionId);
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
          <h1 className="text-2xl font-bold text-zinc-100">Configuração do DRE</h1>
          <p className="text-zinc-400 mt-1">Configure a estrutura do DRE por empresa</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Template
          </button>
          <button
            onClick={() => {
              if (!selectedCompanyId) {
                setError('Selecione uma empresa primeiro');
                return;
              }
              setShowSectionModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Seção
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Empresa
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
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
      </div>

      {selectedCompanyId ? (
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleSectionExpansion(section.id)}
                    className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400"
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>
                  <div>
                    <span className="text-zinc-400 font-mono text-sm">{section.code}</span>
                    <h3 className="text-zinc-100 font-medium">{section.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setShowLineModal(true);
                    }}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Nova Linha
                  </button>
                  <button
                    onClick={() => {
                      setEditingSection(section);
                      setShowSectionModal(true);
                    }}
                    className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedSections.has(section.id) && (
                <div className="border-t border-zinc-800">
                  <div className="p-4 space-y-2">
                    {getSectionLines(section.id).map(line => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg"
                        style={{ paddingLeft: `${line.indent_level * 20 + 8}px` }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 font-mono text-sm">{line.code}</span>
                          <span
                            className={`text-zinc-100 ${line.is_bold ? 'font-semibold' : ''}`}
                            style={line.highlight_color ? { color: line.highlight_color } : undefined}
                          >
                            {line.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingLine(line);
                              setShowLineModal(true);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded-lg text-zinc-400"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLine(line.id)}
                            className="p-1 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Selecione uma empresa para configurar o DRE</p>
        </div>
      )}

      <DreTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        editingTemplate={editingTemplate}
      />

      <DreSectionModal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
        editingSection={editingSection}
        companyId={selectedCompanyId}
      />

      <DreLineModal
        isOpen={showLineModal}
        onClose={() => {
          setShowLineModal(false);
          setEditingLine(null);
          setSelectedSectionId(null);
        }}
        onSave={handleSaveLine}
        editingLine={editingLine}
        sectionId={selectedSectionId || ''}
      />
    </div>
  );
};