import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';

export interface ConfirmationRequest {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private stateSubject = new BehaviorSubject<ConfirmationRequest | null>(null);
  private resultSubject = new Subject<boolean>();

  state$: Observable<ConfirmationRequest | null> = this.stateSubject.asObservable();

  open(request: ConfirmationRequest): Observable<boolean> {
    this.stateSubject.next(request);
    return this.resultSubject.pipe(first());
  }

  confirm(): void {
    this.stateSubject.next(null);
    this.resultSubject.next(true);
  }

  cancel(): void {
    this.stateSubject.next(null);
    this.resultSubject.next(false);
  }
}
