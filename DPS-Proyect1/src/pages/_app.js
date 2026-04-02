/**
 * Punto de entrada global de Next.js.
 *
 * Carga estilos globales y envuelve toda la aplicación
 * con el proveedor de autenticación.
 */

import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
