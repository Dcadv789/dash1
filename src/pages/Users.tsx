import React, { useState } from 'react';
import { User, Edit, Trash2, Plus, Building, Search, Shield, X } from 'lucide-react';

interface Permission {
  page: string;
  canAccess: boolean;
  canEdit: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: 'master' | 'consultor' | 'cliente' | 'colab';
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
  'Usuários',
  'Configurações'
];

const ROLE_LABELS = {
  master: 'Master',
  consultor: 'Consultor',
  cliente: 'Cliente',
  colab: 'Colaborador'
};

const ROLE_COLORS = {
  master: 'bg-purple-500/20 text-purple-400',
  consultor: 'bg-blue-500/20 text-blue-400',
  cliente: 'bg-green-500/20 text-green-400',
  colab: 'bg-orange-500/20 text-orange-400'
};

const COMPANIES: Company[] = [
  { id: 'COMP001', tradingName: 'TechCorp' },
  { id: 'COMP002', tradingName: 'InovaTech' },
  { id: 'COMP003', tradingName: 'GSE' },
  { id: 'COMP004', tradingName: 'DataFlow' },
  { id: 'COMP005', tradingName: 'CloudSys' },
];

const generatePermissions = (role: UserData['role']): Permission[] => {
  return AVAILABLE_PAGES.map(page => {
    switch (role) {
      case 'master':
        return { page, canAccess: true, canEdit: true };
      case 'consultor':
        return { 
          page, 
          canAccess: true, 
          canEdit: !['Configurações'].includes(page)
        };
      case 'cliente':
        return { 
          page, 
          canAccess: !['Usuários', 'Configurações'].includes(page), 
          canEdit: false 
        };
      case 'colab':
        return { 
          page, 
          canAccess: !['Usuários', 'Configurações', 'DRE'].includes(page), 
          canEdit: false 
        };
      default:
        return { page, canAccess: false, canEdit: false };
    }
  });
};

const USERS: UserData[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@techcorp.com',
    companyId: 'COMP001',
    role: 'master',
    permissions: generatePermissions('master'),
    isActive: true
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@techcorp.com',
    companyId: 'COMP001',
    role: 'consultor',
    permissions: generatePermissions('consultor'),
    isActive: true
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@inovatech.com',
    companyId: 'COMP002',
    role: 'cliente',
    permissions: generatePermissions('cliente'),
    isActive: true
  },
  {
    id: '4',
    name: 'Ana Paula',
    email: 'ana@gse.com',
    companyId: 'COMP003',
    role: 'colab',
    permissions: generatePermissions('colab'),
    isActive: true
  }
];

export const Users = () => {
  const [users, setUsers] = useState<UserData[]>(USERS);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUserRole] = useState<UserData['role']>('master');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const canEditUser = (editorRole: UserData['role'], targetRole: UserData['role']) => {
    if (editorRole === 'master') return true;
    
    const roleHierarchy = {
      master: 4,
      consultor: 3,
      cliente: 2,
      colab: 1
    };
    
    return roleHierarchy[editorRole] > roleHierarchy[targetRole];
  };

  const canEditPermissions = (editorRole: UserData['role'], targetRole: UserData['role']) => {
    if (editorRole === 'master') return true;
    if (editorRole === 'consultor') return ['cliente', 'colab'].includes(targetRole);
    return false;
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = () => {
    if (!editingUser) return;

    setUsers(users.map(user => 
      user.id === editingUser.id 
        ? {
            ...editingUser,
            permissions: generatePermissions(editingUser.role)
          }
        : user
    ));
    setEditingUser(null);
  };

  const handleUpdatePermission = (userId: string, page: string, field: 'canAccess' | 'canEdit', value: boolean) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || !canEditPermissions(currentUserRole, targetUser.role)) return;

    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          permissions: user.permissions.map(permission => 
            permission.page === page
              ? { ...permission, [field]: value }
              : permission
          )
        };
      }
      return user;
    }));
  };

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
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Gerenciamento de Usuários</h1>
          <p className="text-zinc-400 mt-1">Gerencie usuários e suas permissões de acesso</p>
        </div>
        {currentUserRole === 'master' && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} />
            Novo Usuário
          </button>
        )}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Nível</th>
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
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-zinc-500" />
                        <span className={`px-2 py-1 rounded-full text-xs ${ROLE_COLORS[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </div>
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
                        {(canEditUser(currentUserRole, user.role) || user.role === 'master') && (
                          <>
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                            >
                              <Edit size={16} />
                            </button>
                            {user.role !== 'master' && (
                              <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {showPermissions === user.id && canEditPermissions(currentUserRole, user.role) && (
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
                                <div className="flex flex-col">
                                  <label className="text-zinc-300 mb-1">{permission.page}</label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={permission.canAccess}
                                        onChange={(e) => handleUpdatePermission(user.id, permission.page, 'canAccess', e.target.checked)}
                                        className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                                      />
                                      <span className="text-zinc-400">Acessar</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={permission.canEdit}
                                        onChange={(e) => handleUpdatePermission(user.id, permission.page, 'canEdit', e.target.checked)}
                                        className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                                      />
                                      <span className="text-zinc-400">Editar</span>
                                    </label>
                                  </div>
                                </div>
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

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Editar Usuário</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Empresa
                </label>
                <select
                  value={editingUser.companyId}
                  onChange={(e) => setEditingUser({ ...editingUser, companyId: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COMPANIES.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.tradingName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Nível de Acesso
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ 
                    ...editingUser, 
                    role: e.target.value as UserData['role'],
                    permissions: generatePermissions(e.target.value as UserData['role'])
                  })}
                  disabled={editingUser.role === 'master' && currentUserRole !== 'master'}
                  className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-800"
                  />
                  <span className="text-zinc-400">Usuário Ativo</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};