/**
 * Modal de formulario para crear o editar proyectos.
 *
 * Este componente:
 * - Carga datos del proyecto cuando se edita
 * - Valida campos obligatorios
 * - Valida fechas
 * - Controla automáticamente el progreso al completar
 * - Envía datos listos al componente padre con onGuardar()
 */

import { useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";

const PRIORIDADES = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

const ESTADOS = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "En progreso", label: "En progreso" },
  { value: "Completado", label: "Completado" },
];

/**
 * Valores iniciales del formulario.
 */
const FORM_INICIAL = {
  nombre: "",
  descripcion: "",
  estado: "Pendiente",
  prioridad: "media",
  progreso: 0,
  progresoAnterior: 0,
  assignedTo: "",
  fechaInicio: "",
  fechaFin: "",
};

export default function ProjectForm({
  proyecto,
  usuarios = [],
  usuarioActual,
  onGuardar,
  onCerrar,
}) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});

  /**
   * Si se está editando, llena el formulario con datos del proyecto.
   * Si se está creando, limpia el formulario.
   */
  useEffect(() => {
    if (proyecto) {
      setForm({
        nombre: proyecto.nombre || "",
        descripcion: proyecto.descripcion || "",
        estado: proyecto.estado || "Pendiente",
        prioridad: proyecto.prioridad || "media",
        progreso: proyecto.progreso ?? 0,
        progresoAnterior: proyecto.progresoAnterior ?? proyecto.progreso ?? 0,
        assignedTo: proyecto.assignedTo || "",
        fechaInicio: proyecto.fechaInicio || "",
        fechaFin: proyecto.fechaFin || "",
      });
      return;
    }

    setForm(FORM_INICIAL);
  }, [proyecto]);

  /**
   * Valida la información del proyecto.
   */
  const validar = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    }

    if (!form.assignedTo) {
      nuevosErrores.assignedTo = "Debes seleccionar a un usuario";
    }

    if (form.progreso < 0 || form.progreso > 100) {
      nuevosErrores.progreso = "El progreso debe estar entre 0 y 100";
    }

    /**
     * Regla lógica:
     * si el proyecto está completado, su progreso debe ser 100.
     */
    if (form.estado === "Completado" && Number(form.progreso) !== 100) {
      nuevosErrores.progreso =
        "Si el proyecto está completado, el progreso debe ser 100";
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!form.fechaInicio) {
      nuevosErrores.fechaInicio = "La fecha de inicio es obligatoria";
    }

    if (!form.fechaFin) {
      nuevosErrores.fechaFin = "La fecha final es obligatoria";
    }

    /**
     * Solo se valida contra hoy cuando es un proyecto nuevo.
     */
    if (!proyecto && form.fechaInicio) {
      const inicio = new Date(`${form.fechaInicio}T00:00:00`);
      if (inicio < hoy) {
        nuevosErrores.fechaInicio =
          "La fecha de inicio no puede ser anterior a hoy";
      }
    }

    /**
     * Guarda la fecha final original para permitir editar otros campos
     * sin bloquear proyectos antiguos con fechas ya vencidas.
     */
    const fechaFinOriginal = proyecto?.fechaFin || "";

    if (form.fechaFin) {
      const fin = new Date(`${form.fechaFin}T00:00:00`);
      const cambioFecha = form.fechaFin !== fechaFinOriginal;

      if ((!proyecto || cambioFecha) && fin < hoy) {
        nuevosErrores.fechaFin =
          "La fecha final no puede ser anterior a hoy";
      }
    }

    /**
     * La fecha final no puede ir antes de la fecha inicial.
     */
    if (form.fechaInicio && form.fechaFin) {
      const inicio = new Date(`${form.fechaInicio}T00:00:00`);
      const fin = new Date(`${form.fechaFin}T00:00:00`);

      if (fin < inicio) {
        nuevosErrores.fechaFin =
          "La fecha final no puede ser menor que la fecha de inicio";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Envía la información validada al componente padre.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validar()) return;

    onGuardar({
      ...form,
      progreso: Number(form.progreso),
      progresoAnterior: Number(form.progresoAnterior ?? 0),
      assignedTo: form.assignedTo ? String(form.assignedTo) : null,
    });
  };

  /**
   * Maneja cambios del formulario.
   *
   * Lógica especial:
   * - si pasa a completado, progreso = 100
   * - si sale de completado, restaura progresoAnterior
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const nuevoForm = {
        ...prev,
        [name]: value,
      };

      if (name === "estado") {
        if (value === "Completado") {
          if (prev.estado !== "Completado") {
            nuevoForm.progresoAnterior = prev.progreso;
          }
          nuevoForm.progreso = 100;
        } else if (prev.estado === "Completado") {
          nuevoForm.progreso = prev.progresoAnterior ?? 0;
        }
      }

      if (name === "progreso") {
        const progresoNumero = Number(value);
        nuevoForm.progreso = progresoNumero;

        if (prev.estado !== "Completado") {
          nuevoForm.progresoAnterior = progresoNumero;
        }
      }

      return nuevoForm;
    });

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const hoyMin = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {proyecto ? "Editar proyecto" : "Nuevo proyecto"}
          </h2>

          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!proyecto && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Creado por
              </label>
              <input
                type="text"
                value={usuarioActual?.nombre || "Sin usuario"}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-100 rounded-xl text-sm text-gray-600 cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ingresa el nombre del proyecto"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errores.nombre
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-gray-50 focus:bg-white"
              }`}
            />
            {errores.nombre && (
              <p className="mt-1 text-xs text-red-500">{errores.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe el proyecto"
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none ${
                errores.descripcion
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-gray-50 focus:bg-white"
              }`}
            />
            {errores.descripcion && (
              <p className="mt-1 text-xs text-red-500">{errores.descripcion}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {PRIORIDADES.map((prioridad) => (
                  <option key={prioridad.value} value={prioridad.value}>
                    {prioridad.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Asignado a <span className="text-red-500">*</span>
            </label>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errores.assignedTo
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-gray-50 focus:bg-white"
              }`}
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
            {errores.assignedTo && (
              <p className="mt-1 text-xs text-red-500">{errores.assignedTo}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha de inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={form.fechaInicio}
                min={!proyecto ? hoyMin : undefined}
                disabled={!!proyecto}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-colors ${
                  proyecto
                    ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                    : errores.fechaInicio
                    ? "border-red-400 bg-red-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    : "border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                }`}
              />
              {errores.fechaInicio && (
                <p className="mt-1 text-xs text-red-500">{errores.fechaInicio}</p>
              )}
              {proyecto && (
                <p className="mt-1 text-xs text-gray-400">
                  La fecha de inicio no se puede modificar después de crear el
                  proyecto.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha final <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaFin"
                value={form.fechaFin}
                min={form.fechaInicio || (!proyecto ? hoyMin : undefined)}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errores.fechaFin
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50 focus:bg-white"
                }`}
              />
              {errores.fechaFin && (
                <p className="mt-1 text-xs text-red-500">{errores.fechaFin}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Progreso %
            </label>
            <input
              type="number"
              name="progreso"
              min="0"
              max="100"
              value={form.progreso}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errores.progreso
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-gray-50 focus:bg-white"
              }`}
            />
            {errores.progreso && (
              <p className="mt-1 text-xs text-red-500">{errores.progreso}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {proyecto ? (
                <>
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Crear proyecto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}