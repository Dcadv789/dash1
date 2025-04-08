import React, { useState } from 'react';
import { User, Edit, Trash2, Plus, Building, Search } from 'lucide-react';

interface Permission {
  page: string;
  canAccess: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: string;
  permissions: Permission[];
  isActive: boolean;
}

interface Company {
  id: string;
  tradingName: string;
}

const AVAILABLE_PAGES = [
  'Início',
  'Dashboard',
  'Vendas',
  'Análise',
  'Caixa',
  'DRE',
  'Usuários'
];

const COMPANIES: Company[] = [
  { id: 'COMP001', tradingName: 'TechCorp' },
  { id: 'COMP002', tradingName: 'InovaTech' },
  { id: 'COMP003', tradingName: 'GSE' },
  { id: 'COMP004', tradingName: 'DataFlow' },
  { id: 'COMP005', tradingName: 'CloudSys' },
];

const USERS: UserData[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@techcorp.com',
    companyId: 'COMP001',
    role: 'master',
    permissions: AVAILABLE_PAGES.map(page => ({ page, canAccess: true })),
    isActive: true
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@techcorp.com',
    companyId: 'COMP001',
    role: 'user',
    permissions: AVAILABLE_PAGES.map(page => ({ 
      page, 
      canAccess: !['Usuários', 'DRE'].includes(page)
    })),
    isActive: true
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@inovatech.com',
    companyId: 'COMP002',
    role: 'master',
    permissions: AVAILABLE_PAGES.map(page => ({ page, canAccess: true })),
    isActive: true
  },
  {
    id: '4',
    name: 'Ana Paula',
    email: 'ana@gse.com',
    companyId: 'COMP003',
    role: 'user',
    permissions: AVAILABLE_PAGES.map(page => ({ page, canAccess: true })),
    isActive: true
  },
  {
    id: '5',
    name: 'Roberto Lima',
    email: 'roberto@dataflow.com',
    companyId: 'COMP004',
    role: 'master',
    permissions: AVAILABLE_PAGES.map(page => ({ page, canAccess: true })),
    isActive: true
  }
];

export const Users = () => {
  const [users] = useState<UserData[]>(USERS);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredUsers = users.filter(user => {
    const matchesCompany = selectedCompany ? user.companyId === selectedCompany : true;
    const matchesSearch = searchTerm.toLowerCase() === '' ? true : 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCompany && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Gerenciamento de Usuários</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as empresas</option>
                {COMPANIES.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.tradingName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Usuário</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Empresa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Cargo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                          <User size={16} className="text-zinc-400" />
                        </div>
                        <span className="text-zinc-300">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-zinc-500" />
                        <span className="text-zinc-400">
                          {COMPANIES.find(c => c.id === user.companyId)?.tradingName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'master' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-zinc-700/50 text-zinc-400'
                      }`}>
                        {user.role === 'master' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setShowPermissions(showPermissions === user.id ? null : user.id)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {showPermissions === user.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-zinc-800/50">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-zinc-300">Permissões de Acesso</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {user.permissions.map((permission) => (
                              <div 
                                key={permission.page}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={permission.canAccess}
                                  disabled={user.role === 'master'}
                                  className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                                />
                                <span className="text-zinc-300">{permission.page}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};