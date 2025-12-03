import { EventosAcademicosService } from './../../services/eventos-academicos.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarEventosModalComponent } from 'src/app/modals/editar-eventos-modal/editar-eventos-modal.component';

@Component({
  selector: 'app-registro-eventos-academicos',
  templateUrl: './registro-eventos-academicos.component.html',
  styleUrls: ['./registro-eventos-academicos.component.scss'],
})
export class RegistroEventosAcademicosComponent implements OnInit {
  @Input() tipo: string = '';
  @Input() datos_evento: any = {};

  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = '';
  public idEvento: number = 0;
  public lista_responsables: any[] = [];

  public publico_o: any[] = [
    { value: '1', nombre: 'Estudiantes' },
    { value: '2', nombre: 'Profesores' },
    { value: '3', nombre: 'Público general' },
  ];

  //Para el select
  public programa_educativo: any[] = [
    { value: '1', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: '2', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: '3', viewValue: 'Ingeniería en Tecnologías de la Información' },
  ];
  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private eventosAcademicosService: EventosAcademicosService,
    private maestrosService: MaestrosService,
    private administradoresService: AdministradoresService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerResponsables();
    this.token = this.facadeService.getSessionToken();

    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log('ID de evento', this.idEvento);

      this.eventosAcademicosService.obtenerEventoPorId(this.idEvento).subscribe(
        (response) => {
          this.evento = response;
          if (this.evento.hora_inicio) {
            this.evento.hora_inicio = this.evento.hora_inicio.slice(0, 5); // "01:00:00" -> "01:00"
          }

          if (this.evento.hora_fin) {
            this.evento.hora_fin = this.evento.hora_fin.slice(0, 5); // "07:00:00" -> "07:00"
          }
          if (!this.evento.publico_objetivo) {
            this.evento.publico_objetivo = [];
          }
          const responsableEncontrado = this.lista_responsables.find(
            (item) =>
              `${item.user.first_name} ${item.user.last_name}` ===
              this.evento.responsable
          );

          if (responsableEncontrado) {
            this.evento.responsable = responsableEncontrado.user.id; // ahora es número
          }
          console.log('Evento cargado', this.evento);
        },
        (error) => {
          console.error('Error al cargar el evento', error);
        }
      );
    } else {
      this.evento = this.eventosAcademicosService.esquemaEventos();
      this.evento.tipo = this.tipo;
    }

    console.log('Evento: ', this.evento);
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32 // Espacio
    ) {
      event.preventDefault();
    }
  }

  public soloAlfanumericos(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) && // Letras mayúsculas (A-Z)
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas (a-z)
      !(charCode >= 48 && charCode <= 57) // Números (0-9)
    ) {
      event.preventDefault(); // Bloquea cualquier otro caracter
    }
  }

  public changeFecha(event: any) {
    console.log(event);
    console.log(event.value.toISOString());

    this.evento.fecha = event.value.toISOString().split('T')[0];
    console.log('Fecha: ', this.evento.fecha);
  }

  public checkboxChange(event: any) {
    console.log('Evento: ', event);
    if (event.checked) {
      this.evento.publico_objetivo.push(event.source.value);
    } else {
      console.log(event.source.value);
      this.evento.publico_objetivo.forEach((publico, i) => {
        if (publico == event.source.value) {
          this.evento.publico_objetivo.splice(i, 1);
        }
      });
    }
    console.log('Array publico: ', this.evento);
  }
  public revisarSeleccion(nombre: string) {
    if (this.evento.publico_objetivo) {
      var busqueda = this.evento.publico_objetivo.find(
        (element) => element == nombre
      );
      if (busqueda != undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  public regresar() {
    this.location.back();
  }

  public registrar() {
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.eventosAcademicosService.validarEvento(
      this.evento,
      this.editar
    );
    if (Object.keys(this.errors).length > 0) {
      return false;
    }
    this.eventosAcademicosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert('Evento registrado exitosamente');
        console.log('Registradno evento', response);
        this.router.navigate(['/eventos-academicos']);
      },
      (error) => {
        alert('Error al registrar el Evento');
        console.log('Error al registrar el evento');
      }
    );
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.eventosAcademicosService.validarEvento(
      this.evento,
      this.editar
    );
    if (Object.keys(this.errors).length > 0) {
      console.log('Errores de validación', this.errors);
      return;
    }

    //Abrir modal de advertencia
    const dialogRef = this.dialog.open(EditarEventosModalComponent, {
      data: {
        mensaje: `¿Estás seguro de actualizar el evento "${this.evento.nombre_evento}"?`,
      },
      width: '328px',
      height: '288px',
    });

    //Esperar respuesta del modal
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Resultado modal actualizar:', result);

      if (result?.confirmar) {
        //Si confirma, ahora sí actualizar
        this.eventosAcademicosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            alert('Evento actualizado exitosamente');
            console.log('Evento actualizado', response);
            this.router.navigate(['eventos-academicos']);
          },
          (error) => {
            alert('Error al actualizar Evento');
            console.error('Error al actualizar evento', error);
          }
        );
      } else {
        console.log('Actualización cancelada por el usuario');
      }
    });
  }

  public obtenerResponsables() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (responseAdmins) => {
        this.lista_responsables = responseAdmins;

        this.maestrosService
          .obtenerListaMaestros()
          .subscribe((responseMaestros) => {
            // Unimos las dos listas
            this.lista_responsables =
              this.lista_responsables.concat(responseMaestros);
            this.mapResponsableNombreToId();
          });
      },
      (error) => {
        console.error('Error al obtener responsables', error);
      }
    );
  }
  private mapResponsableNombreToId(): void {
    // Si aún no tengo evento o responsables, no hago nada
    if (
      !this.evento ||
      !this.evento.responsable ||
      !this.lista_responsables ||
      this.lista_responsables.length === 0
    ) {
      return;
    }

    // Solo aplico el parche si responsable es un string (nombre),
    // si ya es número (id), no toco nada
    if (typeof this.evento.responsable !== 'string') {
      return;
    }

    const nombreEvento = (this.evento.responsable as string).trim();

    const responsableEncontrado = this.lista_responsables.find((item) => {
      const nombreCompleto =
        `${item.user.first_name} ${item.user.last_name}`.trim();
      return nombreCompleto === nombreEvento;
    });

    if (responsableEncontrado) {
      // nombre → ID
      this.evento.responsable = responsableEncontrado.user.id;
      console.log('Responsable mapeado a ID:', this.evento.responsable);
    } else {
      console.warn(
        'No se encontró responsable que coincida con',
        this.evento.responsable
      );
    }
  }
}
