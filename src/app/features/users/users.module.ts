import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './components/user-list/user-list.component';

@NgModule({
  declarations: [UserListComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, UsersRoutingModule],
})
export class UsersModule {}
