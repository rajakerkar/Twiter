const User = require('../models/User');
const Tweet = require('../models/Tweet');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
// Use direct Cloudinary config instead of environment variables
const { uploadImage } = require('../config/cloudinaryDirect');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name username profilePicture')
      .populate('following', 'name username profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    bio,
    location,
    website,
    profilePicture,
    coverPicture
  } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (bio) userFields.bio = bio;
    if (location) userFields.location = location;
    if (website) userFields.website = website;

    // Handle profile picture upload to Cloudinary
    if (profilePicture) {
      try {
        console.log('Uploading profile picture...');
        // Skip upload if it's already a URL and hasn't changed
        if (profilePicture.startsWith('http') && profilePicture === user.profilePicture) {
          userFields.profilePicture = profilePicture;
        } else {
          const profilePictureUrl = await uploadImage(profilePicture);
          console.log('Profile picture uploaded:', profilePictureUrl);
          userFields.profilePicture = profilePictureUrl;
        }
      } catch (error) {
        console.error('Profile picture upload error:', error);
        return res.status(400).json({
          success: false,
          message: `Profile picture upload failed: ${error.message}`
        });
      }
    }

    // Handle cover picture upload to Cloudinary
    if (coverPicture) {
      try {
        console.log('Uploading cover picture...');
        // Skip upload if it's already a URL and hasn't changed
        if (coverPicture.startsWith('http') && coverPicture === user.coverPicture) {
          userFields.coverPicture = coverPicture;
        } else {
          const coverPictureUrl = await uploadImage(coverPicture);
          console.log('Cover picture uploaded:', coverPictureUrl);
          userFields.coverPicture = coverPictureUrl;
        }
      } catch (error) {
        console.error('Cover picture upload error:', error);
        return res.status(400).json({
          success: false,
          message: `Cover picture upload failed: ${error.message}`
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user is already following
    if (userToFollow.followers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Add current user to followers array of the user to follow
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    });

    // Add user to follow to following array of current user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    });

    // Create a notification for the user being followed
    await Notification.create({
      recipient: req.params.id,
      sender: req.user.id,
      type: 'follow'
    });

    res.status(200).json({
      success: true,
      message: 'User followed successfully'
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

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot unfollow yourself'
      });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user is not following
    if (!userToUnfollow.followers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Remove current user from followers array of the user to unfollow
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    });

    // Remove user to unfollow from following array of current user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
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

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('name username profilePicture bio followers following');

    console.log('Search results:', users);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Private
exports.getUserFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username profilePicture bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      data: user.followers
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

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Private
exports.getUserFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name username profilePicture bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      data: user.following
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
