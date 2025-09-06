import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { verifyAccessToken } from '../middleware/authMiddleware';
import { verifyCrmOwner } from '../middleware/crmAuthMiddleware';
import { Organization } from '../models/Organization';
import { Role } from '../models/Role';
import { IUser } from '../models/User';
import { OrganizationUserRole } from '../models/OrganizationUserRole';

const router = Router();

interface CreateOrganizationBody {
  name: string;
  email: string;
  description?: string;
}

router.post(
  '/',
  verifyAccessToken,
  verifyCrmOwner,
  async (req: Request<{}, {}, CreateOrganizationBody>, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { name, email, description } = req.body;
      const user = req.user as IUser;

      if (!name || !email) {
        return res.status(400).json({
          message: 'Name and email are required',
        });
      }

      // Get admin role
      const adminRole = await Role.findOne({ name: 'Organization Admin' });
      if (!adminRole) {
        throw new Error(
          'Required roles not found. Please run system initialization.'
        );
      }

      // Create franchisee
      const organizations = await Organization.create(
        [
          {
            name,
            email: email.toLowerCase(),
            description,
            slug: name.toLowerCase().replace(/ /g, '-'),
            status: 'active',
          },
        ],
        { session }
      );

      const organization = organizations[0];
      if (!organization) {
        throw new Error('Failed to create organization');
      }

      // Add user to organization as admin
      await OrganizationUserRole.create(
        [
          {
            userId: user.userId,
            organizationId: organization.organizationId,
            roleId: adminRole.roleId,
            status: 'active',
            isPrimary: true,
            metadata: {
              acceptedAt: new Date(),
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return res.status(201).json({
        organization: {
          organizationId: organization.organizationId,
          name: organization.name,
          slug: organization.slug,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      session.endSession();
    }
  }
);

// add a new user to the franchisee with a role but the verifytoken function will be for the admin of the franchisee

export default router;
