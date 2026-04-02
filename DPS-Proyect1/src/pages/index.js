/**
 * Página principal de acceso.
 *
 * Permite iniciar sesión o registrar un nuevo usuario
 * con validaciones básicas de nombre, correo y contraseña.
 */

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario",
  });
  const [message, setMessage] = useState("");

  // Actualiza el estado del formulario según el campo editado.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Valida el formato básico del correo electrónico.
  const validateEmail = (email) => {
    return /^[A-Za-z0-9.]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  // Permite únicamente letras y espacios en el nombre.
  const validateName = (nombre) => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre);
  };

  // Obtiene los usuarios guardados en localStorage.
  const getUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  };

  // Maneja el flujo de inicio de sesión o registro
  // según el modo actual del formulario.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { nombre, email, password, rol } = formData;

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setMessage("Completa todos los campos obligatorios.");
        return;
      }

      if (!validateEmail(email.trim())) {
        setMessage("Ingresa un correo válido.");
        return;
      }

      const result = await login(email.trim(), password);

      if (result.success) {
        setMessage("Inicio de sesión exitoso.");
        router.push("/dashboard");
      } else {
        setMessage(result.message);
      }

      return;
    }

    const users = getUsers();

    if (!nombre.trim()) {
      setMessage("El nombre no puede quedar vacío.");
      return;
    }

    if (!validateName(nombre.trim())) {
      setMessage("El nombre no debe contener números ni símbolos.");
      return;
    }

    const nombreRepetido = users.some(
      (user) =>
        (user.nombre || "").toLowerCase().trim() === nombre.toLowerCase().trim()
    );

    if (nombreRepetido) {
      setMessage("Ese nombre ya está registrado.");
      return;
    }

    if (!email.trim()) {
      setMessage("El correo no puede quedar vacío.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setMessage(
        "El correo solo puede contener letras, números y puntos. No se permiten símbolos especiales."
      );
      return;
    }

    const emailRepetido = users.some(
      (user) =>
        (user.email || "").toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (emailRepetido) {
      setMessage("Ese correo ya está registrado.");
      return;
    }

    if (!password.trim()) {
      setMessage("La contraseña no puede quedar vacía.");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol,
    };

    const result = register(newUser);

    if (result.success) {
      setMessage("Usuario registrado correctamente. Ahora inicia sesión.");
      setIsLogin(true);
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "usuario",
      });
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={styles.input}
              />

              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="usuario">Usuario</option>
                <option value="gerente">Gerente</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            {isLogin ? "Entrar" : "Registrar"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.switchText}>
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            style={styles.linkButton}
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0070f3",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
    color: "#333",
  },
  switchText: {
    marginTop: "15px",
    textAlign: "center",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#0070f3",
    cursor: "pointer",
    fontWeight: "bold",
  },
};