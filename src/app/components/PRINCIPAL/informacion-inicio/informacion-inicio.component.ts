import { Component } from '@angular/core';
import { InformacionInicioService } from '../../../services/informacion-inicio.service'; 
import { Empleado } from '../../../models/asistencia.model';
import { OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-informacion-inicio',
  templateUrl: './informacion-inicio.component.html',
  styleUrls: ['./informacion-inicio.component.css']
})

export class InformacionInicioComponent implements OnInit {
  empleados: Empleado[] = [];  // Lista completa de empleados
  empleadosFiltrados: Empleado[] = [];  // Empleados después de aplicar el filtro
  empleadoSeleccionado: Empleado = {} as Empleado;  // Empleado seleccionado
  empleado: Empleado = {} as Empleado;  // Objeto para el formulario

  modalEstado = false;  // Controla el estado del modal

  mostrarReporte = false;
  pdfUrl: any;  // Cambiar el tipo de la URL a 'any' para usarlo con DomSanitizer

  constructor(
    private informacionInicioService: InformacionInicioService,
    private sanitizer: DomSanitizer  // Inyectar el servicio DomSanitizer
  ) {}

  abrirReporte() {
    this.informacionInicioService.getAllEmployeeAttendancePdf().subscribe(
      (pdfBlob: Blob) => {
        // Convertir el Blob a una URL y marcarla como segura
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);  // Marcar la URL como segura
        this.mostrarReporte = true;
      },
      error => {
        console.error('Error al obtener el PDF', error);
      }
    );
  }

  empleadoActivoStr: string = 'No';     // Propiedad auxiliar para el valor de 'activo'



  // Método que se ejecuta cuando cambia el valor del 'select'
  onActivoChange() {
    // Convierte 'Sí' o 'No' de vuelta a un valor booleano para 'empleado.activo'
    if(this.empleadoActivoStr === 'Sí'){
      this.empleadoSeleccionado.activo = true;

    }else{
      this.empleadoSeleccionado.activo = false;

    }
  }
  
  ngOnInit(): void {
    this.obtenerEmpleados();
  }


  // Método para obtener los empleados desde el servicio
  obtenerEmpleados(): void {
    this.informacionInicioService.obtenerEmpleados().subscribe(
      (response) => {
        if (response.code === '200' && response.data) {
          this.empleados = response.data;  // Asigna los empleados a la variable del componente
          this.empleadosFiltrados = this.empleados; // Actualiza la lista filtrada
        } else {
          console.error('Error al obtener empleados:', response.message);
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }

  // Método para buscar un empleado por nombre
// Método para buscar un empleado por nombre
buscarEmpleado(event?: Event): void {
  // Si el evento está presente (es decir, si se dispara desde el input)
  if (event) {
    const input = event.target as HTMLInputElement; // Hacemos una afirmación de tipo
    const nombre = input.value; // Ahora podemos acceder a "value" sin problemas
    this.buscarPorNombre(nombre);
  } else {
    // Si el evento no está presente, podemos acceder al valor desde el campo de entrada manualmente
    const input = document.getElementById('buscarEmpleado') as HTMLInputElement;
    const nombre = input ? input.value : '';
    this.buscarPorNombre(nombre);
  }
}

// Método auxiliar para realizar la búsqueda
buscarPorNombre(nombre: string): void {
  if (nombre) {
    // Filtramos los empleados que coincidan con el nombre, ignorando mayúsculas/minúsculas
    this.empleadosFiltrados = this.empleados.filter(empleado =>
      empleado.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  } else {
    // Si el campo de búsqueda está vacío, mostramos todos los empleados
    this.empleadosFiltrados = this.empleados;
  }
}

  // Método para llenar el formulario con los datos del empleado seleccionado
  llenarFormulario(): void {
    if (this.empleadoSeleccionado) {
      this.empleado = { ...this.empleadoSeleccionado };  // Copiar los datos al formulario
    }
  }

  // Método para actualizar los datos del empleado
  actualizarEmpleado(): void {
    if (!this.empleadoSeleccionado || !this.empleadoSeleccionado.identificacion) {
      alert('Debe seleccionar un empleado válido.');
      return; // No continuar con la solicitud si la identificación es inválida
    }
  
    // Continuar con la lógica de la actualización si la identificación es válida
    this.informacionInicioService.actualizarEmpleado(this.empleadoSeleccionado).subscribe(
      (response) => {
        if (response.code === '200') {
          alert(response.message);
          if (response.message !== "NO HUBO CAMBIOS") {
            // Solo cerrar el modal si no es "NO HUBO CAMBIOS"
            this.cerrarModal();
          }
        } else {
          console.error('Error al actualizar el empleado:', response.message);
          alert('Error al actualizar el empleado: ' + response.message);
        }
      },
      (error) => {
        console.error('Error en la solicitud de actualización:', error);
        alert('Hubo un error al actualizar el empleado.');
      }
    );
  }
  
  

  // Método para cerrar el modal
  cerrarModal(): void {
    this.modalEstado = false;
  }
}
