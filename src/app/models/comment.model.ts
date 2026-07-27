import { UserRole } from './user.model';

export interface CommentAuthor {
  id: string;
  name: string;
  role: UserRole;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author?: CommentAuthor | null;
}
