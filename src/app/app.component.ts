import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Pharmacy_project';

  usuarioLogueado: boolean;

  constructor() {
    // Verificar si el usuario está logueado con base en algún valor, como en el localStorage
    this.usuarioLogueado = !!localStorage.getItem('usuario');
  }
}
