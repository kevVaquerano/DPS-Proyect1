import { useState, useEffect } from 'react'
import { X, Save, Plus } from 'lucide-react'

const PRIORIDADES = [
  { value: 'alta',  label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja',  label: 'Baja' },
]

const ESTADOS = [
  { value: 'pendiente',   label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completada',  label: 'Completada' },
]


export default function TaskForm({ tarea, usuarios, proyectos, esGerente, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    estado: 'pendiente',
    prioridad: 'media',
    projectId: '',
    assignedTo: '',
    fechaLimite: '',
  })
  const [errores, setErrores] = useState({})

  // si viene una tarea la cargamos en el formulario para editar
  useEffect(() => {
    if (tarea) {
      setForm({
        titulo:      tarea.titulo      || '',
        descripcion: tarea.descripcion || '',
        estado:      tarea.estado      || 'pendiente',
        prioridad:   tarea.prioridad   || 'media',
        projectId:   tarea.projectId   || '',
        assignedTo:  tarea.assignedTo  || '',
        fechaLimite: tarea.fechaLimite || '',
      })
    }
  }, [tarea])

  const validar = () => {
    const nuevosErrores = {}
    if (!form.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return
    onGuardar({
      ...form,
      projectId:  form.projectId  ? parseInt(form.projectId)  : null,
      assignedTo: form.assignedTo ? parseInt(form.assignedTo) : null,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {tarea ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ingresa el título de la tarea"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errores.titulo
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-gray-50 focus:bg-white'
              }`}
            />
            {errores.titulo && (
              <p className="mt-1 text-xs text-red-500">{errores.titulo}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe la tarea (opcional)"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Estado y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Proyecto
            </label>
            <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">Sin proyecto asignado</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {/* asignar a - solo lo puede hacer el gerente */}
          {esGerente && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Asignar a
              </label>
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value="">Sin asignar</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha límite
            </label>
            <input
              type="date"
              name="fechaLimite"
              value={form.fechaLimite}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Acciones */}
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
              {tarea ? (
                <><Save className="w-4 h-4" /> Guardar cambios</>
              ) : (
                <><Plus className="w-4 h-4" /> Crear tarea</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
