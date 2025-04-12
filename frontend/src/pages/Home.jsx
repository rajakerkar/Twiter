import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { useTweets } from '../context/TweetContext';
import TweetForm from '../components/TweetForm';
import Tweet from '../components/Tweet';
import SectionErrorBoundary from '../components/SectionErrorBoundary';

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

      <SectionErrorBoundary
        section="tweet form"
        fallbackMessage="Unable to load the tweet form. Please try again."
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <TweetForm />
      </SectionErrorBoundary>

      <SectionErrorBoundary
        section="tweet list"
        fallbackMessage="Unable to load tweets. Please try refreshing the page."
        showDetails={process.env.NODE_ENV === 'development'}
        onRetry={() => activeTab === 'all' ? fetchAllTweets() : fetchTimelineTweets()}
      >
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : tweets.length === 0 ? (
          <Alert variant="light" className="text-center">
            <p className="mb-0">No tweets yet. Follow some users or create your first tweet!</p>
          </Alert>
        ) : (
          <div className="tweet-list">
            {tweets.map((tweet) => (
              <SectionErrorBoundary
                key={tweet._id}
                section="tweet"
                minimal={true}
                hideErrorMessage={true}
              >
                <Tweet key={tweet._id} tweet={tweet} />
              </SectionErrorBoundary>
            ))}
          </div>
        )}
      </SectionErrorBoundary>
    </Container>
  );
};

export default Home;
