import { User } from './user.model';
import { Ticket, TicketListMeta } from './ticket.model';
import { Comment } from './comment.model';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface MeResponse {
  user: User;
}

export interface TicketListResponse {
  data: Ticket[];
  meta: TicketListMeta;
}

export interface TicketResponse {
  data: Ticket;
}

export interface CommentListResponse {
  data: Comment[];
  total: number;
}

export interface CommentResponse {
  data: Comment;
}

export interface UserListResponse {
  data: User[];
  total: number;
}

export interface UserResponse {
  data: User;
}

export interface AssignTicketResponse {
  data: Partial<Ticket>;
  message: string;
}

export interface UpdateRoleResponse {
  data: User;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
