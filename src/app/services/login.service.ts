import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map ,tap} from 'rxjs/operators';
import { of } from 'rxjs';
import {  throwError } from 'rxjs';
import { AuthService } from './auth.service';
import {  HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

export class LoginService {
  
  private API_SERVER = "http://localhost:8080/usuario";
  
  private usuarioidKey = 'usuarioid'; // Clave para almacenar el ID de usuario
  private estudianteidKey = 'estudianteid'; // Clave para almacenar el ID del estudiante
  private rememberMeKey = 'rememberMe'; // Clave para almacenar el estado de "recordar sesión"

  constructor(private httpClient: HttpClient, private router: Router, private authService: AuthService) {
    const mostrarFormulario = localStorage.getItem('mostrarFormulario');
    if (mostrarFormulario) {
      this.mostrarFormularioSubject.next(mostrarFormulario === 'true');
    }

    const botonesInicio = localStorage.getItem(this.botonesInicioKey);
    if (botonesInicio) {
      this.botonesInicioSubject.next(botonesInicio === 'true');
    }

    // Verificación del estado de "recordar sesión" y del estado de inicio de sesión
    const rememberMe = localStorage.getItem(this.rememberMeKey) === 'true';
    const isLoggedIn = localStorage.getItem(this.isLoggedInKey) === 'true';

    if (rememberMe && isLoggedIn) {
      const userId = localStorage.getItem(this.usuarioidKey);
      if (userId) {
        this.getStudentInfo(userId).subscribe();
        this.changeFormVisibility(true);
      }
    }
  }

  login(username: string, password: string, rememberMe: boolean): Observable<boolean> {
    const loginPayload = { username, password };
  
    return this.httpClient.post<any>(`${this.API_SERVER}/login`, loginPayload).pipe(
      map(response => {
        if (response && response.code === "200" && response.message === "Login exitoso") {
          localStorage.setItem(this.isLoggedInKey, 'true');
          this.isLoggedIn = true;
  
          this.toggleMostrarFormulario();
          this.unlockButtons();
          this.changeFormVisibility(true);
  
          const userId = response.data.id;
          localStorage.setItem(this.usuarioidKey, userId);
          localStorage.setItem(this.rememberMeKey, rememberMe.toString());
  
          // Llamada para obtener el ID del estudiante y almacenarlo
          this.getStudentInfo(userId).subscribe(estudiante => {
        
            if (estudiante && estudiante.data.id) {
              localStorage.setItem(this.estudianteidKey, estudiante.data.id.toString());
            }
          });
  
          this.authService.notifyLogin();

          return true;
        } else {
          return false;
        }
      }),
      catchError(error => {
        console.error('Login error', error);
        return of(false);
      })
    );
  }
  

   // Método para simular el proceso de inicio de sesión
 


/*-------------------------------------------------------------*/

  /* LOGICA PARA GAURDAR ESTADO*/
  // Variable para almacenar la clave utilizada en el almacenamiento local
  private isLoggedInKey = 'isLoggedIn';
  // Variable que indica si el usuario está autenticado
  private isLoggedIn: boolean = localStorage.getItem(this.isLoggedInKey) === 'true';

  // BehaviorSubject para mantener el estado de visualización del formulario de inicio de sesión
  private mostrarFormularioSubject = new BehaviorSubject<boolean>(true);
  // Observable que emite el valor actual de mostrarFormularioSubject
  mostrarFormulario$ = this.mostrarFormularioSubject.asObservable();

  // Método para cambiar el estado de visualización del formulario
  toggleMostrarFormulario(): void {
    const currentValue = this.mostrarFormularioSubject.value;
    const newValue = !currentValue;
    // Invertir el valor actual y actualizar en el almacenamiento local
    this.mostrarFormularioSubject.next(newValue);
    localStorage.setItem('mostrarFormulario', newValue.toString());
  }

  // Método para cambiar el estado de autenticación del usuario
  toggleLoginStatus(): void {
    this.isLoggedIn = !this.isLoggedIn;
    // Actualizar el estado en el almacenamiento local
    localStorage.setItem(this.isLoggedInKey, this.isLoggedIn ? 'true' : 'false');
  }

 

  // Método para simular el proceso de cierre de sesión
  // Método para cerrar sesión
  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem(this.isLoggedInKey);
    localStorage.removeItem(this.usuarioidKey);
    localStorage.removeItem(this.estudianteidKey); // Eliminar el ID del estudiante
    localStorage.removeItem(this.rememberMeKey);


    this.toggleMostrarFormulario();
    this.lockButtons();
    this.changeFormVisibility(false);
    this.router.navigate(['/']);
  }
  

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    // Recuperar estado de inicio de sesión del almacenamiento local
    return this.isLoggedIn;
  }


//-----------------------------------------------------------------------
  // LOGICA PRA DESBLOQUEAR LOS BOTONES DE INICIO 

 private botonesInicioKey = 'botonesInicio';
  private botonesInicioSubject = new BehaviorSubject<boolean>(localStorage.getItem(this.botonesInicioKey) === 'true');
  botonesInicio$ = this.botonesInicioSubject.asObservable();

  unlockButtons(): void {
    this.botonesInicioSubject.next(false);
    localStorage.setItem(this.botonesInicioKey, 'false');

  }

  lockButtons(): void {
    this.botonesInicioSubject.next(true);
    localStorage.setItem(this.botonesInicioKey, 'true');

  }

//-----------------------------------------------------------------------
  // LOGICA PRA DESBLOQUEAR LOS BOTONES DE header
  private botonesHeaderKey = 'botonesHeader';
  private botonesHeaderSubject = new BehaviorSubject<boolean>(localStorage.getItem(this.botonesHeaderKey) === 'true');
  botonesHeader$ = this.botonesHeaderSubject.asObservable();

  unlockButtonsH(): void {
    this.botonesInicioSubject.next(false);
    localStorage.setItem(this.botonesHeaderKey, 'false');
  }

  lockButtonsH(): void {
    this.botonesInicioSubject.next(true);
    localStorage.setItem(this.botonesHeaderKey, 'true');
  }

  //LOGICA PARA FORUMALRIO INICIO SESION
  // Clave para almacenar el estado de visibilidad del formulario en el almacenamiento local
private formVisibleKey = 'formVisible';

// BehaviorSubject para el estado de visibilidad del formulario
private formVisibility = new BehaviorSubject<boolean>(
  localStorage.getItem(this.formVisibleKey) === 'true'
);

// Observable para el BehaviorSubject de visibilidad del formulario
currentFormVisibility = this.formVisibility.asObservable();

// Método para cambiar la visibilidad del formulario
changeFormVisibility(isVisible: boolean): void {
  // Actualizar el BehaviorSubject con el nuevo valor de visibilidad
  this.formVisibility.next(isVisible);
  // Guardar el nuevo estado de visibilidad en el almacenamiento local
  localStorage.setItem(this.formVisibleKey, isVisible.toString());
}

//--------------------------------------------------------------------------
//LOGICA PARA EL FORMULARIO DEL HEADER

private estudianteApiUrl = "http://localhost:8080/estudiante/usuario";

private estudianteUpdateUrl = "http://localhost:8080/estudiante"; // URL base para actualización

private studentInfoSubject = new BehaviorSubject<any>(null);
studentInfo$ = this.studentInfoSubject.asObservable();

  
  // Método para obtener la información del estudiante
  getStudentInfo(userId: string): Observable<any> {
    return this.httpClient.get<any>(`${this.estudianteApiUrl}/${userId}`).pipe(

      tap(info => this.studentInfoSubject.next(info)),
      catchError(error => {
        console.error('Error fetching student info', error);
        return of(null);
      })
    );
  }

  // Método para actualizar la información del estudiante
  updateStudentInfo(studentId: number, studentData: any): Observable<any> {
    return this.httpClient.put<any>(`${this.estudianteUpdateUrl}/${studentId}`, studentData).pipe(
      catchError(error => {
        console.error('Error updating student info', error);
        return throwError(error);
      })
    );
  }


  sendRecoveryLink(email: string): Observable<any> {
    const body = {
      correosElectronicos: [email]
    };
    return this.httpClient.post(`${this.API_SERVER}/forgot-password`, body);
  }
  resetPassword(token: string, password: string): Observable<any> {
    return this.httpClient.post(`http://localhost:8080/usuario/reset-password?token=${token}`, { password });
  }
  

}

