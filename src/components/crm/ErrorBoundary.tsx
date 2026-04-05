"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("CRM ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="bg-orange/10 border border-orange/20 rounded-2xl p-8 max-w-md w-full">
            <AlertCircle className="w-12 h-12 text-orange mx-auto mb-4" />
            <h2 className="text-xl font-bold text-teal-dark mb-2">Something went wrong</h2>
            <p className="text-sm text-brown/70 mb-6 font-mono break-words">{this.state.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, message: "" })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-base text-white text-sm font-semibold hover:bg-teal-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
