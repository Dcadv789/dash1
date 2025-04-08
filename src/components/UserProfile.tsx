import React from 'react';
import { User } from 'lucide-react';

export const UserProfile = () => {
  return (
    <div className="p-4 border-t border-zinc-800 m-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
          <User size={20} className="text-zinc-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">João Silva</p>
          <p className="text-xs text-zinc-500">Administrador</p>
        </div>
      </div>
    </div>
  );
};