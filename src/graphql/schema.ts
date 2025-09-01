import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-express';

// Import types
import { sharedTypes } from './shared/shared.types';
import { instituteTypes } from './institute/institute.types';
import { superAdminTypes } from './super-admin/super-admin.types';
import { adminTypes } from './admin/admin.types';

// Import resolvers
import { instituteQueries } from './institute/institute.queries';
import { instituteMutations } from './institute/institute.mutations';
import { superAdminQueries } from './super-admin/super-admin.queries';
import { superAdminMutations } from './super-admin/super-admin.mutations';
import { adminQueries } from './admin/admin.queries';
import { adminMutations } from './admin/admin.mutations';
import { userTypes } from './user/user.types';

const typeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const resolvers = {
  Query: {
    ...instituteQueries,
    ...superAdminQueries,
    ...adminQueries,
  },
  Mutation: {
    ...instituteMutations,
    ...superAdminMutations,
    ...adminMutations,
  },
};

export const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
    sharedTypes,
    instituteTypes,
    superAdminTypes,
    adminTypes,
    userTypes,
  ],
  resolvers,

});