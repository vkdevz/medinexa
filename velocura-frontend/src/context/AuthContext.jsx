import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read session elements from local storage on boot
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');

    if (token && role && email) {
      setUser({ token, role, email, firstName, lastName });
    }
    setLoading(false);
  }, []);

  const login = (token, email, role, firstName, lastName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('email', email);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);

    setUser({ token, role, email, firstName, lastName });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
