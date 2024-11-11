import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformacionInicioService {

  private apiUrlActualizar = 'http://localhost:8080/empleado/actualizar/';
  private apiUrlObtener = 'http://localhost:8080/empleado/all';
  private apiUrlObtenerPDF = 'http://localhost:8080/informe-asistencia/pdf/empleados'; // Asegúrate de usar la URL correcta


  

  constructor(private http: HttpClient) {}

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

}
