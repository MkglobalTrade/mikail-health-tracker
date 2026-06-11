import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthContextProvider({ children }) {
  const [state, setState] = useState(null);
  return <AuthContext.Provider value={ state, setState }>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
