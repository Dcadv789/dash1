import { useState, useEffect } from 'react';
import { DreAccount } from '../types/dre';

const loadFromStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const useDreAccounts = (selectedCompanyId: string) => {
  const [accounts, setAccounts] = useState<DreAccount[]>(() => 
    loadFromStorage('dre_accounts', [])
  );

  useEffect(() => {
    saveToStorage('dre_accounts', accounts);
  }, [accounts]);

  const getChildAccounts = (accountId: string): DreAccount[] => {
    return accounts.filter(acc => 
      acc.parentAccountId === accountId && 
      acc.companyId === selectedCompanyId
    );
  };

  const moveAccount = (accountId: string, direction: 'up' | 'down') => {
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    const account = accounts[accountIndex];
    
    if (!account) return;

    const siblingAccounts = accounts.filter(acc => 
      acc.parentAccountId === account.parentAccountId && 
      acc.companyId === selectedCompanyId
    ).sort((a, b) => a.displayOrder - b.displayOrder);

    const currentIndex = siblingAccounts.findIndex(acc => acc.id === accountId);
    
    if (direction === 'up' && currentIndex > 0) {
      const temp = siblingAccounts[currentIndex - 1].displayOrder;
      siblingAccounts[currentIndex - 1].displayOrder = account.displayOrder;
      siblingAccounts[currentIndex].displayOrder = temp;
    } else if (direction === 'down' && currentIndex < siblingAccounts.length - 1) {
      const temp = siblingAccounts[currentIndex + 1].displayOrder;
      siblingAccounts[currentIndex + 1].displayOrder = account.displayOrder;
      siblingAccounts[currentIndex].displayOrder = temp;
    }

    setAccounts([...accounts]);
  };

  const toggleAccountStatus = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, isActive: !acc.isActive } : acc
    ));
  };

  const toggleAccountExpansion = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, isExpanded: !acc.isExpanded } : acc
    ));
  };

  return {
    accounts,
    setAccounts,
    getChildAccounts,
    moveAccount,
    toggleAccountStatus,
    toggleAccountExpansion
  };
};