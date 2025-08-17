import { createError } from '../../middleware/errorHandler';
import { Role } from '../../models/Role';
import { User } from '../../models/User';
import { BaseError } from '../../types/errors/base.error';
import { GraphQLContext } from '../context';
import { CreateRoleInput, RoleResponse } from './franchisee.interfaces';

export const franchiseeMutations = {
  createRole: async (
    _: unknown,
    { input }: { input: CreateRoleInput },
    context: GraphQLContext
  ): Promise<RoleResponse> => {
    try {
      // Verify user is authenticated and is a Franchisee Admin
      if (!context.user) {
        throw createError.authentication('Not authenticated');
      }

      // Get user's primary franchisee and role
      const primaryFranchisee = await User.findOne({
        userId: context.user.id,
      }).then(user => user?.getPrimaryFranchisee());
      if (!primaryFranchisee) {
        throw createError.notFound(
          'User is not associated with any franchisee'
        );
      }

      const isAdmin = await User.findOne({ userId: context.user.id }).then(
        user =>
          user?.hasRole(
            primaryFranchisee.franchisee.franchiseeId,
            'Franchisee Admin'
          )
      );

      if (!isAdmin) {
        throw createError.authentication(
          'Not authorized. Only Franchisee Admin can create roles.'
        );
      }

      // Validate input
      if (
        !input.name ||
        !input.permissions ||
        !Array.isArray(input.permissions)
      ) {
        throw createError.validation('Invalid input');
      }

      // Create new role
      const role = new Role({
        name: input.name,
        description: input.description,
        permissions: input.permissions,
        isSystemRole: false, // Custom roles are never system roles
      });

      await role.save();

      return {
        success: true,
        message: 'Role created successfully',
        role,
      };
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw createError.database('Failed to create role', {
        operation: 'create',
        entityType: 'Role',
      });
    }
  },
};
