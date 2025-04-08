import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Users, Building } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { useNavigate } from 'react-router-dom';

export const Topbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-zinc-900 m-2 rounded-xl p-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <Bell size={20} className="text-zinc-400" />
        </button>
        <div className="relative" ref={settingsRef}>
          <button 
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <Settings size={20} className="text-zinc-400" />
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  navigate('/users');
                  setIsSettingsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
              >
                <Users size={16} />
                Usuários
              </button>
              <button
                onClick={() => {
                  navigate('/companies');
                  setIsSettingsOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
              >
                <Building size={16} />
                Empresas
              </button>
            </div>
          )}
        </div>
        <UserDropdown />
      </div>
    </header>
  );
};