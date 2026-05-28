import React, { ReactNode, ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary Component
 * ────────────────────────
 * Catches rendering errors in child components and displays a graceful
 * fallback instead of white screen crash. Logs errors for debugging.
 *
 * Usage:
 * <ErrorBoundary context="DigitalTwinForm">
 *   <ComplexForm />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[ErrorBoundary${this.props.context ? ` - ${this.props.context}` : ""}]`);
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
    }

    // Update state with error details
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      try {
        // Could send to Sentry, LogRocket, etc.
        // Example: captureException(error);
      } catch (e) {
        // Silently fail if error tracking fails
      }
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className="w-full p-4 sm:p-6 lg:p-8 rounded-lg border-2 border-red-200 bg-red-50"
          role="alert"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-red-900 mb-1">
                Oops! Something went wrong
              </h2>
              <p className="text-sm sm:text-base text-red-700 mb-3">
                {this.props.context
                  ? `An error occurred in ${this.props.context}.`
                  : "An unexpected error occurred while rendering."}
                {this.state.errorCount > 1 &&
                  ` (Attempt ${this.state.errorCount})`}
              </p>

              {process.env.NODE_ENV === "development" && (
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-300 overflow-x-auto">
                  <p className="text-xs font-mono text-red-900 break-words">
                    <strong>Error:</strong>{" "}
                    {this.state.error?.message || "Unknown error"}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2 text-xs text-red-800">
                      <summary className="cursor-pointer font-semibold">
                        Stack trace
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap break-words bg-white p-2 rounded border border-red-200 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                <button
                  onClick={this.resetError}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = "/dashboard"}
                  className="px-3 sm:px-4 py-2 bg-slate-300 text-slate-900 rounded font-medium text-sm hover:bg-slate-400 transition-colors"
                >
                  Go Back Home
                </button>
              </div>

              <p className="text-xs sm:text-sm text-red-600 mt-3">
                If this problem persists, please refresh the page or contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
