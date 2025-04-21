import React, { useState } from 'react';
import { Plus, Search, SlidersHorizontal, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BulkUpload } from '../components/BulkUpload';

interface Company {
  id: string;
  trading_name: string;
}

interface RawData {
  id: string;
  empresa_id: string;
  ano: number;
  mes: string;
  categoria_id: string | null;
  indicador_id: string | null;
  valor: number;
  company?: Company;
  category?: {
    name: string;
    code: string;
  };
  indicator?: {
    name: string;
    code: string;
  };
}

export const RawData = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RawData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    fetchCompanies();
    fetchData();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, trading_name')
        .eq('is_active', true)
        .order('trading_name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setError('Erro ao carregar empresas');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('dados_brutos')
        .select(`
          *,
          company:companies(id, trading_name),
          category:categories(name, code),
          indicator:indicators(name, code)
        `)
        .order('created_at', { ascending: false });

      if (selectedCompany) {
        query = query.eq('empresa_id', selectedCompany);
      }

      const { data, error } = await query;

      if (error) throw error;
      setData(data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      item.category?.name.toLowerCase().includes(searchLower) ||
      item.indicator?.name.toLowerCase().includes(searchLower) ||
      item.company?.trading_name.toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-2xl font-bold text-zinc-100">Dados Brutos</h1>
          <p className="text-zinc-400 mt-1">Gerencie os dados financeiros</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
        >
          <Upload size={20} />
          Upload em Massa
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar dados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
            >
              <option value="">Todas as empresas</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.trading_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Upload em Massa</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                ×
              </button>
            </div>
            
            <BulkUpload />
          </div>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Empresa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Período</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Categoria/Indicador</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-400">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-6 py-4 text-zinc-300">
                    {item.company?.trading_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">{item.mes}</span>
                    <span className="text-zinc-500 mx-1">/</span>
                    <span className="text-zinc-300">{item.ano}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-mono text-sm">
                        {item.category?.code || item.indicator?.code}
                      </span>
                      <span className="text-zinc-300">
                        {item.category?.name || item.indicator?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-${item.valor < 0 ? 'red' : 'green'}-400`}>
                      {item.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
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