import { IEntity } from '@/models/Entity';
import { IUser } from '@/models/User';
import { IInvite } from '@/types/types';

export interface Context {
  isAuthenticated: boolean;
}

export interface IBaseResponse {
  success: boolean;
  message: string;
}
export interface IInvitesResponse extends IBaseResponse {
  invites: IInvite[];
}

export interface InviteWithEntity {
  inviteId: string;
  email: string;
  status: string;
  entityId: string;
  userId: string;
  role: string;
  rollNumber: string;
  batch: string;
  createdAt: string;
  updatedAt: string;
  entity: IEntity;
}

export interface InviteWithUser {
  inviteId: string;
  email: string;
  status: string;
  entityId: string;
  userId: string;
  role: string;
  rollNumber: string;
  batch: string;
  createdAt: string;
  updatedAt: string;
  user: IUser;
}

export interface MyEntityInvitesResponse extends IBaseResponse {
  invites: InviteWithEntity[];
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

export interface GetInviteByEntityIdInput {
  entityId: string;
}

export interface GetInviteByEntityIdResponse {
  success: boolean;
  message: string;
  invites: InviteWithUser[];
}