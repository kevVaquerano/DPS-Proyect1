import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const register = (newUser) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find((u) => u.email === newUser.email);

    if (exists) {
      return { success: false, message: "El correo ya está registrado" };
    }

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return { success: true, message: "Usuario registrado correctamente" };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      return { success: false, message: "Correo o contraseña incorrectos" };
    }

    setUser(foundUser);
    localStorage.setItem("user", JSON.stringify(foundUser));

    return { success: true, message: "Inicio de sesión exitoso" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}