/**
 * Contexto global de autenticación.
 *
 * ¿Para qué sirve?
 * - Mantener el usuario logueado en toda la app
 * - Evitar pasar props manualmente (prop drilling)
 * - Centralizar login, logout y registro
 *
 * Usa:
 * - React Context API
 * - localStorage para persistencia
 */

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Se crea el contexto.
 */
const AuthContext = createContext();

/**
 * Provider principal que envuelve la aplicación.
 *
 * Todo lo que esté dentro de este provider
 * puede acceder a user, login, logout, etc.
 */
export function AuthProvider({ children }) {
  /**
   * user:
   * guarda el usuario actual en sesión.
   */
  const [user, setUser] = useState(null);

  /**
   * useEffect inicial:
   * - carga usuario desde localStorage
   * - carga usuarios desde backend si no existen localmente
   */
  useEffect(() => {
    /**
     * Recupera sesión guardada.
     */
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    /**
     * Recupera lista de usuarios.
     */
    const usersGuardados = JSON.parse(localStorage.getItem("users")) || [];

    /**
     * Si no hay usuarios en localStorage,
     * intenta cargarlos desde el servidor (json-server).
     */
    if (usersGuardados.length === 0) {
      fetch("http://localhost:3001/users")
        .then((response) => response.json())
        .then((usersDelServer) => {
          localStorage.setItem("users", JSON.stringify(usersDelServer));
        })
        .catch(() => {
          /**
           * Si falla, simplemente no rompe la app.
           * Se sigue trabajando con localStorage.
           */
        });
    }
  }, []);

  /**
   * Registro de usuario.
   *
   * Validaciones:
   * - No permite correos duplicados
   */
  const register = (newUser) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(
      (usuario) => usuario.email.toLowerCase() === newUser.email.toLowerCase()
    );

    if (exists) {
      return { success: false, message: "El correo ya está registrado" };
    }

    /**
     * Guarda el usuario nuevo.
     */
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    return { success: true, message: "Usuario registrado correctamente" };
  };

  /**
   * Inicio de sesión.
   *
   * - Valida email y contraseña
   * - Si no hay usuarios, intenta traerlos del servidor
   */
  const login = async (email, password) => {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    /**
     * Si no hay usuarios, los carga del backend.
     */
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

    /**
     * Busca usuario que coincida con email y password.
     */
    const foundUser = users.find(
      (usuario) => usuario.email === email && usuario.password === password
    );

    if (!foundUser) {
      return { success: false, message: "Correo o contraseña incorrectos" };
    }

    /**
     * Guarda sesión.
     */
    setUser(foundUser);
    localStorage.setItem("user", JSON.stringify(foundUser));

    return { success: true, message: "Inicio de sesión exitoso" };
  };

  /**
   * Cierra sesión:
   * - limpia estado
   * - elimina usuario del localStorage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  /**
   * Variable booleana útil para proteger rutas.
   */
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para usar el contexto.
 *
 * Ejemplo:
 * const { user, login } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}