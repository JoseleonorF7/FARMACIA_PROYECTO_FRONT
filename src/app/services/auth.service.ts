import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginEvent = new Subject<void>();

  loginEvent$ = this.loginEvent.asObservable();

  notifyLogin() {
    this.loginEvent.next();
  }
  
}
