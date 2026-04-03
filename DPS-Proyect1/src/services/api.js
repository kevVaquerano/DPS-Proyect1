/**
 * Cliente HTTP centralizado de la aplicación.
 *
 * ¿Por qué existe este archivo?
 * - Para NO repetir axios en todos los componentes.
 * - Para centralizar la URL base de la API.
 * - Para tener todas las funciones CRUD organizadas en un solo lugar.
 *
 * Esto facilita mantenimiento, escalabilidad y reutilización.
 */

import axios from "axios";

/**
 * URL base de la API.
 *
 * Se intenta leer desde variables de entorno (Next.js),
 * lo cual es buena práctica para:
 * - producción
 * - diferentes entornos (dev, test, prod)
 *
 * Si no existe, usa localhost como fallback.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Instancia de axios configurada.
 *
 * Ventajas:
 * - No repetir baseURL en cada llamada
 * - Configurar headers globales
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * ================================
 * TAREAS (TASKS)
 * ================================
 */

/**
 * Obtiene todas las tareas.
 */
export const getTasks = () => api.get("/tasks");

/**
 * Obtiene una tarea específica por ID.
 */
export const getTaskById = (id) => api.get(`/tasks/${id}`);

/**
 * Crea una nueva tarea.
 * @param data Objeto con la información de la tarea
 */
export const createTask = (data) => api.post("/tasks", data);

/**
 * Actualiza una tarea existente.
 * @param id ID de la tarea
 * @param data Datos actualizados
 */
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);

/**
 * Elimina una tarea por ID.
 */
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

/**
 * ================================
 * USUARIOS (USERS)
 * ================================
 */

export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);

/**
 * ================================
 * PROYECTOS (PROJECTS)
 * ================================
 */

export const getProjects = () => api.get("/projects");
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post("/projects", data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

/**
 * Exportación principal (por si quieres usar api directamente).
 */
export default api;