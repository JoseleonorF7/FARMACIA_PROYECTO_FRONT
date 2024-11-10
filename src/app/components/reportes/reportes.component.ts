import { Component } from '@angular/core';
import { RegistroAsistenciasService } from '../../services/registro-asistencias.service';
import { AsistenciasService } from '../../services/utils/asistencias.service';
import { Asistencia } from '../../models/asistencia.model';
import { AsistenciaFusionada } from '../../models/asistencia.model';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {
  reportes: any[] = [];
  empleadosFiltrados: any[] = [];
  empleadoSeleccionado: any = null;
  asistenciasFusionadas: AsistenciaFusionada[] = [];
  asistencias: Asistencia[] = [];
  empleados: any[] = [];  // Lista de empleados para llenar el combobox
  selectedEmpleado: any = null; // Empleado seleccionado en el combobox
  searchText: string = ''; // Texto de búsqueda
  isTextboxDisabled: boolean = false; // Para deshabilitar el campo de búsqueda

  constructor(
    private registroAsistenciasService: RegistroAsistenciasService,
    private asistenciaService: AsistenciasService
  ) {}

  ngOnInit(): void {
    this.obtenerReportes();
  }

  obtenerReportes(): void {
    this.registroAsistenciasService.obtenerAsistencias().subscribe(data => {
      const asistencias = data.data;
      console.log('Asistencias obtenidas:', asistencias);

      this.asistenciasFusionadas = this.asistenciaService.getMergedAsistencias(asistencias);

      const asistenciasAgrupadas = this.asistenciasFusionadas.reduce((acc: any, asistencia: any) => {
        const idEmpleado = asistencia.empleado.identificacion;
        if (!acc[idEmpleado]) {
          acc[idEmpleado] = { 
            empleado: asistencia.empleado, 
            asistencias: [] 
          };
        }
        acc[idEmpleado].asistencias.push(asistencia);
        return acc;
      }, {});

      this.reportes = Object.values(asistenciasAgrupadas);
      this.empleadosFiltrados = [...this.reportes];
      this.empleados = this.reportes.map(item => item.empleado);

      console.log("Asistencias agrupadas por empleado:", this.reportes);
    });
  }

  filtrarEmpleados(): void {
    if (!this.searchText) {
      this.empleadosFiltrados = [...this.reportes];
    } else {
      this.empleadosFiltrados = this.reportes.filter(reporte =>
        reporte.empleado.nombre.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
    console.log("Filtrando empleados con texto:", this.searchText);
    console.log("Empleados filtrados:", this.empleadosFiltrados);
  }

  filtrarPorEmpleadoSeleccionado(): void {
    if (this.selectedEmpleado) {
      this.empleadosFiltrados = this.reportes.filter(reporte =>
        reporte.empleado.identificacion === this.selectedEmpleado.identificacion
      );
      console.log("Filtrando por empleado seleccionado:", this.selectedEmpleado);
    } else {
      this.empleadosFiltrados = [...this.reportes];
    }
  }

  buscarEmpleado() {
    this.isTextboxDisabled = !!this.selectedEmpleado;
    if (this.selectedEmpleado) {
      this.filtrarPorEmpleadoSeleccionado();
    } else {
      this.filtrarEmpleados();
    }
  }

  onEmpleadoSeleccionado() {
    this.searchText = '';
    this.isTextboxDisabled = true;
  }

  onEmpleadoDeseleccionado() {
    this.isTextboxDisabled = false;
  }

  abrirModal(reporte: any): void {
    this.empleadoSeleccionado = reporte;
  }

  cerrarModal(): void {
    this.empleadoSeleccionado = null;
  }

  getEstadoFromDiferencia(diferencia: string | null): string {
    if (!diferencia || diferencia === 'No disponible') {
      return 'default';
    }
    const estado = diferencia.split(' ')[0];
    return estado.toUpperCase();
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'PUNTUAL': return '#66FF66';
      case 'TARDE': return '#FF6666';
      case 'TEMPRANO': return '#FFD700';
      default: return '#f0f0f0';
    }
  }

  getEstadoGradient(diferencia: string | null): string {
    const estado = this.getEstadoFromDiferencia(diferencia);
    switch (estado) {
      case 'PUNTUAL':
        return 'linear-gradient(to bottom, #66FF66, #aff7af)';
      case 'TARDE':
        return 'linear-gradient(to bottom, #ff6b6b, #f7c9c9)';
      case 'TEMPRANO':
        return 'linear-gradient(to bottom, #f5e04b, #eee0a7)';
      default:
        return 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)';
    }
  }
}
