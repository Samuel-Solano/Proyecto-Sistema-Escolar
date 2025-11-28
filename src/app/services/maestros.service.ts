import { HttpHeaders, HttpClient } from '@angular/common/http';
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
export class MaestrosService {
  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) {}

  public esquemaMaestro() {
    return {
      rol: '',
      id_trabajador: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmar_password: '',
      fecha_nacimiento: '',
      telefono: '',
      rfc: '',
      cubiculo: '',
      area_investigacion: '',
      materias_json: [],
    };
  }

  //Validación para el formulario
  public validarMaestro(data: any, editar: boolean) {
    console.log('Validando maestro... ', data);
    let error: any = [];

    if (!this.validatorService.required(data['id_trabajador'])) {
      error['id_trabajador'] = this.errorService.required;
    } else if (data['id_trabajador'].length !== 9) {
      error['id_trabajador'] = 'El id debe de tener 9 digitos.';
    }

    if (!this.validatorService.required(data['first_name'])) {
      error['first_name'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['last_name'])) {
      error['last_name'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['email'])) {
      error['email'] = this.errorService.required;
    } else if (!this.validatorService.max(data['email'], 40)) {
      error['email'] = this.errorService.max(40);
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if (!editar) {
      if (!this.validatorService.required(data['password'])) {
        error['password'] = this.errorService.required;
      } else if (!this.validatorService.min(data['password'], 8)) {
        error['password'] = this.errorService.min(8); // longitud mínima
      }

      if (!this.validatorService.required(data['confirmar_password'])) {
        error['confirmar_password'] = this.errorService.required;
      } else if (data['password'] !== data['confirmar_password']) {
        error['confirmar_password'] = 'Las contraseñas no coinciden';
      }
    }

    if (this.validatorService.required(data['fecha_nacimiento'])) {
      const v = data['fecha_nacimiento'];
      const esValida =
        v instanceof Date ||
        (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v));
      if (!esValida) {
        error['fecha_nacimiento'] = 'Formato de fecha inválido (YYYY-MM-DD)';
      }
    }

    if (!this.validatorService.required(data['rfc'])) {
      error['rfc'] = this.errorService.required;
    } else if (!this.validatorService.min(data['rfc'], 12)) {
      error['rfc'] = this.errorService.min(12);
      alert('La longitud de caracteres deL RFC es menor, deben ser 12');
    } else if (!this.validatorService.max(data['rfc'], 13)) {
      error['rfc'] = this.errorService.max(13);
      alert('La longitud de caracteres deL RFC es mayor, deben ser 13');
    }

    if (!this.validatorService.required(data['telefono'])) {
      error['telefono'] = this.errorService.required;
    }

    // cubiculo
    if (this.validatorService.required(data['cubiculo'])) {
      if (!this.validatorService.min(data['cubiculo'], 1)) {
        error['cubiculo'] = this.errorService.required; // no vacío
        error['cubiculo'] = 'Debe de tener un cubiculo asignado.';
      } else if (!this.validatorService.max(data['cubiculo'], 255)) {
        error['cubiculo'] = this.errorService.max(255);
      }
    }

    // area_investigacion
    if (this.validatorService.required(data['area_investigacion'])) {
      if (!this.validatorService.min(data['area_investigacion'], 1)) {
        error['area_investigacion'] = this.errorService.required;
      }
    }

    if (
      data['materias_json'] == null ||
      !Array.isArray(data['materias_json']) ||
      data['materias_json'].length === 0
    ) {
      error['materias_json'] = 'Debes seleccionar al menos una materia';
    }

    //Return arreglo
    return error;
  }

  //Aquí van los servicios HTTP
  //Servicio para registrar un nuevo usuario
  public registrarMaestro(data: any): Observable<any> {
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
    return this.http.post<any>(`${environment.url_api}/maestros/`, data, {
      headers,
    });
  }

  //Servicio para obtener la lista de maestros
  public obtenerListaMaestros(): Observable<any> {
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
    return this.http.get<any>(`${environment.url_api}/lista-maestros/`, {
      headers,
    });
  }

  //Servicio para eliminar un maestro
  public eliminarMaestro(idMaestro: number): Observable<any> {
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
      `${environment.url_api}/maestros/?id=${idMaestro}`,
      { headers }
    );
  }

  public obtenerMaestroPorID(idMaestro: number): Observable<any> {
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
      `${environment.url_api}/maestros/?id=${idMaestro}`,
      {
        headers,
      }
    );
  }

  public actualizarMaestro(data: any): Observable<any> {
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
    return this.http.put<any>(`${environment.url_api}/maestros/`, data, {
      headers,
    });
  }
}
