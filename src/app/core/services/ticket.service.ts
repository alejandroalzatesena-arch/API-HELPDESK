import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Ticket, TicketFilters, TicketPayload } from 'src/app/models/ticket.model';
import { Comment } from 'src/app/models/comment.model';
import {
  AssignTicketResponse,
  CommentListResponse,
  CommentResponse,
  MessageResponse,
  TicketListResponse,
  TicketResponse,
} from 'src/app/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  constructor(private http: HttpClient) {}

  getTickets(filters: TicketFilters): Observable<TicketListResponse> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 1))
      .set('limit', String(filters.limit ?? 10));

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }

    return this.http.get<TicketListResponse>(`${environment.apiUrl}/tickets`, { params });
  }

  getTicket(id: string): Observable<Ticket> {
    return this.http
      .get<TicketResponse>(`${environment.apiUrl}/tickets/${id}`)
      .pipe(map((res) => res.data));
  }

  createTicket(payload: TicketPayload): Observable<Ticket> {
    return this.http
      .post<TicketResponse>(`${environment.apiUrl}/tickets`, payload)
      .pipe(map((res) => res.data));
  }

  updateTicket(id: string, payload: TicketPayload): Observable<Ticket> {
    return this.http
      .patch<TicketResponse>(`${environment.apiUrl}/tickets/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteTicket(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${environment.apiUrl}/tickets/${id}`);
  }

  assignTicket(id: string, agentId: string): Observable<AssignTicketResponse> {
    return this.http.post<AssignTicketResponse>(`${environment.apiUrl}/tickets/${id}/assign`, {
      agentId,
    });
  }

  getComments(ticketId: string): Observable<Comment[]> {
    return this.http
      .get<CommentListResponse>(`${environment.apiUrl}/tickets/${ticketId}/comments`)
      .pipe(map((res) => res.data));
  }

  addComment(ticketId: string, body: string): Observable<Comment> {
    return this.http
      .post<CommentResponse>(`${environment.apiUrl}/tickets/${ticketId}/comments`, { body })
      .pipe(map((res) => res.data));
  }
}
