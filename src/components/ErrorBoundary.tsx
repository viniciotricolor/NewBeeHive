"use client";

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background p-8">
          <span className="text-6xl mb-4">🐝</span>
          <h2 className="text-2xl font-bold text-foreground mb-2">Ops! Something went wrong 🐝</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            An unexpected error occurred. Please try reloading the page.
          </p>
          <details className="mb-4 text-sm text-muted-foreground max-w-lg">
            <summary className="cursor-pointer hover:text-foreground">Error details</summary>
            <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-xs">
              {this.state.error?.message}
            </pre>
          </details>
          <Button onClick={this.handleReload} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
