import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

//Estas son variables para las cookies
const session_cookie_name = 'dev-sistema-escolar-token';
const user_email_cookie_name = 'dev-sistema-escolar-email';
const user_id_cookie_name = 'dev-sistema-escolar-user_id';
const user_complete_name_cookie_name = 'dev-sistema-escolar-user_complete_name';
const group_name_cookie_name = 'dev-sistema-escolar-group_name';
const codigo_cookie_name = 'dev-sistema-escolar-codigo';
const COOKIE_PATH = '/';
@Injectable({
  providedIn: 'root',
})
export class FacadeService {
  constructor(
    private http: HttpClient,
    public router: Router,
    private cookieService: CookieService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) {}

  //Funcion para validar login
  public validarLogin(username: String, password: String) {
    let data = {
      username: username,
      password: password,
    };
    console.log('Valindando login con datos: ', data);
    let error: any = {};

    if (!this.validatorService.required(data['username'])) {
      error['username'] = this.errorService.required;
    } else if (!this.validatorService.max(data['username'], 40)) {
      error['username'] = this.errorService.max(40);
    } else if (!this.validatorService.email(data['username'])) {
      error['username'] = this.errorService.email;
    }

    if (!this.validatorService.required(data['password'])) {
      error['password'] = this.errorService.required;
    }

    return error;
  }

  // Funciones básicas
  //Iniciar sesión
  public login(username: String, password: String): Observable<any> {
    let data = {
      username: username,
      password: password,
    };
    return this.http.post<any>(`${environment.url_api}/login/`, data);
  }

  //Cerrar sesión
  public logout(): Observable<any> {
    let headers: any;
    let token = this.getSessionToken();
    headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    });
    return this.http.get<any>(`${environment.url_api}/logout/`, {
      headers: headers,
    });
  }

  // Funciones para utilizar las cookies en web
  retrieveSignedUser() {
    var headers: any;
    var token = this.getSessionToken();
    headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/me/`, {
      headers: headers,
    });
  }

  getCookieValue(key: string) {
    return this.cookieService.get(key);
  }

  saveCookieValue(key: string, value: string) {
    var secure = environment.url_api.indexOf('https') != -1;
    this.cookieService.set(
      key,
      value,
      undefined,
      undefined,
      undefined,
      secure,
      secure ? 'None' : 'Lax'
    );
  }

  saveUserData(user_data: any) {
    const secure = environment.url_api.indexOf('https') !== -1;
    // Soporta respuesta plana o anidada en 'user'
    let id = user_data.id || user_data.user?.id;
    let email = user_data.email || user_data.user?.email;
    let first_name = user_data.first_name || user_data.user?.first_name || '';
    let last_name = user_data.last_name || user_data.user?.last_name || '';
    let name = (first_name + ' ' + last_name).trim();
    let rol = user_data.rol;
    this.cookieService.set(
      user_id_cookie_name,
      id,
      undefined,
      COOKIE_PATH,
      undefined,
      secure,
      secure ? 'None' : 'Lax'
    );
    this.cookieService.set(
      user_email_cookie_name,
      email,
      undefined,
      COOKIE_PATH,
      undefined,
      secure,
      secure ? 'None' : 'Lax'
    );
    this.cookieService.set(
      user_complete_name_cookie_name,
      name,
      undefined,
      COOKIE_PATH,
      undefined,
      secure,
      secure ? 'None' : 'Lax'
    );
    this.cookieService.set(
      session_cookie_name,
      user_data.token,
      undefined,
      COOKIE_PATH,
      undefined,
      secure,
      secure ? 'None' : 'Lax'
    );
    this.cookieService.set(
      group_name_cookie_name,
      user_data.rol,
      undefined,
      COOKIE_PATH,
      undefined,
      secure,
      secure ? 'None' : 'Lax'
    );
  }

  destroyUser() {
    this.cookieService.deleteAll();
  }

  getSessionToken() {
    return this.cookieService.get(session_cookie_name);
  }

  getUserEmail() {
    return this.cookieService.get(user_email_cookie_name);
  }

  getUserCompleteName() {
    return this.cookieService.get(user_complete_name_cookie_name);
  }

  getUserId() {
    return this.cookieService.get(user_id_cookie_name);
  }

  getUserGroup() {
    const rol = this.cookieService.get(group_name_cookie_name);
    console.log('getUserGroup →', rol);
    return rol;
  }
}
