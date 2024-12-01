import { Injectable } from '@angular/core';
import { Asistencia, AsistenciaFusionada } from '../../models/asistencia.model';
@Injectable({
  providedIn: 'root'
})
export class AsistenciasService {
  constructor() { }

  // Método para formatear la hora
  formatHora(hora: string | null): string {
    if (!hora) {
      return 'No disponible';  // Si no hay hora, retorna "No disponible"
    }

    // Primero extraemos la parte de la hora (HH:mm) de la cadena completa
    const [h, m] = hora.split(':').slice(0, 2);  // Tomamos solo las horas y minutos (ignora segundos y milisegundos)

    // Convertimos la hora a un objeto Date en UTC para evitar el cambio de zona horaria
    const date = new Date(`1970-01-01T${h}:${m}:00Z`);  // Forzamos a UTC utilizando el sufijo 'Z'

    let hours = date.getUTCHours();  // Usamos getUTCHours() para obtener la hora en UTC
    const minutes = date.getUTCMinutes();  // Usamos getUTCMinutes() para obtener los minutos en UTC

    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convertimos de 24 horas a 12 horas
    hours = hours % 12;
    if (hours === 0) hours = 12;  // 0 horas se convierte en 12 para el formato de 12 horas

    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

    return formattedTime;
  }


  getMergedAsistencias(asistencias: Asistencia[]): AsistenciaFusionada[] {
    const merged: AsistenciaFusionada[] = [];
    const empleadosFechasProcesados = new Set<string>();

    asistencias.forEach(asistencia => {
      const empleadoFechaId = `${asistencia.empleado.id}-${asistencia.fecha}`;

      if (!empleadosFechasProcesados.has(empleadoFechaId)) {
        empleadosFechasProcesados.add(empleadoFechaId);

        // Filtrar todos los registros del empleado en la misma fecha
        const registrosDelEmpleado = asistencias.filter(a => a.empleado.id === asistencia.empleado.id && a.fecha === asistencia.fecha);

        // Agrupar por tipo de registro (ENTRADA_1, SALIDA_1, etc.)
        const entradas = registrosDelEmpleado.filter(a => a.tipoRegistro.startsWith('ENTRADA'));
        const salidas = registrosDelEmpleado.filter(a => a.tipoRegistro.startsWith('SALIDA'));

        // Combinar cada ENTRADA_x con su respectiva SALIDA_x
        entradas.forEach((entrada, index) => {
          const salida = salidas.find(s => s.tipoRegistro === `SALIDA_${index + 1}`);

          // Formatear las diferencias de tiempo
          const formattedDiferenciaEntrada = entrada?.diferenciaTiempoEntrada === "No disponible" ? null : entrada.diferenciaTiempoEntrada;
          const formattedDiferenciaSalida = salida?.diferenciaTiempoSalida === "No disponible" 
          ? null 
          : salida?.diferenciaTiempoSalida ?? null;
        
          // Crear la asistencia fusionada
          merged.push({
            empleado: entrada.empleado,
            fecha: entrada.fecha,
            horaEntrada: this.formatHora(entrada.horaEntrada),
            horaSalida: salida ? this.formatHora(salida.horaSalida) : null,
            estadoEntrada: entrada.estado,
            estadoSalida: salida ? salida.estado : null,
            tipoRegistro: salida ? 'Entrada y Salida' : 'Entrada',
            diferenciaTiempoEntrada: formattedDiferenciaEntrada,
            diferenciaTiempoSalida: formattedDiferenciaSalida,
          });
        });

        // Procesar salidas sin una entrada correspondiente
        salidas
          .filter(salida => !entradas.some(entrada => entrada.tipoRegistro === `ENTRADA_${salida.tipoRegistro.split('_')[1]}`))
          .forEach(salida => {
            merged.push({
              empleado: salida.empleado,
              fecha: salida.fecha,
              horaEntrada: null,
              horaSalida: this.formatHora(salida.horaSalida),
              estadoEntrada: null,
              estadoSalida: salida.estado,
              tipoRegistro: 'Salida',
              diferenciaTiempoEntrada: null,
              diferenciaTiempoSalida: salida.diferenciaTiempoSalida === "No disponible" ? null : salida.diferenciaTiempoSalida,
            });
          });
      }
    });

    return merged;
  }



}
