/**
 * API Configuration
 * Centralized API base URL configuration
 */

export const API_BASE_URL = "http://sorteo-api-e8riu2-6dbe6f-31-97-133-67.traefik.me/api";

//export const API_BASE_URL = "https://sorteoapi.unify-tec.com/api";
//export const API_BASE_URL = "http://localhost:3000/api";
//export const API_BASE_URL = "https://sorteoapi.onrender.com/api";


/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  SEND_ACCESS_CODE: `${API_BASE_URL}/users/send-access-code`,
  
  // Participant endpoints
  PARTICIPANTES: `${API_BASE_URL}/participantes`,
  MI_AMIGO_SECRETO: (userId: string) => `${API_BASE_URL}/mi-amigo-secreto/${userId}`,
  ENCUESTA: `${API_BASE_URL}/encuesta`,
  ENCUESTA_VERIFICAR: (userId: string) => `${API_BASE_URL}/encuesta/verificar/${userId}`,
  ENCUESTA_AMIGO_SECRETO: (userId: string) => `${API_BASE_URL}/encuesta/amigo-secreto/${userId}`,
  
  // Sorteo endpoints
  SORTEO: `${API_BASE_URL}/sorteo`,
  SORTEO_RESET: `${API_BASE_URL}/sorteo/reset`,
} as const;
