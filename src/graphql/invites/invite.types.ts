import { IUser } from '@/models/User';
import { IInvite } from '@/types/types';
import { gql } from 'apollo-server-express';

export interface Context {
  isAuthenticated: boolean;
}

export interface GetInviteByIdArgs {
  id: string;
}

export interface GetMockInviteTokenArgs {
  userId: string;
}

export interface GetAllInviteResult {
  success: boolean;
  invites: unknown[];
}

export interface GetInviteByIdResult {
  success: boolean;
  invite: unknown | null;
}

export interface GetMockInviteTokenResult {
  success: boolean;
  newToken: string;
}

export interface InviteUserArgs {
  email: string;
  orgId: string;
  roleId: string;
}

export interface AcceptInviteArgs {
  token: string;
}

export interface InviteUserResult {
  success: boolean;
  message: string;
  invite: unknown;
  inviteUrl: string;
}

export interface AcceptInviteResult {
  success: boolean;
  message: string;
  redirectUri: string | null;
  newUser: unknown;
  invite: unknown;
  inviteToken: string | null;
}

export interface SeedInviteResult {
  success: boolean;
  message: string;
}

export interface SendInviteResult {
  invite: IInvite;
  inviteUrl: string;
}

export interface HandleInviteResult {
  user: IUser | null;
  invite: IInvite | null;
  newUser: Boolean | null;
  inviteToken: string | null;
  redirectUri: string | null;
  message: string;
  success: Boolean;
}

export const inviteTypes = gql`
  type Invite {
    _id: ID!
    email: String!
    orgId: String!
    roleId: String!
    token: String!
    expiresAt: String!
    used: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AcceptInvite {
    success: Boolean!
    message: String!
    redirectUri: String
    newUser: Boolean
    invite: Invite
    inviteToken: String
  }

  type AllInvites {
    success: Boolean!
    invites: [Invite]
  }

  type SeedInviteResp {
    success: Boolean!
    message: String!
  }

  type InviteUser {
    success: Boolean!
    message: String!
    invite: Invite
  }

  type GetInviteById {
    success: Boolean!
    invite: Invite
  }

  type NewTokenPayload {
    success: Boolean!
    newToken: String!
  }

  extend type Query {
    getAllInvite: AllInvites
    getInviteById(id: String!): GetInviteById
    getMockInviteToken(userId: String!): NewTokenPayload
  }

  extend type Mutation {
    inviteUser(email: String!, orgId: String!, roleId: String!): InviteUser
    acceptInvite(token: String!): AcceptInvite
    seedInvite: SeedInviteResp!
  }
`;
