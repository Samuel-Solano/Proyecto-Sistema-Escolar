import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent implements OnInit {
  public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_alumnos: any[] = [];

  //Para la tabla
  displayedColumns: string[] = [
    'matricula',
    'nombre',
    'email',
    'fecha_nacimiento',
    'telefono',
    'curp',
    'rfc',
    //'edad',
    //'ocupacion',
    'editar',
    'eliminar',
  ];
  dataSource = new MatTableDataSource<DatosUsuario>(
    this.lista_alumnos as DatosUsuario[]
  );

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log('Token: ', this.token);
    if (this.token == '') {
      this.router.navigate(['/']);
    }
    //Obtener maestros
    this.obtenerAlumnos();
  }

  // Consumimos el servicio para obtener los maestros
  //Obtener maestros
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log('Lista users: ', this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach((usuario) => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log('Alumnos: ', this.lista_alumnos);

          this.dataSource = new MatTableDataSource<DatosUsuario>(
            this.lista_alumnos as DatosUsuario[]
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
        console.error('Error al obtener la lista de alumnos: ', error);
        alert('No se pudo obtener la lista de alumnos');
      }
    );
  }

  public goEditar(idUser: number) {
    const userIdSession = Number(this.facadeService.getUserId());
    if (
      (this.rol === 'alumno' && userIdSession === idUser) ||
      this.rol === 'maestro' ||
      this.rol === 'administrador'
    ) {
      this.router.navigate(['registro-usuarios/alumno/' + idUser]);
    } else {
      alert('No puedes editar a los alumnos siendo un alumno');
      console.log('No puedes editar a los alumnos siendo un alumno');
    }
  }

  public delete(idUser: number) {
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    const userIdSession = Number(this.facadeService.getUserId());
    if (
      this.rol === 'administrador' ||
      this.rol === 'maestro' /*&& userIdSession === idUser*/
    ) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' }, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDelete) {
          console.log('Alumno eliminado');
          alert('Alumno eliminado correctamente.');
          //Recargar página
          window.location.reload();
        } else {
          alert('Alumno no se ha podido eliminar.');
          console.log('No se eliminó el Alumno');
        }
      });
    } else {
      alert('No tienes permisos para eliminar este alumno.');
    }
  }

  public busquedaFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  curp: string;
  telefono: string;
  rfc: string;
  //edad: number;
  //ocupacion: string;
}
