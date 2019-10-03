
import React from 'react'

class ErrorBoundary extends React.Component {
    state = { error: undefined, errorInfo: undefined };
    
    componentDidCatch(error, errorInfo) {
      this.setState({
        error,
        errorInfo
      });
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
  
    render() {
        const { hasError, error, errorInfo } = this.state;

        if (hasError) {
            return (
                <div>
                    <h2 className="error">An unexpected error has occurred.</h2>
                    <details className="preserve-space">
                        {error && error.toString()}
                    </details>
                </div>
            )
        }
        return this.props.children; 
    }
  }

  export default ErrorBoundary;