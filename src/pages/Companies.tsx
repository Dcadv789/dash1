import React, { useState } from 'react';
import { Building, Edit, Trash2, Plus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  isActive: boolean;
}

export const Companies = () => {
  const [companies] = useState<Company[]>([
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
    },
    {
      id: 'COMP004',
      name: 'DataFlow Analytics Ltda',
      tradingName: 'DataFlow',
      cnpj: '45.678.901/0001-23',
      isActive: true
    },
    {
      id: 'COMP005',
      name: 'Cloud Systems Brasil S.A.',
      tradingName: 'CloudSys',
      cnpj: '56.789.012/0001-34',
      isActive: false
    }
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Gerenciamento de Empresas</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">CNPJ</th>
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
                    <span className="text-zinc-400 font-mono">{company.id}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{company.cnpj}</td>
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
                      <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
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
    </div>
  );
};