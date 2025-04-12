import { useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

const NotificationBadge = () => {
  const { unreadCount, fetchUnreadCount } = useNotifications();

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <Link
      to="/notifications"
      className="d-flex align-items-center px-3 py-2 rounded-pill hover-bg-light position-relative text-decoration-none"
    >
      <FaBell className="me-2 text-primary" size={20} />
      <span className="fw-medium text-dark">Notifications</span>
      {unreadCount > 0 && (
        <Badge
          bg="danger"
          pill
          className="position-absolute"
          style={{ top: '5px', right: '5px', fontSize: '0.6rem' }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Link>
  );
};

export default NotificationBadge;
