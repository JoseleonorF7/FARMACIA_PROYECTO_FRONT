import { Component, OnInit } from '@angular/core'; 
import { RegistroEmpleadosService } from '../../services/registro-empleados.service';

interface Empleado {
  nombre: string;
  identificacion: string;
  fechaContratacion: string;
  activo: boolean;
  activoStr?: string; // Nueva propiedad para almacenar la selección de "Sí" o "No"
  rol: string;
  huellaDactilar: string;
}

@Component({
  selector: 'app-registro-empleados',
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.css']
})
export class RegistrosComponent implements OnInit {
  empleado: Empleado = { nombre: '', identificacion: '', fechaContratacion: '', activo: false, rol: '', huellaDactilar: '' };
  huellas: string[] = [];

  constructor(private registroService: RegistroEmpleadosService) {}

  ngOnInit(): void {
    this.getHuellas();
  }

  getHuellas(): void {
    this.registroService.getAllHuellas().subscribe((response: any) => {
      this.huellas = response.data; // Ajusta el acceso a la lista de huellas según tu respuesta backend
    });
  }

  onSubmit(): void {
    // Verificar si todos los campos están completos
    if (!this.empleado.nombre || !this.empleado.identificacion || !this.empleado.fechaContratacion || !this.empleado.rol || !this.empleado.huellaDactilar) {
      alert('Por favor, complete todos los campos antes de enviar el formulario.');
      return;
    }
  
    // Convertir activoStr a boolean
    this.empleado.activo = this.empleado.activoStr === 'Sí';
  
    // Enviar al backend
    this.registroService.updateEmpleado(this.empleado.huellaDactilar, this.empleado)
      .subscribe(
        (response) => {
          console.log('Empleado registrado:', response);
          alert(response.message || 'Empleado registrado correctamente');
          
          // Vaciar el formulario después de éxito
          this.resetForm();
        },
        (error) => {
          console.error('Error al actualizar el empleado:', error);
  
          // Mostrar el mensaje de error desde el backend, si está disponible
          if (error.error && error.error.message) {
            alert(error.error.message);
          } else {
            alert('Error desconocido al actualizar el empleado');
          }
        }
      );
  }
  
  // Método para vaciar el formulario
  resetForm(): void {
    // Restablecer las propiedades del objeto empleado a su estado inicial
    this.empleado = {
      nombre: '',
      identificacion: '',
      fechaContratacion: '',
      rol: '',
      huellaDactilar: '',
      activoStr: 'Sí',
      activo: true
    };
  }
  

  onRefresh() {
    this.getHuellas(); // Actualiza la lista al hacer clic en el botón
  }
}
