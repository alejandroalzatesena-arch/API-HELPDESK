import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketListComponent } from './components/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './components/ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { TicketFiltersComponent } from './components/ticket-filters/ticket-filters.component';
import { CommentListComponent } from './components/comment-list/comment-list.component';

@NgModule({
  declarations: [
    TicketListComponent,
    TicketDetailComponent,
    TicketFormComponent,
    TicketFiltersComponent,
    CommentListComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, TicketsRoutingModule],
})
export class TicketsModule {}
