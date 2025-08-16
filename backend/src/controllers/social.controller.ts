import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const socialController = {
  // Get personalized feed
  async getFeed(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      // Get posts from followed users and own posts
      const posts = await prisma.socialPost.findMany({
        where: {
          OR: [
            {
              user: {
                followersRelation: {
                  some: { followerId: BigInt(userId) }
                }
              }
            },
            { userId: BigInt(userId) }
          ]
        },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
            }
          },
          postLikes: {
            where: { userId: BigInt(userId) },
            take: 1
          },
          postComments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  userId: true,
                  username: true,
                  profileImageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      const transformedPosts = posts.map(post => ({
        ...post,
        postId: post.postId.toString(),
        userId: post.userId.toString(),
        user: {
          ...post.user,
          userId: post.user.userId.toString()
        },
        isLiked: post.postLikes.length > 0,
        postComments: post.postComments.map(comment => ({
          ...comment,
          commentId: comment.commentId.toString(),
          postId: comment.postId.toString(),
          userId: comment.userId.toString(),
          user: {
            ...comment.user,
            userId: comment.user.userId.toString()
          }
        }))
      }));

      const hasMore = posts.length === limit;

      res.json({ posts: transformedPosts, hasMore });
    } catch (error) {
      console.error('Get feed error:', error);
      res.status(500).json({ error: '피드를 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Create new post
  async createPost(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { content, imageUrl, workoutId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: '게시글 내용을 입력해주세요' });
      }

      const post = await prisma.socialPost.create({
        data: {
          userId: BigInt(userId),
          content,
          imageUrl,
          workoutId: workoutId ? BigInt(workoutId) : null,
        },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
            }
          }
        }
      });

      const transformedPost = {
        ...post,
        postId: post.postId.toString(),
        userId: post.userId.toString(),
        workoutId: post.workoutId?.toString(),
        user: {
          ...post.user,
          userId: post.user.userId.toString()
        },
        isLiked: false,
        postComments: []
      };

      res.status(201).json(transformedPost);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: '게시글을 작성하는 중 오류가 발생했습니다' });
    }
  },

  // Get specific post
  async getPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = req.user?.userId;

      const post = await prisma.socialPost.findUnique({
        where: { postId: BigInt(postId) },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
            }
          },
          postLikes: userId ? {
            where: { userId: BigInt(userId) },
            take: 1
          } : false,
          postComments: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  userId: true,
                  username: true,
                  profileImageUrl: true
                }
              }
            }
          }
        }
      });

      if (!post) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      }

      const transformedPost = {
        ...post,
        postId: post.postId.toString(),
        userId: post.userId.toString(),
        workoutId: post.workoutId?.toString(),
        user: {
          ...post.user,
          userId: post.user.userId.toString()
        },
        isLiked: userId ? (post.postLikes as any)?.length > 0 : false,
        postComments: post.postComments.map(comment => ({
          ...comment,
          commentId: comment.commentId.toString(),
          postId: comment.postId.toString(),
          userId: comment.userId.toString(),
          user: {
            ...comment.user,
            userId: comment.user.userId.toString()
          }
        }))
      };

      res.json(transformedPost);
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ error: '게시글을 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Delete post
  async deletePost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      const post = await prisma.socialPost.findUnique({
        where: { postId: BigInt(postId) }
      });

      if (!post) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      }

      if (post.userId !== BigInt(userId)) {
        return res.status(403).json({ error: '게시글을 삭제할 권한이 없습니다' });
      }

      await prisma.socialPost.delete({
        where: { postId: BigInt(postId) }
      });

      res.json({ message: '게시글이 삭제되었습니다' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: '게시글을 삭제하는 중 오류가 발생했습니다' });
    }
  },

  // Like/unlike post
  async toggleLike(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      const existingLike = await prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId: BigInt(postId),
            userId: BigInt(userId)
          }
        }
      });

      let isLiked: boolean;

      if (existingLike) {
        // Unlike
        await prisma.postLike.delete({
          where: { likeId: existingLike.likeId }
        });

        await prisma.socialPost.update({
          where: { postId: BigInt(postId) },
          data: { likesCount: { decrement: 1 } }
        });

        isLiked = false;
      } else {
        // Like
        await prisma.postLike.create({
          data: {
            postId: BigInt(postId),
            userId: BigInt(userId)
          }
        });

        await prisma.socialPost.update({
          where: { postId: BigInt(postId) },
          data: { likesCount: { increment: 1 } }
        });

        isLiked = true;
      }

      const updatedPost = await prisma.socialPost.findUnique({
        where: { postId: BigInt(postId) },
        select: { likesCount: true }
      });

      res.json({ 
        isLiked, 
        likesCount: updatedPost?.likesCount || 0 
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ error: '좋아요 처리 중 오류가 발생했습니다' });
    }
  },

  // Get post comments
  async getComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const comments = await prisma.postComment.findMany({
        where: { postId: BigInt(postId) },
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
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      const transformedComments = comments.map(comment => ({
        ...comment,
        commentId: comment.commentId.toString(),
        postId: comment.postId.toString(),
        userId: comment.userId.toString(),
        user: {
          ...comment.user,
          userId: comment.user.userId.toString()
        }
      }));

      const hasMore = comments.length === limit;

      res.json({ comments: transformedComments, hasMore });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: '댓글을 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Add comment
  async addComment(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: '댓글 내용을 입력해주세요' });
      }

      const comment = await prisma.postComment.create({
        data: {
          postId: BigInt(postId),
          userId: BigInt(userId),
          content: content.trim()
        },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
            }
          }
        }
      });

      // Update comments count
      await prisma.socialPost.update({
        where: { postId: BigInt(postId) },
        data: { commentsCount: { increment: 1 } }
      });

      const transformedComment = {
        ...comment,
        commentId: comment.commentId.toString(),
        postId: comment.postId.toString(),
        userId: comment.userId.toString(),
        user: {
          ...comment.user,
          userId: comment.user.userId.toString()
        }
      };

      res.status(201).json(transformedComment);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: '댓글을 작성하는 중 오류가 발생했습니다' });
    }
  },

  // Delete comment
  async deleteComment(req: Request, res: Response) {
    try {
      const { postId, commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      const comment = await prisma.postComment.findUnique({
        where: { commentId: BigInt(commentId) }
      });

      if (!comment) {
        return res.status(404).json({ error: '댓글을 찾을 수 없습니다' });
      }

      if (comment.userId !== BigInt(userId)) {
        return res.status(403).json({ error: '댓글을 삭제할 권한이 없습니다' });
      }

      await prisma.postComment.delete({
        where: { commentId: BigInt(commentId) }
      });

      // Update comments count
      await prisma.socialPost.update({
        where: { postId: BigInt(postId) },
        data: { commentsCount: { decrement: 1 } }
      });

      res.json({ message: '댓글이 삭제되었습니다' });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: '댓글을 삭제하는 중 오류가 발생했습니다' });
    }
  },

  // Follow user
  async followUser(req: Request, res: Response) {
    try {
      const { userId: targetUserId } = req.body;
      const followerId = req.user?.userId;

      if (!followerId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      if (followerId === targetUserId) {
        return res.status(400).json({ error: '자신을 팔로우할 수 없습니다' });
      }

      const existingFollow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: BigInt(followerId),
            followingId: BigInt(targetUserId)
          }
        }
      });

      if (existingFollow) {
        return res.status(400).json({ error: '이미 팔로우 중입니다' });
      }

      await prisma.userFollow.create({
        data: {
          followerId: BigInt(followerId),
          followingId: BigInt(targetUserId)
        }
      });

      res.json({ isFollowing: true, message: '팔로우했습니다' });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({ error: '팔로우 처리 중 오류가 발생했습니다' });
    }
  },

  // Unfollow user
  async unfollowUser(req: Request, res: Response) {
    try {
      const { userId: targetUserId } = req.body;
      const followerId = req.user?.userId;

      if (!followerId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      const existingFollow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: BigInt(followerId),
            followingId: BigInt(targetUserId)
          }
        }
      });

      if (!existingFollow) {
        return res.status(400).json({ error: '팔로우하지 않는 사용자입니다' });
      }

      await prisma.userFollow.delete({
        where: { followId: existingFollow.followId }
      });

      res.json({ isFollowing: false, message: '언팔로우했습니다' });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({ error: '언팔로우 처리 중 오류가 발생했습니다' });
    }
  },

  // Get user followers
  async getFollowers(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const currentUserId = req.user?.userId;

      const follows = await prisma.userFollow.findMany({
        where: { followingId: BigInt(userId) },
        include: {
          follower: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
              bio: true,
              followersRelation: currentUserId ? {
                where: { followerId: BigInt(currentUserId) },
                take: 1
              } : false
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      const followers = follows.map(follow => ({
        ...follow.follower,
        userId: follow.follower.userId.toString(),
        isFollowing: currentUserId ? (follow.follower.followersRelation as any)?.length > 0 : false
      }));

      const hasMore = follows.length === limit;

      res.json({ followers, hasMore });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({ error: '팔로워를 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Get user following
  async getFollowing(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const currentUserId = req.user?.userId;

      const follows = await prisma.userFollow.findMany({
        where: { followerId: BigInt(userId) },
        include: {
          following: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
              bio: true,
              followersRelation: currentUserId ? {
                where: { followerId: BigInt(currentUserId) },
                take: 1
              } : false
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      const following = follows.map(follow => ({
        ...follow.following,
        userId: follow.following.userId.toString(),
        isFollowing: currentUserId ? (follow.following.followersRelation as any)?.length > 0 : false
      }));

      const hasMore = follows.length === limit;

      res.json({ following, hasMore });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({ error: '팔로잉을 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Search users and content
  async globalSearch(req: Request, res: Response) {
    try {
      const { q: query } = req.query as { q: string };
      const currentUserId = req.user?.userId;

      if (!query || query.trim().length === 0) {
        return res.json({ users: [], challenges: [], posts: [] });
      }

      const searchTerm = query.trim();

      // Search users
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { bio: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          userId: true,
          username: true,
          profileImageUrl: true,
          userTier: true,
          bio: true,
          followersRelation: currentUserId ? {
            where: { followerId: BigInt(currentUserId) },
            take: 1
          } : false,
          _count: {
            select: {
              followersRelation: true,
              followingRelation: true,
              workouts: true
            }
          }
        },
        take: 10
      });

      // Search posts
      const posts = await prisma.socialPost.findMany({
        where: {
          content: { contains: searchTerm, mode: 'insensitive' }
        },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
            }
          },
          postLikes: currentUserId ? {
            where: { userId: BigInt(currentUserId) },
            take: 1
          } : false
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Search challenges
      const challenges = await prisma.challenge.findMany({
        where: {
          OR: [
            { challengeName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ],
          endDate: { gte: new Date() }
        },
        include: {
          participants: currentUserId ? {
            where: { userId: BigInt(currentUserId) },
            take: 1
          } : false,
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { startDate: 'desc' },
        take: 10
      });

      const transformedUsers = users.map(user => ({
        ...user,
        userId: user.userId.toString(),
        isFollowing: currentUserId ? (user.followersRelation as any)?.length > 0 : false,
        followersCount: user._count.followersRelation,
        followingCount: user._count.followingRelation,
        workoutCount: user._count.workouts
      }));

      const transformedPosts = posts.map(post => ({
        ...post,
        postId: post.postId.toString(),
        userId: post.userId.toString(),
        workoutId: post.workoutId?.toString(),
        user: {
          ...post.user,
          userId: post.user.userId.toString()
        },
        isLiked: currentUserId ? (post.postLikes as any)?.length > 0 : false
      }));

      const transformedChallenges = challenges.map(challenge => ({
        ...challenge,
        challengeId: challenge.challengeId.toString(),
        targetValue: challenge.targetValue ? Number(challenge.targetValue) : null,
        isParticipating: currentUserId ? (challenge.participants as any)?.length > 0 : false,
        participantsCount: challenge._count.participants
      }));

      res.json({
        users: transformedUsers,
        posts: transformedPosts,
        challenges: transformedChallenges
      });
    } catch (error) {
      console.error('Global search error:', error);
      res.status(500).json({ error: '검색 중 오류가 발생했습니다' });
    }
  },

  // Get suggested users to follow
  async getSuggestedUsers(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({ error: '로그인이 필요합니다' });
      }

      // Get users that current user doesn't follow, ordered by activity
      const suggestedUsers = await prisma.user.findMany({
        where: {
          userId: { not: BigInt(userId) },
          followersRelation: {
            none: { followerId: BigInt(userId) }
          }
        },
        select: {
          userId: true,
          username: true,
          profileImageUrl: true,
          userTier: true,
          bio: true,
          totalPoints: true,
          _count: {
            select: {
              followersRelation: true,
              workouts: true
            }
          }
        },
        orderBy: [
          { totalPoints: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      const transformedUsers = suggestedUsers.map(user => ({
        ...user,
        userId: user.userId.toString(),
        followersCount: user._count.followersRelation,
        workoutCount: user._count.workouts,
        isFollowing: false
      }));

      res.json(transformedUsers);
    } catch (error) {
      console.error('Get suggested users error:', error);
      res.status(500).json({ error: '추천 사용자를 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Get trending posts
  async getTrendingPosts(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.user?.userId;

      // Get posts with high engagement from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const posts = await prisma.socialPost.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo }
        },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              profileImageUrl: true,
              userTier: true,
            }
          },
          postLikes: userId ? {
            where: { userId: BigInt(userId) },
            take: 1
          } : false
        },
        orderBy: [
          { likesCount: 'desc' },
          { commentsCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      const transformedPosts = posts.map(post => ({
        ...post,
        postId: post.postId.toString(),
        userId: post.userId.toString(),
        workoutId: post.workoutId?.toString(),
        user: {
          ...post.user,
          userId: post.user.userId.toString()
        },
        isLiked: userId ? (post.postLikes as any)?.length > 0 : false
      }));

      res.json(transformedPosts);
    } catch (error) {
      console.error('Get trending posts error:', error);
      res.status(500).json({ error: '인기 게시글을 불러오는 중 오류가 발생했습니다' });
    }
  },

  // Get popular users
  async getPopularUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.user?.userId;

      const users = await prisma.user.findMany({
        where: userId ? {
          userId: { not: BigInt(userId) }
        } : undefined,
        select: {
          userId: true,
          username: true,
          profileImageUrl: true,
          userTier: true,
          bio: true,
          totalPoints: true,
          followersRelation: userId ? {
            where: { followerId: BigInt(userId) },
            take: 1
          } : false,
          _count: {
            select: {
              followersRelation: true,
              workouts: true
            }
          }
        },
        orderBy: [
          { totalPoints: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      const transformedUsers = users.map(user => ({
        ...user,
        userId: user.userId.toString(),
        followersCount: user._count.followersRelation,
        workoutCount: user._count.workouts,
        isFollowing: userId ? (user.followersRelation as any)?.length > 0 : false
      }));

      res.json(transformedUsers);
    } catch (error) {
      console.error('Get popular users error:', error);
      res.status(500).json({ error: '인기 사용자를 불러오는 중 오류가 발생했습니다' });
    }
  }
};