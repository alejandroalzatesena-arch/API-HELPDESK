import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User, UserRole } from 'src/app/models/user.model';
import { UpdateRoleResponse, UserListResponse, UserResponse } from 'src/app/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(role?: UserRole): Observable<User[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    return this.http
      .get<UserListResponse>(`${environment.apiUrl}/users`, { params })
      .pipe(map((res) => res.data));
  }

  updateRole(userId: string, role: UserRole): Observable<User> {
    return this.http
      .patch<UpdateRoleResponse>(`${environment.apiUrl}/users/${userId}/role`, { role })
      .pipe(map((res) => res.data));
  }
}
