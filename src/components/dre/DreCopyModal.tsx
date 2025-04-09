import React from 'react';
import { Company } from '../../types/company';

interface DreCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  copyFromCompanyId: string;
  copyToCompanyId: string;
  onCopyFromChange: (id: string) => void;
  onCopyToChange: (id: string) => void;
  onCopy: () => void;
}

export const DreCopyModal = ({
  isOpen,
  onClose,
  companies,
  copyFromCompanyId,
  copyToCompanyId,
  onCopyFromChange,
  onCopyToChange,
  onCopy
}: DreCopyModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          Copiar DreConfig
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Copiar de:
            </label>
            <select
              value={copyFromCompanyId}
              onChange={(e) => onCopyFromChange(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
            >
              <option value="">Selecione uma empresa</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.tradingName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Copiar para:
            </label>
            <select
              value={copyToCompanyId}
              onChange={(e) => onCopyToChange(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg text-zinc-100"
            >
              <option value="">Selecione uma empresa</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.tradingName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
          >
            Cancelar
          </button>
          <button
            onClick={onCopy}
            disabled={!copyFromCompanyId || !copyToCompanyId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  );
};