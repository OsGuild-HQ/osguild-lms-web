import React, { createContext, useContext, useState } from 'react';

type Role = 'DEVELOPER' | 'MAINTAINER';

interface RoleContextType {
  role: Role;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('DEVELOPER');

  const toggleRole = () => setRole(r => (r === 'DEVELOPER' ? 'MAINTAINER' : 'DEVELOPER'));

  return (
    <RoleContext.Provider value={{ role, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
};
