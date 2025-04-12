import { useState } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import { Card, Form, Button, Image, Alert, Spinner } from 'react-bootstrap';
import { useTweets } from '../context/TweetContext';
import { useAuth } from '../context/AuthContext';

const TweetForm = () => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addTweet } = useTweets();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      console.log('Submitting tweet with media:', media ? 'Yes' : 'No');
      await addTweet({ text, media });
      setText('');
      setMedia('');
      setMediaPreview('');
    } catch (error) {
      console.error('Error creating tweet:', error);
      setError(error.response?.data?.message || 'Failed to create tweet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview and store the base64 data for upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
      setMedia(reader.result); // Store the base64 data for upload to Cloudinary
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <div className="d-flex">
            <Image
              src={currentUser?.profilePicture || 'https://via.placeholder.com/48?text=No+Photo'}
              alt="Profile"
              roundedCircle
              className="me-3"
              width={48}
              height={48}
              style={{ objectFit: 'cover' }}
            />
          <div className="flex-grow-1">
            <Form.Control
              as="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's happening?"
              className="border-0 mb-3"
              style={{ resize: 'none', minHeight: '80px' }}
              maxLength={280}
            />
            {mediaPreview && (
              <div className="position-relative mt-2 mb-3">
                <Image
                  src={mediaPreview}
                  alt="Preview"
                  fluid
                  rounded
                  style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                />
                <Button
                  variant="dark"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => {
                    setMedia('');
                    setMediaPreview('');
                  }}
                >
                  <FaTimes />
                </Button>
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Form.Label htmlFor="media-upload" className="mb-0 text-primary" style={{ cursor: 'pointer' }}>
                  <FaImage size={20} />
                  <Form.Control
                    id="media-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleMediaChange}
                    className="d-none"
                  />
                </Form.Label>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  {text.length}/280
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !text.trim()}
                  className="rounded-pill px-4 d-flex align-items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span>Posting...</span>
                    </>
                  ) : (
                    'Tweet'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TweetForm;
