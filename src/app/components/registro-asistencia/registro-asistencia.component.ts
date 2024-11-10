import { Component, OnInit } from '@angular/core';
import { RegistroAsistenciasService } from '../../services/registro-asistencias.service';
import { Asistencia, AsistenciaFusionada } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/utils/asistencias.service';

@Component({
  selector: 'app-registro-asistencia',
  templateUrl: './registro-asistencia.component.html',
  styleUrls: ['./registro-asistencia.component.css']
})
export class RegistroAsistenciaComponent implements OnInit {
  asistencias: Asistencia[] = [];
  asistenciasFusionadas: AsistenciaFusionada[] = [];
  asistenciasHoy: AsistenciaFusionada[] = [];
  asistenciasAyer: AsistenciaFusionada[] = [];
  asistenciasSemana: AsistenciaFusionada[] = [];
  asistenciasTodas:AsistenciaFusionada[] = [];
  filtroSeleccionado: string = 'hoy'; // El filtro por defecto es "Hoy"

  asistenciasFiltradas : AsistenciaFusionada[]=[];    // Datos que se mostrarán según el filtro
  tituloTabla = 'Asistencias de Hoy';

  constructor(
    private registroAsistenciasService: RegistroAsistenciasService,
    private asistenciaService: AsistenciasService
  ) {}

  ngOnInit(): void {
    this.obtenerAsistencias();
    this.startPeriodicUpdates();
    this.filtrarAsistencias(); // Filtrar las asistencias cuando se obtienen

  }

  obtenerAsistencias(): void {
    this.registroAsistenciasService.obtenerAsistencias().subscribe(
      (response) => {
        this.asistencias = response.data;
        this.asistenciasFusionadas = this.asistenciaService.getMergedAsistencias(this.asistencias);
        this.filtrarAsistencias(); // Filtrar las asistencias cuando se obtienen
      },
      (error) => console.error('Error al obtener las asistencias:', error)
    );
  }

  // Filtra las asistencias por la fecha seleccionada
  filtrarAsistencias(): void {
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; // Fecha de hoy (YYYY-MM-DD)
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDateString = yesterday.toISOString().split('T')[0]; // Fecha de ayer (YYYY-MM-DD)
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneWeekAgoDateString = oneWeekAgo.toISOString().split('T')[0]; // Fecha de hace una semana (YYYY-MM-DD)
  
    // Filtrar asistencias de hoy
    this.asistenciasHoy = this.asistenciasFusionadas.filter(asistencia => {
      const asistenciaFecha = new Date(asistencia.fecha).toISOString().split('T')[0]; // Solo la fecha (YYYY-MM-DD)
      return asistenciaFecha === todayDateString;
    });
  
    // Filtrar asistencias de ayer
    this.asistenciasAyer = this.asistenciasFusionadas.filter(asistencia => {
      const asistenciaFecha = new Date(asistencia.fecha).toISOString().split('T')[0]; // Solo la fecha (YYYY-MM-DD)
      return asistenciaFecha === yesterdayDateString;
    });
  
    // Filtrar asistencias de la semana
    this.asistenciasSemana = this.asistenciasFusionadas.filter(asistencia => {
      const asistenciaFecha = new Date(asistencia.fecha).toISOString().split('T')[0]; // Solo la fecha (YYYY-MM-DD)
      return asistenciaFecha >= oneWeekAgoDateString && asistenciaFecha <= todayDateString;
    });

    this.asistenciasTodas =this.asistenciasFusionadas
  
    // Aplica el filtro seleccionado por defecto
    this.aplicarFiltro();
  }
  

  // Aplica el filtro según la opción seleccionada
  aplicarFiltro(): void {
    switch (this.filtroSeleccionado) {
      case 'hoy':
        this.asistenciasFiltradas = this.asistenciasHoy;
        break;
      case 'ayer':
        this.asistenciasFiltradas = this.asistenciasAyer;
        break;
      case 'semana':
        this.asistenciasFiltradas = this.asistenciasSemana;
        break;
      case 'todas':
        this.asistenciasFiltradas = this.asistenciasTodas;
        break;

      default:
        this.asistenciasFiltradas = this.asistenciasFusionadas;
        break;
    }
  }

  // Cambia el filtro seleccionado
  cambiarFiltro(filtro: string): void {
    switch(filtro) {
      case 'hoy':
        this.asistenciasFiltradas = this.asistenciasHoy;
        this.tituloTabla = 'Asistencias de Hoy';
        break;
      case 'ayer':
        this.asistenciasFiltradas = this.asistenciasAyer;
        this.tituloTabla = 'Asistencias de Ayer';
        break;
      case 'semana':
        this.asistenciasFiltradas = this.asistenciasSemana;
        this.tituloTabla = 'Asistencias de la Semana';
        break;
      case 'todas':
        this.asistenciasFiltradas = this.asistenciasFusionadas;
        this.tituloTabla = 'Todas las asistencias';
        break;

      default:
        this.asistenciasFiltradas = [];
        this.tituloTabla = 'No hay datos disponibles';
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'PUNTUAL': return '#66FF66';
      case 'TARDE': return '#FF6666';
      case 'TEMPRANO': return '#FFD700';
      default: return '#f0f0f0';
    }
  }

  startPeriodicUpdates(): void {
    setInterval(() => this.obtenerAsistencias(), 10000);
  }
}
