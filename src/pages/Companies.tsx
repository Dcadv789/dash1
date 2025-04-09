import React, { useState, useEffect } from 'react';
import { Plus, X, Building2, Users, Calendar, FileText, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];
type Partner = Database['public']['Tables']['company_partners']['Row'];

interface CompanyWithPartners extends Company {
  partners?: Partner[];
}

export const Companies = () => {
  const [companies, setCompanies] = useState<CompanyWithPartners[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithPartners | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    trading_name: '',
    cnpj: '',
    contract_start_date: ''
  });
  const [newPartner, setNewPartner] = useState({
    name: '',
    cpf: '',
    role: '',
    ownership_percentage: 0
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Busca as empresas
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;

      // Busca os sócios para cada empresa
      const companiesWithPartners = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: partners } = await supabase
            .from('company_partners')
            .select('*')
            .eq('company_id', company.id)
            .eq('is_active', true);

          return {
            ...company,
            partners: partners || []
          };
        })
      );

      setCompanies(companiesWithPartners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const generateCompanyCode = () => {
    const prefix = 'EMP';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomNum}`;
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const handleCreateCompany = async () => {
    try {
      const companyCode = generateCompanyCode();
      
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: newCompany.name,
          trading_name: newCompany.trading_name,
          cnpj: newCompany.cnpj,
          contract_start_date: newCompany.contract_start_date,
          company_code: companyCode,
          is_active: true
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      setShowModal(false);
      setNewCompany({ name: '', trading_name: '', cnpj: '', contract_start_date: '' });
      await fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa');
    }
  };

  const handleAddPartner = async () => {
    if (!selectedCompany) return;

    try {
      const { error: partnerError } = await supabase
        .from('company_partners')
        .insert([{
          company_id: selectedCompany.id,
          name: newPartner.name,
          cpf: newPartner.cpf,
          role: newPartner.role,
          ownership_percentage: newPartner.ownership_percentage,
          is_active: true
        }]);

      if (partnerError) throw partnerError;

      setShowPartnersModal(false);
      setNewPartner({ name: '', cpf: '', role: '', ownership_percentage: 0 });
      await fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar sócio');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Gerenciamento de Empresas</h1>
          <p className="text-zinc-400 mt-1">Cadastre e gerencie as empresas do sistema</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Empresa
        </button>
      </div>

      {loading ? (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Carregando empresas...</p>
        </div>
      ) : error ? (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Nenhuma empresa cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100">{company.trading_name}</h3>
                      <p className="text-sm text-zinc-400">{company.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    company.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {company.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText size={16} className="text-zinc-500" />
                    <span className="text-zinc-400">CNPJ:</span>
                    <span className="text-zinc-300">{company.cnpj}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-zinc-500" />
                    <span className="text-zinc-400">Início do Contrato:</span>
                    <span className="text-zinc-300">
                      {company.contract_start_date ? formatDate(company.contract_start_date) : 'Não definido'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-zinc-500" />
                    <span className="text-zinc-400">Sócios:</span>
                    <span className="text-zinc-300">{company.partners?.length || 0}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">{company.company_code}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowPartnersModal(true);
                      }}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                    >
                      <Users size={16} />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {company.partners && company.partners.length > 0 && (
                <div className="border-t border-zinc-800 p-4">
                  <h4 className="text-sm font-medium text-zinc-300 mb-3">Sócios</h4>
                  <div className="space-y-2">
                    {company.partners.map((partner) => (
                      <div key={partner.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-zinc-300">{partner.name}</p>
                          <p className="text-zinc-500">{partner.role}</p>
                        </div>
                        <span className="text-zinc-400">{partner.ownership_percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova Empresa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Nova Empresa</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="Razão Social"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={newCompany.trading_name}
                  onChange={(e) => setNewCompany({ ...newCompany, trading_name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="Nome Fantasia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={newCompany.cnpj}
                  onChange={(e) => setNewCompany({ ...newCompany, cnpj: formatCNPJ(e.target.value) })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Data de Início do Contrato
                </label>
                <input
                  type="date"
                  value={newCompany.contract_start_date}
                  onChange={(e) => setNewCompany({ ...newCompany, contract_start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCompany}
                disabled={!newCompany.name || !newCompany.trading_name || !newCompany.cnpj}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Empresa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sócios */}
      {showPartnersModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">Sócios</h2>
                <p className="text-sm text-zinc-400">{selectedCompany.trading_name}</p>
              </div>
              <button
                onClick={() => {
                  setShowPartnersModal(false);
                  setSelectedCompany(null);
                }}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nome do Sócio
                </label>
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={newPartner.cpf}
                  onChange={(e) => setNewPartner({ ...newPartner, cpf: formatCPF(e.target.value) })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Cargo/Função
                </label>
                <input
                  type="text"
                  value={newPartner.role}
                  onChange={(e) => setNewPartner({ ...newPartner, role: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="Ex: Diretor, Sócio-Administrador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Percentual de Participação
                </label>
                <input
                  type="number"
                  value={newPartner.ownership_percentage}
                  onChange={(e) => setNewPartner({ ...newPartner, ownership_percentage: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Sócios Cadastrados</h3>
              <div className="space-y-3">
                {selectedCompany.partners?.map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                    <div>
                      <p className="text-zinc-200">{partner.name}</p>
                      <p className="text-sm text-zinc-500">{partner.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-300">{partner.ownership_percentage}%</p>
                      <p className="text-sm text-zinc-500">{formatCPF(partner.cpf)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPartnersModal(false);
                  setSelectedCompany(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                Fechar
              </button>
              <button
                onClick={handleAddPartner}
                disabled={!newPartner.name || !newPartner.cpf || !newPartner.role || newPartner.ownership_percentage <= 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar Sócio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};