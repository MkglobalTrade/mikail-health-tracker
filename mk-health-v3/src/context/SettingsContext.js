import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);

export function SettingsContextProvider({ children }) {
  const [state, setState] = useState(null);
  return <SettingsContext.Provider value={ state, setState }>{children}</SettingsContext.Provider>;
}

export function useSettingsContext() {
  return useContext(SettingsContext);
}
