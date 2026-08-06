import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { ApiErrorBody } from 'src/app/models/api-response.model';
import { ROLE_LABELS, User } from 'src/app/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = false;
  error = '';
  totalTickets = 0;

  private subscriptions = new Subscription();

  constructor(private authService: AuthService, private ticketService: TicketService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe((user) => (this.user = user))
    );
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get roleLabel(): string {
    return this.user ? ROLE_LABELS[this.user.role] : '';
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.getTickets({ page: 1, limit: 1 }).subscribe({
        next: (response) => {
          this.totalTickets = response.meta.total;
          this.loading = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudieron cargar las estadísticas.';
          this.loading = false;
        },
      })
    );
  }
}
