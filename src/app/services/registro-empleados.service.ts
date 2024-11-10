import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistroEmpleadosService {

  private apiUrl = 'http://localhost:8080/empleado'; // Ajusta la URL según sea necesario
  private apiUrlRegsitrarEmpeleado = 'http://localhost:8080/empleado/registrar'; // Cambia la URL al endpoint correcto de tu backend

  constructor(private http: HttpClient) {}

  updateEmpleado(huella: string, empleado: any): Observable<any> {
    const url = `${this.apiUrlRegsitrarEmpeleado}/${huella}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, empleado, { headers });
  }

  getAllHuellas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/huellas`);
  }  
}
