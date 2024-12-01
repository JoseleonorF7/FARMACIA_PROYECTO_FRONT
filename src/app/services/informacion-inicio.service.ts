import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InformacionInicioService {
  private baseUrl = 'https://farmacia-proyecto-backend.onrender.com'; // URL raíz del backend

  private apiUrlActualizar = `${this.baseUrl}/empleado/actualizar/`;
  private apiUrlObtener = `${this.baseUrl}/empleado/all`;
  private apiUrlObtenerPDF = `${this.baseUrl}/informe-asistencia/pdf/empleados`;
  private apiUrlActualzarContraseña = `${this.baseUrl}/usuario/update-password/`;
  private apiUrlEnvioReporteAutomatico = `${this.baseUrl}/informe-asistencia/programarEnvioCorreo`;
  private apiUrlTiempoRestanteEnvio = `${this.baseUrl}/informe-asistencia/verTiempoRestante`;
  private apiUrlAgregarUsuario = `${this.baseUrl}/usuario`;
  private apiUrlReporteEmpleadosMensual = `${this.baseUrl}/informe-asistencia/reporteMensual/pdf/`;
  private apiUrlReporteEmpleadoMensual = `${this.baseUrl}/informe-asistencia/reporteEmpleado/pdf/`;
  private apiUrlReporteEmpleadoFecha = `${this.baseUrl}/informe-asistencia/reporteEmpleadoUnico/pdf/`;
  private apiUrlReporteComparativoMensual = `${this.baseUrl}/informe-asistencia/pdf/comparativo`;

  constructor(private http: HttpClient) {}

  // Métodos relacionados con el envío automático de reportes
  activarReporteAutomatico(frecuencia: string): Observable<any> {
    const body = { frecuencia };
    return this.http.post<any>(this.apiUrlEnvioReporteAutomatico, body);
  }

  cancelarEnvioReporte(): Observable<any> {
    return this.http.post<any>('URL_DEL_BACKEND/cancelarEnvioCorreo', {});
  }

  // Métodos para gestionar empleados
  obtenerEmpleados(): Observable<any> {
    return this.http.get(`${this.apiUrlObtener}`);
  }

  actualizarEmpleado(empleado: any): Observable<any> {
    return this.http.put(`${this.apiUrlActualizar}${empleado.identificacion}`, empleado);
  }

  agregarUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrlAgregarUsuario, usuario);
  }

  // Métodos relacionados con los reportes PDF
  getAllEmployeeAttendancePdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrlObtenerPDF}`, { responseType: 'blob' });
  }

  getReporteMensualPdf(mes: number, ano: number): Observable<Blob> {
    const url = `${this.apiUrlReporteEmpleadosMensual}${mes}/${ano}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.error instanceof Blob && error.error.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = () => {
                    console.error('Error detectado:', reader.result);
                };
                reader.readAsText(error.error);
            } else {
                console.error('Error desconocido:', error);
            }
            return throwError(() => error);
        })
    );
}

getReporteEmpleadoPdf(empleadoId: number, mes: number, ano: number): Observable<Blob> {
    const url = `${this.apiUrlReporteEmpleadoMensual}${empleadoId}/${mes}/${ano}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.error instanceof Blob && error.error.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = () => {
                    console.error('Error detectado:', reader.result);
                };
                reader.readAsText(error.error);
            } else {
                console.error('Error desconocido:', error);
            }
            return throwError(() => error);
        })
    );
}

getReporteEmpleadoUnicoPdf(empleadoId: number, fecha: Date): Observable<Blob> {
    const formattedDate = fecha.toISOString().split('T')[0];
    const url = `${this.apiUrlReporteEmpleadoFecha}${empleadoId}/${formattedDate}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.error instanceof Blob && error.error.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = () => {
                    console.error('Error detectado:', reader.result);
                };
                reader.readAsText(error.error);
            } else {
                console.error('Error desconocido:', error);
            }
            return throwError(() => error);
        })
    );
}

getComparativoAsistenciaPdf(mes: number, ano: number): Observable<Blob> {
  const url = `${this.apiUrlReporteComparativoMensual}?mes=${mes}&anio=${ano}`;
  return this.http.get(url, { responseType: 'blob' });
}



  // Método para gestionar la contraseña de un usuario
  actualizarContrasena(id: number, nuevaContrasena: string): Observable<any> {
    const url = `${this.apiUrlActualzarContraseña}${id}`;
    const payload = { newPassword: nuevaContrasena };
    return this.http.put(url, payload);
  }

  // Método para manejar errores
  private handleError(error: any): Observable<never> {
    return throwError(() => error);
  }
}
