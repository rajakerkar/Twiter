import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Spinner, Image } from 'react-bootstrap';
import { FaTwitter, FaCamera } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: ''
  });
  const [formError, setFormError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { name, username, email, password, confirmPassword } = formData;

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
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      console.log('Registering with profile picture:', formData.profilePicture ? 'Yes' : 'No');
      await register({
        name,
        username,
        email,
        password,
        profilePicture: formData.profilePicture
      });
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setFormError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <FaTwitter size={50} className="text-primary mb-3" />
            <h2 className="fw-bold">Create your account</h2>
            <p className="text-muted">
              Or{' '}
              <Link to="/login" className="text-decoration-none">
                sign in to your account
              </Link>
            </p>
          </div>

          {formError && (
            <Alert variant="danger">{formError}</Alert>
          )}

          <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
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
              <div className="mt-2 text-muted small">Click to add a profile photo (optional)</div>
            </div>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
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
                  Loading...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
