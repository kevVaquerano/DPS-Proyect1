/**
 * Tarjeta visual de un proyecto.
 *
 * Muestra estado, prioridad, usuarios relacionados,
 * fechas, progreso y acciones disponibles según el rol.
 */

import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarX,
  Edit2,
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
  Pendiente: {
    label: "Pendiente",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  "En progreso": {
    label: "En progreso",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  Completado: {
    label: "Completado",
    bg: "bg-green-100",
    text: "text-green-700",
  },
};

const ESTADOS_OPCIONES = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "En progreso", label: "En progreso" },
  { value: "Completado", label: "Completado" },
];

export default function ProjectCard({
  proyecto,
  usuarios = [],
  esGerente,
  onEditar,
  onEliminar,
  onCambiarEstado,
}) {
  const creador = usuarios.find(
    (u) => String(u.id) === String(proyecto.creadoPor)
  );

  const asignado = usuarios.find(
    (u) => String(u.id) === String(proyecto.assignedTo)
  );

  const prioridadConf = PRIORIDAD[proyecto.prioridad] || PRIORIDAD.media;
  const estadoConf = ESTADO[proyecto.estado] || ESTADO.Pendiente;
  const progreso = Number(proyecto.progreso || 0);

  // Convierte una fecha en formato ISO a una fecha legible.
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

  const fechaFin = proyecto.fechaFin
    ? new Date(`${proyecto.fechaFin}T00:00:00`)
    : null;

  // Un proyecto está retrasado si la fecha final ya venció
  // y todavía no está completado.
  const retrasado =
    !!fechaFin &&
    fechaFin.getTime() < hoy.getTime() &&
    proyecto.estado !== "Completado";

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
          {proyecto.nombre}
        </h3>

        {proyecto.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {proyecto.descripcion}
          </p>
        )}

        <div className="space-y-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>
              Creado por:{" "}
              {creador?.nombre || proyecto.creadoPorNombre || "No definido"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>Asignado a: {asignado?.nombre || "No asignado"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">
              Inicio: {formatFecha(proyecto.fechaInicio)}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${
              retrasado ? "text-red-500 font-medium" : ""
            }`}
          >
            {retrasado ? (
              <CalendarX className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            ) : (
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}

            <span className="truncate">
              Fin: {formatFecha(proyecto.fechaFin)}
              {retrasado ? " · ⚠ Retrasado ⚠" : ""}
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
                onClick={() => onEditar(proyecto)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>

              <button
                onClick={() => onEliminar(proyecto)}
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
                value={proyecto.estado}
                onChange={(e) => onCambiarEstado?.(proyecto, e.target.value)}
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