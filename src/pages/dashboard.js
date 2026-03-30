import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import { createProject, updateProject, deleteProject, getTasks, getUsers, createTask, updateTask, deleteTask } from "../services/api";
import {
  Plus, Search, Clock, CheckCircle2, Loader2,
  AlertCircle, ListTodo, RefreshCw, X,
} from "lucide-react";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import ConfirmDialog from "../components/tasks/ConfirmDialog";

// columnas del kanban
const COLUMNAS = [
  {
    estado: "pendiente",
    label: "Pendiente",
    bgCol: "bg-amber-50",
    bgHeader: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    Icon: Clock,
  },
  {
    estado: "en_progreso",
    label: "En Progreso",
    bgCol: "bg-blue-50",
    bgHeader: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    Icon: Loader2,
  },
  {
    estado: "completada",
    label: "Completada",
    bgCol: "bg-green-50",
    bgHeader: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    Icon: CheckCircle2,
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // --- estado de proyectos ---
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    estado: "Pendiente",
    progreso: 0,
  });
  const [editing, setEditing] = useState(false);
  // este flag evita que se borren los proyectos al montar el componente con projects=[]
  const [loaded, setLoaded] = useState(false);

  // --- estado de tareas (kanban) ---
  const [tareas, setTareas]       = useState([]);
  const [usuarios, setUsuarios]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [errorTareas, setErrorTareas] = useState(null);
  const [montado, setMontado]     = useState(false);

  // filtros del kanban
  const [busqueda, setBusqueda]               = useState("");
  const [proyectoFiltro, setProyectoFiltro]   = useState("");
  const [prioridadFiltro, setPrioridadFiltro] = useState("");

  // modales
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tareaEditando, setTareaEditando]         = useState(null);
  const [tareaEliminando, setTareaEliminando]     = useState(null);

  const esGerente = user?.rol === "gerente";

  // carga inicial de proyectos desde localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    setProjects(savedProjects);
    setLoaded(true);
  }, [isAuthenticated, router]);

  // guarda proyectos en localStorage cada vez que cambian
  useEffect(() => {
    // sin el loaded, esto se ejecuta con [] antes de cargar y borra todo
    if (!loaded) return;
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects, loaded]);

  // carga tareas, usuarios y proyectos del servidor
  useEffect(() => {
    setMontado(true);
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    setCargando(true);
    setErrorTareas(null);
    try {
      const [tRes, uRes] = await Promise.all([getTasks(), getUsers()]);
      setTareas(tRes.data);
      setUsuarios(uRes.data);
    } catch {
      setErrorTareas("No se pudo conectar con el servidor. Ejecuta: npm run server");
    } finally {
      setCargando(false);
    }
  };

  // stats del dashboard (usa proyectos de localStorage y tareas del servidor)
  const resumen = useMemo(() => {
    return {
      totalProjects: projects.length,
      activos:       projects.filter((p) => p.estado === "En progreso").length,
      completados:   projects.filter((p) => p.estado === "Completado").length,
      pendientes:    tareas.filter((t) => t.estado === "pendiente").length,
    };
  }, [projects, tareas]);

  // --- handlers de proyectos ---
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({
      ...prev,
      [name]: name === "progreso" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setProjectForm({ id: null, nombre: "", descripcion: "", estado: "Pendiente", progreso: 0 });
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
      const updatedProjects = projects.map((p) =>
        p.id === projectForm.id ? projectForm : p
      );
      setProjects(updatedProjects);
      // sincronizamos con el servidor para que tareas lo vea también
      updateProject(projectForm.id, projectForm).catch(() => {});
      resetForm();
      return;
    }

    const newProject = { ...projectForm, id: Date.now() };
    setProjects([...projects, newProject]);
    // mandamos el proyecto nuevo al servidor para que aparezca en el kanban
    createProject(newProject).catch(() => {});
    resetForm();
  };

  const handleEditProject = (project) => {
    setProjectForm(project);
    setEditing(true);
  };

  const handleDeleteProject = (id) => {
    const confirmDelete = window.confirm("¿Seguro que deseas eliminar este proyecto?");
    if (!confirmDelete) return;

    setProjects(projects.filter((p) => p.id !== id));
    // borramos del servidor también
    deleteProject(id).catch(() => {});
  };

  // --- handlers del kanban ---
  const filtrarPorColumna = (estado) =>
    tareas.filter((t) => {
      if (t.estado !== estado) return false;
      if (busqueda && !t.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (proyectoFiltro && t.projectId !== parseInt(proyectoFiltro)) return false;
      if (prioridadFiltro && t.prioridad !== prioridadFiltro) return false;
      if (!esGerente && t.assignedTo !== user?.id) return false;
      return true;
    });

  const hayFiltros = busqueda || proyectoFiltro || prioridadFiltro;

  const stats = {
    total:       tareas.length,
    pendiente:   tareas.filter((t) => t.estado === "pendiente").length,
    en_progreso: tareas.filter((t) => t.estado === "en_progreso").length,
    completada:  tareas.filter((t) => t.estado === "completada").length,
  };

  const handleCrear = () => {
    setTareaEditando(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (tarea) => {
    setTareaEditando(tarea);
    setMostrarFormulario(true);
  };

  const handleEliminarClick = (tarea) => setTareaEliminando(tarea);

  const handleEliminarConfirmar = async () => {
    try {
      await deleteTask(tareaEliminando.id);
      setTareas((prev) => prev.filter((t) => t.id !== tareaEliminando.id));
    } catch {
      setErrorTareas("Error al eliminar la tarea.");
    } finally {
      setTareaEliminando(null);
    }
  };

  const handleGuardar = async (datos) => {
    try {
      if (tareaEditando) {
        const res = await updateTask(tareaEditando.id, { ...tareaEditando, ...datos });
        setTareas((prev) => prev.map((t) => (t.id === tareaEditando.id ? res.data : t)));
      } else {
        const res = await createTask({
          ...datos,
          fechaCreacion: new Date().toISOString().split("T")[0],
        });
        setTareas((prev) => [...prev, res.data]);
      }
      setMostrarFormulario(false);
    } catch {
      setErrorTareas("Error al guardar la tarea.");
    }
  };

  const handleCambiarEstado = async (tarea, nuevoEstado) => {
    try {
      const res = await updateTask(tarea.id, { ...tarea, estado: nuevoEstado });
      setTareas((prev) => prev.map((t) => (t.id === tarea.id ? res.data : t)));
    } catch {
      setErrorTareas("Error al actualizar el estado.");
    }
  };

  if (!isAuthenticated) {
    return <p style={{ padding: "20px" }}>Cargando...</p>;
  }

  if (!montado) return null;

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>

      <div style={styles.page}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.mainTitle}>Dashboard</h1>
            <p style={styles.subtitle}>
              Bienvenido, <strong>{user?.name}</strong> ({user?.role})
            </p>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            style={styles.logoutButton}
          >
            Cerrar sesión
          </button>
        </header>

        {/* Tarjetas de resumen */}
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

        {/* Formulario de proyectos (solo gerente) */}
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
                  <button type="button" onClick={resetForm} style={styles.secondaryButton}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {/* Lista de proyectos */}
        <section style={styles.section}>
          <h2>Lista de proyectos</h2>
          {projects.length === 0 ? (
            <p>No hay proyectos registrados todavía.</p>
          ) : (
            <div style={styles.projectList}>
              {projects.map((project) => (
                <div key={project.id} style={styles.projectCard}>
                  <h3>{project.nombre}</h3>
                  <p><strong>Descripción:</strong> {project.descripcion}</p>
                  <p><strong>Estado:</strong> {project.estado}</p>
                  <p><strong>Progreso:</strong> {project.progreso}%</p>
                  <div style={styles.progressBarBackground}>
                    <div style={{ ...styles.progressBarFill, width: `${project.progreso}%` }} />
                  </div>
                  {user?.role === "gerente" && (
                    <div style={styles.projectActions}>
                      <button onClick={() => handleEditProject(project)} style={styles.editButton}>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} style={styles.deleteButton}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---- Módulo de Tareas (Kanban) ---- */}
        <section style={styles.section}>
          {/* encabezado del kanban */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 m-0">
              <ListTodo className="w-6 h-6 text-indigo-600" />
              Gestión de Tareas
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={cargarTareas}
                disabled={cargando}
                title="Actualizar"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${cargando ? "animate-spin" : ""}`} />
              </button>
              {esGerente && (
                <button
                  onClick={handleCrear}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </button>
              )}
            </div>
          </div>

          {/* estadísticas del kanban */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Total",       value: stats.total,       bg: "bg-white",    text: "text-gray-800",  icon: "📋" },
              { label: "Pendientes",  value: stats.pendiente,   bg: "bg-amber-50", text: "text-amber-700", icon: "⏳" },
              { label: "En Progreso", value: stats.en_progreso, bg: "bg-blue-50",  text: "text-blue-700",  icon: "🔄" },
              { label: "Completadas", value: stats.completada,  bg: "bg-green-50", text: "text-green-700", icon: "✅" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${stat.text}`}>{stat.value}</p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* barra de filtros */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <select
              value={proyectoFiltro}
              onChange={(e) => setProyectoFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Todos los proyectos</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <select
              value={prioridadFiltro}
              onChange={(e) => setPrioridadFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            {hayFiltros && (
              <button
                onClick={() => { setBusqueda(""); setProyectoFiltro(""); setPrioridadFiltro(""); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* error del servidor */}
          {errorTareas && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 flex-1">{errorTareas}</p>
              <button onClick={() => setErrorTareas(null)} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* tablero kanban */}
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Cargando tareas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COLUMNAS.map(({ estado, label, bgCol, bgHeader, textColor, borderColor, Icon }) => {
                const columna = filtrarPorColumna(estado);
                return (
                  <div key={estado} className={`${bgCol} rounded-2xl border ${borderColor} overflow-hidden`}>
                    <div className={`${bgHeader} px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${textColor}`} />
                        <span className={`font-semibold text-sm ${textColor}`}>{label}</span>
                      </div>
                      <span className={`text-xs font-bold ${textColor} bg-white/60 px-2 py-0.5 rounded-full`}>
                        {columna.length}
                      </span>
                    </div>
                    <div className="p-3 space-y-3 min-h-[160px]">
                      {columna.length === 0 ? (
                        <div className="flex items-center justify-center py-10">
                          <p className="text-xs text-gray-400">Sin tareas</p>
                        </div>
                      ) : (
                        columna.map((tarea) => (
                          <TaskCard
                            key={tarea.id}
                            tarea={tarea}
                            usuarios={usuarios}
                            proyectos={projects}
                            esGerente={esGerente}
                            onEditar={handleEditar}
                            onEliminar={handleEliminarClick}
                            onCambiarEstado={handleCambiarEstado}
                          />
                        ))
                      )}
                    </div>
                    {esGerente && (
                      <div className="px-3 pb-3">
                        <button
                          onClick={handleCrear}
                          className={`w-full py-2 text-xs ${textColor} hover:bg-white/50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-dashed ${borderColor}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Añadir tarea
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* modal crear/editar tarea */}
      {mostrarFormulario && (
        <TaskForm
          tarea={tareaEditando}
          usuarios={usuarios}
          proyectos={projects}
          esGerente={esGerente}
          onGuardar={handleGuardar}
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}

      {/* modal confirmar eliminación */}
      {tareaEliminando && (
        <ConfirmDialog
          titulo="Eliminar tarea"
          mensaje={`¿Estás seguro de que deseas eliminar "${tareaEliminando.titulo}"? Esta acción no se puede deshacer.`}
          tipo="peligro"
          onConfirmar={handleEliminarConfirmar}
          onCancelar={() => setTareaEliminando(null)}
        />
      )}
    </>
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
  projectActions: {
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
