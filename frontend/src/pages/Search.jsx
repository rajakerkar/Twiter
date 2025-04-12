import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Card, Form, InputGroup, Button, Row, Col, Image, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { searchUsers, followUser, unfollowUser } from '../api';
import { useAuth } from '../context/AuthContext';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      searchForUsers(query);
    }
  }, [searchParams]);

  const searchForUsers = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await searchUsers(query);
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search users');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchParams({ q: searchTerm });
    searchForUsers(searchTerm);
  };

  const handleFollow = async (userId) => {
    try {
      console.log('Following user:', userId);
      await followUser(userId);

      // Update the local state to reflect the follow action
      setUsers(users.map(user => {
        if (user._id === userId) {
          // Create a new followers array with the current user's ID
          const newFollowers = Array.isArray(user.followers) ? [...user.followers] : [];

          // Add current user ID to followers if not already there
          if (!isFollowing(user)) {
            if (typeof newFollowers[0] === 'string') {
              newFollowers.push(currentUser.id || currentUser._id);
            } else {
              newFollowers.push({
                _id: currentUser.id || currentUser._id,
                name: currentUser.name,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture
              });
            }
          }

          return { ...user, followers: newFollowers };
        }
        return user;
      }));
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      console.log('Unfollowing user:', userId);
      await unfollowUser(userId);

      // Update the local state to reflect the unfollow action
      setUsers(users.map(user => {
        if (user._id === userId) {
          // Filter out the current user from followers
          const newFollowers = Array.isArray(user.followers) ? [...user.followers] : [];

          // Remove current user ID from followers
          const filteredFollowers = typeof newFollowers[0] === 'string'
            ? newFollowers.filter(id => id !== currentUser.id && id !== currentUser._id)
            : newFollowers.filter(follower =>
                follower._id !== currentUser.id &&
                follower._id !== currentUser._id &&
                follower.id !== currentUser.id
              );

          return { ...user, followers: filteredFollowers };
        }
        return user;
      }));
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  const isFollowing = (user) => {
    if (!currentUser || !user.followers) return false;

    // Check if the current user's ID is in the user's followers array
    // Handle both string IDs and object IDs
    return user.followers.some(follower =>
      typeof follower === 'string'
        ? follower === currentUser.id || follower === currentUser._id
        : follower._id === currentUser.id || follower._id === currentUser._id || follower.id === currentUser.id
    );
  };

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Find People to Follow</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <InputGroup className="mb-3">
              <InputGroup.Text id="search-addon">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-describedby="search-addon"
                autoFocus
              />
              <Button type="submit" variant="primary">
                Search
              </Button>
            </InputGroup>
            <div className="text-muted small mb-2">Find people to follow and connect with</div>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : users.length > 0 ? (
        <Card>
          <Card.Header className="bg-light">
            <h5 className="mb-0">Found {users.length} {users.length === 1 ? 'user' : 'users'}</h5>
          </Card.Header>
          <Card.Body>
            {users.map(user => (
              <Row key={user._id} className="mb-3 pb-3 border-bottom align-items-center hover-bg-light rounded mx-0">
                <Col xs={2} md={1}>
                  <Link to={`/profile/${user._id}`}>
                    <Image
                      src={user.profilePicture || 'https://via.placeholder.com/50?text=No+Photo'}
                      alt={user.name}
                      roundedCircle
                      width={60}
                      height={60}
                      className="border shadow-sm"
                      style={{ objectFit: 'cover' }}
                    />
                  </Link>
                </Col>
                <Col xs={7} md={9}>
                  <Link to={`/profile/${user._id}`} className="text-decoration-none">
                    <div className="fw-bold text-dark fs-5">{user.name}</div>
                    <div className="text-muted">@{user.username}</div>
                    {user.bio ? (
                      <div className="small mt-1 text-secondary">{user.bio}</div>
                    ) : (
                      <div className="small mt-1 text-muted fst-italic">No bio provided</div>
                    )}
                    <div className="mt-1 small">
                      <span className="me-3">
                        <strong>{user.followers?.length || 0}</strong> <span className="text-muted">Followers</span>
                      </span>
                      <span>
                        <strong>{user.following?.length || 0}</strong> <span className="text-muted">Following</span>
                      </span>
                    </div>
                  </Link>
                </Col>
                <Col xs={3} md={2} className="text-end">
                  {currentUser && currentUser.id !== user._id && (
                    <Button
                      variant={isFollowing(user) ? "outline-primary" : "primary"}
                      size="sm"
                      className="rounded-pill shadow-sm"
                      onClick={() => isFollowing(user) ? handleUnfollow(user._id) : handleFollow(user._id)}
                    >
                      {isFollowing(user) ? (
                        <>
                          <FaUserMinus className="me-1" /> Unfollow
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="me-1" /> Follow
                        </>
                      )}
                    </Button>
                  )}
                </Col>
              </Row>
            ))}
          </Card.Body>
        </Card>
      ) : searchParams.get('q') ? (
        <Alert variant="light" className="text-center">
          No users found matching "{searchParams.get('q')}"
        </Alert>
      ) : null}
    </Container>
  );
};

export default Search;
