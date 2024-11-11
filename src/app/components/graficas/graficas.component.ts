import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { RegistroAsistenciasService } from '../../services/registro-asistencias.service';
import { AsistenciaFusionada } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/utils/asistencias.service';

Chart.register(...registerables);

@Component({
  selector: 'app-graficas',
  templateUrl: './graficas.component.html',
  styleUrls: ['./graficas.component.css']
})
export class GraficasComponent implements AfterViewInit {
  asistenciasFusionadas: AsistenciaFusionada[] = [];

  constructor(private registroAsistenciasService: RegistroAsistenciasService,
    private asistenciaService: AsistenciasService

  ) { }
  graficaActual: string = 'estadoPorEmpleado';
  empleadoSeleccionado: any = null;
  
  mostrarGrafica(grafica: string) {
    this.graficaActual = grafica;
  }
  
  obtenerEmpleadoDesdeEvento(evento: any): any {
    // Ejemplo de depuración
    console.log('Evento recibido:', evento);
    // Ajusta esta lógica para extraer correctamente el ID del empleado desde el evento
    const empleadoId = evento?.data?.empleadoId; // Ejemplo
    console.log('ID del empleado obtenido:', empleadoId);
    return empleadoId;
  }
  
  onBarClick(evento: any) {
    const empleadoId = this.obtenerEmpleadoDesdeEvento(evento);
    
    if (empleadoId !== undefined) {
      this.empleadoSeleccionado = this.asistenciasFusionadas.find(
        (asistencia) => asistencia.empleado.id === empleadoId
      );
      
      if (!this.empleadoSeleccionado) {
        console.warn('Empleado no encontrado con ID:', empleadoId);
      }
    } else {
      console.error('Error: ID de empleado no válido');
    }
  }
  

  ngAfterViewInit() {
    this.obtenerReportes();
  }

  obtenerReportes(): void {
    this.registroAsistenciasService.obtenerAsistencias().subscribe(data => {
      const asistencias = data.data;

      this.asistenciasFusionadas = this.asistenciaService.getMergedAsistencias(asistencias);

      console.log(this.asistenciasFusionadas)

      this.crearGraficaEstadoPorEmpleado(this.asistenciasFusionadas);
      this.crearGraficasTardanza(this.asistenciasFusionadas);
      this.crearGraficaTardanzasGenerales(this.asistenciasFusionadas);
    });
  }

  crearGraficaEstadoPorEmpleado(asistencias: any): void {
    const ctx = document.getElementById('estadoPorEmpleadoChart') as HTMLCanvasElement;

    // Obtén los empleados únicos
    const empleados = Array.from(new Set(asistencias.map((a: any) => a.empleado.id))) as number[];

    // Definir los estados
    const estados = ['TARDE', 'TEMPRANO', 'PUNTUAL'];

    // Contar las ocurrencias de cada estado para cada empleado
    const datasets = estados.map(estado => ({
      label: estado,
      data: empleados.map((empleadoId: number) => this.obtenerContadorEstadoPorEmpleado(asistencias, empleadoId, estado)),
      backgroundColor: this.obtenerColorEstado(estado),
      borderColor: this.obtenerColorEstado(estado, true),
      borderWidth: 1
    }));

    // Crear gráfico de barras agrupadas
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: empleados.map(id => `Empleado ${id}`),
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Función para contar el número de veces que un empleado tiene un estado determinado
  obtenerContadorEstadoPorEmpleado(asistencias: any[], empleadoId: number, estado: string): number {
    return asistencias.filter(a => a.empleado.id === empleadoId && a.estadoEntrada === estado).length;
  }


  // Función para calcular la tardanza acumulada de entrada de un empleado en horas
  // Función para calcular la tardanza acumulada de entrada de un empleado en minutos
  obtenerTardanzaEntradaPorEmpleado(asistencias: any[], empleadoId: number): number {
    const registrosEmpleado = asistencias.filter(a => a.empleado.id === empleadoId);

    // Sumar solo los minutos de tardanza de entrada
    const minutosAcumuladosEntrada = registrosEmpleado.reduce((acumulado, registro) => {
      const diferenciaEntrada = this.extraerMinutosTardanza(registro.diferenciaTiempoEntrada);
      return acumulado + diferenciaEntrada;
    }, 0);

    // Devolver los minutos acumulados sin convertir a horas
    return minutosAcumuladosEntrada;
  }

  // Función para calcular la tardanza acumulada de salida de un empleado en minutos
  obtenerTardanzaSalidaPorEmpleado(asistencias: any[], empleadoId: number): number {
    const registrosEmpleado = asistencias.filter(a => a.empleado.id === empleadoId);

    // Sumar solo los minutos de tardanza de salida (o temprano en salida)
    const minutosAcumuladosSalida = registrosEmpleado.reduce((acumulado, registro) => {
      const diferenciaSalida = this.extraerMinutosTardanza(registro.diferenciaTiempoSalida);
      return acumulado + diferenciaSalida;
    }, 0);

    // Devolver los minutos acumulados sin convertir a horas
    return minutosAcumuladosSalida;
  }

  // Función para crear los gráficos de tardanza acumulada
  crearGraficasTardanza(asistencias: any): void {
    const ctxEntrada = document.getElementById('tardanzaEntradaChart') as HTMLCanvasElement;
    const ctxSalida = document.getElementById('tardanzaSalidaChart') as HTMLCanvasElement;

    // Obtener los empleados únicos
    const empleados = Array.from(new Set(asistencias.map((a: any) => a.empleado.id))) as number[];

    // Calcular las tardanzas por cada empleado (tanto entrada como salida)
    const tardanzasEntrada = empleados.map((empleadoId: number) =>
      this.obtenerTardanzaEntradaPorEmpleado(asistencias, empleadoId)
    );

    const tardanzasSalida = empleados.map((empleadoId: number) =>
      this.obtenerTardanzaSalidaPorEmpleado(asistencias, empleadoId)
    );

    // Crear gráfico para tardanza de entrada
    new Chart(ctxEntrada, {
      type: 'bar',
      data: {
        labels: empleados.map(id => `Empleado ${id}`),
        datasets: [{
          label: 'Tardanza Entrada (minutos)',  // Tardanza por entrada en minutos
          data: tardanzasEntrada,
          backgroundColor: 'rgba(255, 99, 132, 0.2)', // Color para tardanza
          borderColor: 'rgba(255, 99, 132, 1)',      // Borde rojo
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Crear gráfico para tardanza de salida
    new Chart(ctxSalida, {
      type: 'bar',
      data: {
        labels: empleados.map(id => `Empleado ${id}`),
        datasets: [{
          label: 'Tardanza Salida (minutos)',  // Tardanza por salida en minutos
          data: tardanzasSalida,
          backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color para salida
          borderColor: 'rgba(54, 162, 235, 1)',      // Borde azul
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Función para crear gráfica de tardanzas generales (Tardías, Puntuales, Tempranas)
  crearGraficaTardanzasGenerales(asistencias: any): void {
    const ctx = document.getElementById('tardanzaGeneralChart') as HTMLCanvasElement;

    // Contar las entradas tardías, puntuales y tempranas
    const estados = ['TARDE', 'PUNTUAL', 'TEMPRANO'];
    const counts = estados.map(estado =>
      asistencias.filter((a: any) => a.estadoEntrada === estado).length
    );

    // Crear gráfico de pie (circulante)
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Tardes', 'Puntuales', 'Temprano'],
        datasets: [{
          data: counts,
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }


  obtenerColorEstado(estado: string, border: boolean = false): string {
    switch (estado) {
      case 'TARDE':
        return border ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 99, 132, 0.2)';  // Rojo para Tarde
      case 'TEMPRANO':
        return border ? 'rgba(255, 159, 64, 1)' : 'rgba(255, 159, 64, 0.2)';  // Amarillo para Temprano
      case 'PUNTUAL':
        return border ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 75, 0.2)';  // Verde para Puntual
      default:
        return 'rgba(0, 0, 0, 0.2)';  // Gris por defecto
    }
  }


  extraerMinutosTardanza(diferencia: string): number {
    if (!diferencia || diferencia === 'No disponible') return 0;
    const horas = parseInt(diferencia.split(' ')[2]);
    const minutos = parseInt(diferencia.split(' ')[5]);
    return horas * 60 + minutos;
  }

}
