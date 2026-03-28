import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Tareas
export const getTasks    = ()         => api.get('/tasks')
export const getTaskById = (id)       => api.get(`/tasks/${id}`)
export const createTask  = (data)     => api.post('/tasks', data)
export const updateTask  = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask  = (id)       => api.delete(`/tasks/${id}`)

// Usuarios
export const getUsers = () => api.get('/users')

// Proyectos
export const getProjects = () => api.get('/projects')

export default api
