/**
 * Página principal del sistema.
 *
 * Muestra el dashboard con gestión de proyectos y tareas,
 * incluyendo filtros, estadísticas, formularios y acciones CRUD.
 */

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectConfirmDialog from "../components/projects/ProjectConfirmDialog";
import ProjectForm from "../components/projects/ProjectForm";
import TaskCard from "../components/tasks/TaskCard";
import ConfirmDialog from "../components/tasks/TaskConfirmDialog";
import TaskForm from "../components/tasks/TaskForm";
import { useAuth } from "../context/AuthContext";
import {
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  getProjects,
  getTasks,
  getUsers,
  updateProject,
  updateTask,
} from "../services/api";

// Configuración visual y lógica de las columnas del tablero de proyectos.
const COLUMNAS_PROYECTOS = [
  {
    estado: "Pendiente",
    label: "Pendiente",
    bgCol: "bg-amber-50",
    bgHeader: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    Icon: Clock,
  },
  {
    estado: "En progreso",
    label: "En Progreso",
    bgCol: "bg-blue-50",
    bgHeader: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    Icon: Loader2,
  },
  {
    estado: "Completado",
    label: "Completado",
    bgCol: "bg-green-50",
    bgHeader: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    Icon: CheckCircle2,
  },
];

// Configuración visual y lógica de las columnas del tablero de tareas.
const COLUMNAS_TAREAS = [
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

// Avatar por defecto para usuarios sin imagen de perfil.
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=Usuario&background=6366f1&color=fff";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const proyectosRef = useRef(null);
  const tareasRef = useRef(null);

  const [proyectos, setProyectos] = useState([]);
  const [errorProyectos, setErrorProyectos] = useState(null);
  const [mostrarFormularioProyecto, setMostrarFormularioProyecto] =
    useState(false);
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [proyectoEliminando, setProyectoEliminando] = useState(null);

  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorTareas, setErrorTareas] = useState(null);
  const [montado, setMontado] = useState(false);

  const [busquedaProyecto, setBusquedaProyecto] = useState("");
  const [prioridadProyectoFiltro, setPrioridadProyectoFiltro] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [prioridadFiltro, setPrioridadFiltro] = useState("");
  const [proyectoFiltro, setProyectoFiltro] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [tareaEliminando, setTareaEliminando] = useState(null);

  const esGerente = user?.rol === "gerente";

  // Redirige al login si el usuario no ha iniciado sesión.
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Marca el componente como montado para evitar errores de renderizado.
  useEffect(() => {
    setMontado(true);
  }, []);

  // Carga la información principal del dashboard cuando el usuario está autenticado.
  useEffect(() => {
    if (isAuthenticated && user) {
      cargarDashboard();
    }
  }, [isAuthenticated, user]);

  // Carga proyectos, tareas y usuarios desde el servidor
  // para construir la vista principal del dashboard.
  const cargarDashboard = async () => {
    setCargando(true);
    setErrorTareas(null);
    setErrorProyectos(null);

    try {
      const [proyectosRes, tareasRes, usuariosRes] = await Promise.all([
        getProjects(),
        getTasks(),
        getUsers(),
      ]);

      const usuariosServidor = usuariosRes.data || [];

      const existeUsuarioActual = usuariosServidor.some(
        (usuario) => String(usuario.id) === String(user?.id)
      );

      const usuariosFinales =
        user && !existeUsuarioActual
          ? [...usuariosServidor, user]
          : usuariosServidor;

      setProyectos(proyectosRes.data || []);
      setTareas(tareasRes.data || []);
      setUsuarios(usuariosFinales);
    } catch {
      setErrorTareas(
        "No se pudo conectar con el servidor. Ejecuta: npm run server"
      );
      setErrorProyectos(
        "No se pudo conectar con el servidor. Ejecuta: npm run server"
      );
    } finally {
      setCargando(false);
    }
  };

  // Filtra las tareas por estado y por los filtros activos del tablero.
  const filtrarTareasPorColumna = (estado) =>
    tareas.filter((tarea) => {
      if (tarea.estado !== estado) return false;

      if (
        busqueda &&
        !tarea.titulo.toLowerCase().includes(busqueda.toLowerCase())
      ) {
        return false;
      }

      if (prioridadFiltro && tarea.prioridad !== prioridadFiltro) {
        return false;
      }

      if (proyectoFiltro && String(tarea.projectId) !== String(proyectoFiltro)) {
        return false;
      }

      return true;
    });

  // Filtra los proyectos por estado y por los filtros activos.
  const filtrarProyectosPorColumna = (estado) =>
    proyectos.filter((proyecto) => {
      if (proyecto.estado !== estado) return false;

      if (
        busquedaProyecto &&
        !proyecto.nombre.toLowerCase().includes(busquedaProyecto.toLowerCase())
      ) {
        return false;
      }

      if (
        prioridadProyectoFiltro &&
        proyecto.prioridad !== prioridadProyectoFiltro
      ) {
        return false;
      }

      return true;
    });

  const hayFiltrosTareas = busqueda || prioridadFiltro || proyectoFiltro;
  const hayFiltrosProyecto = busquedaProyecto || prioridadProyectoFiltro;

  const statsProyectos = {
    total: proyectos.length,
    pendiente: proyectos.filter((proyecto) => proyecto.estado === "Pendiente")
      .length,
    enProgreso: proyectos.filter(
      (proyecto) => proyecto.estado === "En progreso"
    ).length,
    completado: proyectos.filter(
      (proyecto) => proyecto.estado === "Completado"
    ).length,
  };

  const statsTareas = {
    total: tareas.length,
    pendiente: tareas.filter((tarea) => tarea.estado === "pendiente").length,
    enProgreso: tareas.filter((tarea) => tarea.estado === "en_progreso").length,
    completada: tareas.filter((tarea) => tarea.estado === "completada").length,
  };

  // Abre el formulario para crear un nuevo proyecto.
  const handleCrearProyecto = () => {
    setProyectoEditando(null);
    setMostrarFormularioProyecto(true);
  };

  // Abre el formulario con los datos del proyecto seleccionado.
  const handleEditarProyecto = (proyecto) => {
    setProyectoEditando(proyecto);
    setMostrarFormularioProyecto(true);
  };

  // Abre el diálogo de confirmación para eliminar un proyecto.
  const handleEliminarProyectoClick = (proyecto) => {
    setProyectoEliminando(proyecto);
  };

  // Elimina el proyecto seleccionado y actualiza la vista.
  const handleEliminarProyectoConfirmar = async () => {
    try {
      await deleteProject(proyectoEliminando.id);
      setProyectos((prev) =>
        prev.filter((proyecto) => proyecto.id !== proyectoEliminando.id)
      );
    } catch {
      setErrorProyectos("Error al eliminar el proyecto.");
    } finally {
      setProyectoEliminando(null);
    }
  };

  // Crea un proyecto nuevo o actualiza uno existente.
  const handleGuardarProyecto = async (datos) => {
    try {
      if (proyectoEditando) {
        const response = await updateProject(proyectoEditando.id, {
          ...proyectoEditando,
          ...datos,
          creadoPor: proyectoEditando.creadoPor,
          creadoPorNombre: proyectoEditando.creadoPorNombre,
          fechaInicio: proyectoEditando.fechaInicio || "",
        });

        setProyectos((prev) =>
          prev.map((proyecto) =>
            proyecto.id === proyectoEditando.id ? response.data : proyecto
          )
        );
      } else {
        const response = await createProject({
          ...datos,
          fechaCreacion: new Date().toISOString().split("T")[0],
          creadoPor: user?.id ?? null,
          creadoPorNombre: user?.nombre ?? "Sin usuario",
        });

        setProyectos((prev) => [...prev, response.data]);
      }

      setMostrarFormularioProyecto(false);
    } catch {
      setErrorProyectos("Error al guardar el proyecto.");
    }
  };

  // Actualiza el estado del proyecto y ajusta el progreso automáticamente.
  const handleCambiarEstadoProyecto = async (proyecto, nuevoEstado) => {
    try {
      let progresoNuevo = proyecto.progreso;
      let progresoAnteriorNuevo =
        proyecto.progresoAnterior ?? proyecto.progreso;

      if (nuevoEstado === "Completado") {
        if (proyecto.estado !== "Completado") {
          progresoAnteriorNuevo = proyecto.progreso;
        }
        progresoNuevo = 100;
      } else if (proyecto.estado === "Completado") {
        progresoNuevo = proyecto.progresoAnterior ?? 0;
      }

      const response = await updateProject(proyecto.id, {
        ...proyecto,
        estado: nuevoEstado,
        progreso: progresoNuevo,
        progresoAnterior: progresoAnteriorNuevo,
      });

      setProyectos((prev) =>
        prev.map((item) => (item.id === proyecto.id ? response.data : item))
      );
    } catch {
      setErrorProyectos("Error al actualizar el estado del proyecto.");
    }
  };

  // Abre el formulario para crear una nueva tarea.
  const handleCrearTarea = () => {
    setTareaEditando(null);
    setMostrarFormulario(true);
  };

  // Abre el formulario con los datos de la tarea seleccionada.
  const handleEditarTarea = (tarea) => {
    setTareaEditando(tarea);
    setMostrarFormulario(true);
  };

  // Abre el diálogo de confirmación para eliminar una tarea.
  const handleEliminarTareaClick = (tarea) => {
    setTareaEliminando(tarea);
  };

  // Elimina la tarea seleccionada y actualiza la vista.
  const handleEliminarTareaConfirmar = async () => {
    try {
      await deleteTask(tareaEliminando.id);
      setTareas((prev) =>
        prev.filter((tarea) => tarea.id !== tareaEliminando.id)
      );
    } catch {
      setErrorTareas("Error al eliminar la tarea.");
    } finally {
      setTareaEliminando(null);
    }
  };

  // Crea una tarea nueva o actualiza una existente.
  const handleGuardarTarea = async (datos) => {
    try {
      if (tareaEditando) {
        const response = await updateTask(tareaEditando.id, {
          ...tareaEditando,
          ...datos,
          creadoPor: tareaEditando.creadoPor,
          fechaInicio:
            tareaEditando.fechaInicio || tareaEditando.fechaCreacion || "",
        });

        setTareas((prev) =>
          prev.map((tarea) =>
            tarea.id === tareaEditando.id ? response.data : tarea
          )
        );
      } else {
        const response = await createTask({
          ...datos,
          progreso: Number(datos.progreso ?? 0),
          creadoPor: datos.creadoPor ?? user?.id ?? null,
          fechaCreacion: new Date().toISOString().split("T")[0],
        });

        setTareas((prev) => [...prev, response.data]);
      }

      setMostrarFormulario(false);
    } catch {
      setErrorTareas("Error al guardar la tarea.");
    }
  };

  // Actualiza el estado de la tarea y conserva/restaura el progreso anterior.
  const handleCambiarEstadoTarea = async (tarea, nuevoEstado) => {
    try {
      let progresoNuevo = tarea.progreso;
      let progresoAnteriorNuevo = tarea.progresoAnterior ?? tarea.progreso;

      if (nuevoEstado === "completada") {
        if (tarea.estado !== "completada") {
          progresoAnteriorNuevo = tarea.progreso;
        }
        progresoNuevo = 100;
      } else if (tarea.estado === "completada") {
        progresoNuevo = tarea.progresoAnterior ?? 0;
      }

      const response = await updateTask(tarea.id, {
        ...tarea,
        estado: nuevoEstado,
        progreso: progresoNuevo,
        progresoAnterior: progresoAnteriorNuevo,
      });

      setTareas((prev) =>
        prev.map((item) => (item.id === tarea.id ? response.data : item))
      );
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

      <Navbar proyectosRef={proyectosRef} tareasRef={tareasRef} />

      <div style={styles.page}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.mainTitle}>Dashboard</h1>
            <p style={styles.subtitle}>
              Bienvenid@, <strong>{user?.nombre}</strong> ({user?.rol})
            </p>
          </div>

          <div style={styles.userAvatarWrap}>
            <img
              src={user?.avatar || DEFAULT_AVATAR}
              alt={user?.nombre || "Usuario"}
              style={styles.userAvatar}
            />
          </div>
        </header>

        <section ref={proyectosRef} style={styles.section}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 m-0">
              <FolderKanban className="w-6 h-6 text-indigo-600" />
              Gestión de Proyectos
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={cargarDashboard}
                disabled={cargando}
                title="Actualizar"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${cargando ? "animate-spin" : ""}`} />
              </button>

              {esGerente && (
                <button
                  onClick={handleCrearProyecto}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Proyecto
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              {
                label: "Total",
                value: statsProyectos.total,
                bg: "bg-white",
                text: "text-gray-800",
                icon: "📁",
              },
              {
                label: "Pendientes",
                value: statsProyectos.pendiente,
                bg: "bg-amber-50",
                text: "text-amber-700",
                icon: "⏳",
              },
              {
                label: "En progreso",
                value: statsProyectos.enProgreso,
                bg: "bg-blue-50",
                text: "text-blue-700",
                icon: "🔄",
              },
              {
                label: "Completados",
                value: statsProyectos.completado,
                bg: "bg-green-50",
                text: "text-green-700",
                icon: "✅",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-xl p-4 border border-gray-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-0.5 ${stat.text}`}>
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={busquedaProyecto}
                onChange={(e) => setBusquedaProyecto(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <select
              value={prioridadProyectoFiltro}
              onChange={(e) => setPrioridadProyectoFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            {hayFiltrosProyecto && (
              <button
                onClick={() => {
                  setBusquedaProyecto("");
                  setPrioridadProyectoFiltro("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          {errorProyectos && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 flex-1">{errorProyectos}</p>
              <button
                onClick={() => setErrorProyectos(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Cargando proyectos...</p>
            </div>
          ) : proyectos.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-gray-400">No hay proyectos registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COLUMNAS_PROYECTOS.map(
                ({
                  estado,
                  label,
                  bgCol,
                  bgHeader,
                  textColor,
                  borderColor,
                  Icon,
                }) => {
                  const columna = filtrarProyectosPorColumna(estado);

                  return (
                    <div
                      key={estado}
                      className={`${bgCol} rounded-2xl border ${borderColor} overflow-hidden`}
                    >
                      <div
                        className={`${bgHeader} px-4 py-3 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${textColor}`} />
                          <span className={`font-semibold text-sm ${textColor}`}>
                            {label}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold ${textColor} bg-white/60 px-2 py-0.5 rounded-full`}
                        >
                          {columna.length}
                        </span>
                      </div>

                      <div className="p-3 space-y-3 min-h-[160px]">
                        {columna.length === 0 ? (
                          <div className="flex items-center justify-center py-10">
                            <p className="text-xs text-gray-400">Sin proyectos</p>
                          </div>
                        ) : (
                          columna.map((proyecto) => (
                            <ProjectCard
                              key={proyecto.id}
                              proyecto={proyecto}
                              usuarios={usuarios}
                              esGerente={esGerente}
                              onEditar={handleEditarProyecto}
                              onEliminar={handleEliminarProyectoClick}
                              onCambiarEstado={handleCambiarEstadoProyecto}
                            />
                          ))
                        )}
                      </div>

                      {esGerente && (
                        <div className="px-3 pb-3">
                          <button
                            onClick={handleCrearProyecto}
                            className={`w-full py-2 text-xs ${textColor} hover:bg-white/50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-dashed ${borderColor}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Añadir proyecto
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section ref={tareasRef} style={{ ...styles.section, marginTop: "20px" }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 m-0">
              <ListTodo className="w-6 h-6 text-indigo-600" />
              Gestión de Tareas
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={cargarDashboard}
                disabled={cargando}
                title="Actualizar"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${cargando ? "animate-spin" : ""}`} />
              </button>

              {esGerente && (
                <button
                  onClick={handleCrearTarea}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              {
                label: "Total",
                value: statsTareas.total,
                bg: "bg-white",
                text: "text-gray-800",
                icon: "📋",
              },
              {
                label: "Pendientes",
                value: statsTareas.pendiente,
                bg: "bg-amber-50",
                text: "text-amber-700",
                icon: "⏳",
              },
              {
                label: "En Progreso",
                value: statsTareas.enProgreso,
                bg: "bg-blue-50",
                text: "text-blue-700",
                icon: "🔄",
              },
              {
                label: "Completadas",
                value: statsTareas.completada,
                bg: "bg-green-50",
                text: "text-green-700",
                icon: "✅",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-xl p-4 border border-gray-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-0.5 ${stat.text}`}>
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

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
              value={prioridadFiltro}
              onChange={(e) => setPrioridadFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            <select
              value={proyectoFiltro}
              onChange={(e) => setProyectoFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>

            {hayFiltrosTareas && (
              <button
                onClick={() => {
                  setBusqueda("");
                  setPrioridadFiltro("");
                  setProyectoFiltro("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          {errorTareas && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 flex-1">{errorTareas}</p>
              <button
                onClick={() => setErrorTareas(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Cargando tareas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COLUMNAS_TAREAS.map(
                ({ estado, label, bgCol, bgHeader, textColor, borderColor, Icon }) => {
                  const columna = filtrarTareasPorColumna(estado);

                  return (
                    <div
                      key={estado}
                      className={`${bgCol} rounded-2xl border ${borderColor} overflow-hidden`}
                    >
                      <div
                        className={`${bgHeader} px-4 py-3 flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${textColor}`} />
                          <span className={`font-semibold text-sm ${textColor}`}>
                            {label}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold ${textColor} bg-white/60 px-2 py-0.5 rounded-full`}
                        >
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
                              proyectos={proyectos}
                              esGerente={esGerente}
                              onEditar={handleEditarTarea}
                              onEliminar={handleEliminarTareaClick}
                              onCambiarEstado={handleCambiarEstadoTarea}
                            />
                          ))
                        )}
                      </div>

                      {esGerente && (
                        <div className="px-3 pb-3">
                          <button
                            onClick={handleCrearTarea}
                            className={`w-full py-2 text-xs ${textColor} hover:bg-white/50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-dashed ${borderColor}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Añadir tarea
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      {mostrarFormulario && (
        <TaskForm
          tarea={tareaEditando}
          usuarios={usuarios}
          proyectos={proyectos}
          esGerente={esGerente}
          usuarioActual={user}
          onGuardar={handleGuardarTarea}
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}

      {tareaEliminando && (
        <ConfirmDialog
          titulo="Eliminar tarea"
          mensaje={`¿Estás seguro de que deseas eliminar "${tareaEliminando.titulo}"? Esta acción no se puede deshacer.`}
          tipo="peligro"
          onConfirmar={handleEliminarTareaConfirmar}
          onCancelar={() => setTareaEliminando(null)}
        />
      )}

      {mostrarFormularioProyecto && (
        <ProjectForm
          proyecto={proyectoEditando}
          usuarios={usuarios}
          usuarioActual={user}
          onGuardar={handleGuardarProyecto}
          onCerrar={() => setMostrarFormularioProyecto(false)}
        />
      )}

      {proyectoEliminando && (
        <ProjectConfirmDialog
          titulo="Eliminar proyecto"
          mensaje={`¿Estás seguro de que deseas eliminar "${proyectoEliminando.nombre}"? Esta acción no se puede deshacer.`}
          tipo="peligro"
          onConfirmar={handleEliminarProyectoConfirmar}
          onCancelar={() => setProyectoEliminando(null)}
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
  userAvatarWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
  section: {},
};