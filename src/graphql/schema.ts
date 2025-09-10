import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-express';

// Import types
import { sharedTypes } from './shared/shared.types';
import { organizationTypes } from './organization/organization.types';
import { superAdminTypes } from './super-admin/super-admin.types';
import { adminTypes } from './admin/admin.types';
import { entityTypes } from './entity/entity.types';
import { inviteTypes } from './invites/invite.types';
import { groupTypes } from './groups/group.types';

// Import resolvers
import { organizationQueries } from './organization/organization.queries';
import { organizationMutations } from './organization/organization.mutations';
import { superAdminQueries } from './super-admin/super-admin.queries';
import { superAdminMutations } from './super-admin/super-admin.mutations';
import { adminQueries } from './admin/admin.queries';
import { adminMutations } from './admin/admin.mutations';
import { userTypes } from './user/user.types';
import { entityQueries } from './entity/entity.queries';
import { entityMutations } from './entity/entity.mutations';
import { inviteMutations } from './invites/invite.mutations';
import { inviteQueries } from './invites/invite.queries';
import { groupQueries } from './groups/group.queries';
import { groupMutations } from './groups/group.mutations';

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
    ...organizationQueries,
    ...superAdminQueries,
    ...adminQueries,
    ...entityQueries,
    ...inviteQueries,
    ...groupQueries,
  },
  Mutation: {
    ...organizationMutations,
    ...superAdminMutations,
    ...adminMutations,
    ...entityMutations,
    ...inviteMutations,
    ...groupMutations,
  },
};

export const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
    sharedTypes,
    organizationTypes,
    superAdminTypes,
    adminTypes,
    userTypes,
    entityTypes,
    inviteTypes,
    groupTypes,
  ],
  resolvers,
});
