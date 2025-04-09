import React, { useState } from 'react';
import { X, User, Plus, Trash2 } from 'lucide-react';
import { Company } from '../types/company';

interface Partner {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: any) => void;
  editingCompany: Company | null;
}

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .slice(0, 15);
};

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

export const CompanyModal = ({ isOpen, onClose, onSave, editingCompany }: CompanyModalProps) => {
  const [companyData, setCompanyData] = useState({
    name: editingCompany?.name || '',
    tradingName: editingCompany?.tradingName || '',
    cnpj: editingCompany?.cnpj || '',
    phone: editingCompany?.phone || '',
    email: editingCompany?.email || '',
    contractStartDate: editingCompany?.contractStartDate || '',
    isActive: editingCompany?.isActive ?? true,
    partners: [] as Partner[]
  });

  const [newPartner, setNewPartner] = useState<Partner>({
    id: '',
    name: '',
    cpf: '',
    email: '',
    phone: ''
  });

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.cpf) return;

    setCompanyData(prev => ({
      ...prev,
      partners: [...prev.partners, { ...newPartner, id: crypto.randomUUID() }]
    }));

    setNewPartner({
      id: '',
      name: '',
      cpf: '',
      email: '',
      phone: ''
    });
  };

  const handleRemovePartner = (partnerId: string) => {
    setCompanyData(prev => ({
      ...prev,
      partners: prev.partners.filter(p => p.id !== partnerId)
    }));
  };

  const handleSave = () => {
    const companyId = editingCompany?.id || crypto.randomUUID();
    const companyCode = editingCompany?.code || `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    onSave({
      ...companyData,
      id: companyId,
      code: companyCode
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="Razão Social"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={companyData.cnpj}
                onChange={(e) => setCompanyData({ ...companyData, cnpj: formatCNPJ(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: formatPhone(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={companyData.tradingName}
                onChange={(e) => setCompanyData({ ...companyData, tradingName: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="Nome Fantasia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="email@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Data de Início do Contrato
              </label>
              <input
                type="date"
                value={companyData.contractStartDate}
                onChange={(e) => setCompanyData({ ...companyData, contractStartDate: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={companyData.isActive}
              onChange={(e) => setCompanyData({ ...companyData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
            />
            <span className="text-zinc-400">Empresa Ativa</span>
          </label>
        </div>

        <div className="mt-6 border-t border-zinc-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-zinc-300">Sócios</h3>
            <button
              onClick={handleAddPartner}
              disabled={!newPartner.name || !newPartner.cpf}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Adicionar Sócio
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <input
                type="text"
                value={newPartner.name}
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="Nome do Sócio"
              />
            </div>
            <div>
              <input
                type="text"
                value={newPartner.cpf}
                onChange={(e) => setNewPartner({ ...newPartner, cpf: formatCPF(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="CPF"
                maxLength={14}
              />
            </div>
            <div>
              <input
                type="email"
                value={newPartner.email}
                onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="Email do Sócio"
              />
            </div>
            <div>
              <input
                type="text"
                value={newPartner.phone}
                onChange={(e) => setNewPartner({ ...newPartner, phone: formatPhone(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
                placeholder="Telefone do Sócio"
              />
            </div>
          </div>

          {companyData.partners.length > 0 && (
            <div className="space-y-2 mt-4">
              {companyData.partners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                  <div>
                    <p className="text-zinc-200">{partner.name}</p>
                    <div className="flex gap-4 text-sm text-zinc-500">
                      <span>{partner.cpf}</span>
                      <span>{partner.email}</span>
                      <span>{partner.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePartner(partner.id)}
                    className="p-1 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            disabled={!companyData.name || !companyData.tradingName || !companyData.cnpj}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingCompany ? 'Salvar' : 'Criar Empresa'}
          </button>
        </div>
      </div>
    </div>
  );
};