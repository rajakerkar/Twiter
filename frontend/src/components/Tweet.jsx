import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Form, Image, InputGroup } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaReply } from 'react-icons/fa';
import { useTweets } from '../context/TweetContext';
import { useAuth } from '../context/AuthContext';
import TimeAgo from './TimeAgo';

const Tweet = ({ tweet }) => {
  const { currentUser } = useAuth();
  const { handleLikeTweet, handleUnlikeTweet, removeTweet, addComment } = useTweets();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isLiked = tweet.likes.includes(currentUser?.id);
  // Check both _id and id formats to ensure compatibility
  const isAuthor = currentUser && (tweet.user._id === currentUser.id || tweet.user._id === currentUser._id || tweet.user.id === currentUser.id);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await handleUnlikeTweet(tweet._id);
      } else {
        await handleLikeTweet(tweet._id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        console.log('Deleting tweet with ID:', tweet._id);
        await removeTweet(tweet._id);
        // Show success message (optional)
        alert('Tweet deleted successfully');
      } catch (error) {
        console.error('Error deleting tweet:', error);
        // Show error message to user
        alert('Failed to delete tweet. Please try again.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addComment(tweet._id, { text: comment });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Card className="tweet-card border-0 shadow-sm">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex">
          <Link to={`/profile/${tweet.user._id}`} className="me-3">
            <Image
              src={tweet.user.profilePicture || 'https://via.placeholder.com/40'}
              alt={tweet.user.name}
              roundedCircle
              width={48}
              height={48}
              className="tweet-avatar"
              style={{ objectFit: 'cover', border: '2px solid #eee' }}
            />
          </Link>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <Link
                to={`/profile/${tweet.user._id}`}
                className="text-dark text-decoration-none fw-bold me-2 hover-underline"
              >
                {tweet.user.name}
              </Link>
              <span className="text-secondary" style={{ fontSize: '0.95rem' }}>@{tweet.user.username}</span>
              <span className="text-secondary mx-2">·</span>
              <TimeAgo date={tweet.createdAt} className="text-secondary" style={{ fontSize: '0.95rem' }} />
              {isAuthor && (
                <Button
                  variant="link"
                  onClick={handleDelete}
                  className="text-secondary p-0 ms-auto border-0 delete-btn"
                  title="Delete tweet"
                >
                  <FaTrash size={14} />
                </Button>
              )}
            </div>

            <p className="mb-3" style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.5' }}>
              {tweet.text}
            </p>

            {tweet.media && (
              <div className="tweet-media-container mb-3">
                <Image
                  src={tweet.media}
                  alt="Tweet media"
                  fluid
                  rounded
                  className="w-100"
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            )}

            <div className="d-flex align-items-center gap-4 mb-2">
              <Button
                variant="link"
                onClick={() => setShowComments(!showComments)}
                className="tweet-action-btn text-secondary p-0 d-flex align-items-center border-0"
              >
                <FaComment size={16} className="me-2" />
                <span style={{ fontSize: '0.95rem' }}>{tweet.comments.length}</span>
              </Button>
              <Button
                variant="link"
                onClick={handleLike}
                className={`tweet-action-btn p-0 d-flex align-items-center border-0 ${
                  isLiked ? 'text-danger' : 'text-secondary'
                }`}
              >
                {isLiked ? <FaHeart size={16} className="me-2" /> : <FaRegHeart size={16} className="me-2" />}
                <span style={{ fontSize: '0.95rem' }}>{tweet.likes.length}</span>
              </Button>
            </div>

            {showComments && (
              <div className="mt-3 pt-3 border-top">
                <Form onSubmit={handleCommentSubmit} className="mb-3">
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="border-end-0 bg-light"
                      style={{ fontSize: '0.95rem' }}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!comment.trim()}
                      className="d-flex align-items-center gap-2 rounded-end px-3"
                    >
                      <FaReply size={14} />
                      <span className="d-none d-sm-inline">Reply</span>
                    </Button>
                  </InputGroup>
                </Form>

                <div className="d-flex flex-column gap-3">
                  {tweet.comments.map((comment) => (
                    <div key={comment._id} className="d-flex pt-3 comment-item">
                      <Link to={`/profile/${comment.user._id}`} className="me-2">
                        <Image
                          src={comment.user.profilePicture || 'https://via.placeholder.com/32'}
                          alt={comment.user.name}
                          roundedCircle
                          width={32}
                          height={32}
                          className="comment-avatar"
                          style={{ objectFit: 'cover', border: '1px solid #eee' }}
                        />
                      </Link>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <Link
                            to={`/profile/${comment.user._id}`}
                            className="text-dark text-decoration-none fw-bold me-2 hover-underline"
                          >
                            {comment.user.name}
                          </Link>
                          <span className="text-secondary" style={{ fontSize: '0.9rem' }}>@{comment.user.username}</span>
                          <span className="text-secondary mx-2" style={{ fontSize: '0.9rem' }}>·</span>
                          <TimeAgo date={comment.createdAt} className="text-secondary" style={{ fontSize: '0.9rem' }} />
                        </div>
                        <p className="mb-0 mt-1" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Tweet;
