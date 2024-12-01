import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RegistroEmpleadosService {
  private baseUrl = 'https://farmacia-proyecto-backend.onrender.com'; // URL raíz del backend
  private apiUrl = `${this.baseUrl}/empleado`;
  private apiUrlRegistrarEmpleado = `${this.baseUrl}/empleado/registrar`;

  constructor(private http: HttpClient) {}

  updateEmpleado(huella: string, empleado: any): Observable<any> {
    const url = `${this.apiUrlRegistrarEmpleado}/${huella}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, empleado, { headers });
  }

  getAllHuellas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/huellas`);
  }
}
