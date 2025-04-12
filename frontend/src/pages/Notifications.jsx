import { useEffect } from 'react';
import { Container, Card, ListGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCheck, FaBell } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/NotificationItem';

const Notifications = () => {
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleRemoveNotification = (notificationId) => {
    removeNotification(notificationId);
  };

  if (loading && notifications.length === 0) {
    return (
      <Container className="py-4">
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
            <h4 className="mb-0">Notifications</h4>
          </Card.Header>
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading notifications...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
          <h4 className="mb-0">Notifications</h4>
          {notifications.length > 0 && (
            <Button
              variant="outline-light"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="d-flex align-items-center gap-1"
            >
              <FaCheck /> Mark all as read
            </Button>
          )}
        </Card.Header>

        {error && (
          <Alert variant="danger" className="m-3">
            {error}
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Card.Body className="text-center py-5">
            <FaBell size={48} className="text-muted mb-3" />
            <h5>No notifications yet</h5>
            <p className="text-muted">
              When you get notifications, they'll show up here.
            </p>
          </Card.Body>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onRemove={handleRemoveNotification}
              />
            ))}
          </ListGroup>
        )}
      </Card>
    </Container>
  );
};

export default Notifications;
