import { ListGroup, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaUserPlus, FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import TimeAgo from './TimeAgo';

const NotificationItem = ({ notification, onMarkAsRead, onRemove }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FaHeart className="text-danger" />;
      case 'comment':
        return <FaComment className="text-primary" />;
      case 'follow':
        return <FaUserPlus className="text-success" />;
      case 'mention':
        return <FaBell className="text-warning" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  const getNotificationText = () => {
    const { type, sender } = notification;
    
    switch (type) {
      case 'like':
        return (
          <>
            <Link to={`/profile/${sender._id}`} className="fw-bold text-decoration-none">
              {sender.name}
            </Link>{' '}
            liked your tweet
          </>
        );
      case 'comment':
        return (
          <>
            <Link to={`/profile/${sender._id}`} className="fw-bold text-decoration-none">
              {sender.name}
            </Link>{' '}
            commented on your tweet
          </>
        );
      case 'follow':
        return (
          <>
            <Link to={`/profile/${sender._id}`} className="fw-bold text-decoration-none">
              {sender.name}
            </Link>{' '}
            started following you
          </>
        );
      case 'mention':
        return (
          <>
            <Link to={`/profile/${sender._id}`} className="fw-bold text-decoration-none">
              {sender.name}
            </Link>{' '}
            mentioned you in a tweet
          </>
        );
      default:
        return 'You have a new notification';
    }
  };

  const getNotificationLink = () => {
    const { type, tweet } = notification;
    
    if (type === 'follow') {
      return `/profile/${notification.sender._id}`;
    }
    
    if (tweet) {
      return `/tweet/${tweet._id}`;
    }
    
    return '#';
  };

  return (
    <ListGroup.Item 
      className={`d-flex align-items-start py-3 ${!notification.read ? 'bg-light' : ''}`}
    >
      <div className="me-3 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="mb-1">{getNotificationText()}</p>
            <small className="text-muted">
              <TimeAgo date={notification.createdAt} />
            </small>
          </div>
          <div className="d-flex">
            {!notification.read && (
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={() => onMarkAsRead(notification._id)}
                title="Mark as read"
              >
                <FaCheck />
              </Button>
            )}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onRemove(notification._id)}
              title="Remove notification"
            >
              <FaTrash />
            </Button>
          </div>
        </div>
        {!notification.read && (
          <Badge bg="primary" pill className="mt-2">
            New
          </Badge>
        )}
        {notification.type !== 'follow' && notification.tweet && (
          <div className="mt-2 p-2 border rounded bg-light">
            <Link to={getNotificationLink()} className="text-decoration-none">
              <small className="text-muted">
                {notification.tweet.text?.length > 100
                  ? `${notification.tweet.text.substring(0, 100)}...`
                  : notification.tweet.text}
              </small>
            </Link>
          </div>
        )}
      </div>
    </ListGroup.Item>
  );
};

export default NotificationItem;
