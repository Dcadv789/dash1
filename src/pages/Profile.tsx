import React from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar } from 'lucide-react';

export const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-zinc-900 rounded-xl p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center">
            <User size={40} className="text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">João Silva</h1>
            <p className="text-zinc-400">Administrador</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Informações Pessoais</h2>
            
            <div className="flex items-center gap-3 text-zinc-300">
              <Mail className="text-zinc-500" size={20} />
              <span>joao.silva@empresa.com</span>
            </div>
            
            <div className="flex items-center gap-3 text-zinc-300">
              <Phone className="text-zinc-500" size={20} />
              <span>(11) 98765-4321</span>
            </div>
            
            <div className="flex items-center gap-3 text-zinc-300">
              <MapPin className="text-zinc-500" size={20} />
              <span>São Paulo, SP</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Informações Profissionais</h2>
            
            <div className="flex items-center gap-3 text-zinc-300">
              <Building className="text-zinc-500" size={20} />
              <span>Departamento Financeiro</span>
            </div>
            
            <div className="flex items-center gap-3 text-zinc-300">
              <Calendar className="text-zinc-500" size={20} />
              <span>Desde Janeiro 2023</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-zinc-300">Relatório mensal gerado</p>
                <p className="text-sm text-zinc-500">Há {index + 1} dias</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};