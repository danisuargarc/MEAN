import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Auth } from './auth.model';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + "/users";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authenticated = false;
  private bearerToken: string;
  private authStatusListener = new Subject<boolean>();
  private timer: any;
  private userId: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.bearerToken;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.authenticated;
  }

  getUserId() {
    return this.userId;
  }

  createUser(email: string, password: string) {
    const authData: Auth = { email: email, password: password };
    return this.http
      .post<{}>(BACKEND_URL + '/signup', authData)
      .subscribe((response) => {
        console.log(response);
        this.router.navigate(['/auth/login']);
      }, error => {
        console.log(error);
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string) {
    const authData: Auth = { email: email, password: password };
    this.http
      .post<{ message: string; userId: string, token: string, expiresIn: number }>(
        BACKEND_URL + '/login',
        authData
      )
      .subscribe((response) => {
        this.bearerToken = response.token;
        if (response.token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.authenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(response.token, expirationDate, this.userId)
          this.router.navigate(['/']);
        }
      }, error => {
        console.log(error);
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();

    if (!authInformation) {
      return;
    }

    const now = new Date();
    const expiresInDuration = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresInDuration > 0) {
      this.bearerToken = authInformation.token;
      this.authenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresInDuration / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.bearerToken = null;
    this.authenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.timer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.timer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");

    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }
}
