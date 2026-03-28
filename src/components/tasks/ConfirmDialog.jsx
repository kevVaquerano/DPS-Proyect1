import { Trash2, AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({
  titulo,
  mensaje,
  tipo = 'peligro',
  onConfirmar,
  onCancelar,
}) {
  const esPeligro = tipo === 'peligro'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onCancelar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-6 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                esPeligro ? 'bg-red-100' : 'bg-amber-100'
              }`}
            >
              {esPeligro ? (
                <Trash2 className="w-5 h-5 text-red-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          </div>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-500 leading-relaxed">{mensaje}</p>

          {/* Botones */}
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={onCancelar}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors ${
                esPeligro
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {esPeligro ? 'Sí, eliminar' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
