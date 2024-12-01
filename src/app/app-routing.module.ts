import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/PRINCIPAL/login/login.component';
import { RegistrosComponent } from './components/registros-Empleados/registros.component'; 
import { ReportesComponent } from './components/reportes/reportes.component';
import { GraficasComponent } from './components/graficas/graficas.component';
import { InformacionInicioComponent } from './components/PRINCIPAL/informacion-inicio/informacion-inicio.component';
import { RegistroAsistenciaComponent } from './components/registro-asistencia/registro-asistencia.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'header', component: HeaderComponent, children: [
      { path: 'informacionInicio', component: InformacionInicioComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'registros', component: RegistrosComponent },
      { path: 'graficas', component: GraficasComponent },
      { path: 'registroAsistencia', component: RegistroAsistenciaComponent },
      { path: '', redirectTo: 'informacionInicio', pathMatch: 'full' } // Ruta por defecto cuando entra en /header
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Redirige al login por defecto
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
