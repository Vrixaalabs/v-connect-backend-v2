import { IUser } from '@/models/User';
import { IInvite } from '@/types/types';

export interface Context {
  isAuthenticated: boolean;
}

export interface InviteEntityMemberInput {
  entityId: string;
  email: string;
  rollNumber: string;
  batch: string;
  role: string;
}

export interface InviteEntityMemberArgs {
  input: InviteEntityMemberInput;
}

export interface InviteEntityMemberResponse {
  success: boolean;
  message: string;
  invite: IInvite;
}
