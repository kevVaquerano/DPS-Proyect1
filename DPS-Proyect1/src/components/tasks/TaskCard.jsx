/**
 * Tarjeta visual de una tarea dentro del tablero.
 *
 * Muestra datos principales, progreso, fechas, usuario creador,
 * usuario asignado y acciones según el rol del usuario.
 */

import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarX,
  Edit2,
  FolderOpen,
  Trash2,
  User,
  Users,
} from "lucide-react";

const PRIORIDAD = {
  alta: {
    label: "Alta",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-l-red-500",
  },
  media: {
    label: "Media",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-l-yellow-500",
  },
  baja: {
    label: "Baja",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-l-green-500",
  },
};

const ESTADO = {
  pendiente: {
    label: "Pendiente",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  en_progreso: {
    label: "En Progreso",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  completada: {
    label: "Completada",
    bg: "bg-green-100",
    text: "text-green-700",
  },
};

const ESTADOS_OPCIONES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_progreso", label: "En Progreso" },
  { value: "completada", label: "Completada" },
];

export default function TaskCard({
  tarea,
  usuarios,
  proyectos,
  esGerente,
  onEditar,
  onEliminar,
  onCambiarEstado,
}) {
  const prioridadConf = PRIORIDAD[tarea.prioridad] || PRIORIDAD.media;
  const estadoConf = ESTADO[tarea.estado] || ESTADO.pendiente;

  const creador = usuarios.find((u) => String(u.id) === String(tarea.creadoPor));
  const usuarioAsignado = usuarios.find(
    (u) => String(u.id) === String(tarea.assignedTo)
  );
  const proyecto = proyectos.find((p) => String(p.id) === String(tarea.projectId));
  const progreso = Number(tarea.progreso || 0);

  // Formatea una fecha a texto legible en español.
  const formatFecha = (str) => {
    if (!str) return "Sin fecha";
    return new Date(`${str}T00:00:00`).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaFinTexto = tarea.fechaFin || tarea.fechaLimite || "";
  const fechaInicioTexto = tarea.fechaInicio || tarea.fechaCreacion || "";

  const fechaFin = fechaFinTexto ? new Date(`${fechaFinTexto}T00:00:00`) : null;

  // Una tarea se considera retrasada si su fecha final ya pasó
  // y todavía no está completada.
  const retrasada =
    !!fechaFin &&
    fechaFin.getTime() < hoy.getTime() &&
    tarea.estado !== "completada";

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${prioridadConf.border} shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up`}
    >
      <div className="p-4 break-words">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estadoConf.bg} ${estadoConf.text}`}
          >
            {estadoConf.label}
          </span>

          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${prioridadConf.bg} ${prioridadConf.text}`}
          >
            {prioridadConf.label}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 break-words">
          {tarea.titulo}
        </h3>

        {tarea.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {tarea.descripcion}
          </p>
        )}

        <div className="space-y-1.5 text-xs text-gray-500">
          {proyecto && (
            <div className="flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{proyecto.nombre}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>
              Creado por: {creador?.nombre || tarea.creadoPorNombre || "No definido"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>Asignado a: {usuarioAsignado?.nombre || "No asignado"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">Inicio: {formatFecha(fechaInicioTexto)}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${
              retrasada ? "text-red-500 font-medium" : ""
            }`}
          >
            {retrasada ? (
              <CalendarX className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            ) : (
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}

            <span className="truncate">
              Fin: {formatFecha(fechaFinTexto)}
              {retrasada ? " · ⚠ Retrasada ⚠" : ""}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>Progreso actual: {progreso}%</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
          {esGerente ? (
            <>
              <button
                onClick={() => onEditar(tarea)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>

              <button
                onClick={() => onEliminar(tarea)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </>
          ) : (
            <div className="w-full">
              <label className="block text-xs text-gray-400 mb-1">
                Actualizar estado:
              </label>
              <select
                value={tarea.estado}
                onChange={(e) => onCambiarEstado?.(tarea, e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              >
                {ESTADOS_OPCIONES.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}