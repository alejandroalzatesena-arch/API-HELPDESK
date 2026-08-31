import { Component, Input } from '@angular/core';
import { PRIORITY_LABELS, STATUS_LABELS } from 'src/app/models/ticket.model';

export type StatusBadgeType = 'status' | 'priority';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() type: StatusBadgeType = 'status';
  @Input() value: string = '';

  get label(): string {
    return this.type === 'priority'
      ? PRIORITY_LABELS[this.value as keyof typeof PRIORITY_LABELS] ?? this.value
      : STATUS_LABELS[this.value as keyof typeof STATUS_LABELS] ?? this.value;
  }

  get badgeClass(): string {
    return `badge badge-${this.value}`;
  }
}
