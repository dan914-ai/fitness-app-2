import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { socialController } from '../controllers/social.controller';

const router = Router();

// All social routes require authentication
router.use(authMiddleware);

// Feed & Posts
router.get('/feed', socialController.getFeed);
router.post('/posts', socialController.createPost);
router.get('/posts/:postId', socialController.getPost);
router.delete('/posts/:postId', socialController.deletePost);

// Post interactions
router.post('/posts/:postId/like', socialController.toggleLike);
router.get('/posts/:postId/comments', socialController.getComments);
router.post('/posts/:postId/comments', socialController.addComment);
router.delete('/posts/:postId/comments/:commentId', socialController.deleteComment);

// Follow system
router.post('/follow', socialController.followUser);
router.post('/unfollow', socialController.unfollowUser);
router.get('/users/:userId/followers', socialController.getFollowers);
router.get('/users/:userId/following', socialController.getFollowing);

// Discovery & Search
router.get('/search', socialController.globalSearch);
router.get('/suggested-users', socialController.getSuggestedUsers);
router.get('/trending', socialController.getTrendingPosts);
router.get('/popular-users', socialController.getPopularUsers);

export default router;