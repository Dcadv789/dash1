import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar, PencilIcon, Camera, Save, X } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  startDate: string;
  company: string;
  role: string;
  avatarUrl: string | null;
}

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '(11) 98765-4321',
    location: 'São Paulo, SP',
    department: 'Departamento Financeiro',
    startDate: 'Janeiro 2023',
    company: 'TechCorp Solutions',
    role: 'Administrador',
    avatarUrl: null
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as alterações
    setIsEditing(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-zinc-900 rounded-xl p-6">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                {profileData.avatarUrl ? (
                  <img 
                    src={profileData.avatarUrl} 
                    alt="Foto de perfil" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-zinc-400" />
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold text-zinc-100 bg-zinc-800 rounded px-2 py-1"
                />
              ) : (
                <h1 className="text-2xl font-bold text-zinc-100">{profileData.name}</h1>
              )}
              <p className="text-zinc-400">{profileData.role}</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <PencilIcon size={16} />
              Editar Perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                <Save size={16} />
                Salvar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Informações Pessoais</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-zinc-500" size={20} />
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="flex-1 bg-zinc-800 rounded px-3 py-2 text-zinc-300"
                    placeholder="Seu email"
                  />
                ) : (
                  <span className="text-zinc-300">{profileData.email}</span>
                )}
              </div>

              {isEditing && (
                <div className="space-y-3 pl-8">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-800 rounded px-3 py-2 text-zinc-300"
                    placeholder="Nova senha"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-800 rounded px-3 py-2 text-zinc-300"
                    placeholder="Confirmar nova senha"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Phone className="text-zinc-500" size={20} />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 bg-zinc-800 rounded px-3 py-2 text-zinc-300"
                    placeholder="Seu telefone"
                  />
                ) : (
                  <span className="text-zinc-300">{profileData.phone}</span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="text-zinc-500" size={20} />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="flex-1 bg-zinc-800 rounded px-3 py-2 text-zinc-300"
                    placeholder="Sua localização"
                  />
                ) : (
                  <span className="text-zinc-300">{profileData.location}</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Informações Profissionais</h2>
            
            <div className="flex items-center gap-3">
              <Building className="text-zinc-500" size={20} />
              <span className="text-zinc-300">{profileData.company}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="text-zinc-500" size={20} />
              <span className="text-zinc-300">Desde {profileData.startDate}</span>
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