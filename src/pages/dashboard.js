import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [projectForm, setProjectForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    estado: "Pendiente",
    progreso: 0,
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [
      {
        id: 1,
        titulo: "Diseñar pantalla de login",
        estado: "Pendiente",
        proyecto: "Sistema de Gestión",
        asignadoA: user?.email || "usuario@correo.com",
      },
      {
        id: 2,
        titulo: "Actualizar dashboard",
        estado: "En progreso",
        proyecto: "Sistema de Inventario",
        asignadoA: user?.email || "usuario@correo.com",
      },
    ];

    setProjects(savedProjects);
    setTasks(savedTasks);
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const resumen = useMemo(() => {
    const totalProjects = projects.length;
    const activos = projects.filter((p) => p.estado === "En progreso").length;
    const completados = projects.filter((p) => p.estado === "Completado").length;
    const pendientes = tasks.filter((t) => t.estado === "Pendiente").length;

    return {
      totalProjects,
      activos,
      completados,
      pendientes,
    };
  }, [projects, tasks]);

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({
      ...prev,
      [name]: name === "progreso" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setProjectForm({
      id: null,
      nombre: "",
      descripcion: "",
      estado: "Pendiente",
      progreso: 0,
    });
    setEditing(false);
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();

    if (!projectForm.nombre.trim() || !projectForm.descripcion.trim()) {
      alert("Completa el nombre y la descripción del proyecto.");
      return;
    }

    if (projectForm.progreso < 0 || projectForm.progreso > 100) {
      alert("El progreso debe estar entre 0 y 100.");
      return;
    }

    if (editing) {
      const updatedProjects = projects.map((project) =>
        project.id === projectForm.id ? projectForm : project
      );
      setProjects(updatedProjects);
      resetForm();
      return;
    }

    const newProject = {
      ...projectForm,
      id: Date.now(),
    };

    setProjects([...projects, newProject]);
    resetForm();
  };

  const handleEditProject = (project) => {
    setProjectForm(project);
    setEditing(true);
  };

  const handleDeleteProject = (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este proyecto?"
    );

    if (!confirmDelete) return;

    const filteredProjects = projects.filter((project) => project.id !== id);
    setProjects(filteredProjects);
  };

  if (!isAuthenticated) {
    return <p style={{ padding: "20px" }}>Cargando...</p>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.mainTitle}>Dashboard</h1>
          <p style={styles.subtitle}>
            Bienvenido, <strong>{user?.name}</strong> ({user?.role})
          </p>
        </div>

        <div style={styles.actions}>
          {/* botón para ir al kanban de tareas */}
          <Link href="/tareas" style={styles.tareasButton}>
            Ver Tareas
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            style={styles.logoutButton}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section style={styles.cardsContainer}>
        <div style={styles.card}>
          <h3>Total de proyectos</h3>
          <p style={styles.cardNumber}>{resumen.totalProjects}</p>
        </div>

        <div style={styles.card}>
          <h3>Proyectos en progreso</h3>
          <p style={styles.cardNumber}>{resumen.activos}</p>
        </div>

        <div style={styles.card}>
          <h3>Proyectos completados</h3>
          <p style={styles.cardNumber}>{resumen.completados}</p>
        </div>

        <div style={styles.card}>
          <h3>Tareas pendientes</h3>
          <p style={styles.cardNumber}>{resumen.pendientes}</p>
        </div>
      </section>

      {user?.role === "gerente" && (
        <section style={styles.section}>
          <h2>{editing ? "Editar proyecto" : "Crear proyecto"}</h2>

          <form onSubmit={handleProjectSubmit} style={styles.form}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del proyecto"
              value={projectForm.nombre}
              onChange={handleProjectChange}
              style={styles.input}
            />

            <textarea
              name="descripcion"
              placeholder="Descripción del proyecto"
              value={projectForm.descripcion}
              onChange={handleProjectChange}
              style={styles.textarea}
            />

            <select
              name="estado"
              value={projectForm.estado}
              onChange={handleProjectChange}
              style={styles.input}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
            </select>

            <input
              type="number"
              name="progreso"
              placeholder="Progreso"
              min="0"
              max="100"
              value={projectForm.progreso}
              onChange={handleProjectChange}
              style={styles.input}
            />

            <div style={styles.formButtons}>
              <button type="submit" style={styles.primaryButton}>
                {editing ? "Guardar cambios" : "Agregar proyecto"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.secondaryButton}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section style={styles.section}>
        <h2>Lista de proyectos</h2>

        {projects.length === 0 ? (
          <p>No hay proyectos registrados todavía.</p>
        ) : (
          <div style={styles.projectList}>
            {projects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <h3>{project.nombre}</h3>
                <p>
                  <strong>Descripción:</strong> {project.descripcion}
                </p>
                <p>
                  <strong>Estado:</strong> {project.estado}
                </p>
                <p>
                  <strong>Progreso:</strong> {project.progreso}%
                </p>

                <div style={styles.progressBarBackground}>
                  <div
                    style={{
                      ...styles.progressBarFill,
                      width: `${project.progreso}%`,
                    }}
                  />
                </div>

                {user?.role === "gerente" && (
                  <div style={styles.actions}>
                    <button
                      onClick={() => handleEditProject(project)}
                      style={styles.editButton}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      style={styles.deleteButton}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "15px",
    flexWrap: "wrap",
  },
  mainTitle: {
    margin: 0,
    fontSize: "32px",
  },
  subtitle: {
    marginTop: "8px",
    color: "#444",
  },
  actions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  tareasButton: {
    backgroundColor: "#6366f1",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "14px",
  },
  logoutButton: {
    backgroundColor: "#d62828",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  cardNumber: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "10px",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: "25px",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    minHeight: "90px",
    resize: "vertical",
  },
  formButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  projectList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginTop: "15px",
  },
  projectCard: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "16px",
    backgroundColor: "#fafafa",
  },
  progressBarBackground: {
    width: "100%",
    height: "10px",
    backgroundColor: "#ddd",
    borderRadius: "20px",
    marginTop: "10px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0070f3",
    borderRadius: "20px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },
  editButton: {
    backgroundColor: "#f4a261",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#e63946",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};