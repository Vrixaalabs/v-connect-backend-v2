 export enum ActivityCategory {
  DRAMA = 'DRAMA',
  MUSIC = 'MUSIC',
  SHOOTING = 'SHOOTING',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
  SPORTS = 'SPORTS',
  DANCE = 'DANCE',
  INDOOR_GAMES = 'INDOOR_GAMES',
  OTHER = 'OTHER',
}

export interface IPortfolioEntry {
  title: string;
  description: string;
  link?: string;
  technologies?: string[];
}

export interface IFriendProfile {
  userId: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  department?: string;
  degree?: string;
  graduationYear?: number;
  linkedin?: string;
  github?: string;
  portfolio?: IPortfolioEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface IFriendConnection {
  id: string;
  requesterUserId: string;
  recipientUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  createdAt: string;
  updatedAt: string;
acceptedAt?: string;
}

export interface IActivityRequest {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  createdByUserId: string;
  responses: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Input Types ---

export interface IUpdateFriendProfileInput {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  department?: string;
  degree?: string;
  graduationYear?: number;
  linkedin?: string;
  github?: string;
}

export interface IPortfolioEntryInput {
  title: string;
  description: string;
  link?: string;
  technologies?: string[];
}

export interface IUpdatePortfolioInput {
  entries: IPortfolioEntryInput[];
}

// --- Payload Types ---

export interface IFriendSuggestionsPayload {
  users: IFriendProfile[];
}

export interface IRandomUsersPayload {
  users: IFriendProfile[];
}

export interface IFriendListPayload {
  connections: IFriendProfile[];
}

export interface IActivityRequestListPayload {
  requests: IActivityRequest[];
  total: number;
}

export interface IRequestRespondersPayload {
  responders: IFriendProfile[];
}
