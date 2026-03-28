import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Plus, Search, Clock, CheckCircle2, Loader2,
  AlertCircle, ListTodo, RefreshCw, X,
} from 'lucide-react'
import { getTasks, getUsers, getProjects, createTask, updateTask, deleteTask } from '../../services/api'
import TaskCard from '../../components/tasks/TaskCard'
import TaskForm from '../../components/tasks/TaskForm'
import ConfirmDialog from '../../components/tasks/ConfirmDialog'

// Columnas del tablero Kanban
const COLUMNAS = [
  {
    estado: 'pendiente',
    label: 'Pendiente',
    bgCol: 'bg-amber-50',
    bgHeader: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    Icon: Clock,
  },
  {
    estado: 'en_progreso',
    label: 'En Progreso',
    bgCol: 'bg-blue-50',
    bgHeader: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    Icon: Loader2,
  },
  {
    estado: 'completada',
    label: 'Completada',
    bgCol: 'bg-green-50',
    bgHeader: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    Icon: CheckCircle2,
  },
]

export default function TareasPage() {
  const [tareas, setTareas]       = useState([])
  const [usuarios, setUsuarios]   = useState([])
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)
  const [montado, setMontado]     = useState(false)

  // Filtros
  const [busqueda, setBusqueda]               = useState('')
  const [proyectoFiltro, setProyectoFiltro]   = useState('')
  const [prioridadFiltro, setPrioridadFiltro] = useState('')

  // Modales
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [tareaEditando, setTareaEditando]         = useState(null)
  const [tareaEliminando, setTareaEliminando]     = useState(null)

  // usuario que inicio sesion
  const [usuario, setUsuario] = useState(null)
  const esGerente = usuario?.rol === 'gerente'

  // se usa para que no falle al renderizar en el servidor
  useEffect(() => {
    setMontado(true)
    const stored = localStorage.getItem('usuario')
    if (stored) {
      try {
        setUsuario(JSON.parse(stored))
      } catch {
        setUsuario({ id: 1, nombre: 'Carlos Mendoza', rol: 'gerente' })
      }
    } else {
      setUsuario({ id: 1, nombre: 'Carlos Mendoza', rol: 'gerente' })
    }
    cargarDatos()
  }, [])

  //Carga de datos
  const cargarDatos = async () => {
    setCargando(true)
    setError(null)
    try {
      const [tRes, uRes, pRes] = await Promise.all([
        getTasks(), getUsers(), getProjects(),
      ])
      setTareas(tRes.data)
      setUsuarios(uRes.data)
      setProyectos(pRes.data)
    } catch {
      setError('No se pudo conectar con el servidor. Ejecuta: npm run server')
    } finally {
      setCargando(false)
    }
  }

  // Filtrado
  const filtrarPorColumna = (estado) =>
    tareas.filter((t) => {
      if (t.estado !== estado) return false
      if (busqueda && !t.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false
      if (proyectoFiltro && t.projectId !== parseInt(proyectoFiltro)) return false
      if (prioridadFiltro && t.prioridad !== prioridadFiltro) return false
      // Usuario solo ve sus tareas asignadas
      if (!esGerente && t.assignedTo !== usuario?.id) return false
      return true
    })

  const hayFiltros = busqueda || proyectoFiltro || prioridadFiltro

  // Stats
  const stats = {
    total:       tareas.length,
    pendiente:   tareas.filter((t) => t.estado === 'pendiente').length,
    en_progreso: tareas.filter((t) => t.estado === 'en_progreso').length,
    completada:  tareas.filter((t) => t.estado === 'completada').length,
  }

  // Handlers CRUD
  const handleCrear = () => {
    setTareaEditando(null)
    setMostrarFormulario(true)
  }

  const handleEditar = (tarea) => {
    setTareaEditando(tarea)
    setMostrarFormulario(true)
  }

  const handleEliminarClick = (tarea) => setTareaEliminando(tarea)

  const handleEliminarConfirmar = async () => {
    try {
      await deleteTask(tareaEliminando.id)
      setTareas((prev) => prev.filter((t) => t.id !== tareaEliminando.id))
    } catch {
      setError('Error al eliminar la tarea.')
    } finally {
      setTareaEliminando(null)
    }
  }

  const handleGuardar = async (datos) => {
    try {
      if (tareaEditando) {
        const res = await updateTask(tareaEditando.id, { ...tareaEditando, ...datos })
        setTareas((prev) => prev.map((t) => (t.id === tareaEditando.id ? res.data : t)))
      } else {
        const res = await createTask({
          ...datos,
          fechaCreacion: new Date().toISOString().split('T')[0],
        })
        setTareas((prev) => [...prev, res.data])
      }
      setMostrarFormulario(false)
    } catch {
      setError('Error al guardar la tarea.')
    }
  }

  const handleCambiarEstado = async (tarea, nuevoEstado) => {
    try {
      const res = await updateTask(tarea.id, { ...tarea, estado: nuevoEstado })
      setTareas((prev) => prev.map((t) => (t.id === tarea.id ? res.data : t)))
    } catch {
      setError('Error al actualizar el estado.')
    }
  }

  if (!montado) return null

  return (
    <>
      <Head>
        <title>Gestión de Tareas</title>
      </Head>

      <div className="min-h-screen bg-slate-50">

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ListTodo className="w-7 h-7 text-indigo-600" />
                Gestión de Tareas
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {usuario?.nombre} ·{' '}
                {esGerente ? 'Vista de gerente' : 'Vista de usuario'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cargarDatos}
                disabled={cargando}
                title="Actualizar"
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
              </button>
              {esGerente && (
                <button
                  onClick={handleCrear}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </button>
              )}
            </div>
          </div>

          {/* Estadísticas*/}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total',       value: stats.total,       bg: 'bg-white',      text: 'text-gray-800',   icon: '📋' },
              { label: 'Pendientes',  value: stats.pendiente,   bg: 'bg-amber-50',   text: 'text-amber-700',  icon: '⏳' },
              { label: 'En Progreso', value: stats.en_progreso, bg: 'bg-blue-50',    text: 'text-blue-700',   icon: '🔄' },
              { label: 'Completadas', value: stats.completada,  bg: 'bg-green-50',   text: 'text-green-700',  icon: '✅' },
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

          {/*Barra de filtros*/}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <select
              value={proyectoFiltro}
              onChange={(e) => setProyectoFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>

            <select
              value={prioridadFiltro}
              onChange={(e) => setPrioridadFiltro(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            {hayFiltros && (
              <button
                onClick={() => { setBusqueda(''); setProyectoFiltro(''); setPrioridadFiltro('') }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* mensaje de error */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Contenido principal  */}
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Cargando tareas...</p>
            </div>
          ) : (
            /* Tablero Kanban */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COLUMNAS.map(({ estado, label, bgCol, bgHeader, textColor, borderColor, Icon }) => {
                const columna = filtrarPorColumna(estado)
                return (
                  <div
                    key={estado}
                    className={`${bgCol} rounded-2xl border ${borderColor} overflow-hidden`}
                  >
                    {/* Encabezado de columna */}
                    <div className={`${bgHeader} px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${textColor}`} />
                        <span className={`font-semibold text-sm ${textColor}`}>{label}</span>
                      </div>
                      <span className={`text-xs font-bold ${textColor} bg-white/60 px-2 py-0.5 rounded-full`}>
                        {columna.length}
                      </span>
                    </div>

                    {/* Tarjetas */}
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
                            onEditar={handleEditar}
                            onEliminar={handleEliminarClick}
                            onCambiarEstado={handleCambiarEstado}
                          />
                        ))
                      )}
                    </div>

                    {/* Boton para agregar tarea (solo gerente) */}
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
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/*Crear / Editar tarea  */}
      {mostrarFormulario && (
        <TaskForm
          tarea={tareaEditando}
          usuarios={usuarios}
          proyectos={proyectos}
          esGerente={esGerente}
          onGuardar={handleGuardar}
          onCerrar={() => setMostrarFormulario(false)}
        />
      )}

      {/* Confirmar eliminación */}
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
  )
}
