import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaRedo } from 'react-icons/fa';

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.section || 'component'}:`, error, errorInfo);
    this.setState({
      error: error
    });

    // Optionally report to an error tracking service
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Check if we should use a minimal error display
      if (this.props.minimal) {
        return (
          <div className="p-2 text-center">
            {this.props.hideErrorMessage ? null : (
              <small className="text-muted d-flex align-items-center justify-content-center">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-muted me-1"
                  onClick={this.handleRetry}
                >
                  <FaRedo size={12} />
                </Button>
                {this.props.minimalMessage || 'Reload content'}
              </small>
            )}
          </div>
        );
      }

      // Standard error display
      return (
        <Alert variant="danger" className="my-3">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>
            {this.props.fallbackMessage ||
             `We couldn't load this ${this.props.section || 'section'} properly.`}
          </p>
          {this.props.showDetails && this.state.error && (
            <details className="mb-3">
              <summary>Error details</summary>
              <p className="mt-2 text-danger">{this.state.error.toString()}</p>
            </details>
          )}
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={this.handleRetry}
            >
              <FaRedo className="me-1" /> Try Again
            </Button>
          </div>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
