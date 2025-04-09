import React, { useState } from 'react';
import { Building, Edit, Trash2, Plus, Power, Mail, Users, Eye, Calendar } from 'lucide-react';

interface Partner {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface Company {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  email: string;
  phone: string;
  partners: Partner[];
  isActive: boolean;
  contractStartDate: string;
}

export const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 'COMP001',
      name: 'TechCorp Solutions Ltda',
      tradingName: 'TechCorp',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techcorp.com',
      phone: '(11) 3456-7890',
      partners: [
        { name: 'João Silva', email: 'joao@techcorp.com', phone: '(11) 98765-4321', cpf: '123.456.789-00' },
        { name: 'Maria Santos', email: 'maria@techcorp.com', phone: '(11) 98765-4322', cpf: '987.654.321-00' }
      ],
      isActive: true,
      contractStartDate: '2023-01-15'
    },
    {
      id: 'COMP002',
      name: 'Inovação Digital S.A.',
      tradingName: 'InovaTech',
      cnpj: '23.456.789/0001-01',
      email: 'contato@inovatech.com',
      phone: '(11) 4567-8901',
      partners: [
        { name: 'Pedro Souza', email: 'pedro@inovatech.com', phone: '(11) 98765-4323', cpf: '456.789.123-00' }
      ],
      isActive: true,
      contractStartDate: '2023-06-20'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Company>({
    id: '',
    name: '',
    tradingName: '',
    cnpj: '',
    email: '',
    phone: '',
    partners: [{ name: '', email: '', phone: '', cpf: '' }],
    isActive: true,
    contractStartDate: new Date().toISOString().split('T')[0]
  });

  const calculateMonthsAsClient = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + 
                  (now.getMonth() - start.getMonth());
    return months;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleViewCompany = (company: Company) => {
    setViewingCompany(company);
    setShowViewModal(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setFormData(company);
    setShowModal(true);
  };

  const handleNewCompany = () => {
    setEditingCompany(null);
    setFormData({
      id: `COMP${(companies.length + 1).toString().padStart(3, '0')}`,
      name: '',
      tradingName: '',
      cnpj: '',
      email: '',
      phone: '',
      partners: [{ name: '', email: '', phone: '', cpf: '' }],
      isActive: true,
      contractStartDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleAddPartner = () => {
    setFormData({
      ...formData,
      partners: [...formData.partners, { name: '', email: '', phone: '', cpf: '' }]
    });
  };

  const handleRemovePartner = (index: number) => {
    setFormData({
      ...formData,
      partners: formData.partners.filter((_, i) => i !== index)
    });
  };

  const handlePartnerChange = (index: number, field: keyof Partner, value: string) => {
    const newPartners = [...formData.partners];
    newPartners[index] = { ...newPartners[index], [field]: value };
    setFormData({ ...formData, partners: newPartners });
  };

  const handleSave = () => {
    if (editingCompany) {
      setCompanies(companies.map(company => 
        company.id === editingCompany.id ? formData : company
      ));
    } else {
      setCompanies([...companies, formData]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (companyId: string) => {
    setCompanies(companies.map(company =>
      company.id === companyId ? { ...company, isActive: !company.isActive } : company
    ));
  };

  const handleDelete = (companyId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      setCompanies(companies.filter(company => company.id !== companyId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Gerenciamento de Empresas</h1>
          <p className="text-zinc-400 mt-1">Cadastre e gerencie as empresas do sistema</p>
        </div>
        <button 
          onClick={handleNewCompany}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Empresa
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Empresa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">CNPJ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Início Contrato</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Sócios</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Building size={16} className="text-zinc-400" />
                      </div>
                      <div>
                        <span className="text-zinc-300 block">{company.tradingName}</span>
                        <span className="text-zinc-500 text-sm">{company.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-400 font-mono">{company.cnpj}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-zinc-500" />
                      <span className="text-zinc-400">{company.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-zinc-500" />
                      <div>
                        <span className="text-zinc-400">{formatDate(company.contractStartDate)}</span>
                        <span className="text-zinc-500 text-sm block">
                          Cliente há {calculateMonthsAsClient(company.contractStartDate)} meses
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-zinc-500" />
                      <span className="text-zinc-400">{company.partners.length} sócios</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      company.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {company.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewCompany(company)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(company.id)}
                        className={`p-2 hover:bg-zinc-700 rounded-lg transition-colors ${
                          company.isActive ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
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

      {/* Modal de Visualização */}
      {showViewModal && viewingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">{viewingCompany.tradingName}</h2>
                <p className="text-zinc-400 mt-1">{viewingCompany.name}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">CNPJ</h3>
                  <p className="text-zinc-100">{viewingCompany.cnpj}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">Email</h3>
                  <p className="text-zinc-100">{viewingCompany.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">Telefone</h3>
                  <p className="text-zinc-100">{viewingCompany.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">Início do Contrato</h3>
                  <p className="text-zinc-100">
                    {formatDate(viewingCompany.contractStartDate)}
                    <span className="text-zinc-400 text-sm block">
                      Cliente há {calculateMonthsAsClient(viewingCompany.contractStartDate)} meses
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Sócios</h3>
                <div className="space-y-4">
                  {viewingCompany.partners.map((partner, index) => (
                    <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                      <h4 className="text-zinc-300 mb-2">Sócio {index + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-zinc-400">Nome</p>
                          <p className="text-zinc-100">{partner.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400">CPF</p>
                          <p className="text-zinc-100">{partner.cpf}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400">Email</p>
                          <p className="text-zinc-100">{partner.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400">Telefone</p>
                          <p className="text-zinc-100">{partner.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Empresa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold text-zinc-100 mb-6">
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={formData.tradingName}
                    onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Data de Início do Contrato
                  </label>
                  <input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-zinc-400">
                    Sócios
                  </label>
                  <button
                    onClick={handleAddPartner}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Adicionar Sócio
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.partners.map((partner, index) => (
                    <div key={index} className="bg-zinc-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-zinc-300">Sócio {index + 1}</h4>
                        {index > 0 && (
                          <button
                            onClick={() => handleRemovePartner(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            value={partner.name}
                            onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                            placeholder="Nome"
                            className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={partner.cpf}
                            onChange={(e) => handlePartnerChange(index, 'cpf', e.target.value)}
                            placeholder="CPF"
                            className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            value={partner.email}
                            onChange={(e) => handlePartnerChange(index, 'email', e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={partner.phone}
                            onChange={(e) => handlePartnerChange(index, 'phone', e.target.value)}
                            placeholder="Telefone"
                            className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                  />
                  <span className="text-zinc-400">Empresa Ativa</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {editingCompany ? 'Salvar Alterações' : 'Criar Empresa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};