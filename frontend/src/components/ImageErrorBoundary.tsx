import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ImageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Image Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
            <span className="text-gray-500">Failed to load image</span>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
