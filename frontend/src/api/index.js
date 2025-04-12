import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (userData) => api.post('/auth/login', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const logoutUser = () => api.get('/auth/logout');

// User API calls
export const getUserById = (userId) => api.get(`/users/${userId}`);
export const updateUserProfile = (userData) => api.put('/users/profile', userData);
export const followUser = (userId) => api.put(`/users/${userId}/follow`);
export const unfollowUser = (userId) => api.put(`/users/${userId}/unfollow`);
export const searchUsers = (query) => api.get(`/users/search?query=${query}`);
export const getUserFollowers = (userId) => api.get(`/users/${userId}/followers`);
export const getUserFollowing = (userId) => api.get(`/users/${userId}/following`);

// Tweet API calls
export const createTweet = (tweetData) => api.post('/tweets', tweetData);
export const getAllTweets = () => api.get('/tweets');
export const getTimelineTweets = () => api.get('/tweets/timeline');
export const getUserTweets = (userId) => api.get(`/tweets/user/${userId}`);
export const getTweetById = (tweetId) => api.get(`/tweets/${tweetId}`);
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);
export const likeTweet = (tweetId) => api.put(`/tweets/${tweetId}/like`);
export const unlikeTweet = (tweetId) => api.put(`/tweets/${tweetId}/unlike`);
export const commentOnTweet = (tweetId, commentData) => api.post(`/tweets/${tweetId}/comment`, commentData);
export const deleteComment = (tweetId, commentId) => api.delete(`/tweets/${tweetId}/comment/${commentId}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count');
export const markNotificationAsRead = (notificationId) => api.put(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');
export const deleteNotification = (notificationId) => api.delete(`/notifications/${notificationId}`);

export default api;
