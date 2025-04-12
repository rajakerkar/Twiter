import { createContext, useState, useContext, useCallback } from 'react';
import {
  createTweet,
  getAllTweets,
  getTimelineTweets,
  getUserTweets,
  getTweetById,
  deleteTweet,
  likeTweet,
  unlikeTweet,
  commentOnTweet,
  deleteComment
} from '../api';

const TweetContext = createContext();

export const useTweets = () => useContext(TweetContext);

export const TweetProvider = ({ children }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a new tweet
  const addTweet = useCallback(async (tweetData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createTweet(tweetData);
      setTweets(prevTweets => [res.data.data, ...prevTweets]);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tweet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all tweets
  const fetchAllTweets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllTweets();
      setTweets(res.data.data || []);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tweets');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get timeline tweets (from followed users)
  const fetchTimelineTweets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTimelineTweets();
      setTweets(res.data.data || []);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch timeline');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tweets by user ID
  const fetchUserTweets = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserTweets(userId);
      setTweets(res.data.data || []);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user tweets');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tweet by ID
  const fetchTweetById = useCallback(async (tweetId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTweetById(tweetId);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tweet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a tweet
  const removeTweet = useCallback(async (tweetId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTweet(tweetId);
      setTweets(prevTweets => prevTweets.filter(tweet => tweet._id !== tweetId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tweet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Like a tweet
  const handleLikeTweet = useCallback(async (tweetId) => {
    setError(null);
    try {
      const res = await likeTweet(tweetId);
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet._id === tweetId ? { ...tweet, likes: res.data.data } : tweet
        )
      );
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to like tweet');
      throw err;
    }
  }, []);

  // Unlike a tweet
  const handleUnlikeTweet = useCallback(async (tweetId) => {
    setError(null);
    try {
      const res = await unlikeTweet(tweetId);
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet._id === tweetId ? { ...tweet, likes: res.data.data } : tweet
        )
      );
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlike tweet');
      throw err;
    }
  }, []);

  // Comment on a tweet
  const addComment = useCallback(async (tweetId, commentData) => {
    setError(null);
    try {
      const res = await commentOnTweet(tweetId, commentData);
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet._id === tweetId ? { ...tweet, comments: res.data.data } : tweet
        )
      );
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
      throw err;
    }
  }, []);

  // Delete a comment
  const removeComment = useCallback(async (tweetId, commentId) => {
    setError(null);
    try {
      const res = await deleteComment(tweetId, commentId);
      setTweets(prevTweets =>
        prevTweets.map(tweet =>
          tweet._id === tweetId ? { ...tweet, comments: res.data.data } : tweet
        )
      );
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
      throw err;
    }
  }, []);

  const value = {
    tweets,
    loading,
    error,
    addTweet,
    fetchAllTweets,
    fetchTimelineTweets,
    fetchUserTweets,
    fetchTweetById,
    removeTweet,
    handleLikeTweet,
    handleUnlikeTweet,
    addComment,
    removeComment
  };

  return <TweetContext.Provider value={value}>{children}</TweetContext.Provider>;
};

export default TweetContext;
