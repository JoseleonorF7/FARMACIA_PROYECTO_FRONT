import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // URLs extraídas como variables independientes
  private BASE_URL = 'http://localhost:8080/usuario';
  private LOGIN_URL = `${this.BASE_URL}/login`;
  private FORGOT_PASSWORD_URL = `${this.BASE_URL}/forgot-password`;
  private RESET_PASSWORD_URL = `${this.BASE_URL}/reset-password`;
  private VALIDATE_RECOVERY_CODE_URL = `${this.BASE_URL}/validate-recovery-code`;
  private UPDATE_PASSWORD_URL = `${this.BASE_URL}/update-password`;

  // Claves para almacenamiento local
  private usuarioidKey = 'usuarioid';
  private estudianteidKey = 'estudianteid';
  private rememberMeKey = 'rememberMe';
  private roleKey = 'role';
  private isLoggedInKey = 'isLoggedIn';
  private botonesInicioKey = 'botonesInicio';
  private botonesHeaderKey = 'botonesHeader';
  private formVisibleKey = 'formVisible';

  // Estado inicial
  private isLoggedIn: boolean = localStorage.getItem(this.isLoggedInKey) === 'true';
  private mostrarFormularioSubject = new BehaviorSubject<boolean>(true);
  private botonesInicioSubject = new BehaviorSubject<boolean>(localStorage.getItem(this.botonesInicioKey) === 'true');
  private botonesHeaderSubject = new BehaviorSubject<boolean>(localStorage.getItem(this.botonesHeaderKey) === 'true');
  private formVisibility = new BehaviorSubject<boolean>(
    localStorage.getItem(this.formVisibleKey) === 'true'
  );
  private studentInfoSubject = new BehaviorSubject<any>(null);

  // Observables
  mostrarFormulario$ = this.mostrarFormularioSubject.asObservable();
  botonesInicio$ = this.botonesInicioSubject.asObservable();
  botonesHeader$ = this.botonesHeaderSubject.asObservable();
  currentFormVisibility = this.formVisibility.asObservable();
  studentInfo$ = this.studentInfoSubject.asObservable();

  constructor(private httpClient: HttpClient, private router: Router, private authService: AuthService) {
    const mostrarFormulario = localStorage.getItem('mostrarFormulario');
    if (mostrarFormulario) {
      this.mostrarFormularioSubject.next(mostrarFormulario === 'true');
    }

    const botonesInicio = localStorage.getItem(this.botonesInicioKey);
    if (botonesInicio) {
      this.botonesInicioSubject.next(botonesInicio === 'true');
    }

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

  login(username: string, password: string, rememberMe: boolean): Observable<any> {
    const loginPayload = { username, password };
    return this.httpClient.post<any>(this.LOGIN_URL, loginPayload).pipe(
      map(response => {
        if (response && response.code === '200' && response.message === 'Login exitoso') {
          localStorage.setItem(this.isLoggedInKey, 'true');
          localStorage.setItem(this.rememberMeKey, rememberMe.toString());

          const userId = response.data.id;
          const role = response.data.rol;
          const correoElectronico = response.data.correoElectronico;

          localStorage.setItem(this.usuarioidKey, userId.toString());
          localStorage.setItem(this.roleKey, role);
          localStorage.setItem('correoElectronico', correoElectronico);

          this.authService.notifyLogin();
          return { userId, role, correoElectronico };
        }
        return null;
      }),
      catchError(error => {
        console.error('Login error', error);
        return of(null);
      })
    );
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem(this.isLoggedInKey);
    localStorage.removeItem(this.usuarioidKey);
    localStorage.removeItem(this.estudianteidKey);
    localStorage.removeItem(this.rememberMeKey);

    this.toggleMostrarFormulario();
    this.changeFormVisibility(false);
    this.router.navigate(['/']);
  }

  toggleMostrarFormulario(): void {
    const currentValue = this.mostrarFormularioSubject.value;
    const newValue = !currentValue;
    this.mostrarFormularioSubject.next(newValue);
    localStorage.setItem('mostrarFormulario', newValue.toString());
  }

  toggleLoginStatus(): void {
    this.isLoggedIn = !this.isLoggedIn;
    localStorage.setItem(this.isLoggedInKey, this.isLoggedIn ? 'true' : 'false');
  }

 
  changeFormVisibility(isVisible: boolean): void {
    this.formVisibility.next(isVisible);
    localStorage.setItem(this.formVisibleKey, isVisible.toString());
  }

  getStudentInfo(userId: string): Observable<any> {
    return this.httpClient.get<any>(`${this.BASE_URL}/${userId}`).pipe(
      map(response => response?.data),
      catchError(error => {
        console.error('Error fetching student info', error);
        return of(null);
      })
    );
  }

  sendRecoveryLink(email: string): Observable<any> {
    return this.httpClient.post(this.FORGOT_PASSWORD_URL, { correoElectronico: email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.httpClient.post(`${this.RESET_PASSWORD_URL}?token=${token}`, { password });
  }

  validateRecoveryCode(code: string): Observable<any> {
    return this.httpClient.post(this.VALIDATE_RECOVERY_CODE_URL, { code });
  }

  updatePassword(recoveryCode: string, newPassword: string): Observable<any> {
    const payload = { recoveryCode, newPassword };
    return this.httpClient.put<any>(this.UPDATE_PASSWORD_URL, payload).pipe(
      catchError(error => {
        console.error('Error updating password', error);
        return throwError(error);
      })
    );
  }
}
