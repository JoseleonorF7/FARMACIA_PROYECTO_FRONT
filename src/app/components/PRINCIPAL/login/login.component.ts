import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { AuthService } from '../../../services/auth.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {

  formVisible: boolean = false;
  studentInfo: any;
  username: string = "";
  password: string = "";
  rememberMe: boolean = false; // Valor por defecto

  email: string = '';
  showRecoveryForm: boolean = false;

  constructor(public loginService: LoginService, private authService: AuthService, private Router: Router) { }

  ngOnInit(): void {
    this.loginService.currentFormVisibility.subscribe(isVisible => {
      this.formVisible = isVisible;
    });

    // Suscripción a los cambios en la información del estudiante
    this.loginService.studentInfo$.subscribe(info => {

      this.studentInfo = info;
      
    });

    const userId = localStorage.getItem('usuarioid');
   
    if (userId) {
      this.loginService.getStudentInfo(userId).subscribe();
    }


  }
  showRecoveryModal: boolean = false;
  validationMessage: string | null = null;

  // Método para abrir el modal
  openRecoveryModal() {
    this.showRecoveryModal = true;
    this.validationMessage = null; // Limpiar mensajes anteriores
  }

  // Método para cerrar el modal
  closeRecoveryModal() {
    this.showRecoveryModal = false;
    this.email = ''; // Limpiar el campo de email
    this.validationMessage = null; // Limpiar mensajes anteriores
  }
  login(): void {
    this.loginService.login(this.username, this.password, this.rememberMe).subscribe(
      success => {
        if (success) {
          window.alert('Inicio de sesión exitoso. ¡Bienvenido!');

          this.authService.notifyLogin(); // Notifica el evento de inicio de sesión

          // Redirecciona o recarga la página después de un breve retraso para asegurar que los cambios se reflejen
          setTimeout(() => {
            window.location.reload();
          }, 500); // Ajusta el tiempo si es necesario

        } else {
          window.alert('Credenciales incorrectas. Por favor, intente de nuevo.');
        }
      },
      error => {
        window.alert('Hubo un problema con el inicio de sesión. Por favor, intente de nuevo más tarde.');
      }
    );
  }


  showForgotPassword(): void {
    this.showRecoveryForm = true;
  }

  showLogin(): void {
    this.showRecoveryForm = false;
  }

  sendRecoveryLink(): void {
    if (!this.email) {
      alert('Por favor, ingrese su correo electrónico.');
      return;
    }

    this.loginService.sendRecoveryLink(this.email).subscribe(
      response => {
        alert('Enlace de recuperación enviado a su correo electrónico.');

        this.showLogin(); // Método para mostrar el formulario de inicio de sesión o redirigir
      },
      error => {
        alert('Error al enviar el enlsace de recuperación. Por favor, intente de nuevo más tarde.');
      }
    );
  }
  // Método para mostrar alertas estilizadas


  logout(): void {
    this.loginService.logout();
    this.username = '';
    this.password = '';

  }


  passwordFieldType: string = 'password'; // Default is to hide the password



  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

}










