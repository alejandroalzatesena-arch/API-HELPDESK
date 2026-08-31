import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from 'src/app/models/ticket.model';

@Component({
  selector: 'app-ticket-filters',
  templateUrl: './ticket-filters.component.html',
  styleUrls: ['./ticket-filters.component.scss'],
})
export class TicketFiltersComponent implements OnInit, OnDestroy {
  @Output() filtersChange = new EventEmitter<{ status: string; priority: string }>();

  filtersForm: FormGroup;
  statusOptions = STATUS_OPTIONS;
  priorityOptions = PRIORITY_OPTIONS;

  private subscription = new Subscription();

  constructor(private fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      status: [''],
      priority: [''],
    });
  }

  ngOnInit(): void {
    this.subscription = this.filtersForm.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      this.filtersChange.emit(value);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  reset(): void {
    this.filtersForm.reset({ status: '', priority: '' });
  }
}
