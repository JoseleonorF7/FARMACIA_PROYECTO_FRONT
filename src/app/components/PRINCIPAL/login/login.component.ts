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
  step: number = 1;
  formVisible: boolean = false;
  studentInfo: any;
  username: string = "";
  password: string = "";
  rememberMe: boolean = false; // Valor por defecto
  newPassword: string = '';


  recoveryCode: string = ''; // Nuevo campo para el código de recuperación
  showCodeField: boolean = false; // Controla si mostrar el campo del código
  showRecoveryModal: boolean = false;
  validationMessage: string | null = null;

  email: string = '';
  showRecoveryForm: boolean = false;

  isLoading: boolean = false;  // Nueva variable para controlar la carga

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
  login(): void {
    this.isLoading = true;  // Inicia la carga
    this.loginService.login(this.username, this.password, this.rememberMe).subscribe(
      (userData: any) => {  // El servicio devuelve los datos completos del usuario o null
        this.isLoading = false;  // Detiene la carga
  
        if (userData) {  // Si el login fue exitoso
          window.alert('Inicio de sesión exitoso. ¡Bienvenido!');
          this.authService.notifyLogin(); // Notifica el evento de inicio de sesión
  
          // Redirigir según el rol
          if (userData.role === 'admin') {
            this.Router.navigate(['/header/informacionInicio']);
          } else {
            this.Router.navigate(['/header/informacionInicio']);  // Redirección general
          }
        } else {
          window.alert('Credenciales incorrectas. Por favor, intente de nuevo.');
        }
      },
      error => {
        console.log(error);
        this.isLoading = false;  // Detiene la carga en caso de error
        if (error && error.error && error.error.message) {
          this.validationMessage = error.error.message; // Captura el mensaje del backend
        } else {
          this.validationMessage = 'Hubo un problema con el inicio de sesión. Por favor, intente de nuevo en unos minutos.';  // Mensaje predeterminado
        }
      }
    );
  }
  
  

  showForgotPassword(): void {
    this.showRecoveryForm = true;
  }

  showLogin(): void {
    this.showRecoveryForm = false;
  }

   // Método para avanzar al siguiente paso
   nextStep() {
    if (this.step < 3) {
      this.step++;
    }
  }

  // Método para retroceder al paso anterior
  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }
  // Método para abrir el modal
  openRecoveryModal() {
    this.showRecoveryModal = true;
    this.validationMessage = null;
    this.showCodeField = false; // Inicialmente, mostramos solo el formulario de email
    this.step = 1; // Comienza desde el paso 1

  }

  // Método para cerrar el modal
  closeRecoveryModal() {
    this.showRecoveryModal = false;
    this.email = ''; // Limpiar el campo de email
    this.recoveryCode = ''; // Limpiar el código
    this.validationMessage = null;
  }

  // Método para enviar el enlace de recuperación al correo electrónico
  sendRecoveryLink() {
    if (!this.email) {
      alert('Por favor, ingrese su correo electrónico.');
      return;
    }
  
    this.isLoading = true;  // Inicia la carga
  
    this.loginService.sendRecoveryLink(this.email).subscribe(
      response => {
        this.isLoading = false;  // Detiene la carga
        alert('Enlace de recuperación enviado a su correo electrónico.');
  
        this.showCodeField = true; // Ahora mostramos el campo para ingresar el código
        this.nextStep(); // Avanza al siguiente paso después de enviar el enlace
      },
      error => {
        this.isLoading = false;  // Detiene la carga en caso de error
        if (error && error.error && error.error.message) {
          this.validationMessage = error.error.message;  // Mostrar mensaje del backend
        } else {
          this.validationMessage = 'Error al enviar el enlace de recuperación. Por favor, intente de nuevo más tarde.';
        }
      }
    );
  }
  

  // Método para validar el código de recuperación ingresado
  validateCode() {
    if (!this.recoveryCode) {
      alert('Por favor, ingrese el código de recuperación.');
      return;
    }
  
    this.isLoading = true;  // Inicia la carga
  
    this.loginService.validateRecoveryCode(this.recoveryCode).subscribe(
      response => {
        this.isLoading = false;  // Detiene la carga
        alert('Código validado correctamente. Ahora puede restablecer su contraseña.');
        this.nextStep(); // Avanza al siguiente paso después de validar el código
      },
      error => {
        this.isLoading = false;  // Detiene la carga en caso de error
        if (error && error.error && error.error.message) {
          this.validationMessage = error.error.message;  // Mostrar mensaje del backend
        } else {
          this.validationMessage = 'Código inválido. Por favor, intente de nuevo.';
        }
      }
    );
  }
  

  // Enviar la nueva contraseña
  submitNewPassword() {
    if (!this.newPassword) {
      this.validationMessage = 'La contraseña no puede estar vacía';
      return;
    }
  
    this.isLoading = true;  // Inicia la carga
  
    this.loginService.updatePassword(this.recoveryCode, this.newPassword).subscribe(
      (response: any) => {
        this.isLoading = false;  // Detiene la carga
        this.validationMessage = 'Contraseña cambiada exitosamente';
        alert('Contraseña cambiada exitosamente');
  
        this.closeRecoveryModal(); // Cierra el modal después de cambiar la contraseña
      },
      (error: any) => {
        this.isLoading = false;  // Detiene la carga en caso de error
        if (error && error.error && error.error.message) {
          this.validationMessage = error.error.message;  // Mostrar mensaje del backend
        } else {
          this.validationMessage = 'Hubo un error al cambiar la contraseña. Intente nuevamente.';
        }
      }
    );
  }
  



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










