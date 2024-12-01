import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Empleado {
  id: number;
  nombre: string;
  identificacion: string;
  fechaContratacion: string;
  activo: boolean;
  rol: string | null;
  huellaDactilar: string;
}

interface Asistencia {
  id: number;
  empleado: Empleado;
  fecha: string;
  horaEntrada: string | null;
  horaSalida: string | null;
  estado: string;
  tipoRegistro: string;
  diferenciaTiempoEntrada: string;
  diferenciaTiempoSalida: string;
}

interface Response<T> {
  code: string;
  message: string;
  data: T;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegistroAsistenciasService {
  private baseUrl = 'https://farmacia-proyecto-backend.onrender.com'; // URL raíz del backend
  private apiUrl = `${this.baseUrl}/asistencia/todas`;

  constructor(private http: HttpClient) {}

  obtenerAsistencias(): Observable<Response<Asistencia[]>> {
    return this.http.get<Response<Asistencia[]>>(this.apiUrl);
  }
}
