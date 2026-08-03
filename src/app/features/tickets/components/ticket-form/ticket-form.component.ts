import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import { ApiErrorBody } from 'src/app/models/api-response.model';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TicketPayload } from 'src/app/models/ticket.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
})
export class TicketFormComponent implements OnInit, OnDestroy {
  ticketId: string | null = null;
  isEdit = false;
  loading = false;
  saving = false;
  error = '';
  user: User | null = null;

  priorityOptions = PRIORITY_OPTIONS;
  statusOptions = STATUS_OPTIONS;

  ticketForm: FormGroup;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService
  ) {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['medium', Validators.required],
      status: ['open', Validators.required],
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe((user) => (this.user = user))
    );

    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.ticketId = id;
          this.isEdit = true;
          this.loadTicket(id);
        } else {
          if (this.user?.role === 'agent') {
            this.router.navigate(['/tickets']);
            return;
          }
          this.applyRolePermissions();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get pageTitle(): string {
    return this.isEdit ? 'Editar ticket' : 'Nuevo ticket';
  }

  get canCreate(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'client';
  }

  get f() {
    return this.ticketForm.controls;
  }

  loadTicket(id: string): void {
    this.loading = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.getTicket(id).subscribe({
        next: (ticket) => {
          this.ticketForm.patchValue({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
          });
          this.applyRolePermissions();
          this.loading = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudo cargar el ticket.';
          this.loading = false;
        },
      })
    );
  }

  onSubmit(): void {
    this.error = '';

    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const payload: TicketPayload = {
      title: this.ticketForm.get('title')?.value,
      description: this.ticketForm.get('description')?.value,
      priority: this.ticketForm.get('priority')?.value,
    };

    if (this.isEdit) {
      payload.status = this.ticketForm.get('status')?.value;
    }

    this.saving = true;

    const request = this.isEdit && this.ticketId
      ? this.ticketService.updateTicket(this.ticketId, payload)
      : this.ticketService.createTicket(payload);

    this.subscriptions.add(
      request.subscribe({
        next: (ticket) => this.router.navigate(['/tickets', ticket.id]),
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudo guardar el ticket.';
          this.saving = false;
        },
      })
    );
  }

  cancel(): void {
    if (this.ticketId) {
      this.router.navigate(['/tickets', this.ticketId]);
    } else {
      this.router.navigate(['/tickets']);
    }
  }

  private applyRolePermissions(): void {
    if (this.isEdit && this.user?.role === 'agent') {
      this.ticketForm.get('title')?.disable();
      this.ticketForm.get('description')?.disable();
    } else {
      this.ticketForm.get('title')?.enable();
      this.ticketForm.get('description')?.enable();
    }

    if (this.isEdit) {
      this.ticketForm.get('status')?.enable();
    } else {
      this.ticketForm.get('status')?.disable();
    }
  }
}
