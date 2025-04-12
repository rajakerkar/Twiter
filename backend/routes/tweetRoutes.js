const express = require('express');
const { check } = require('express-validator');
const {
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
  likeTweet,
  unlikeTweet,
  commentOnTweet,
  deleteComment,
  getTimelineTweets,
  getUserTweets
} = require('../controllers/tweetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/tweets
// @desc    Create a tweet
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('text', 'Text is required').not().isEmpty(),
      check('text', 'Text cannot be more than 280 characters').isLength({ max: 280 })
    ]
  ],
  createTweet
);

// @route   GET /api/tweets
// @desc    Get all tweets
// @access  Private
router.get('/', protect, getAllTweets);

// @route   GET /api/tweets/timeline
// @desc    Get timeline tweets (from followed users)
// @access  Private
router.get('/timeline', protect, getTimelineTweets);

// @route   GET /api/tweets/user/:id
// @desc    Get tweets by user ID
// @access  Private
router.get('/user/:id', protect, getUserTweets);

// @route   GET /api/tweets/:id
// @desc    Get tweet by ID
// @access  Private
router.get('/:id', protect, getTweetById);

// @route   DELETE /api/tweets/:id
// @desc    Delete a tweet
// @access  Private
router.delete('/:id', protect, deleteTweet);

// @route   PUT /api/tweets/:id/like
// @desc    Like a tweet
// @access  Private
router.put('/:id/like', protect, likeTweet);

// @route   PUT /api/tweets/:id/unlike
// @desc    Unlike a tweet
// @access  Private
router.put('/:id/unlike', protect, unlikeTweet);

// @route   POST /api/tweets/:id/comment
// @desc    Comment on a tweet
// @access  Private
router.post(
  '/:id/comment',
  [
    protect,
    [
      check('text', 'Text is required').not().isEmpty(),
      check('text', 'Text cannot be more than 280 characters').isLength({ max: 280 })
    ]
  ],
  commentOnTweet
);

// @route   DELETE /api/tweets/:id/comment/:comment_id
// @desc    Delete comment
// @access  Private
router.delete('/:id/comment/:comment_id', protect, deleteComment);

module.exports = router;
