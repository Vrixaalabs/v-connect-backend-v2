import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-express';
import { addressMutations } from './address/address.mutations';
import { addressQueries } from './address/address.queries';
import { addressTypes } from './address/address.types';
import { globalTypes } from './global/global.types';
import { inviteMutations } from './invites/invite.mutations';
import { inviteQueries } from './invites/invite.queries';
import { inviteTypes } from './invites/invite.types';
import { userMutations } from './user/user.mutations';
import { userQueries } from './user/user.queries';
import { userTypes } from './user/user.types';

const baseTypeDefs = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

const resolvers = {
  Query: {
    ...inviteQueries,
    ...userQueries,
    ...addressQueries,
  },
  Mutation: {
    ...inviteMutations,
    ...userMutations,
    ...addressMutations,
  },
};

export const schema = makeExecutableSchema({
  typeDefs: [
    baseTypeDefs,
    userTypes,
    inviteTypes,
    addressTypes,
    globalTypes,
  ],
  resolvers,
});
