import { Calendar, User, FolderOpen, Edit2, Trash2 } from 'lucide-react'

// colores y texto según la prioridad
const PRIORIDAD = {
  alta:  { label: 'Alta',  bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-l-red-500' },
  media: { label: 'Media', bg: 'bg-yellow-100',  text: 'text-yellow-700', border: 'border-l-yellow-500' },
  baja:  { label: 'Baja',  bg: 'bg-green-100',   text: 'text-green-700',  border: 'border-l-green-500' },
}

// colores y texto según el estado
const ESTADO = {
  pendiente:   { label: 'Pendiente',   bg: 'bg-gray-100',  text: 'text-gray-600' },
  en_progreso: { label: 'En Progreso', bg: 'bg-blue-100',  text: 'text-blue-700' },
  completada:  { label: 'Completada',  bg: 'bg-green-100', text: 'text-green-700' },
}

const ESTADOS_OPCIONES = [
  { value: 'pendiente',   label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completada',  label: 'Completada' },
]


export default function TaskCard({ tarea, usuarios, proyectos, esGerente, onEditar, onEliminar, onCambiarEstado }) {
  const prioridadConf = PRIORIDAD[tarea.prioridad] || PRIORIDAD.media
  const estadoConf    = ESTADO[tarea.estado]        || ESTADO.pendiente

  const usuarioAsignado = usuarios.find((u) => u.id === tarea.assignedTo)
  const proyecto        = proyectos.find((p) => p.id === tarea.projectId)

  // Verificar si la tarea está vencida
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fechaLimite = tarea.fechaLimite ? new Date(tarea.fechaLimite + 'T00:00:00') : null
  const vencida = fechaLimite && fechaLimite < hoy && tarea.estado !== 'completada'

  const formatFecha = (str) => {
    if (!str) return null
    return new Date(str + 'T00:00:00').toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${prioridadConf.border} shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up`}
    >
      <div className="p-4">
        {/* estado y prioridad */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estadoConf.bg} ${estadoConf.text}`}>
            {estadoConf.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${prioridadConf.bg} ${prioridadConf.text}`}>
            {prioridadConf.label}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2">
          {tarea.titulo}
        </h3>

        {/* Descripción */}
        {tarea.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {tarea.descripcion}
          </p>
        )}

        {/* info adicional de la tarea */}
        <div className="space-y-1.5 text-xs text-gray-500">
          {proyecto && (
            <div className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{proyecto.nombre}</span>
            </div>
          )}
          {usuarioAsignado && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{usuarioAsignado.nombre}</span>
            </div>
          )}
          {fechaLimite && (
            <div className={`flex items-center gap-1.5 ${vencida ? 'text-red-500 font-medium' : ''}`}>
              <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${vencida ? 'text-red-400' : 'text-gray-400'}`} />
              <span>{vencida ? '⚠ Vencida · ' : ''}{formatFecha(tarea.fechaLimite)}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
          {esGerente ? (
            <>
              <button
                onClick={() => onEditar(tarea)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={() => onEliminar(tarea)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </>
          ) : (
            /* el usuario solo puede cambiar el estado */
            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">Actualizar estado:</label>
              <select
                value={tarea.estado}
                onChange={(e) => onCambiarEstado(tarea, e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              >
                {ESTADOS_OPCIONES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
