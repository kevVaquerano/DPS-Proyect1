import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // si no hay usuarios en localStorage, traemos los del servidor (los demo de db.json)
    const usersGuardados = JSON.parse(localStorage.getItem("users")) || [];
    if (usersGuardados.length === 0) {
      fetch("http://localhost:3001/users")
        .then((r) => r.json())
        .then((usersDelServer) => {
          // normalizamos para que tengan name/role Y nombre/rol, así todo el código los entiende
          const normalizados = usersDelServer.map((u) => ({
            ...u,
            name: u.nombre,
            role: u.rol,
          }));
          localStorage.setItem("users", JSON.stringify(normalizados));
        })
        .catch(() => {
          // si el servidor no está corriendo, igual funciona con usuarios registrados
        });
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

    // guardamos con los dos formatos de campos para que dashboard (name/role) y tareas (nombre/rol) funcionen
    const userNormalizado = {
      ...foundUser,
      name: foundUser.nombre || foundUser.name,
      nombre: foundUser.nombre || foundUser.name,
      role: foundUser.rol || foundUser.role,
      rol: foundUser.rol || foundUser.role,
    };

    setUser(userNormalizado);
    localStorage.setItem("user", JSON.stringify(userNormalizado));

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