import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  constructor(private http: HttpClient) { }

  getSettings(clientID: number): Observable<any> {
    return this.http.get(`https://localhost:7107/Treasure/GetUserSettings?ClientID=${clientID}`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.post(`https://localhost:7107/Treasure/UpdateUserSettings`, settings);
  }
}
