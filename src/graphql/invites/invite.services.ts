import { config } from '@/config/app.config';
import { createError } from '@/middleware/errorHandler';
import { InviteModel } from '@/models/invite.model';
import { IUser, User } from '@/models/User';
import { IInviteTokenPayload } from '@/types/types';
import { INVITE_TTL_MS, TOKEN_VALIDITY } from '@/utils/constant';
import { generateInviteToken, verifyInviteToken } from '@/utils/token.util';
import mongoose from 'mongoose';
import { HandleInviteResult, SendInviteResult } from './invite.types';

const isValidEmail = (e: string): boolean => /\S+@\S+\.\S+/.test(e);

const sendInvite = async (
  email: string,
  orgId: string,
  roleId: string
): Promise<SendInviteResult> => {
  if (!isValidEmail(email)) {
    throw createError.validation('Invalid email');
  }
  if (!mongoose.isValidObjectId(orgId)) {
    throw createError.validation('Invalid orgId');
  }

  const normalizedOrgId = new mongoose.Types.ObjectId(orgId);
  const normalizedRoleId = new mongoose.Types.ObjectId(roleId);

  // Looking for an existing "unused" invite (regardless of expiry)
  let invite = await InviteModel.findOne({
    email,
    orgId: normalizedOrgId,
    used: false,
  });

  const newToken = generateInviteToken({ email, orgId }, TOKEN_VALIDITY);
  const newExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
  const inviteUrl = `${config.app.frontendUrl}/invite/accept?token=${newToken}`;

  if (invite) {
    invite.token = newToken;
    invite.expiresAt = newExpiresAt;
    invite.roleId = normalizedRoleId;
    await invite.save();
  } else {
    invite = await InviteModel.create({
      email,
      orgId: normalizedOrgId,
      roleId: normalizedRoleId,
      token: newToken,
      expiresAt: newExpiresAt,
      used: false,
    });
  }
  // TODO: enqueue/send email asynchronously
  return {
    invite,
    inviteUrl,
  };
};

const handleInvite = async (token: string): Promise<HandleInviteResult> => {
  let decoded: IInviteTokenPayload | null = null;
  try {
    decoded = verifyInviteToken(token) as IInviteTokenPayload;
  } catch {
    return {
      user: null,
      newUser: null,
      invite: null,
      inviteToken: token,
      redirectUri: null,
      message: 'Invalid or expired invite token',
      success: false,
    };
  }
  const invite = await InviteModel.findOne({ token, used: false });
  if (!invite) {
    return {
      user: null,
      newUser: null,
      invite: null,
      inviteToken: token,
      redirectUri: null,
      message: 'Invite not found or already used',
      success: false,
    };
  }

  if (invite.expiresAt < new Date()) {
    return {
      user: null,
      newUser: null,
      invite,
      inviteToken: token,
      redirectUri: null,
      message: 'Invite has expired',
      success: false,
    };
  }

  const user = (await User.findOne({ email: decoded.email })) as IUser | null;
  let isNewUser = true;
  if (user) isNewUser = false;

  invite.used = true;
  await invite.save();

  return {
    user,
    newUser: isNewUser,
    invite,
    inviteToken: token,
    redirectUri: isNewUser
      ? `${config.app.frontendUrl}/reset-password?email=${encodeURIComponent(decoded.email)}`
      : `${config.app.frontendUrl}/login?email=${encodeURIComponent(decoded.email)}`,
    message: 'Invitation accepted for existing user',
    success: true,
  };

  //New User creation
  // const tempUsername = generateTempUsername(decoded.email);
  // const tempPassword = generateTempPassword(12);

  // user = await User.create({
  //   username: tempUsername,
  //   email: decoded.email,
  //   password: tempPassword,
  //   orgId: new Types.ObjectId(decoded.orgId),
  //   isTemp: true,
  //   firstName: "Temp_first",
  //   lastName: "Temp_last"
  // }) as IUser;
};

export default { sendInvite, handleInvite };
