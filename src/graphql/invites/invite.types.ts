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
    createdAt: String!
    updatedAt: String!
  }

  input InviteEntityMemberInput {
    email: String!
    entityId: String!
    role: String!
    rollNumber: String!
    batch: String!
  }

  type IInvitesResponse {
    success: Boolean!
    message: String!
    invites: [Invite!]!
  }

  type InviteEntityMemberResponse {
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

  type MyEntityInvitesResponse {
    success: Boolean!
    message: String!
    invites: [InviteWithEntity!]!
  }

  extend type Query {
    getMyEntityInvites: MyEntityInvitesResponse
  }

  extend type Mutation {
    inviteEntityMember(input: InviteEntityMemberInput!): InviteEntityMemberResponse
  }
`;
