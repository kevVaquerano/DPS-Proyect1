/**
 * Archivo global de Next.js.
 *
 * ¿Qué hace este archivo?
 * - Es el punto de entrada principal de todas las páginas.
 * - Se ejecuta cada vez que se renderiza una ruta del proyecto.
 * - Aquí se cargan configuraciones globales que deben estar disponibles
 *   para toda la aplicación.
 *
 * En este caso:
 * 1. Importa los estilos globales.
 * 2. Envuelve toda la app dentro de AuthProvider para que cualquier página
 *    o componente pueda acceder al contexto de autenticación.
 */

import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

export default function App({ Component, pageProps }) {
  return (
    /**
     * AuthProvider:
     * Proveedor global del contexto de autenticación.
     *
     * Gracias a este provider, componentes como:
     * - Navbar
     * - Dashboard
     * - Login
     * pueden usar datos del usuario actual, saber si hay sesión activa
     * y ejecutar funciones como login, logout o register.
     */
    <AuthProvider>
      {/**
       * Component representa la página actual que Next.js va a mostrar.
       * pageProps contiene las props que esa página pueda necesitar.
       */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}