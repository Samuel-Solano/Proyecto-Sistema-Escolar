import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class EventosAcademicosService {
  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) {}

  public esquemaEventos() {
    return {
      nombre_evento: '',
      tipo_evento: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      lugar: '',
      publico_objetivo: [],
      programa_educativo: [],
      responsable: '',
      descripcion: '',
      cupo: 0,
    };
  }

  public validarEvento(data: any, editar: boolean) {
    console.log('Validando evento... ', data);
    let error: any = {};

    // Validar Nombre
    if (!this.validatorService.required(data['nombre_evento'])) {
      error['nombre_evento'] = 'El nombre es obligatorio.';
    }
    //Nombre del evento
    else if (data['nombre_evento'].length < 3) {
      error['nombre_evento'] = 'El nombre es muy corto.';
    }

    // Validar Tipo de Evento
    if (!this.validatorService.required(data['tipo_evento'])) {
      error['tipo_evento'] = 'Selecciona el tipo de evento.';
    }

    // Validar Fecha
    if (!this.validatorService.required(data['fecha'])) {
      error['fecha'] = 'La fecha es obligatoria.';
    } else {
      const v = data['fecha'];
      const esFechaValida =
        v instanceof Date || (typeof v === 'string' && !isNaN(Date.parse(v)));

      if (!esFechaValida) {
        error['fecha'] = 'La fecha no es válida.';
      } else {
        const fechaIngresada = new Date(v);
        // Ajuste de zona horaria para evitar errores de "un día antes"
        fechaIngresada.setHours(0, 0, 0, 0);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaIngresada < hoy) {
          error['fecha'] =
            'No se pueden seleccionar fechas anteriores al día actual.';
        }
      }
    }

    // Validar Horas
    if (
      this.validatorService.required(data['hora_inicio']) &&
      this.validatorService.required(data['hora_fin'])
    ) {
      const inicio = data['hora_inicio'];
      const fin = data['hora_fin'];
      const fechaBase = '2000-01-01';
      const dateInicio = new Date(`${fechaBase}T${inicio}:00`);
      const dateFin = new Date(`${fechaBase}T${fin}:00`);

      if (dateInicio >= dateFin) {
        error['hora_fin'] =
          'La hora de fin debe ser posterior a la hora de inicio.';
      }
    } else {
      if (!data['hora_inicio']) error['hora_inicio'] = 'Campo requerido';
      if (!data['hora_fin']) error['hora_fin'] = 'Campo requerido';
    }

    // Validar Lugar
    if (!this.validatorService.required(data['lugar'])) {
      error['lugar'] = 'Pon el lugar del evento';
    }

    // Validar Público Objetivo
    if (
      data['publico_objetivo'] == null ||
      !Array.isArray(data['publico_objetivo']) ||
      data['publico_objetivo'].length === 0
    ) {
      error['publico_objetivo'] =
        'Debes seleccionar al menos un público objetivo.';
    }

    // Validar Programa Educativo
    const esParaEstudiantes =
      Array.isArray(data['publico_objetivo']) &&
      data['publico_objetivo'].includes('Estudiantes');
    if (esParaEstudiantes) {
      if (
        !data['programa_educativo'] ||
        data['programa_educativo'].length === 0
      ) {
        error['programa_educativo'] =
          'Al ser para estudiantes, debes elegir el programa educativo.';
      }
    }

    // Validar Responsable (Faltaba esta)
    if (!data['responsable']) {
      error['responsable'] = 'El responsable es obligatorio.';
    }

    return error;
  }

  //Registrar evento
  public registrarEvento(data: any): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(
      `${environment.url_api}/eventos-academicos/`,
      data,
      {
        headers,
      }
    );
  }
  public obtenerListaEventos(): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/total-eventos/`, {
      headers,
    });
  }

  //Eliminar Evento
  public eliminarEvento(idEvento: number): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(
      `${environment.url_api}/eventos-academicos/?id=${idEvento}`,
      { headers }
    );
  }

  public obtenerEventoPorId(idEvento: number) {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log('No se encontró el token del usuario');
    }
    return this.http.get<any>(
      `${environment.url_api}/eventos-academicos/?id=${idEvento}`,
      {
        headers,
      }
    );
  }

  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log('No se encontró el token del usuario');
    }
    return this.http.put<any>(
      `${environment.url_api}/eventos-academicos/`,
      data,
      {
        headers,
      }
    );
  }

  //Obtener total de eventos
  public getTotalEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log('No se encontro el token de usuario');
    }
    return this.http.get<any>(`${environment.url_api}/eventos-totales/`, {
      headers,
    });
  }
}
