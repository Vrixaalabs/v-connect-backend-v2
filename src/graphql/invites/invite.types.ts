import { gql } from 'apollo-server-express';

export const inviteTypes = gql`
  type Invite {
    inviteId: String!
    email: String!
    status: String!
    entityId: String!
    userId: String!
    role: String!
    rollNumber: String!
    batch: String!
    type: String!
    createdAt: String!
    updatedAt: String!
  }

  input InviteEntityUserRoleInput {
    email: String!
    entityId: String!
    role: String!
    rollNumber: String!
    batch: String!
    type: String!
  }

  type IInvitesResponse {
    success: Boolean!
    message: String!
    invites: [Invite!]!
  }

  type InviteEntityUserRoleResponse {
    success: Boolean!
    message: String!
    invite: Invite
  }

  type InviteWithEntity {
    inviteId: String!
    email: String!
    status: String!
    entityId: String!
    userId: String!
    role: String!
    rollNumber: String!
    batch: String!
    createdAt: String!
    updatedAt: String!
    entity: Entity!
  }

  type InviteWithUser {
    inviteId: String!
    email: String!
    status: String!
    entityId: String!
    userId: String!
    role: String!
    rollNumber: String!
    batch: String!
    createdAt: String!
    updatedAt: String!
    user: User!
  }

  input GetInviteByEntityIdInput {
    entityId: String!
  }

  type GetInviteByEntityIdResponse {
    success: Boolean!
    message: String!
    invites: [InviteWithUser!]!
  }

  type MyEntityInvitesResponse {
    success: Boolean!
    message: String!
    invites: [InviteWithEntity!]!
  }

  input AcceptEntityInviteInput {
    inviteId: String!
  }

  type AcceptEntityInviteResponse {
    success: Boolean!
    message: String!
    invite: Invite
  }

  extend type Query {
    getMyEntityInvites: MyEntityInvitesResponse
    getInviteByEntityId(entityId: String!): GetInviteByEntityIdResponse
  }

  extend type Mutation {
    inviteEntityMember(
      input: InviteEntityUserRoleInput!
    ): InviteEntityUserRoleResponse
    acceptEntityInvite(
      input: AcceptEntityInviteInput!
    ): AcceptEntityInviteResponse
  }
`;
