import { IUser } from "@/models/User";

export interface IUpdateUserArgs {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface Context {
  isAuthenticated: boolean;
}

export interface IMockToken {
  success: boolean;
  newToken: string | null;
}

export interface IVerificationTokenPayload {
  email: string;
}

export interface IVerifyEmailPayload {
  success: boolean;
  message: string;
  user: IUser | null;
}

export interface ICheckEmailVerificationPayload {
  success: boolean;
  user: IUser | null;
  message: string;
}