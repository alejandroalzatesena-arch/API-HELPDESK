import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConfirmationService } from 'src/app/shared/services/confirmation.service';
import { ApiErrorBody } from 'src/app/models/api-response.model';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, Ticket } from 'src/app/models/ticket.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  ticket: Ticket | null = null;
  loading = false;
  saving = false;
  error = '';
  user: User | null = null;
  agents: User[] = [];

  statusOptions = STATUS_OPTIONS;
  priorityOptions = PRIORITY_OPTIONS;

  updateForm: FormGroup;
  assignForm: FormGroup;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private userService: UserService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {
    this.updateForm = this.fb.group({
      status: ['', Validators.required],
      priority: ['', Validators.required],
    });
    this.assignForm = this.fb.group({
      agentId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe((user) => (this.user = user))
    );

    if (this.user?.role === 'admin') {
      this.loadAgents();
    }

    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.loadTicket(id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  get isAgent(): boolean {
    return this.user?.role === 'agent';
  }

  get canUpdate(): boolean {
    return this.isAdmin || this.isAgent;
  }

  get isClosed(): boolean {
    return this.ticket?.status === 'closed';
  }

  loadTicket(id: string): void {
    this.loading = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.getTicket(id).subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.updateForm.patchValue({ status: ticket.status, priority: ticket.priority });
          this.loading = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudo cargar el ticket.';
          this.loading = false;
        },
      })
    );
  }

  loadAgents(): void {
    this.subscriptions.add(
      this.userService.getUsers('agent').subscribe({
        next: (agents) => (this.agents = agents),
        error: () => undefined,
      })
    );
  }

  updateTicket(): void {
    if (this.updateForm.invalid || !this.ticket) {
      return;
    }

    this.saving = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.updateTicket(this.ticket.id, this.updateForm.value).subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.saving = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudo actualizar el ticket.';
          this.saving = false;
        },
      })
    );
  }

  assignTicket(): void {
    if (this.assignForm.invalid || !this.ticket) {
      return;
    }

    this.saving = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.assignTicket(this.ticket.id, this.assignForm.value.agentId).subscribe({
        next: (response) => {
          this.ticket = { ...this.ticket!, ...response.data };
          this.saving = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudo asignar el ticket.';
          this.saving = false;
        },
      })
    );
  }

  deleteTicket(): void {
    if (!this.ticket) {
      return;
    }

    this.subscriptions.add(
      this.confirmationService
        .open({
          title: 'Eliminar ticket',
          message: `¿Seguro que deseas eliminar el ticket ${this.ticket.id}? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          danger: true,
        })
        .subscribe((confirmed) => {
          if (!confirmed || !this.ticket) {
            return;
          }

          this.saving = true;
          this.error = '';

          this.subscriptions.add(
            this.ticketService.deleteTicket(this.ticket.id).subscribe({
              next: () => this.router.navigate(['/tickets']),
              error: (error: ApiErrorBody) => {
                this.error = error.error?.message ?? 'No se pudo eliminar el ticket.';
                this.saving = false;
              },
            })
          );
        })
    );
  }
}
