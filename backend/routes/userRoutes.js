const express = require('express');
const { check } = require('express-validator');
const {
  getUsers,
  getUserById,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
  getUserFollowers,
  getUserFollowing
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', protect, getUsers);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', protect, searchUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, getUserById);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    protect,
    [
      check('name', 'Name is required').optional(),
      check('bio', 'Bio cannot be more than 160 characters').optional().isLength({ max: 160 }),
      check('location', 'Location is required').optional(),
      check('website', 'Website is required').optional()
    ]
  ],
  updateProfile
);

// @route   PUT /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.put('/:id/follow', protect, followUser);

// @route   PUT /api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.put('/:id/unfollow', protect, unfollowUser);

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Private
router.get('/:id/followers', protect, getUserFollowers);

// @route   GET /api/users/:id/following
// @desc    Get user's following
// @access  Private
router.get('/:id/following', protect, getUserFollowing);

module.exports = router;
