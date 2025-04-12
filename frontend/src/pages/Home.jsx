import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { useTweets } from '../context/TweetContext';
import TweetForm from '../components/TweetForm';
import Tweet from '../components/Tweet';

const Home = () => {
  const { tweets, loading, fetchAllTweets, fetchTimelineTweets } = useTweets();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllTweets();
    } else {
      fetchTimelineTweets();
    }
  }, [activeTab, fetchAllTweets, fetchTimelineTweets]);

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Home</h4>
            <div className="btn-group">
              <button
                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('all')}
              >
                All Tweets
              </button>
              <button
                className={`btn ${activeTab === 'following' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('following')}
              >
                Following
              </button>
            </div>
          </div>
        </Card.Header>
      </Card>

      <TweetForm />

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : tweets.length === 0 ? (
        <Alert variant="light" className="text-center">
          <p className="mb-0">No tweets yet. Follow some users or create your first tweet!</p>
        </Alert>
      ) : (
        tweets.map((tweet) => <Tweet key={tweet._id} tweet={tweet} />)
      )}
    </Container>
  );
};

export default Home;
