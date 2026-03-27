import { createContext, useMemo, useState } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [tenant, setTenant] = useState('default');

  const value = useMemo(() => ({ tenant, setTenant }), [tenant]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
