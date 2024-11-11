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
  id: number;
  nombre: string;
  identificacion: string;
  fechaContratacion: string | null;
  activo: boolean;
  rol: string | null;
  huellaDactilar: string;
}

  