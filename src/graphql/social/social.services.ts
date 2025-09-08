import { FriendProfile, IFriendProfile } from '../../models/FriendProfile';
import { FriendConnection } from '../../models/FriendConnection';
import {
  ActivityRequest,
  IActivityRequest,
} from '../../models/ActivityRequest';
import { FilterQuery } from 'mongoose';

export class SocialService {
  // Profiles
  async getOrCreateProfile(userId: string) {
    const existing = await FriendProfile.findOne({ userId });
    if (existing) return existing;
    return FriendProfile.create({ userId });
  }

  async updateProfile(userId: string, input: Record<string, unknown>) {
    return FriendProfile.findOneAndUpdate(
      { userId },
      { $set: input },
      { upsert: true, new: true }
    );
  }

  async replacePortfolio(userId: string, entries: Array<unknown>) {
    return FriendProfile.findOneAndUpdate(
      { userId },
      { $set: { portfolio: entries } },
      { upsert: true, new: true }
    );
  }

  // Friend connections
  async sendFriendRequest(requesterUserId: string, recipientUserId: string) {
    if (requesterUserId === recipientUserId)
      throw new Error('Cannot friend yourself');
    // prevent duplicates in either direction
    const existing = await FriendConnection.findOne({
      $or: [
        { requesterUserId, recipientUserId },
        { requesterUserId: recipientUserId, recipientUserId: requesterUserId },
      ],
    });
    if (existing) return existing; // idempotent
    return FriendConnection.create({ requesterUserId, recipientUserId });
  }

  async acceptFriendRequest(currentUserId: string, requesterUserId: string) {
    const conn = await FriendConnection.findOne({
      requesterUserId,
      recipientUserId: currentUserId,
      status: 'pending',
    });
    if (!conn) throw new Error('Request not found');
    conn.status = 'accepted';
    conn.acceptedAt = new Date();
    await conn.save();
    return conn;
  }

  async rejectFriendRequest(currentUserId: string, requesterUserId: string) {
    const conn = await FriendConnection.findOneAndUpdate(
      {
        requesterUserId,
        recipientUserId: currentUserId,
        status: 'pending',
      },
      { $set: { status: 'rejected' } },
      { new: true }
    );
    if (!conn) throw new Error('Request not found');
    return conn;
  }

  async removeFriend(currentUserId: string, friendUserId: string) {
    const conn = await FriendConnection.findOne({
      $or: [
        { requesterUserId: currentUserId, recipientUserId: friendUserId },
        { requesterUserId: friendUserId, recipientUserId: currentUserId },
      ],
      status: 'accepted',
    });
    if (!conn) return false;
    await conn.deleteOne();
    return true;
  }

  async getFriends(userId: string) {
    // eslint-disable-next-line
    const conns = await FriendConnection.find({
      $or: [
        { requesterUserId: userId, status: 'accepted' },
        { recipientUserId: userId, status: 'accepted' },
      ],
    });
    // const friendIds = conns.map(c =>
    //   c.requesterUserId === userId ? c.recipientUserId : c.requesterUserId
    // );
    return FriendProfile.find({ userId: { $in: '' } });
  }

  async randomUsers(limit: number) {
    return FriendProfile.aggregate([{ $sample: { size: limit } }]);
  }

  async suggestedUsers(userId: string, limit: number) {
    const me = await FriendProfile.findOne({ userId });
    if (!me) return [];
    const keywords = new Set<string>();
    // me.portfolio?.forEach(p => p.technologies?.forEach(t => keywords.add(t)));
    const query: FilterQuery<IFriendProfile> = {
      userId: { $ne: userId },
      $or: [
        // { department: me.department },
        // { degree: me.degree },
        // { graduationYear: me.graduationYear },
        keywords.size
          ? { 'portfolio.technologies': { $in: Array.from(keywords) } }
          : // fallback impossible clause removed by $or filtering
            { _id: null },
      ],
    };
    return FriendProfile.find(query).limit(limit);
  }

  // Activity Requests
  async createRequest(
    userId: string,
    title: string,
    description: string,
    category: string
  ) {
    return ActivityRequest.create({
      title,
      description,
      category,
      createdByUserId: userId,
      responses: [],
    });
  }

  async listRequests(
    category: string | undefined,
    limit: number,
    offset: number
  ) {
    const filter: FilterQuery<IActivityRequest> = {};
    if (category) filter.category = category;
    const [requests, total] = await Promise.all([
      ActivityRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      ActivityRequest.countDocuments(filter),
    ]);
    return { requests, total };
  }

  async getRequest(id: string) {
    return ActivityRequest.findById(id);
  }

  async respondToRequest(userId: string, requestId: string) {
    const req = await ActivityRequest.findById(requestId);
    if (!req) throw new Error('Request not found');
    if (!req.responses.includes(userId)) {
      req.responses.push(userId);
      await req.save();
    }
    // auto friend request between creator and responder
    await this.sendFriendRequest(userId, req.createdByUserId);
    return req;
  }

  async withdrawResponse(userId: string, requestId: string) {
    const req = await ActivityRequest.findById(requestId);
    if (!req) throw new Error('Request not found');
    req.responses = req.responses.filter(r => r !== userId);
    await req.save();
    return req;
  }

  async getRequestResponders(requestId: string): Promise<IFriendProfile[]> {
    const request = await ActivityRequest.findById(requestId).lean();
    if (!request) {
      throw new Error('Request not found');
    }
    const responderIds = request.responses;
    if (!responderIds || responderIds.length === 0) {
      return [];
    }
    return FriendProfile.find({ userId: { $in: responderIds } }).lean();
  }

  async getSuggestedUsers(
    currentUserId: string,
    limit: number
  ): Promise<IFriendProfile[]> {
    const currentUser = await this.getOrCreateProfile(currentUserId);
    if (!currentUser) {
      return [];
    }

    const friendsAndCurrentUserIds =
      await this.getFriendsAndSelfIds(currentUserId);

    const suggestions = await FriendProfile.aggregate([
      // 1. Exclude current user and their existing friends
      {
        $match: {
          userId: { $nin: friendsAndCurrentUserIds },
        },
      },
      // 2. Calculate similarity score
      {
        $addFields: {
          similarityScore: {
            // $let: {
            //   vars: {
            //     departmentMatch: {
            //       $cond: [
            //         { $eq: ['$department', currentUser.department] },
            //         10,
            //         0,
            //       ],
            //     },
            //     degreeMatch: {
            //       $cond: [{ $eq: ['$degree', currentUser.degree] }, 10, 0],
            //     },
            //     gradYearMatch: {
            //       $cond: [
            //         { $eq: ['$graduationYear', currentUser.graduationYear] },
            //         5,
            //         0,
            //       ],
            //     },
            //     techOverlap: {
            //       $size: {
            //         $ifNull: [
            //           {
            //             $setIntersection: [
            //               '$portfolio.technologies',
            //               currentUser.portfolio?.flatMap(p => p.technologies) ??
            //                 [],
            //             ],
            //           },
            //           [],
            //         ],
            //       },
            //     },
            //   },
            //   in: {
            //     $add: [
            //       '$$departmentMatch',
            //       '$$degreeMatch',
            //       '$$gradYearMatch',
            //       { $multiply: ['$$techOverlap', 2] },
            //     ],
            //   },
            // },
          },
        },
      },
      // 3. Sort by the new score in descending order
      {
        $sort: {
          similarityScore: -1,
        },
      },
      // 4. Limit the results
      {
        $limit: limit,
      },
    ]);

    return suggestions;
  }

  // Helper to get IDs of current user and their friends
  private async getFriendsAndSelfIds(userId: string): Promise<string[]> {
    // eslint-disable-next-line
    const connections = await FriendConnection.find({
      $or: [{ requesterUserId: userId }, { recipientUserId: userId }],
      status: 'accepted',
    }).lean();

    // const friendIds = connections.map(conn =>
    //   conn.requesterUserId === userId
    //     ? conn.recipientUserId
    //     : conn.requesterUserId
    // );

    return [userId, ''];
  }
}

export const socialService = new SocialService();
