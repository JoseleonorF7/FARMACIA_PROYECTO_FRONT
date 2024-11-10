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
      nombre: string;
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
  