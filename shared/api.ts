/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export type UserRole = "admin" | "participant";

export interface User {
  _id: string;
  nombreCompleto: string;
  numeroTelefono: string;
  esAdmin: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  _id: string;
  nombreCompleto: string;
  numeroTelefono: string;
  esAdmin: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  codigoAcceso?: string | null;
  codigoExpiracion?: string | null;
  amigoSecreto?: string;
}

export interface DrawResult {
  participante: string;
  nombreParticipante: string;
  tieneAmigoSecreto: boolean;
}

export interface DrawResponse {
  success: boolean;
  message: string;
  total: number;
  sorteo: {
    id: string;
    fecha: string;
    estado: "pendiente" | "completado";
  };
  data: DrawResult[];
}

export interface ResetSorteoResponse {
  success: boolean;
  message: string;
  data: {
    participantesLimpiados: number;
    sorteosEliminados: number;
  };
}

export interface LoginRequest {
  numeroTelefono: string;
  contrasena?: string;
  codigoAcceso?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface SendAccessCodeRequest {
  numeroTelefono: string;
}

export interface SendAccessCodeResponse {
  success: boolean;
  message: string;
  data?: {
    numeroTelefono: string;
    expiraEn: string;
  };
}

export interface RegisterRequest {
  nombreCompleto: string;
  numeroTelefono: string;
  contrasena: string;
  esAdmin: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface ParticipantsResponse {
  success: boolean;
  total: number;
  data: Participant[];
  sorteo?: {
    estado: "pendiente" | "completado";
    fecha?: string;
    totalParticipantes?: number;
  };
}

export interface MyAssignmentResponse {
  assigned: string | null;
  message?: string;
}

export interface MiAmigoSecretoResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    tuNombre: string;
    amigoSecreto: {
      _id: string;
      nombreCompleto: string;
      numeroTelefono: string;
    };
  };
}

export interface DemoResponse {
  message: string;
}
