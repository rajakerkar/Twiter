import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Image, Alert, Spinner } from 'react-bootstrap';
import { FaCamera } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../api';

const Settings = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    profilePicture: '',
    coverPicture: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        website: currentUser.website || '',
        profilePicture: currentUser.profilePicture || '',
        coverPicture: currentUser.coverPicture || ''
      });
      setImagePreview(currentUser.profilePicture || null);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData({ ...formData, profilePicture: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await updateUserProfile(formData);
      setCurrentUser({
        ...currentUser,
        ...res.data.data
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${currentUser.id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to edit your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Edit Profile</h4>
        </Card.Header>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col md={8} lg={6} className="mx-auto">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  <div 
                    onClick={handleImageClick} 
                    style={{ 
                      cursor: 'pointer', 
                      position: 'relative', 
                      display: 'inline-block' 
                    }}
                  >
                    <Image 
                      src={imagePreview || 'https://via.placeholder.com/150?text=Profile+Photo'} 
                      roundedCircle 
                      width={120} 
                      height={120} 
                      className="border" 
                      style={{ objectFit: 'cover' }} 
                    />
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '5px', 
                        right: '5px', 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        borderRadius: '50%', 
                        padding: '5px' 
                      }}
                    >
                      <FaCamera color="white" size={16} />
                    </div>
                  </div>
                  <Form.Control 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="d-none" 
                  />
                  <div className="mt-2 text-muted small">Click to change profile photo</div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    maxLength={160}
                  />
                  <Form.Text className="text-muted">
                    {formData.bio.length}/160 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(`/profile/${currentUser.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
