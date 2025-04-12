import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <Card className="text-center shadow-sm" style={{ maxWidth: '500px' }}>
            <Card.Header className="bg-danger text-white">
              <FaExclamationTriangle className="me-2" size={20} />
              Something went wrong
            </Card.Header>
            <Card.Body>
              <Card.Title>Oops! We encountered an error</Card.Title>
              <Card.Text>
                We're sorry for the inconvenience. You can try reloading the page or going back to the home page.
              </Card.Text>
              {this.props.showDetails && this.state.error && (
                <div className="mt-3 mb-3">
                  <details className="text-start bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    <summary className="fw-bold mb-2">Error Details</summary>
                    <p className="text-danger">{this.state.error.toString()}</p>
                    <p className="text-muted small">
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </p>
                  </details>
                </div>
              )}
              <div className="d-flex justify-content-center gap-3 mt-3">
                <Button variant="primary" onClick={this.handleReload}>
                  <FaRedo className="me-2" /> Reload Page
                </Button>
                <Button variant="outline-primary" onClick={this.handleGoHome}>
                  <FaHome className="me-2" /> Go to Home
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted">
              If the problem persists, please contact support.
            </Card.Footer>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
