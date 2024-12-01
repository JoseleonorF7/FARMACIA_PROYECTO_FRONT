import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformacionInicioService {

  private apiUrlActualizar = 'http://localhost:8080/empleado/actualizar/';
  private apiUrlObtener = 'http://localhost:8080/empleado/all';
  private apiUrlObtenerPDF = 'http://localhost:8080/informe-asistencia/pdf/empleados'; // Asegúrate de usar la URL correcta
  private apiUrlActualzarContraseña = 'http://localhost:8080/usuario/update-password/'
  private apiUrlEnvioReporteAutomatico = 'http://localhost:8080/informe-asistencia/programarEnvioCorreo';  // Asegúrate de que la URL del backend sea correcta
  private apiUrlTiempoRestanteEnvio = 'http://localhost:8080/informe-asistencia/verTiempoRestante';  // URL del endpoint

  constructor(private http: HttpClient) {}


  // Método para obtener el tiempo restante
 
  // Método para activar el reporte automático
  // Método para activar el reporte automático
  activarReporteAutomatico(frecuencia: string): Observable<any> {
    const body = { frecuencia };  // Enviamos un objeto con la frecuencia
    return this.http.post<any>(this.apiUrlEnvioReporteAutomatico, body);
  }

  cancelarEnvioReporte(): Observable<any> {
    // Suponiendo que el backend tiene un endpoint para cancelar el envío
    return this.http.post<any>('URL_DEL_BACKEND/cancelarEnvioCorreo', {});
  }
  // Obtener datos del empleados
  obtenerEmpleados(): Observable<any> {
    return this.http.get(`${this.apiUrlObtener}`);
  }

  // Actualizar datos del empleado
  actualizarEmpleado(empleado: any): Observable<any> {
    return this.http.put(`${this.apiUrlActualizar}${empleado.identificacion}`, empleado);
  }


  getAllEmployeeAttendancePdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrlObtenerPDF}`, { responseType: 'blob' });
  }


  actualizarContrasena(id: number, nuevaContrasena: string): Observable<any> {
    const url = `${this.apiUrlActualzarContraseña}${id}`;
    const payload = { newPassword: nuevaContrasena };
    return this.http.put(url, payload);
  }
  
  private apiUrlAgregarUsuario = 'http://localhost:8080/usuario'; // Cambia esta URL con la URL real de tu backend
  private apiUrlReporteEmpleadosMensual = 'http://localhost:8080/informe-asistencia/reporteMensual/pdf/';
  private apiUrlReporteEmpleadoMensual = 'http://localhost:8080/informe-asistencia/reporteEmpleado/pdf/';
  private apiUrlReporteEmpleadoFecha = 'http://localhost:8080/informe-asistencia/reporteEmpleadoUnico/pdf/';
  private apiUrlReporteComparativoMensual = 'http://localhost:8080/informe-asistencia/pdf/comparativo';


  // Método para agregar usuario
  agregarUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrlAgregarUsuario, usuario);
  }

  // Método para obtener el reporte mensual de todos los empleados
  getReporteMensualPdf(mes: number, ano: number): Observable<Blob> {
    const url = `${this.apiUrlReporteEmpleadosMensual}${mes}/${ano}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
        catchError((error) => {
            // Re-emitir el error para que el controlador lo reciba
            return throwError(() => error);
        })
    );
}


  // Método para obtener el reporte mensual de un empleado específico
getReporteEmpleadoPdf(empleadoId: number, mes: number, ano: number): Observable<Blob> {
  const url = `${this.apiUrlReporteEmpleadoMensual}${empleadoId}/${mes}/${ano}`;
  return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
          // Re-emitir el error para que el controlador lo maneje
          return throwError(() => error);
      })
  );
}

// Método para obtener el reporte de un empleado en una fecha específica
getReporteEmpleadoUnicoPdf(empleadoId: number, fecha: Date): Observable<Blob> {
  const formattedDate = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const url = `${this.apiUrlReporteEmpleadoFecha}${empleadoId}/${formattedDate}`;
  return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
          // Re-emitir el error para que el controlador lo maneje
          return throwError(() => error);
      })
  );
}

// Método para obtener el reporte comparativo de asistencia mensual
getComparativoAsistenciaPdf(mes: number, ano: number): Observable<Blob> {
  const url = `${this.apiUrlReporteComparativoMensual}?mes=${mes}&anio=${ano}`;
  return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
          // Re-emitir el error para que el controlador lo maneje
          return throwError(() => error);
      })
  );
}
}