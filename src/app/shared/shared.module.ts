import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';

@NgModule({
  declarations: [
    NavbarComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    StatusBadgeComponent,
  ],
  imports: [CommonModule, RouterModule],
  exports: [
    NavbarComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    StatusBadgeComponent,
  ],
})
export class SharedModule {}
