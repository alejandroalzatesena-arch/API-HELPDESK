import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { User } from 'src/app/models/user.model';
import { ApiErrorBody } from 'src/app/models/api-response.model';
import { Ticket, TicketFilters, TicketListMeta, TicketPriority, TicketStatus } from 'src/app/models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
})
export class TicketListComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  meta: TicketListMeta | null = null;
  filters: TicketFilters = { status: '', priority: '', page: 1, limit: 10 };
  loading = false;
  error = '';
  user: User | null = null;

  private subscriptions = new Subscription();

  constructor(private ticketService: TicketService, private authService: AuthService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe((user) => (this.user = user))
    );
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isStaff(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'agent';
  }

  get canCreate(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'client';
  }

  onFiltersChange(filters: { status: string; priority: string }): void {
    this.filters = {
      ...this.filters,
      status: filters.status ? (filters.status as TicketStatus) : undefined,
      priority: filters.priority ? (filters.priority as TicketPriority) : undefined,
      page: 1,
    };
    this.loadTickets();
  }

  changePage(delta: number): void {
    if (!this.meta) {
      return;
    }
    this.filters.page = (this.filters.page ?? 1) + delta;
    this.loadTickets();
  }

  private loadTickets(): void {
    this.loading = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.getTickets(this.filters).subscribe({
        next: (response) => {
          this.tickets = response.data;
          this.meta = response.meta;
          this.loading = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudieron cargar los tickets.';
          this.loading = false;
        },
      })
    );
  }
}
