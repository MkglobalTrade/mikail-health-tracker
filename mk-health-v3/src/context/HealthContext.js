import { createContext, useContext, useState } from 'react';

const HealthContext = createContext(null);

export function HealthContextProvider({ children }) {
  const [state, setState] = useState(null);
  return <HealthContext.Provider value={ state, setState }>{children}</HealthContext.Provider>;
}

export function useHealthContext() {
  return useContext(HealthContext);
}
