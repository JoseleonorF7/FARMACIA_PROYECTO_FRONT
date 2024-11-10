import { Injectable } from '@angular/core';
import { Asistencia,AsistenciaFusionada } from '../../models/asistencia.model';
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


 // Método para fusionar las asistencias por empleado y fecha
 getMergedAsistencias(asistencias: Asistencia[]): AsistenciaFusionada[] {
  const merged: AsistenciaFusionada[] = [];
  const empleadosIds = new Set();
  
  asistencias.forEach(asistencia => {
    // Verificamos si el empleado y la fecha ya fueron procesados
    const empleadoFechaId = `${asistencia.empleado.id}-${asistencia.fecha}`;

    if (!empleadosIds.has(empleadoFechaId)) {
      empleadosIds.add(empleadoFechaId); // Añadimos la combinación de empleado + fecha para evitar duplicados

      const registrosDelEmpleado = asistencias.filter(a => a.empleado.id === asistencia.empleado.id && a.fecha === asistencia.fecha);
  
      const entrada = registrosDelEmpleado.find(a => a.tipoRegistro === 'ENTRADA');
      const salida = registrosDelEmpleado.find(a => a.tipoRegistro === 'SALIDA');
  
      const diferenciaEntrada = entrada ? entrada.diferenciaTiempoEntrada : "No disponible";
      const diferenciaSalida = salida ? salida.diferenciaTiempoSalida : "No disponible";

      // Reemplazar "No disponible" por valor null o un valor predeterminado
      const formattedDiferenciaEntrada = diferenciaEntrada === "No disponible" ? null : diferenciaEntrada;
      const formattedDiferenciaSalida = diferenciaSalida === "No disponible" ? null : diferenciaSalida;

      if (entrada && !salida) {
        merged.push({
          empleado: entrada.empleado,
          fecha: entrada.fecha,
          horaEntrada: this.formatHora(entrada.horaEntrada),
          horaSalida: null,
          estadoEntrada: entrada.estado,
          estadoSalida: null,
          tipoRegistro: 'Entrada',
          diferenciaTiempoEntrada: formattedDiferenciaEntrada,
          diferenciaTiempoSalida: null
        });
      } else if (!entrada && salida) {
        merged.push({
          empleado: salida.empleado,
          fecha: salida.fecha,
          horaEntrada: null,
          horaSalida: this.formatHora(salida.horaSalida),
          estadoEntrada: null,
          estadoSalida: salida.estado,
          tipoRegistro: 'Salida',
          diferenciaTiempoEntrada: null,
          diferenciaTiempoSalida: formattedDiferenciaSalida
        });
      } else if (entrada && salida) {
        merged.push({
          empleado: entrada.empleado,
          fecha: entrada.fecha,
          horaEntrada: this.formatHora(entrada.horaEntrada),
          horaSalida: this.formatHora(salida.horaSalida),
          estadoEntrada: entrada.estado,
          estadoSalida: salida.estado,
          tipoRegistro: 'Entrada y Salida',
          diferenciaTiempoEntrada: formattedDiferenciaEntrada,
          diferenciaTiempoSalida: formattedDiferenciaSalida
        });
      }
    }
  });

  return merged;
}


}
