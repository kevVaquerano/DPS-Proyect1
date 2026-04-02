/**
 * Navbar principal del dashboard.
 *
 * Se muestra únicamente cuando el usuario ha iniciado sesión.
 * Permite desplazarse a las secciones de proyectos y tareas
 * y cerrar sesión.
 */

"use client";

import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ proyectosRef, tareasRef }) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  // Hace scroll suave hacia la sección indicada usando su ref.
  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (!isAuthenticated) return null;

  // Cierra la sesión actual y redirige al login.
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <h2 style={styles.logo}>ProjectManager</h2>
      </div>

      <ul style={styles.centerMenu}>
        <li>
          <button
            type="button"
            onClick={() => scrollToSection(proyectosRef)}
            style={styles.navButton}
          >
            Gestión de Proyectos
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => scrollToSection(tareasRef)}
            style={styles.navButton}
          >
            Gestión de Tareas
          </button>
        </li>
      </ul>

      <div style={styles.right}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#0f172a",
    color: "white",
  },
  left: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 180px",
    minWidth: "140px",
  },
  logo: {
    margin: 0,
    fontSize: "clamp(18px, 2.5vw, 22px)",
    fontWeight: "bold",
    lineHeight: 1.2,
  },
  centerMenu: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px 16px",
    listStyle: "none",
    margin: 0,
    padding: 0,
    flex: "1 1 260px",
  },
  right: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: "1 1 140px",
    minWidth: "120px",
  },
  navButton: {
    background: "none",
    border: "none",
    color: "white",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "clamp(13px, 2vw, 15px)",
    padding: "6px 8px",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "clamp(13px, 2vw, 15px)",
    whiteSpace: "nowrap",
  },
};