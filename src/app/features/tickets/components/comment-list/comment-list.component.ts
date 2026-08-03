import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TicketService } from 'src/app/core/services/ticket.service';
import { ApiErrorBody } from 'src/app/models/api-response.model';
import { Comment } from 'src/app/models/comment.model';
import { TicketStatus } from 'src/app/models/ticket.model';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() ticketId = '';
  @Input() ticketStatus?: TicketStatus;

  comments: Comment[] = [];
  loading = false;
  adding = false;
  error = '';

  commentForm: FormGroup;

  private subscriptions = new Subscription();

  constructor(private fb: FormBuilder, private ticketService: TicketService) {
    this.commentForm = this.fb.group({
      body: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    if (this.ticketId) {
      this.loadComments();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get canComment(): boolean {
    return this.ticketStatus !== 'closed';
  }

  loadComments(): void {
    this.loading = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.getComments(this.ticketId).subscribe({
        next: (comments) => {
          this.comments = comments;
          this.loading = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudieron cargar los comentarios.';
          this.loading = false;
        },
      })
    );
  }

  onSubmit(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.adding = true;
    this.error = '';

    this.subscriptions.add(
      this.ticketService.addComment(this.ticketId, this.commentForm.value.body).subscribe({
        next: (comment) => {
          this.comments = [...this.comments, comment];
          this.commentForm.reset();
          this.adding = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudo agregar el comentario.';
          this.adding = false;
        },
      })
    );
  }
}
