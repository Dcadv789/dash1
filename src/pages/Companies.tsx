import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];

export const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    trading_name: '',
    cnpj: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    try {
      const { error } = await supabase
        .from('companies')
        .insert([{
          name: newCompany.name,
          trading_name: newCompany.trading_name,
          cnpj: newCompany.cnpj,
          is_active: true
        }]);

      if (error) {
        throw error;
      }

      setShowModal(false);
      setNewCompany({ name: '', trading_name: '', cnpj: '' });
      fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa');
    }
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

  return (
    <div className="max-w-6xl mx-auto py-8">
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
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Nome Fantasia</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">CNPJ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-6 py-4 text-zinc-300">{company.name}</td>
                    <td className="px-6 py-4 text-zinc-300">{company.trading_name}</td>
                    <td className="px-6 py-4 text-zinc-400">{company.cnpj}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        company.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {company.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  Nome da Empresa
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
    </div>
  );
};