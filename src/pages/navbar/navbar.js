"use client"; 

import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>ProjectManager</h2>

      <ul style={styles.menu}>
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/projects">Proyectos</Link></li>
        <li><Link href="/tasks">Tareas</Link></li>
      </ul>

      <div style={styles.auth}>
        <Link href="/login">Login</Link>
        <Link href="/register">Registro</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#0f172a",
    color: "white"
  },
  logo: {
    fontWeight: "bold"
  },
  menu: {
    display: "flex",
    gap: "15px",
    listStyle: "none"
  },
  auth: {
    display: "flex",
    gap: "10px"
  }
};   