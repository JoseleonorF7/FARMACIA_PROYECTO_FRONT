import { Component, OnInit } from '@angular/core';
import { RegistroEmpleadosService } from '../../services/registro-empleados.service';

interface Empleado {
  nombre: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  identificacion: string;
  fechaContratacion: string;
  horarioSeleccionado: string; // ID del horario seleccionado como string
  activo: boolean;
  activoStr?: string; // Nueva propiedad para seleccionar entre "Sí" o "No"
  rol: string;
  huellaDactilar: string;
  horario: {
    id: number | null; // Representa el horario enviado al backend
  };
}

@Component({
  selector: 'app-registro-empleados',
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.css']
})
export class RegistrosComponent implements OnInit {
  empleado: Empleado = {
    nombre: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    identificacion: '',
    fechaContratacion: '',
    horarioSeleccionado: '', // Este será el ID del horario seleccionado
    activo: true,
    activoStr: 'Sí', // Default en "Sí"
    rol: '',
    huellaDactilar: '',
    horario: {
      id: null
    }
  };

  huellas: string[] = [];

  horarios = [
    {
      nombre: 'Horario 1',
      detalle: '7:00 AM - 1:00 PM y 5:30 PM - 9:30 PM',
      id: 1
    },
    {
      nombre: 'Horario 2',
      detalle: '1:00 PM - 9:30 PM',
      id: 2
    }
  ];

  fechaMaxima: string = '';

  constructor(private registroService: RegistroEmpleadosService) { }

  ngOnInit(): void {
    this.getHuellas();

    const hoy = new Date();
    this.fechaMaxima = hoy.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
  }

  getHuellas(): void {
    this.registroService.getAllHuellas().subscribe((response: any) => {
      this.huellas = response.data; // Ajusta el acceso a la lista de huellas según tu respuesta del backend
    });
  }

  onSubmit(): void {
    // Validar si todos los campos están completos
    if (
      !this.empleado.primerNombre ||
      !this.empleado.primerApellido ||
      !this.empleado.identificacion ||
      !this.empleado.fechaContratacion ||
      !this.empleado.rol ||
      !this.empleado.huellaDactilar ||
      !this.empleado.horarioSeleccionado
    ) {
      alert('Por favor, complete todos los campos antes de enviar el formulario.');
      return;
    }
  
    // Validar que la identificación sea válida
    if (!/^\d+$/.test(this.empleado.identificacion)) {
      alert('La identificación debe contener solo números.');
      return;
    }
  
    // Validar la fecha de contratación
    const hoy = new Date();
    const fechaContratacion = new Date(this.empleado.fechaContratacion);

    console.log(hoy)
    console.log(fechaContratacion)
    if (fechaContratacion > hoy) {
      alert('La fecha de contratación no puede ser futura.');
      return;
    }
    const limiteAntiguo = new Date(hoy.getFullYear() - 50, hoy.getMonth(), hoy.getDate());
    if (fechaContratacion < limiteAntiguo) {
      alert('La fecha de contratación no puede ser anterior a 50 años.');
      return;
    }
  
  
    // Unir los nombres en un solo atributo
    this.empleado.nombre = `${this.empleado.primerNombre} ${this.empleado.segundoNombre || ''} ${this.empleado.primerApellido} ${this.empleado.segundoApellido || ''}`.trim();
  
    // Convertir activoStr a boolean
    this.empleado.activo = this.empleado.activoStr === 'Sí';
  
    // Añadir el horario seleccionado
    this.empleado.horario = {
      id: Number(this.empleado.horarioSeleccionado) // Convertir a número para enviar al backend
    };
  
    console.log(this.empleado);
    console.log(this.empleado.horario);
  
    // Enviar al backend
    this.registroService.updateEmpleado(this.empleado.huellaDactilar, this.empleado)
      .subscribe(
        (response) => {
          console.log('Empleado registrado:', response);
          alert(response.message || 'Empleado registrado correctamente');
  
          // Vaciar el formulario después de éxito
          this.resetForm();
          this.onRefresh();
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
    this.empleado = {
      nombre: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      identificacion: '',
      fechaContratacion: '',
      horarioSeleccionado: '',
      activoStr: 'Sí',
      activo: true,
      rol: '',
      huellaDactilar: '',
      horario: {
        id: null
      }
    };
  }
  

  onRefresh(): void {
    this.getHuellas(); // Actualiza la lista de huellas
  }
}
