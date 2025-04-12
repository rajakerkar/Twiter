import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Nav, Alert, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaLink, FaUserPlus, FaUserMinus, FaCamera } from 'react-icons/fa';
import { getUserById, followUser, unfollowUser, getUserTweets } from '../api';
import { useAuth } from '../context/AuthContext';
import Tweet from '../components/Tweet';

const Profile = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tweets');

  const isCurrentUser = currentUser && (currentUser.id === id || currentUser._id === id);
  const isFollowing = profile?.followers ? profile.followers.some(follower =>
    typeof follower === 'string'
      ? follower === currentUser?.id || follower === currentUser?._id
      : follower._id === currentUser?.id || follower._id === currentUser?._id || follower.id === currentUser?.id
  ) : false;

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [userRes, tweetsRes] = await Promise.all([
          getUserById(id),
          getUserTweets(id)
        ]);
        console.log('User profile data:', userRes.data);
        setProfile(userRes.data.data);
        console.log('User tweets data:', tweetsRes.data);
        setTweets(tweetsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleFollow = async () => {
    try {
      console.log('Following/unfollowing user:', id);

      if (isFollowing) {
        await unfollowUser(id);

        // Update followers list based on its current structure
        const newFollowers = Array.isArray(profile.followers) ? [...profile.followers] : [];
        const filteredFollowers = typeof newFollowers[0] === 'string'
          ? newFollowers.filter(followerId => followerId !== currentUser.id && followerId !== currentUser._id)
          : newFollowers.filter(follower =>
              follower._id !== currentUser.id &&
              follower._id !== currentUser._id &&
              follower.id !== currentUser.id
            );

        setProfile({
          ...profile,
          followers: filteredFollowers
        });

        console.log('Unfollowed successfully');
      } else {
        await followUser(id);

        // Update followers list based on its current structure
        const newFollowers = Array.isArray(profile.followers) ? [...profile.followers] : [];

        if (newFollowers.length > 0 && typeof newFollowers[0] === 'string') {
          // If followers are stored as strings (IDs)
          setProfile({
            ...profile,
            followers: [...newFollowers, currentUser.id || currentUser._id]
          });
        } else {
          // If followers are stored as objects
          setProfile({
            ...profile,
            followers: [...newFollowers, {
              _id: currentUser.id || currentUser._id,
              name: currentUser.name,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture
            }]
          });
        }

        console.log('Followed successfully');
      }
    } catch (err) {
      console.error('Error following/unfollowing:', err);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Profile</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            The user profile you're trying to access may not exist or there might be a connection issue.
            Please try again later or check if the user ID is correct.
          </p>
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>User Not Found</Alert.Heading>
          <p>The user profile you're looking for doesn't exist.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Cover Photo and Profile Info */}
      <Card className="border-0 mb-4">
        <div
          style={{
            height: '200px',
            backgroundColor: '#1da1f2',
            position: 'relative',
            backgroundImage: profile.coverPicture ? `url(${profile.coverPicture})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Cover photo is set as background image for better display */}
        </div>

        <Card.Body className="position-relative">
          <div className="d-flex justify-content-between">
            <div style={{ marginTop: '-75px' }}>
              <div className="position-relative">
                <Image
                  src={profile.profilePicture || 'https://via.placeholder.com/150?text=No+Photo'}
                  alt={profile.name}
                  roundedCircle
                  className="border border-4 border-white shadow"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                {isCurrentUser && (
                  <Link
                    to="/settings/profile"
                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                    style={{ transform: 'translate(25%, 25%)' }}
                    title="Change profile picture"
                  >
                    <FaCamera />
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-2">
              {!isCurrentUser && (
                <Button
                  variant={isFollowing ? "outline-primary" : "primary"}
                  onClick={handleFollow}
                  className="rounded-pill"
                >
                  {isFollowing ? (
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
              {isCurrentUser && (
                <Button
                  as={Link}
                  to="/settings/profile"
                  variant="outline-secondary"
                  className="rounded-pill"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h2 className="fw-bold mb-0">{profile.name}</h2>
            <p className="text-muted">@{profile.username}</p>
            {profile.bio ? (
              <p className="mt-2 mb-3 fs-6">{profile.bio}</p>
            ) : (
              <p className="mt-2 mb-3 text-muted fst-italic">No bio provided</p>
            )}

            <div className="d-flex flex-wrap mt-3 text-muted gap-3">
              {profile.location ? (
                <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1">
                  <FaMapMarkerAlt className="me-2 text-primary" />
                  <span>{profile.location}</span>
                </div>
              ) : null}
              {profile.website ? (
                <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1">
                  <FaLink className="me-2 text-primary" />
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              ) : null}
              <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1">
                <FaCalendarAlt className="me-2 text-primary" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="d-flex mt-4 gap-4">
              <Link to={`/profile/${profile._id}/following`} className="text-decoration-none">
                <div className="d-flex flex-column align-items-center bg-light rounded px-4 py-2">
                  <span className="fw-bold fs-5">{profile.following.length}</span>
                  <span className="text-muted">Following</span>
                </div>
              </Link>
              <Link to={`/profile/${profile._id}/followers`} className="text-decoration-none">
                <div className="d-flex flex-column align-items-center bg-light rounded px-4 py-2">
                  <span className="fw-bold fs-5">{profile.followers.length}</span>
                  <span className="text-muted">Followers</span>
                </div>
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Card className="mb-4">
        <Card.Header className="bg-white p-0">
          <Nav variant="tabs" className="border-0">
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'tweets'}
            onClick={() => setActiveTab('tweets')}
          >
            Tweets
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'media'}
            onClick={() => setActiveTab('media')}
          >
            Media
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'likes'}
            onClick={() => setActiveTab('likes')}
          >
            Likes
          </Nav.Link>
        </Nav.Item>
          </Nav>
        </Card.Header>

      {/* Tweets */}
        <Card.Body>
          {tweets.length === 0 ? (
            <Alert variant="light" className="text-center">
              <p className="mb-0">No tweets yet.</p>
            </Alert>
          ) : (
            tweets.map((tweet) => <Tweet key={tweet._id} tweet={tweet} />)
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
