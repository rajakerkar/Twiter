const Tweet = require('../models/Tweet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
// Use direct Cloudinary config instead of environment variables
const { uploadImage } = require('../config/cloudinaryDirect');

// @desc    Create a tweet
// @route   POST /api/tweets
// @access  Private
exports.createTweet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { text, media } = req.body;

    // Handle media upload if provided
    let mediaUrl = '';
    if (media) {
      try {
        console.log('Uploading tweet media...');
        mediaUrl = await uploadImage(media);
        console.log('Tweet media uploaded:', mediaUrl);
      } catch (error) {
        console.error('Tweet media upload error:', error);
        return res.status(400).json({
          success: false,
          message: `Media upload failed: ${error.message}`
        });
      }
    }

    const newTweet = new Tweet({
      text,
      user: req.user.id,
      media: mediaUrl
    });

    const tweet = await newTweet.save();

    // Populate user data
    const populatedTweet = await Tweet.findById(tweet._id).populate('user', 'name username profilePicture');

    res.status(201).json({
      success: true,
      data: populatedTweet
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all tweets
// @route   GET /api/tweets
// @access  Private
exports.getAllTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture')
      .populate('comments.user', 'name username profilePicture');

    res.status(200).json({
      success: true,
      count: tweets.length,
      data: tweets
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tweet by ID
// @route   GET /api/tweets/:id
// @access  Private
exports.getTweetById = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
      .populate('user', 'name username profilePicture')
      .populate('comments.user', 'name username profilePicture');

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tweet
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete tweet
// @route   DELETE /api/tweets/:id
// @access  Private
exports.deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    // Check user
    if (tweet.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized'
      });
    }

    // Use deleteOne() instead of remove() which is deprecated
    await Tweet.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Tweet removed'
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like a tweet
// @route   PUT /api/tweets/:id/like
// @access  Private
exports.likeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    // Check if the tweet has already been liked by this user
    if (tweet.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Tweet already liked'
      });
    }

    tweet.likes.unshift(req.user.id);

    await tweet.save();

    // Create a notification if the tweet is not by the current user
    if (tweet.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: tweet.user,
        sender: req.user.id,
        type: 'like',
        tweet: tweet._id
      });
    }

    res.status(200).json({
      success: true,
      data: tweet.likes
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unlike a tweet
// @route   PUT /api/tweets/:id/unlike
// @access  Private
exports.unlikeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    // Check if the tweet has not yet been liked by this user
    if (!tweet.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Tweet has not yet been liked'
      });
    }

    // Remove the like
    tweet.likes = tweet.likes.filter(
      like => like.toString() !== req.user.id
    );

    await tweet.save();

    res.status(200).json({
      success: true,
      data: tweet.likes
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Comment on a tweet
// @route   POST /api/tweets/:id/comment
// @access  Private
exports.commentOnTweet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const tweet = await Tweet.findById(req.params.id);
    const user = await User.findById(req.user.id).select('-password');

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    const newComment = {
      text: req.body.text,
      user: req.user.id
    };

    tweet.comments.unshift(newComment);

    await tweet.save();

    // Create a notification if the tweet is not by the current user
    if (tweet.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: tweet.user,
        sender: req.user.id,
        type: 'comment',
        tweet: tweet._id,
        comment: tweet.comments[0]._id
      });
    }

    // Populate the user data for the new comment
    const populatedTweet = await Tweet.findById(tweet._id)
      .populate('user', 'name username profilePicture')
      .populate('comments.user', 'name username profilePicture');

    res.status(200).json({
      success: true,
      data: populatedTweet.comments
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/tweets/:id/comment/:comment_id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);

    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }

    // Pull out comment
    const comment = tweet.comments.find(
      comment => comment.id === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment does not exist'
      });
    }

    // Check user
    if (comment.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized'
      });
    }

    // Get remove index
    const removeIndex = tweet.comments
      .map(comment => comment.id)
      .indexOf(req.params.comment_id);

    tweet.comments.splice(removeIndex, 1);

    await tweet.save();

    res.status(200).json({
      success: true,
      data: tweet.comments
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tweet not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tweets from users that the current user follows (timeline)
// @route   GET /api/tweets/timeline
// @access  Private
exports.getTimelineTweets = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Get tweets from current user and all users they follow
    const userIds = [...currentUser.following, req.user.id];

    const tweets = await Tweet.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture')
      .populate('comments.user', 'name username profilePicture');

    res.status(200).json({
      success: true,
      count: tweets.length,
      data: tweets
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tweets by user ID
// @route   GET /api/tweets/user/:id
// @access  Private
exports.getUserTweets = async (req, res) => {
  try {
    const tweets = await Tweet.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture')
      .populate('comments.user', 'name username profilePicture');

    res.status(200).json({
      success: true,
      count: tweets.length,
      data: tweets
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
