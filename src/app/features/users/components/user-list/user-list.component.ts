import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { ConfirmationService } from 'src/app/shared/services/confirmation.service';
import { ApiErrorBody } from 'src/app/models/api-response.model';
import { ROLE_LABELS, USER_ROLES, User, UserRole } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  saving = false;
  error = '';
  currentUser: User | null = null;

  roleLabels = ROLE_LABELS;
  userRoles = USER_ROLES;

  usersForm: FormGroup;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {
    this.usersForm = this.fb.group({
      users: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe((user) => (this.currentUser = user))
    );
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get usersArray(): FormArray {
    return this.usersForm.get('users') as FormArray;
  }

  getUserForm(index: number): FormGroup {
    return this.usersArray.at(index) as FormGroup;
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.subscriptions.add(
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.users = users;
          this.rebuildForm();
          this.loading = false;
        },
        error: (error: ApiErrorBody) => {
          this.error = error.error?.message ?? 'No se pudieron cargar los usuarios.';
          this.loading = false;
        },
      })
    );
  }

  onRoleChange(index: number): void {
    const user = this.users[index];
    const newRole = this.usersArray.at(index).value.role as UserRole;

    if (newRole === user.role) {
      return;
    }

    this.subscriptions.add(
      this.confirmationService
        .open({
          title: 'Cambiar rol',
          message: `¿Deseas cambiar el rol de ${user.name} a "${this.roleLabels[newRole]}"?`,
          confirmText: 'Cambiar',
          cancelText: 'Cancelar',
        })
        .subscribe((confirmed) => {
          if (!confirmed) {
            this.usersArray.at(index).patchValue({ role: user.role });
            return;
          }

          this.saving = true;
          this.error = '';

          this.subscriptions.add(
            this.userService.updateRole(user.id, newRole).subscribe({
              next: (updated) => {
                this.users[index] = updated;
                this.saving = false;
              },
              error: (error: ApiErrorBody) => {
                this.error = error.error?.message ?? 'No se pudo actualizar el rol.';
                this.usersArray.at(index).patchValue({ role: user.role });
                this.saving = false;
              },
            })
          );
        })
    );
  }

  private rebuildForm(): void {
    while (this.usersArray.length) {
      this.usersArray.removeAt(0);
    }
    this.users.forEach((user) => {
      this.usersArray.push(this.fb.group({ role: [user.role, Validators.required] }));
    });
  }
}
