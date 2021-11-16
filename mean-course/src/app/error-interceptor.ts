import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = "An unknown error occurred.";
        console.log(typeof(error.error.message));
        if (error.error.message && typeof(error.error.message) != "object") {
          errorMsg = error.error.message;
        }
        this.dialog.open(ErrorComponent, { data: { message: errorMsg } });
        return throwError(error);
      })
    );
  }
}
