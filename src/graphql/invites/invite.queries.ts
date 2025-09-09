import { config } from '@/config/app.config';
import { createError } from '@/middleware/errorHandler';
import { InviteModel } from '@/models/invite.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { BaseError } from '../../types/errors/base.error';

export const inviteQueries = {
  
};
