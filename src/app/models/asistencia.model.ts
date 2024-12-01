// src/app/models/asistencia.model.ts

export interface Asistencia {
    id: number;
    empleado: {
      id: number;
      nombre: string;
    };
    fecha: string;
    horaEntrada: string | null;
    horaSalida: string | null;
    estado: string;
    tipoRegistro: string;
    diferenciaTiempoEntrada:string | null;
    diferenciaTiempoSalida:string | null;

  }
  
  export interface AsistenciaFusionada {
    empleado: {
      id:number
      nombre: string| null;
    };
    fecha: string;
    horaEntrada: string | null;
    horaSalida: string | null;
    estadoEntrada: string | null;
    estadoSalida: string | null;
    tipoRegistro: string;
    diferenciaTiempoEntrada:string | null;
    diferenciaTiempoSalida:string | null;


  }
  // src/app/models/empleado.model.ts
  export interface Empleado {
    id: number; // ID del empleado
    nombre: string; // Nombre completo del empleado
    identificacion: string; // Identificación del empleado
    fechaContratacion: string | null; // Fecha de contratación, puede ser nula
    activo: boolean; // Estado de actividad
    rol: string | null; // Rol del empleado, puede ser nulo
    huellaDactilar: string; // ID de huella dactilar
    horario: { // Información del horario asignado
      id: number | null; // ID del horario
      descripcion: string; // Descripción completa del horario
      horaInicio1: string | null; // Hora de inicio del primer turno
      horaFin1: string | null; // Hora de fin del primer turno
      horaInicio2: string | null; // Hora de inicio del segundo turno, opcional
      horaFin2: string | null; // Hora de fin del segundo turno, opcional
    };
    turnoProgramado: string | null; // Turno específico programado, puede ser nulo
  }
  

  