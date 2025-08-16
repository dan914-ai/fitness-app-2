import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const challengesController = {
  // Get all challenges with filters
  async getChallenges(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const type = req.query.type as 'active' | 'upcoming' | 'completed' || 'active';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const now = new Date();
      let dateFilter: any;

      switch (type) {
        case 'active':
          dateFilter = {
            startDate: { lte: now },
            endDate: { gte: now }
          };
          break;
        case 'upcoming':
          dateFilter = {
            startDate: { gt: now }
          };
          break;
        case 'completed':
          dateFilter = {
            endDate: { lt: now }
          };
          break;
      }

      const challenges = await prisma.challenge.findMany({
        where: dateFilter,
        include: {
          participants: userId ? {
            where: { userId: BigInt(userId) },
            take: 1
          } : false,
          _count: {
            select: { participants: true }
          }
        },
        orderBy: [
          { startDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      });

      const transformedChallenges = challenges.map(challenge => {
        const userParticipation = userId ? (challenge.participants as any)?.[0] : null;
        
        return {
          ...challenge,
          challengeId: challenge.challengeId.toString(),
          targetValue: challenge.targetValue ? Number(challenge.targetValue) : null,
          participantsCount: challenge._count.participants,
          isParticipating: !!userParticipation,
          userProgress: userParticipation ? Number(userParticipation.progress) : 0,
          userRank: userParticipation?.rank || null
        };
      });

      const hasMore = challenges.length === limit;

      res.json({ challenges: transformedChallenges, hasMore });
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({ error: '챌린지를 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Get specific challenge
  async getChallenge(req: Request, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.userId;

      const challenge = await prisma.challenge.findUnique({
        where: { challengeId: BigInt(challengeId) },
        include: {
          participants: userId ? {
            where: { userId: BigInt(userId) },
            take: 1
          } : false,
          _count: {
            select: { participants: true }
          }
        }
      });

      if (!challenge) {
        return res.status(404).json({ error: '챌린지를 찾을 수 없습니다' });
      }

      const userParticipation = userId ? (challenge.participants as any)?.[0] : null;

      const transformedChallenge = {
        ...challenge,
        challengeId: challenge.challengeId.toString(),
        targetValue: challenge.targetValue ? Number(challenge.targetValue) : null,
        participantsCount: challenge._count.participants,
        isParticipating: !!userParticipation,
        userProgress: userParticipation ? Number(userParticipation.progress) : 0,
        userRank: userParticipation?.rank || null
      };

      res.json(transformedChallenge);
    } catch (error) {
      console.error('Get challenge error:', error);
      res.status(500).json({ error: '챌린지를 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Join challenge
  async joinChallenge(req: Request, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      // Check if challenge exists and is active
      const challenge = await prisma.challenge.findUnique({
        where: { challengeId: BigInt(challengeId) }
      });

      if (!challenge) {
        return res.status(404).json({ error: '챌린지를 찾을 수 없습니다' });
      }

      const now = new Date();
      if (now > challenge.endDate) {
        return res.status(400).json({ error: '종료된 챌린지입니다' });
      }

      // Check if already participating
      const existingParticipation = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId: BigInt(challengeId),
            userId: BigInt(userId)
          }
        }
      });

      if (existingParticipation) {
        return res.status(400).json({ error: '이미 참여 중인 챌린지입니다' });
      }

      // Create participation
      await prisma.challengeParticipant.create({
        data: {
          challengeId: BigInt(challengeId),
          userId: BigInt(userId)
        }
      });

      res.json({ success: true, message: '챌린지에 참여했습니다' });
    } catch (error) {
      console.error('Join challenge error:', error);
      res.status(500).json({ error: '챌린지 참여 중 오류가 발생했습니다' });
    }
  },

  // Leave challenge
  async leaveChallenge(req: Request, res: Response) {
    try {
      const { challengeId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      const participation = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId: BigInt(challengeId),
            userId: BigInt(userId)
          }
        }
      });

      if (!participation) {
        return res.status(400).json({ error: '참여하지 않은 챌린지입니다' });
      }

      if (participation.isCompleted) {
        return res.status(400).json({ error: '완료된 챌린지는 나갈 수 없습니다' });
      }

      await prisma.challengeParticipant.delete({
        where: { participantId: participation.participantId }
      });

      res.json({ success: true, message: '챌린지에서 나왔습니다' });
    } catch (error) {
      console.error('Leave challenge error:', error);
      res.status(500).json({ error: '챌린지 나가기 중 오류가 발생했습니다' });
    }
  },

  // Get challenge leaderboard
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { challengeId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      const userId = req.user?.userId;

      const participants = await prisma.challengeParticipant.findMany({
        where: { challengeId: BigInt(challengeId) },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
            }
          }
        },
        orderBy: [
          { progress: 'desc' },
          { joinedAt: 'asc' }
        ],
        skip: offset,
        take: limit
      });

      // Calculate ranks
      const leaderboard = participants.map((participant, index) => ({
        user: {
          ...participant.user,
          userId: participant.user.userId.toString()
        },
        progress: Number(participant.progress),
        rank: offset + index + 1,
        isCompleted: participant.isCompleted,
        completedAt: participant.completedAt
      }));

      // Get current user's rank if not in current page
      let userRank: number | undefined;
      if (userId) {
        const userParticipant = await prisma.challengeParticipant.findUnique({
          where: {
            challengeId_userId: {
              challengeId: BigInt(challengeId),
              userId: BigInt(userId)
            }
          }
        });

        if (userParticipant) {
          const betterParticipants = await prisma.challengeParticipant.count({
            where: {
              challengeId: BigInt(challengeId),
              OR: [
                { progress: { gt: userParticipant.progress } },
                {
                  progress: userParticipant.progress,
                  joinedAt: { lt: userParticipant.joinedAt }
                }
              ]
            }
          });
          userRank = betterParticipants + 1;
        }
      }

      const hasMore = participants.length === limit;

      res.json({ leaderboard, userRank, hasMore });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: '리더보드를 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Get user's challenges
  async getUserChallenges(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const status = req.query.status as 'active' | 'completed' || 'active';

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      const now = new Date();
      let challengeFilter: any = {};

      if (status === 'active') {
        challengeFilter = {
          endDate: { gte: now }
        };
      } else if (status === 'completed') {
        challengeFilter = {
          OR: [
            { endDate: { lt: now } },
            {
              participants: {
                some: {
                  userId: BigInt(userId),
                  isCompleted: true
                }
              }
            }
          ]
        };
      }

      const challenges = await prisma.challenge.findMany({
        where: {
          ...challengeFilter,
          participants: {
            some: { userId: BigInt(userId) }
          }
        },
        include: {
          participants: {
            where: { userId: BigInt(userId) },
            take: 1
          },
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { startDate: 'desc' }
      });

      const transformedChallenges = challenges.map(challenge => {
        const userParticipation = challenge.participants[0];
        
        return {
          ...challenge,
          challengeId: challenge.challengeId.toString(),
          targetValue: challenge.targetValue ? Number(challenge.targetValue) : null,
          participantsCount: challenge._count.participants,
          isParticipating: true,
          userProgress: Number(userParticipation.progress),
          userRank: userParticipation.rank || null
        };
      });

      res.json(transformedChallenges);
    } catch (error) {
      console.error('Get user challenges error:', error);
      res.status(500).json({ error: '사용자 챌린지를 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Update challenge progress
  async updateProgress(req: Request, res: Response) {
    try {
      const { challengeId } = req.params;
      const { progress } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      if (typeof progress !== 'number' || progress < 0) {
        return res.status(400).json({ error: '올바른 진행도를 입력해주세요' });
      }

      const participation = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId: BigInt(challengeId),
            userId: BigInt(userId)
          }
        },
        include: {
          challenge: true
        }
      });

      if (!participation) {
        return res.status(400).json({ error: '참여하지 않은 챌린지입니다' });
      }

      const challenge = participation.challenge;
      const now = new Date();

      if (now > challenge.endDate) {
        return res.status(400).json({ error: '종료된 챌린지입니다' });
      }

      // Check if completed
      const isCompleted = challenge.targetValue 
        ? progress >= Number(challenge.targetValue)
        : false;

      const updatedParticipation = await prisma.challengeParticipant.update({
        where: { participantId: participation.participantId },
        data: {
          progress,
          isCompleted,
          completedAt: isCompleted && !participation.isCompleted ? now : participation.completedAt
        }
      });

      // Update ranks for all participants
      await updateChallengeRanks(BigInt(challengeId));

      // Award points if just completed
      if (isCompleted && !participation.isCompleted) {
        await prisma.user.update({
          where: { userId: BigInt(userId) },
          data: {
            totalPoints: { increment: challenge.rewardPoints }
          }
        });
      }

      res.json({ 
        success: true, 
        newProgress: progress,
        isCompleted,
        message: isCompleted ? '챌린지를 완료했습니다!' : '진행도가 업데이트되었습니다'
      });
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({ error: '진행도 업데이트 중 오류가 발생했습니다' });
    }
  },

  // Get trending challenges
  async getTrendingChallenges(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const userId = req.user?.userId;

      const now = new Date();
      const challenges = await prisma.challenge.findMany({
        where: {
          startDate: { lte: now },
          endDate: { gte: now }
        },
        include: {
          participants: userId ? {
            where: { userId: BigInt(userId) },
            take: 1
          } : false,
          _count: {
            select: { participants: true }
          }
        },
        orderBy: [
          { participants: { _count: 'desc' } },
          { startDate: 'desc' }
        ],
        take: limit
      });

      const transformedChallenges = challenges.map(challenge => {
        const userParticipation = userId ? (challenge.participants as any)?.[0] : null;
        
        return {
          ...challenge,
          challengeId: challenge.challengeId.toString(),
          targetValue: challenge.targetValue ? Number(challenge.targetValue) : null,
          participantsCount: challenge._count.participants,
          isParticipating: !!userParticipation,
          userProgress: userParticipation ? Number(userParticipation.progress) : 0,
          userRank: userParticipation?.rank || null
        };
      });

      res.json(transformedChallenges);
    } catch (error) {
      console.error('Get trending challenges error:', error);
      res.status(500).json({ error: '인기 챌린지를 불러오는 중 오류가 발생했습니다' });
    }
  }
};

// Helper function to update challenge ranks
async function updateChallengeRanks(challengeId: bigint) {
  const participants = await prisma.challengeParticipant.findMany({
    where: { challengeId },
    orderBy: [
      { progress: 'desc' },
      { joinedAt: 'asc' }
    ]
  });

  const updatePromises = participants.map((participant, index) =>
    prisma.challengeParticipant.update({
      where: { participantId: participant.participantId },
      data: { rank: index + 1 }
    })
  );

  await Promise.all(updatePromises);
}