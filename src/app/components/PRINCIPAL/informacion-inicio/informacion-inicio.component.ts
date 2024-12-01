import { Component } from '@angular/core';
import { InformacionInicioService } from '../../../services/informacion-inicio.service';
import { Empleado } from '../../../models/asistencia.model';
import { OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { FormsModule } from '@angular/forms'; // Asegúrate de importar FormsModule
import { Subscription } from 'rxjs';



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
  mostrarFechaCompleta = false;
  mostrarEmpleadoSelect = false;
  isLoading: boolean = false;  // Nueva variable para controlar la carga

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
  modalEstado = false;  // Controla el estado del modal

  mostrarReporte = false;
  pdfUrl: any;  // Cambiar el tipo de la URL a 'any' para usarlo con DomSanitizer

  studentInfo: any; // Información del estudiante (o usuario)
  modalVisible = false;

  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  formularioVisible: boolean = false;  // Para mostrar u ocultar el modal
  reporteTipo: string = '';  // Guardará el tipo de reporte seleccionado
  empleadoId: number = 0;  // ID del empleado, si es necesario
  fechaEspecifica: string = '';  // Fecha específica seleccionada para reporte
  mes: number = 0;  // Mes para los reportes mensuales
  anio: number = 0;  // Año para los reportes mensuales
  mesAno: string | null = null; // Mes y año seleccionado (formato YYYY-MM)


  modalAgregarUsuarioVisible: boolean = false;  // Controla la visibilidad del modal

  nuevoUsuario = {
    nombreCompleto: '',
    correoElectronico: '',
    username: '',
    password: '',
    rol: 'usuario'  // Valor por defecto
  };

  // Variables para mostrar mensajes
  mensajeError: string = '';
  mensajeExito: string = '';

  // Variables para almacenar el estado del checkbox y la frecuencia del reporte
  reporteAutomatico: boolean = false;
  frecuenciaReporte: string = 'Seccionar Tipo';  // Puede ser 'mensual' o 'quincenal'
  frecuenciaSeleccionada: boolean = false;  // Para controlar si ya se seleccionó la frecuencia
  tiempoRestante: String = '';  // Tiempo de cuenta regresiva

  private intervalo: any;
  // Método para enviar la información sobre el reporte automático
  ngOnInit(): void {

    // Llamar al método que obtiene el tiempo restante al iniciar el component
    // Iniciar las actualizaciones periódicas cada 30 segundos (30000 ms)
    this.startPeriodicUpdates();

    this.obtenerEmpleados();
    const userId = localStorage.getItem('usuarioId');

    console.log(userId)
    if (userId) {
      this.loginService.getStudentInfo(userId).subscribe(
        (response) => {
          console.log(response)
          // Aquí estamos asignando solo el 'data' del response a la variable studentInfo
          this.studentInfo = response;
        },
        (error) => {
          console.error('Error al obtener la información del estudiante', error);
        }
      );
    }

  }





  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruya
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    if (this.tiempoRestanteSubscription) {
      this.tiempoRestanteSubscription.unsubscribe();
    }
  }


  private tiempoRestanteSubscription: Subscription | null = null;

  // Método para iniciar actualizaciones periódicas
  startPeriodicUpdates(): void {
    this.intervalo = setInterval(() => {
      this.agendarEnvioReporte();
    }, 1000); // Actualiza cada 30 segundos (30000 ms)
  }

  // Cuando cambia el estado del checkbox
  toggleReporteAutomatico() {
    if (!this.reporteAutomatico) {
      // Si el checkbox se deselecciona, cancelar el envío
      this.cancelarEnvioReporte();
    }
  }

  agendarEnvioReporte() {
    console.log(this.reporteAutomatico && this.frecuenciaReporte);
    console.log(this.frecuenciaReporte);
    if (this.reporteAutomatico && this.frecuenciaReporte) {

      this.informacionInicioService.activarReporteAutomatico(this.frecuenciaReporte).subscribe(
        (response) => {
          console.log('Respuesta:', response);
          if (response.status === 'success') {
            this.tiempoRestante = response.tiempoRestante;
          } else {
            console.error(response.message);
            this.tiempoRestante = "";
          }
        },
        (error) => {
          console.error('Error al programar el reporte:', error);
          this.tiempoRestante = "";
        }
      );
    }
  }

  // Cancelar el envío del reporte
  cancelarEnvioReporte() {
    this.tiempoRestante = ''; // Ocultar el mensaje del tiempo restante
    this.informacionInicioService.cancelarEnvioReporte().subscribe(
      (response: any) => {
        console.log('Reporte cancelado:', response);
      },
      (error: any) => {
        console.error('Error al cancelar el reporte:', error);
      }
    );
  }


  // Método para obtener el rol desde localStorage
  getRole(): string {
    return localStorage.getItem('role') || '';  // Devuelve el rol almacenado o una cadena vacía si no existe
  }

  // Función para abrir el modal de agregar usuario
  // Método para mostrar el modal
  abrirModalAgregarUsuario() {
    this.modalAgregarUsuarioVisible = true;
    this.mensajeError = '';  // Limpiar mensaje de error
    this.mensajeExito = '';  // Limpiar mensaje de éxito
  }

  // Método para cerrar el modal
  cerrarModalAgregarUsuario() {
    this.modalAgregarUsuarioVisible = false;
    this.mensajeError = '';  // Limpiar mensaje de error
    this.mensajeExito = '';  // Limpiar mensaje de éxito
  }
  // Función para agregar un nuevo usuario (enviar datos al backend)
  // Método para agregar usuario
  agregarUsuario(form: any) {
    this.informacionInicioService.agregarUsuario(this.nuevoUsuario).subscribe(
      (response: any) => {
        console.log('Usuario agregado exitosamente', response);
        // Aquí puedes agregar una alerta o un mensaje visual
        this.mensajeExito = response.messaje;

        alert(this.mensajeExito); // Para mostrar la alerta
        // Vaciar el formulario
        form.reset();
        this.cerrarModalAgregarUsuario();  // Cerrar el modal después de agregar el usuario


      },
      (error: any) => {
        console.log(error)
        console.error('Error al agregar el usuario', error);

        // Manejar el error basándonos en la respuesta del backend
        if (error.status === 400 && error.error) {
          // Si hay un código de error 400 y una respuesta con error
          this.mensajeError = error.error.message || 'Hubo un error al agregar el usuario. Por favor, intente nuevamente.';
        } else {
          this.mensajeError = 'Hubo un error al agregar el usuario. Por favor, intente nuevamente.';
        }

      }
    );
  }

  constructor(
    private informacionInicioService: InformacionInicioService,
    private sanitizer: DomSanitizer, // Inyectar el servicio DomSanitizer
    private router: Router,
    public loginService: LoginService
  ) { }

  abrirReporte() {
    const reporteTipo = (document.getElementById("reporteTipo") as HTMLSelectElement).value;
    const fechaEspecifica = (document.getElementById("fechaEspecifica") as HTMLInputElement)?.value || null;
    const mesAno = (document.getElementById("mesAno") as HTMLInputElement)?.value || null;
    const empleadoSeleccionado = this.empleadoSeleccionado; // Asegúrate de que este valor esté enlazado con [(ngModel)]

    console.log("Tipo de reporte seleccionado:", reporteTipo);
    console.log("Fecha específica ingresada:", fechaEspecifica);
    console.log("Mes y año ingresados:", mesAno);
    console.log("Empleado seleccionado:", empleadoSeleccionado);

    // Validar que se haya seleccionado un tipo de reporte
    if (!reporteTipo) {
      alert('Por favor selecciona un tipo de reporte.');
      console.error("Error: Tipo de reporte no seleccionado.");
      return;
    }

    let fecha: Date | null = null;


    
    // Validar mes y año para reportes que lo necesiten
const [ano, mes] = (mesAno ?? "").split("-");
      console.log("Año ingresado:", ano, "Mes ingresado:", mes);

      // Convert to numbers
      const mesNum = Number(mes);
      const anoNum = Number(ano);

      console.log("Mes como string:", mesNum, "Año como string:", anoNum);
      // Handle each report type
      switch (reporteTipo) {
        case 'empleadosTodos':
          if (mes === undefined || ano === undefined) {
            alert('Mes y año no válidos para el reporte.');
            console.error("Error: Mes o año no válidos.");
            return;
          }
          console.log("Generando reporte para todos los empleados.");
          this.isLoading = true;
          this.informacionInicioService.getReporteMensualPdf(mesNum, anoNum).subscribe(
            (pdfBlob: Blob) => this.generarPdf(pdfBlob),
            (error) => this.manejarError(error)
          );
          this.isLoading = false;
          break;

        case 'empleadoIndividual':
          if (!empleadoSeleccionado) {
            alert('Por favor selecciona un empleado válido.');
            console.error("Error: Empleado no seleccionado.");
            return;
          }
          if (mes === undefined || ano === undefined) {
            alert('Mes y año no válidos para el reporte.');
            console.error("Error: Mes o año no válidos.");
            return;
          }
          console.log("Generando reporte para empleado individual.", empleadoSeleccionado);
          this.isLoading = true;
          this.informacionInicioService.getReporteEmpleadoPdf(empleadoSeleccionado.id, mesNum, anoNum).subscribe(
            (pdfBlob: Blob) => this.generarPdf(pdfBlob),
            (error) => this.manejarError(error)
          );
          this.isLoading = false;
          break;

        case 'empleadoFecha':
          if (!empleadoSeleccionado || !fechaEspecifica) {
            alert('Por favor selecciona un empleado y una fecha válida.');
            console.error("Error: Empleado o fecha no válidos.");
            return;
          }
          console.log("Generando reporte para empleado con fecha específica.", empleadoSeleccionado, fechaEspecifica);
          this.isLoading = true;
          this.informacionInicioService.getReporteEmpleadoUnicoPdf(empleadoSeleccionado.id, new Date(fechaEspecifica)).subscribe(
            (pdfBlob: Blob) => this.generarPdf(pdfBlob),
            (error) => this.manejarError(error)
          );
          this.isLoading = false;
          break;

        case 'comparativoAsistencia':
          if (mes === undefined || ano === undefined) {
            alert('Mes y año no válidos para el reporte.');
            console.error("Error: Mes o año no válidos.");
            return;
          }
          console.log("Generando reporte comparativo de asistencia.");
          this.isLoading = true;
          this.informacionInicioService.getComparativoAsistenciaPdf(mesNum, anoNum).subscribe(
            (pdfBlob: Blob) => this.generarPdf(pdfBlob),
            (error) => this.manejarError(error)
          );
          this.isLoading = false;
          break;

        default:
          alert('Tipo de reporte no válido.');
          console.error("Error: Tipo de reporte no reconocido.");
          break;

      }
    

  }



  // Función para manejar los errores
  // Función para manejar los errores
  manejarError(error: any) {
    console.error('Error detectado:', error); // Registrar el error en consola

    if (error.error instanceof Blob) {
      // Si el error es un Blob, leer su contenido
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorResponse = JSON.parse(reader.result as string); // Parsear el contenido JSON
          if (errorResponse?.message) {
            alert(`Error al generar el reporte: ${errorResponse.message}`);
          } else {
            alert('Error desconocido: No se pudo obtener el mensaje del backend.');
          }
        } catch (e) {
          alert('Error desconocido: No se pudo interpretar el mensaje del backend.');
        }
      };
      reader.readAsText(error.error); // Leer el Blob como texto
    } else if (error?.message) {
      // Manejo genérico para errores que no son Blob
      alert(`Error desconocido: ${error.message}`);
    } else {
      // Caso de error completamente inesperado
      alert('Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.');
    }
  }



  // Método para generar el PDF y descargarlo


  // Método auxiliar para obtener el ID del empleado seleccionado
  obtenerEmpleadoSeleccionado(): number | null {
    const empleadoSelect = document.getElementById("empleadoId") as HTMLSelectElement;
    if (empleadoSelect && empleadoSelect.value) {
      return parseInt(empleadoSelect.value, 10);
    }
    return null;
  }


  // Función para mostrar el PDF
  generarPdf(pdfBlob: Blob) {
    const pdfUrl = URL.createObjectURL(pdfBlob);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    this.mostrarReporte = true;
  }

  empleadoActivoStr: string = 'No';     // Propiedad auxiliar para el valor de 'activo'


  // Función para alternar la visibilidad del modal
  toggleFormularioReporte() {
    this.formularioVisible = !this.formularioVisible;
  }

  // Método que se ejecuta cuando cambia el valor del 'select'
  onActivoChange() {
    // Convierte 'Sí' o 'No' de vuelta a un valor booleano para 'empleado.activo'
    if (this.empleadoActivoStr === 'Sí') {
      this.empleadoSeleccionado.activo = true;

    } else {
      this.empleadoSeleccionado.activo = false;

    }
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
      console.log(this.empleadoSeleccionado)
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


  logout(): void {
    this.loginService.logout();


  }

  // Abrir el modal y establecer el ID del usuario
  abrirModalActualizarContra() {

    this.modalVisible = true;
  }


  actualizarContrasena() {
    const userId = localStorage.getItem('usuarioid');

    if (!userId) {
      alert('Error: No se encontró el ID del usuario.');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden. Por favor, inténtelo de nuevo.');
      return;
    }

    // Llamar al servicio para actualizar la contraseña
    this.informacionInicioService
      .actualizarContrasena(parseInt(userId, 10), this.nuevaContrasena)
      .subscribe(
        (response) => {
          alert('Contraseña actualizada con éxito.');
          this.cerrarModalActualizarContra();
        },
        (error) => {
          console.error('Error al actualizar la contraseña:', error);
          alert('Hubo un error al actualizar la contraseña. Por favor, inténtelo más tarde.');
        }
      );
  }

  cerrarModalActualizarContra() {
    this.modalVisible = false;
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
  }


  // Método para descargar el reporte en formato PDF
  descargarReporte(pdf: any) {
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte.pdf';  // Puedes personalizar el nombre del archivo
    a.click();
  }

  // Esta función se llama cuando cambia la selección del tipo de reporte
  onTipoReporteChange() {
    const reporteTipo = (document.getElementById("reporteTipo") as HTMLSelectElement).value;

    // Dependiendo del tipo de reporte seleccionado, ajustamos los campos visibles
    switch (reporteTipo) {
      case 'empleadosTodos':
      case 'comparativoAsistencia':
        this.mostrarFechaCompleta = false;
        this.mostrarEmpleadoSelect = false;
        break;
      case 'empleadoIndividual':
      case 'empleadoFecha':
        this.mostrarFechaCompleta = reporteTipo === 'empleadoFecha'; // Fecha completa solo si es "Empleado (Fecha Específica)"
        this.mostrarEmpleadoSelect = true;
        break;
    }
  }
}



