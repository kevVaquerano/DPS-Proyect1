/**
 * Página principal de acceso al sistema.
 *
 * Funciones principales:
 * - Permite iniciar sesión.
 * - Permite registrar nuevos usuarios.
 * - Valida nombre, correo y contraseña.
 * - Cambia entre modo login y modo registro.
 * - Si el login es correcto, redirige al dashboard.
 */

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();

  /**
   * useAuth viene del contexto global de autenticación.
   * login: valida credenciales de acceso.
   * register: registra un nuevo usuario.
   */
  const { login, register } = useAuth();

  /**
   * isLogin:
   * true  = mostrar formulario de inicio de sesión
   * false = mostrar formulario de registro
   */
  const [isLogin, setIsLogin] = useState(true);

  /**
   * formData:
   * Guarda los valores que el usuario escribe en el formulario.
   */
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario",
  });

  /**
   * message:
   * Se usa para mostrar errores o mensajes de éxito al usuario.
   */
  const [message, setMessage] = useState("");

  // Actualiza dinámicamente el estado del formulario según el input modificado.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Valida formato básico del correo.
   *
   * Esta validación revisa:
   * - texto antes del @
   * - dominio después del @
   * - extensión final válida
   */
  const validateEmail = (email) => {
    return /^[A-Za-z0-9.]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  /**
   * Valida el nombre:
   * - solo letras
   * - espacios permitidos
   * - incluye tildes y ñ
   *
   * No permite números ni símbolos.
   */
  const validateName = (nombre) => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre);
  };

  /**
   * Obtiene los usuarios guardados en localStorage.
   *
   * Esto ayuda a verificar si ya existe un nombre o correo registrado.
   * Si no hay datos guardados, retorna un arreglo vacío.
   */
  const getUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  };

  /**
   * Maneja el envío del formulario.
   *
   * Según el modo actual:
   * - Si isLogin es true, intenta iniciar sesión.
   * - Si isLogin es false, intenta registrar un nuevo usuario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { nombre, email, password, rol } = formData;

    /**
     * BLOQUE DE LOGIN
     */
    if (isLogin) {
      // Validar que campos obligatorios no estén vacíos.
      if (!email.trim() || !password.trim()) {
        setMessage("Completa todos los campos obligatorios.");
        return;
      }

      // Validar formato del correo.
      if (!validateEmail(email.trim())) {
        setMessage("Ingresa un correo válido.");
        return;
      }

      // Intentar inicio de sesión usando la función del contexto.
      const result = await login(email.trim(), password);

      if (result.success) {
        setMessage("Inicio de sesión exitoso.");

        /**
         * Si el login es correcto, redirige al dashboard.
         * Aquí ya se asume que el usuario quedó autenticado.
         */
        router.push("/dashboard");
      } else {
        // Muestra el mensaje que retorna la lógica del contexto.
        setMessage(result.message);
      }

      return;
    }

    /**
     * BLOQUE DE REGISTRO
     */
    const users = getUsers();

    // Validar que el nombre no esté vacío.
    if (!nombre.trim()) {
      setMessage("El nombre no puede quedar vacío.");
      return;
    }

    // Validar que el nombre solo tenga letras.
    if (!validateName(nombre.trim())) {
      setMessage("El nombre no debe contener números ni símbolos.");
      return;
    }

    /**
     * Verifica si ya existe otro usuario con el mismo nombre.
     * Se compara en minúsculas y sin espacios innecesarios
     * para evitar duplicados "aparentes".
     */
    const nombreRepetido = users.some(
      (user) =>
        (user.nombre || "").toLowerCase().trim() === nombre.toLowerCase().trim()
    );

    if (nombreRepetido) {
      setMessage("Ese nombre ya está registrado.");
      return;
    }

    // Validar correo vacío.
    if (!email.trim()) {
      setMessage("El correo no puede quedar vacío.");
      return;
    }

    // Validar estructura del correo.
    if (!validateEmail(email.trim())) {
      setMessage(
        "El correo solo puede contener letras, números y puntos. No se permiten símbolos especiales."
      );
      return;
    }

    /**
     * Verifica si ya existe otro usuario con el mismo correo.
     * Esto es importante para no duplicar cuentas.
     */
    const emailRepetido = users.some(
      (user) =>
        (user.email || "").toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (emailRepetido) {
      setMessage("Ese correo ya está registrado.");
      return;
    }

    // Validar contraseña vacía.
    if (!password.trim()) {
      setMessage("La contraseña no puede quedar vacía.");
      return;
    }

    /**
     * Construcción del nuevo usuario.
     * - id: se genera con Date.now() para hacerlo único.
     * - email: se guarda en minúsculas para evitar duplicados inconsistentes.
     */
    const newUser = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol,
    };

    // Registrar usuario usando la función del contexto.
    const result = register(newUser);

    if (result.success) {
      setMessage("Usuario registrado correctamente. Ahora inicia sesión.");

      /**
       * Después de registrar:
       * - vuelve al modo login
       * - limpia el formulario
       */
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
          {/**
           * Estos campos solo se muestran en modo registro.
           * En login solo se piden correo y contraseña.
           */}
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

        {/**
         * message se muestra si existe un texto de error o éxito.
         */}
        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.switchText}>
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              /**
               * Cambia entre login y registro.
               * También limpia el mensaje anterior para que no se arrastre
               * al cambiar de formulario.
               */
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