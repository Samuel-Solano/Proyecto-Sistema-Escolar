import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosAcademicosService } from 'src/app/services/eventos-academicos.service';
import { EliminarEventosModalComponent } from 'src/app/modals/eliminar-eventos-modal/eliminar-eventos-modal.component';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss'],
})
export class EventosScreenComponent implements OnInit {
  public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_eventos: any[] = [];

  // Para la tabla
  displayedColumns: string[] = [];

  dataSource = new MatTableDataSource<DatosEvento>(
    this.lista_eventos as DatosEvento[]
  );

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    public facadeService: FacadeService,
    public eventosService: EventosAcademicosService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Validar inicio de sesión
    this.token = this.facadeService.getSessionToken();
    console.log('Token: ', this.token);
    if (this.token == '') {
      this.router.navigate(['/']);
    }

    this.displayedColumns = [
      'nombre_evento',
      'tipo_evento',
      'fecha',
      'hora_inicio',
      'hora_fin',
      'lugar',
      'publico_objetivo',
      'programa_educativo',
      'responsable',
    ];

    if (this.rol === 'administrador') {
      this.displayedColumns.push('editar', 'eliminar');
    }

    //Obetner Eventos
    this.obtenerEventos();
  }

  // Consumimos el servicio para obtener los eventos
  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        let eventos = response || [];
        console.log('Lista eventos ', eventos);

        if (this.rol === 'maestro') {
          // Maestro ve eventos para maestros y Público general
          eventos = eventos.filter((evento: any) => {
            const po = Array.isArray(evento.publico_objetivo)
              ? evento.publico_objetivo
              : [];

            return po.includes('Profesores') || po.includes('Público general');
          });
        } else if (this.rol === 'alumno') {
          // Alumno ve eventos para alumnos y Público general
          eventos = eventos.filter((evento: any) => {
            const po = Array.isArray(evento.publico_objetivo)
              ? evento.publico_objetivo
              : [];

            return po.includes('Estudiantes') || po.includes('Público general');
          });
        } else if (this.rol === 'administrador') {
          // Admin ve todo
        } else {
          // Cualquier otro rol vacío por seguridad
          eventos = [];
        }

        this.lista_eventos = eventos;
        console.log('Lista eventos: ', this.lista_eventos);

        if (this.lista_eventos.length > 0) {
          this.dataSource = new MatTableDataSource<DatosEvento>(
            this.lista_eventos as DatosEvento[]
          );

          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          });
        }
      },
      (error) => {
        console.error('Error al obtener la lista de eventos: ', error);
      }
    );
  }

  public goEditar(idEvento: number) {
    // Solo admins pueden editar (según tu PDF)
    if (this.rol === 'administrador') {
      this.router.navigate(['registro-eventos-academicos/' + idEvento]);
    } else {
      alert('No tienes permisos para editar eventos.');
    }
  }

  public delete(idEvento: number) {
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarEventosModalComponent, {
        data: { id: idEvento, rol: 'evento' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDelete) {
          console.log('Evento elimininado exitosamente');
          alert('Evento Eliminado');
          window.location.reload();
        } else {
          alert('El evento no se ha podido eliminar');
        }
      });
    } else {
      alert('NO tienes permisos para elimninar este evento');
    }
  }

  public busquedaFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

// Interfaz al final, igual que en Maestros
export interface DatosEvento {
  id: number;
  nombre_evento: string;
  tipo_evento: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  publico_objetivo: any;
  programa_educativo: any;
  responsable: number;
  descripcion: string;
  cupo: number;
}
