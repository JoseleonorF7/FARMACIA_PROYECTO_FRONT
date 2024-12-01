import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  selectedNavItem: string = "";
  botonesHeader: boolean =true;

  constructor(private router: Router) {}

  ngOnInit(): void {

    //para mantener la ruta actual después de recargar la página
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.selectedNavItem = event.urlAfterRedirects.split('/')[1]; // Obtener la ruta actual después de las redirecciones
      }
    });

  }
  // Método para obtener el rol desde localStorage
  getRole(): string {
    return localStorage.getItem('role') || '';  // Devuelve el rol almacenado o una cadena vacía si no existe
  }
    selectNavItem(navItem: string): void {
        this.selectedNavItem = navItem;
    }
  

}
