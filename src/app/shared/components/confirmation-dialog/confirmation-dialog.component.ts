import { Component } from '@angular/core';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  constructor(public confirmationService: ConfirmationService) {}
}
