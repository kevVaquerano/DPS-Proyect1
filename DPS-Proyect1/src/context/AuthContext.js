/**
 * Contexto global de autenticación.
 *
 * Administra el usuario en sesión, el inicio y cierre de sesión,
 * y el registro de usuarios usando localStorage como persistencia local.
 */

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Al iniciar la app, recupera el usuario guardado en localStorage.
  // Si no hay usuarios locales, intenta cargarlos desde el servidor.
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const usersGuardados = JSON.parse(localStorage.getItem("users")) || [];

    if (usersGuardados.length === 0) {
      fetch("http://localhost:3001/users")
        .then((response) => response.json())
        .then((usersDelServer) => {
          localStorage.setItem("users", JSON.stringify(usersDelServer));
        })
        .catch(() => {
          // Si falla la carga inicial, la app seguirá usando localStorage.
        });
    }
  }, []);

  // Registra un nuevo usuario en almacenamiento local
  // si el correo todavía no existe.
  const register = (newUser) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(
      (usuario) => usuario.email.toLowerCase() === newUser.email.toLowerCase()
    );

    if (exists) {
      return { success: false, message: "El correo ya está registrado" };
    }

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return { success: true, message: "Usuario registrado correctamente" };
  };

  // Inicia sesión validando correo y contraseña.
  // Si no hay usuarios en localStorage, intenta obtenerlos del servidor.
  const login = async (email, password) => {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.length === 0) {
      try {
        const response = await fetch("http://localhost:3001/users");
        const usersDelServer = await response.json();

        localStorage.setItem("users", JSON.stringify(usersDelServer));
        users = usersDelServer;
      } catch {
        return {
          success: false,
          message: "No se pudo conectar con el servidor de usuarios",
        };
      }
    }

    const foundUser = users.find(
      (usuario) => usuario.email === email && usuario.password === password
    );

    if (!foundUser) {
      return { success: false, message: "Correo o contraseña incorrectos" };
    }

    setUser(foundUser);
    localStorage.setItem("user", JSON.stringify(foundUser));

    return { success: true, message: "Inicio de sesión exitoso" };
  };

  // Elimina la sesión actual del estado y del localStorage.
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